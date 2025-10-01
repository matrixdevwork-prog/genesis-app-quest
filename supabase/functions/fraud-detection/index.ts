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

    console.log('Fraud detection action:', action, params);

    let result;

    switch (action) {
      case 'log_event':
        result = await logFraudEvent(supabase, params);
        break;
      case 'check_user':
        result = await checkUserFraud(supabase, params);
        break;
      case 'get_fraud_analytics':
        result = await getFraudAnalytics(supabase, params);
        break;
      case 'rate_limit_check':
        result = await rateLimitCheck(supabase, params);
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
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
