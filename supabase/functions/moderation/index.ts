import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_CONTENT_TYPES = ['video', 'user', 'campaign', 'comment'];
const VALID_BAN_TYPES = ['temporary', 'permanent'];
const VALID_STATUSES = ['pending', 'reviewing', 'resolved', 'dismissed'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get authenticated user from JWT
    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authenticatedUserId = user.id

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...params } = await req.json();

    console.log('Moderation action:', action, 'by user:', authenticatedUserId);

    // Check admin status for admin-only actions
    const adminActions = ['review_report', 'ban_user', 'unban_user', 'process_appeal', 'get_moderation_queue', 'moderate_content'];
    
    if (adminActions.includes(action)) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authenticatedUserId)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        return new Response(
          JSON.stringify({ success: false, error: 'Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    let result;

    switch (action) {
      case 'create_report':
        // Validate inputs
        if (!params.contentType || !VALID_CONTENT_TYPES.includes(params.contentType)) {
          throw new Error('Invalid content type')
        }
        if (!params.contentId || typeof params.contentId !== 'string') {
          throw new Error('Invalid content ID')
        }
        if (!params.reason || typeof params.reason !== 'string' || params.reason.length > 500) {
          throw new Error('Reason must be provided and less than 500 characters')
        }
        if (params.description && (typeof params.description !== 'string' || params.description.length > 2000)) {
          throw new Error('Description must be less than 2000 characters')
        }

        result = await createReport(supabase, {
          reportedBy: authenticatedUserId, // Use authenticated user
          contentType: params.contentType,
          contentId: params.contentId,
          reason: params.reason.trim(),
          description: params.description?.trim()
        });
        break;
      
      case 'review_report':
        if (!params.reportId || typeof params.reportId !== 'string') {
          throw new Error('Invalid report ID')
        }
        if (!params.status || !VALID_STATUSES.includes(params.status)) {
          throw new Error('Invalid status')
        }
        if (params.resolutionNotes && (typeof params.resolutionNotes !== 'string' || params.resolutionNotes.length > 2000)) {
          throw new Error('Resolution notes must be less than 2000 characters')
        }

        result = await reviewReport(supabase, {
          reportId: params.reportId,
          reviewedBy: authenticatedUserId, // Use authenticated admin
          status: params.status,
          resolutionNotes: params.resolutionNotes?.trim()
        });
        break;
      
      case 'ban_user':
        if (!params.userId || typeof params.userId !== 'string') {
          throw new Error('Invalid user ID')
        }
        if (!params.banType || !VALID_BAN_TYPES.includes(params.banType)) {
          throw new Error('Invalid ban type')
        }
        if (!params.reason || typeof params.reason !== 'string' || params.reason.length > 1000) {
          throw new Error('Reason must be provided and less than 1000 characters')
        }
        if (params.banType === 'temporary' && !params.expiresAt) {
          throw new Error('Expiration date required for temporary bans')
        }
        if (params.expiresAt) {
          const expiryDate = new Date(params.expiresAt);
          if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
            throw new Error('Expiration date must be in the future')
          }
        }

        result = await banUser(supabase, {
          userId: params.userId,
          bannedBy: authenticatedUserId, // Use authenticated admin
          reason: params.reason.trim(),
          banType: params.banType,
          expiresAt: params.expiresAt
        });
        break;
      
      case 'unban_user':
        if (!params.banId || typeof params.banId !== 'string') {
          throw new Error('Invalid ban ID')
        }
        result = await unbanUser(supabase, params);
        break;
      
      case 'process_appeal':
        if (!params.banId || typeof params.banId !== 'string') {
          throw new Error('Invalid ban ID')
        }
        if (!params.appealStatus || !['approved', 'denied'].includes(params.appealStatus)) {
          throw new Error('Invalid appeal status')
        }

        result = await processAppeal(supabase, {
          banId: params.banId,
          appealStatus: params.appealStatus,
          reviewedBy: authenticatedUserId // Use authenticated admin
        });
        break;
      
      case 'get_moderation_queue':
        const limit = Math.min(params.limit || 50, 200); // Cap at 200
        result = await getModerationQueue(supabase, {
          priority: params.priority,
          status: params.status,
          limit
        });
        break;
      
      case 'moderate_content':
        if (!params.queueId || typeof params.queueId !== 'string') {
          throw new Error('Invalid queue ID')
        }
        if (!params.status || !['approved', 'rejected'].includes(params.status)) {
          throw new Error('Invalid moderation status')
        }
        if (params.notes && (typeof params.notes !== 'string' || params.notes.length > 2000)) {
          throw new Error('Notes must be less than 2000 characters')
        }

        result = await moderateContent(supabase, {
          queueId: params.queueId,
          reviewedBy: authenticatedUserId, // Use authenticated admin
          status: params.status,
          notes: params.notes?.trim()
        });
        break;
      
      case 'check_spam':
        if (!params.content || typeof params.content !== 'string') {
          throw new Error('Invalid content')
        }
        if (params.content.length > 10000) {
          throw new Error('Content too long for spam check')
        }
        result = await checkSpam(params);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Moderation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { 
        status: error instanceof Error && error.message.includes('Admin access') ? 403 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function createReport(supabase: any, params: any) {
  const { reportedBy, contentType, contentId, reason, description } = params;

  const { data, error } = await supabase
    .from('content_reports')
    .insert({
      reported_by: reportedBy,
      content_type: contentType,
      content_id: contentId,
      reason,
      description
    })
    .select()
    .single();

  if (error) throw error;

  // Auto-flag if multiple reports on same content
  const { count } = await supabase
    .from('content_reports')
    .select('*', { count: 'exact', head: true })
    .eq('content_id', contentId)
    .eq('status', 'pending');

  if (count && count > 2) {
    await supabase.rpc('auto_flag_content', {
      p_content_type: contentType,
      p_content_id: contentId,
      p_reasons: { reason: 'multiple_reports', report_count: count }
    });
  }

  return data;
}

async function reviewReport(supabase: any, params: any) {
  const { reportId, reviewedBy, status, resolutionNotes } = params;

  const { data, error } = await supabase
    .from('content_reports')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      resolution_notes: resolutionNotes
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function banUser(supabase: any, params: any) {
  const { userId, bannedBy, reason, banType, expiresAt } = params;

  const { data, error } = await supabase
    .from('user_bans')
    .insert({
      user_id: userId,
      banned_by: bannedBy,
      reason,
      ban_type: banType,
      expires_at: expiresAt
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function unbanUser(supabase: any, params: any) {
  const { banId } = params;

  const { error } = await supabase
    .from('user_bans')
    .delete()
    .eq('id', banId);

  if (error) throw error;
  return { success: true };
}

async function processAppeal(supabase: any, params: any) {
  const { banId, appealStatus, reviewedBy } = params;

  const { data, error } = await supabase
    .from('user_bans')
    .update({
      appeal_status: appealStatus,
      appeal_reviewed_by: reviewedBy,
      appeal_reviewed_at: new Date().toISOString()
    })
    .eq('id', banId)
    .select()
    .single();

  if (error) throw error;

  // If appeal approved, delete the ban
  if (appealStatus === 'approved') {
    await supabase.from('user_bans').delete().eq('id', banId);
  }

  return data;
}

async function getModerationQueue(supabase: any, params: any) {
  const { priority, status, limit = 50 } = params;

  let query = supabase
    .from('moderation_queue')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (priority) query = query.eq('priority', priority);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function moderateContent(supabase: any, params: any) {
  const { queueId, reviewedBy, status, notes } = params;

  const { data, error } = await supabase
    .from('moderation_queue')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      notes
    })
    .eq('id', queueId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Simple spam detection algorithm
async function checkSpam(params: any) {
  const { content } = params;
  
  const spamKeywords = [
    'free money', 'click here', 'subscribe now', 'guaranteed', 
    'act now', 'limited time', 'make money fast', 'buy now'
  ];

  const text = content.toLowerCase();
  let spamScore = 0;

  // Check for spam keywords
  for (const keyword of spamKeywords) {
    if (text.includes(keyword)) {
      spamScore += 20;
    }
  }

  // Check for excessive capitalization
  const capitals = (text.match(/[A-Z]/g) || []).length;
  const capitalRatio = capitals / text.length;
  if (capitalRatio > 0.5) spamScore += 30;

  // Check for excessive exclamation marks
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 3) spamScore += 20;

  // Check for repeated characters
  if (/(.)\1{4,}/.test(text)) spamScore += 25;

  return {
    isSpam: spamScore > 50,
    spamScore: Math.min(100, spamScore),
    flags: {
      hasSpamKeywords: spamKeywords.some(k => text.includes(k)),
      excessiveCapitals: capitalRatio > 0.5,
      excessiveExclamation: exclamations > 3,
      repeatedChars: /(.)\1{4,}/.test(text)
    }
  };
}