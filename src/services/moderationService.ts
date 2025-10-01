import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type ContentReport = Tables<'content_reports'>;
export type UserBan = Tables<'user_bans'>;
export type ModerationQueueItem = Tables<'moderation_queue'>;

export const moderationService = {
  // Create a content report
  async createReport(
    reportedBy: string,
    contentType: 'video' | 'user' | 'campaign' | 'comment',
    contentId: string,
    reason: string,
    description?: string
  ) {
    const { data, error } = await supabase.functions.invoke('moderation', {
      body: {
        action: 'create_report',
        reportedBy,
        contentType,
        contentId,
        reason,
        description
      }
    });

    return { data: data?.data, error };
  },

  // Review a report (admin only)
  async reviewReport(
    reportId: string,
    reviewedBy: string,
    status: 'reviewing' | 'resolved' | 'dismissed',
    resolutionNotes?: string
  ) {
    const { data, error } = await supabase.functions.invoke('moderation', {
      body: {
        action: 'review_report',
        reportId,
        reviewedBy,
        status,
        resolutionNotes
      }
    });

    return { data: data?.data, error };
  },

  // Ban a user (admin only)
  async banUser(
    userId: string,
    bannedBy: string,
    reason: string,
    banType: 'temporary' | 'permanent',
    expiresAt?: string
  ) {
    const { data, error } = await supabase.functions.invoke('moderation', {
      body: {
        action: 'ban_user',
        userId,
        bannedBy,
        reason,
        banType,
        expiresAt
      }
    });

    return { data: data?.data, error };
  },

  // Unban a user (admin only)
  async unbanUser(banId: string) {
    const { data, error } = await supabase.functions.invoke('moderation', {
      body: {
        action: 'unban_user',
        banId
      }
    });

    return { data: data?.data, error };
  },

  // Process ban appeal (admin only)
  async processAppeal(
    banId: string,
    appealStatus: 'approved' | 'denied',
    reviewedBy: string
  ) {
    const { data, error } = await supabase.functions.invoke('moderation', {
      body: {
        action: 'process_appeal',
        banId,
        appealStatus,
        reviewedBy
      }
    });

    return { data: data?.data, error };
  },

  // Get moderation queue (admin only)
  async getModerationQueue(
    priority?: 'low' | 'medium' | 'high' | 'critical',
    status?: 'pending' | 'approved' | 'rejected',
    limit = 50
  ) {
    const { data, error } = await supabase.functions.invoke('moderation', {
      body: {
        action: 'get_moderation_queue',
        priority,
        status,
        limit
      }
    });

    return { data: data?.data, error };
  },

  // Moderate content (admin only)
  async moderateContent(
    queueId: string,
    reviewedBy: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) {
    const { data, error } = await supabase.functions.invoke('moderation', {
      body: {
        action: 'moderate_content',
        queueId,
        reviewedBy,
        status,
        notes
      }
    });

    return { data: data?.data, error };
  },

  // Check content for spam
  async checkSpam(content: string) {
    const { data, error } = await supabase.functions.invoke('moderation', {
      body: {
        action: 'check_spam',
        content
      }
    });

    return { data: data?.data, error };
  },

  // Get user reports
  async getUserReports(userId: string) {
    const { data, error } = await supabase
      .from('content_reports')
      .select('*')
      .eq('reported_by', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Get user bans
  async getUserBans(userId: string) {
    const { data, error } = await supabase
      .from('user_bans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Check if user is banned
  async checkUserBanned(userId: string) {
    const { data, error } = await supabase
      .rpc('check_user_banned', { p_user_id: userId });

    return { data, error };
  },

  // Get all reports (admin only)
  async getAllReports(limit = 100) {
    const { data, error } = await supabase
      .from('content_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  // Get all bans (admin only)
  async getAllBans(limit = 100) {
    const { data, error } = await supabase
      .from('user_bans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  }
};

export default moderationService;
