import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, ...params } = await req.json();

    console.log('Moderation action:', action, params);

    let result;

    switch (action) {
      case 'create_report':
        result = await createReport(supabase, params);
        break;
      case 'review_report':
        result = await reviewReport(supabase, params);
        break;
      case 'ban_user':
        result = await banUser(supabase, params);
        break;
      case 'unban_user':
        result = await unbanUser(supabase, params);
        break;
      case 'process_appeal':
        result = await processAppeal(supabase, params);
        break;
      case 'get_moderation_queue':
        result = await getModerationQueue(supabase, params);
        break;
      case 'moderate_content':
        result = await moderateContent(supabase, params);
        break;
      case 'check_spam':
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
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
