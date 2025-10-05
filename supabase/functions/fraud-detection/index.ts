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

    console.log('Fraud detection action:', action, 'for user:', authenticatedUserId);

    let result;

    switch (action) {
      case 'log_event':
        // Validate input
        if (!params.ipAddress || typeof params.ipAddress !== 'string' || params.ipAddress.length > 50) {
          throw new Error('Invalid IP address')
        }
        if (!params.deviceFingerprint || typeof params.deviceFingerprint !== 'string' || params.deviceFingerprint.length > 200) {
          throw new Error('Invalid device fingerprint')
        }
        if (!params.eventType || typeof params.eventType !== 'string' || params.eventType.length > 100) {
          throw new Error('Invalid event type')
        }

        // Force userId to be the authenticated user
        result = await logFraudEvent(supabase, {
          userId: authenticatedUserId, // Use authenticated user, not client-provided
          ipAddress: params.ipAddress,
          deviceFingerprint: params.deviceFingerprint,
          eventType: params.eventType,
          details: params.details || {}
        });
        break;
      
      case 'check_user':
        // Check if user is admin for viewing other users' fraud data
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authenticatedUserId)
          .eq('role', 'admin')
          .single();

        const targetUserId = params.userId || authenticatedUserId
        
        // Only admins can check other users
        if (targetUserId !== authenticatedUserId && !roleData) {
          throw new Error('Admin access required')
        }

        result = await checkUserFraud(supabase, { userId: targetUserId });
        break;
      
      case 'get_fraud_analytics':
        // Admin only
        const { data: adminRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', authenticatedUserId)
          .eq('role', 'admin')
          .single();

        if (!adminRole) {
          throw new Error('Admin access required')
        }

        result = await getFraudAnalytics(supabase, params);
        break;
      
      case 'rate_limit_check':
        if (!params.action || typeof params.action !== 'string') {
          throw new Error('Invalid action type')
        }

        // Users can only check their own rate limits
        result = await rateLimitCheck(supabase, {
          userId: authenticatedUserId, // Force authenticated user
          actionType: params.action,
          limit: Math.min(params.limit || 10, 100), // Cap at 100
          windowMinutes: Math.min(params.windowMinutes || 60, 1440) // Cap at 24 hours
        });
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Fraud detection error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { 
        status: error instanceof Error && error.message.includes('Admin access') ? 403 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function logFraudEvent(supabase: any, params: any) {
  const { userId, ipAddress, deviceFingerprint, eventType, details } = params;

  const { data, error } = await supabase.rpc('log_fraud_event', {
    p_user_id: userId,
    p_ip_address: ipAddress,
    p_device_fingerprint: deviceFingerprint,
    p_event_type: eventType,
    p_details: details
  });

  if (error) throw error;
  return { logged: true, data };
}

async function checkUserFraud(supabase: any, params: any) {
  const { userId } = params;

  // Get recent fraud patterns
  const { data: fraudPatterns, error: patternsError } = await supabase
    .rpc('detect_fraud_patterns', { p_user_id: userId });

  if (patternsError) throw patternsError;

  // Get fraud logs for this user
  const { data: logs, error: logsError } = await supabase
    .from('fraud_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (logsError) throw logsError;

  // Analyze patterns
  const analysis = analyzeFraudLogs(logs);

  return {
    ...fraudPatterns,
    ...analysis,
    recommendation: getRecommendation(fraudPatterns, analysis)
  };
}

function analyzeFraudLogs(logs: any[]) {
  if (!logs || logs.length === 0) {
    return {
      uniqueIPs: 0,
      uniqueDevices: 0,
      eventTypes: {},
      avgRiskScore: 0,
      suspiciousPatterns: {
        hasMultipleIPs: false,
        hasMultipleDevices: false,
        highTaskCompletionRate: false,
        rapidActions: false
      }
    };
  }

  const uniqueIPs = new Set(logs.map(l => l.ip_address)).size;
  const uniqueDevices = new Set(logs.map(l => l.device_fingerprint)).size;
  
  const eventTypes = logs.reduce((acc, log) => {
    acc[log.event_type] = (acc[log.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgRiskScore = logs.reduce((sum, log) => sum + (log.risk_score || 0), 0) / logs.length;

  // Check for suspicious patterns
  const hasMultipleIPs = uniqueIPs > 5;
  const hasMultipleDevices = uniqueDevices > 3;
  const highTaskCompletionRate = (eventTypes['task_complete'] || 0) > 50;
  const rapidActions = logs.length > 100;

  return {
    uniqueIPs,
    uniqueDevices,
    eventTypes,
    avgRiskScore,
    suspiciousPatterns: {
      hasMultipleIPs,
      hasMultipleDevices,
      highTaskCompletionRate,
      rapidActions
    }
  };
}

function getRecommendation(patterns: any, analysis: any) {
  const riskLevel = patterns.risk_level;
  const suspicious = analysis.suspiciousPatterns;

  if (riskLevel === 'high' || Object.values(suspicious).filter(Boolean).length >= 3) {
    return 'ban';
  } else if (riskLevel === 'medium' || Object.values(suspicious).filter(Boolean).length >= 2) {
    return 'review';
  }
  return 'monitor';
}

async function getFraudAnalytics(supabase: any, params: any) {
  const { startDate, endDate } = params;

  const { data: logs, error } = await supabase
    .from('fraud_logs')
    .select('*')
    .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .lte('created_at', endDate || new Date().toISOString());

  if (error) throw error;

  const totalEvents = logs.length;
  const highRiskEvents = logs.filter((l: any) => l.risk_score > 70).length;
  const uniqueUsers = new Set(logs.map((l: any) => l.user_id)).size;

  const eventsByType = logs.reduce((acc: any, log: any) => {
    acc[log.event_type] = (acc[log.event_type] || 0) + 1;
    return acc;
  }, {});

  const riskDistribution = {
    low: logs.filter((l: any) => l.risk_score < 30).length,
    medium: logs.filter((l: any) => l.risk_score >= 30 && l.risk_score < 70).length,
    high: logs.filter((l: any) => l.risk_score >= 70).length
  };

  return {
    totalEvents,
    highRiskEvents,
    uniqueUsers,
    eventsByType,
    riskDistribution
  };
}

async function rateLimitCheck(supabase: any, params: any) {
  const { userId, actionType, limit = 10, windowMinutes = 60 } = params;

  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('fraud_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', actionType)
    .gte('created_at', windowStart);

  if (error) throw error;

  const count = data || 0;
  const isAllowed = count < limit;
  const remaining = Math.max(0, limit - count);

  return {
    isAllowed,
    count,
    limit,
    remaining,
    windowMinutes
  };
}