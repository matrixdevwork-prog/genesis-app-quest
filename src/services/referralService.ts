import { supabase } from '@/integrations/supabase/client';

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  recentReferrals: number;
  totalEarnings: number;
  referredUsers: Array<{
    id: string;
    name: string;
    joinedAt: string;
  }>;
}

export interface ReferralValidation {
  valid: boolean;
  referrer?: {
    id: string;
    name: string;
  };
  bonuses?: {
    referrer: number;
    referee: number;
  };
  message?: string;
}

export const referralService = {
  // Process a referral when a new user signs up
  async processReferral(referralCode: string, newUserId: string) {
    const { data, error } = await supabase.functions.invoke('referral-system', {
      body: {
        action: 'process_referral',
        referralCode,
        newUserId
      }
    });

    return { data: data?.data, error };
  },

  // Get referral statistics for a user
  async getReferralStats(userId: string): Promise<{ data: ReferralStats | null; error: any }> {
    const { data, error } = await supabase.functions.invoke('referral-system', {
      body: {
        action: 'get_referral_stats',
        userId
      }
    });

    return { data: data?.data, error };
  },

  // Generate a new referral code
  async generateReferralCode(userId: string) {
    const { data, error } = await supabase.functions.invoke('referral-system', {
      body: {
        action: 'generate_code',
        userId
      }
    });

    return { data: data?.data, error };
  },

  // Validate a referral code
  async validateReferralCode(referralCode: string): Promise<{ data: ReferralValidation | null; error: any }> {
    const { data, error } = await supabase.functions.invoke('referral-system', {
      body: {
        action: 'validate_code',
        referralCode
      }
    });

    return { data: data?.data, error };
  },

  // Get referral events for a user
  async getReferralEvents(userId: string) {
    const { data, error } = await supabase
      .from('referral_events')
      .select('*')
      .or(`referrer_id.eq.${userId},referee_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Generate referral link
  generateReferralLink(referralCode: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/signup?ref=${referralCode}`;
  },

  // Share referral code
  async shareReferralCode(referralCode: string, method: 'copy' | 'whatsapp' | 'twitter' | 'facebook') {
    const referralLink = this.generateReferralLink(referralCode);
    const shareText = `Join me on Sub For Sub and get bonus credits! Use my referral code: ${referralCode} or click this link: ${referralLink}`;

    switch (method) {
      case 'copy':
        await navigator.clipboard.writeText(referralLink);
        return { success: true, message: 'Referral link copied to clipboard!' };

      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        return { success: true, message: 'WhatsApp opened for sharing' };

      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        return { success: true, message: 'Twitter opened for sharing' };

      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
        return { success: true, message: 'Facebook opened for sharing' };

      default:
        return { success: false, message: 'Unknown sharing method' };
    }
  }
};

export default referralService;