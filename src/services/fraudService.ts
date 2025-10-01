import { supabase } from '@/integrations/supabase/client';

export const fraudService = {
  // Log fraud event
  async logEvent(
    userId: string,
    ipAddress: string,
    deviceFingerprint: string,
    eventType: string,
    details: any
  ) {
    const { data, error } = await supabase.functions.invoke('fraud-detection', {
      body: {
        action: 'log_event',
        userId,
        ipAddress,
        deviceFingerprint,
        eventType,
        details
      }
    });

    return { data: data?.data, error };
  },

  // Check user for fraud
  async checkUser(userId: string) {
    const { data, error } = await supabase.functions.invoke('fraud-detection', {
      body: {
        action: 'check_user',
        userId
      }
    });

    return { data: data?.data, error };
  },

  // Get fraud analytics
  async getAnalytics(startDate?: string, endDate?: string) {
    const { data, error } = await supabase.functions.invoke('fraud-detection', {
      body: {
        action: 'get_fraud_analytics',
        startDate,
        endDate
      }
    });

    return { data: data?.data, error };
  },

  // Check rate limit
  async checkRateLimit(
    userId: string,
    action: string,
    limit = 10,
    windowMinutes = 60
  ) {
    const { data, error } = await supabase.functions.invoke('fraud-detection', {
      body: {
        action: 'rate_limit_check',
        userId,
        actionType: action,
        limit,
        windowMinutes
      }
    });

    return { data: data?.data, error };
  },

  // Get device fingerprint
  getDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');

    return btoa(fingerprint).substring(0, 50);
  },

  // Get IP address (client-side approximation)
  async getIPAddress(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const ipData = await response.json();
      return ipData.ip;
    } catch {
      return 'unknown';
    }
  }
};

export default fraudService;
