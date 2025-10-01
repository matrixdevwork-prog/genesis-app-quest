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

    console.log('Push notification action:', action, params);

    let result;

    switch (action) {
      case 'subscribe':
        result = await subscribePush(supabase, params);
        break;
      case 'unsubscribe':
        result = await unsubscribePush(supabase, params);
        break;
      case 'send_notification':
        result = await sendNotification(supabase, params);
        break;
      case 'send_bulk_notifications':
        result = await sendBulkNotifications(supabase, params);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Push notification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function subscribePush(supabase: any, params: any) {
  const { userId, endpoint, p256dh, auth } = params;

  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: userId,
      endpoint,
      p256dh,
      auth
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function unsubscribePush(supabase: any, params: any) {
  const { userId, endpoint } = params;

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint);

  if (error) throw error;
  return { success: true };
}

async function sendNotification(supabase: any, params: any) {
  const { userId, title, body, icon, data: notificationData } = params;

  // Get user's push subscriptions
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  if (!subscriptions || subscriptions.length === 0) {
    return { sent: false, message: 'No subscriptions found' };
  }

  // Send to each subscription
  const results = await Promise.allSettled(
    subscriptions.map((sub: any) =>
      sendPushMessage(sub, title, body, icon, notificationData)
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { sent: true, successful, failed, total: subscriptions.length };
}

async function sendBulkNotifications(supabase: any, params: any) {
  const { userIds, title, body, icon, data: notificationData } = params;

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .in('user_id', userIds);

  if (error) throw error;

  if (!subscriptions || subscriptions.length === 0) {
    return { sent: false, message: 'No subscriptions found' };
  }

  const results = await Promise.allSettled(
    subscriptions.map((sub: any) =>
      sendPushMessage(sub, title, body, icon, notificationData)
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return { sent: true, successful, failed, total: subscriptions.length };
}

async function sendPushMessage(
  subscription: any,
  title: string,
  body: string,
  icon?: string,
  data?: any
) {
  // Note: This is a placeholder. In production, you'd use web-push library
  // or a service like Firebase Cloud Messaging
  console.log('Sending push notification:', {
    subscription: subscription.endpoint,
    title,
    body,
    icon,
    data
  });

  // For now, just simulate sending
  return { success: true };
}
