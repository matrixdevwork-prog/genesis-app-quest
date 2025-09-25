import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Campaign = Tables<'campaigns'>;
export type Video = Tables<'videos'>;

export const campaignService = {
  // Get user's campaigns
  async getUserCampaigns(userId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        videos (
          id,
          youtube_id,
          title,
          description,
          thumbnail_url,
          duration,
          channel_name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Get all active campaigns
  async getActiveCampaigns() {
    const { data, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        videos (
          id,
          youtube_id,
          title,
          description,
          thumbnail_url,
          duration,
          channel_name
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Create a new campaign
  async createCampaign(
    userId: string,
    videoId: string,
    title: string,
    creditsAllocated: number,
    targetActions: number
  ) {
    const { data, error } = await supabase.rpc('create_campaign', {
      p_user_id: userId,
      p_video_id: videoId,
      p_title: title,
      p_credits_allocated: creditsAllocated,
      p_target_actions: targetActions
    });

    return { data, error };
  },

  // Update campaign status
  async updateCampaignStatus(campaignId: string, status: 'active' | 'paused' | 'completed' | 'cancelled') {
    const { data, error } = await supabase
      .from('campaigns')
      .update({ status })
      .eq('id', campaignId)
      .select()
      .single();

    return { data, error };
  },

  // Get campaign analytics
  async getCampaignAnalytics(campaignId: string) {
    // Get basic campaign info
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError) return { data: null, error: campaignError };

    // Get completed user tasks for this campaign
    const { data: completedTasks, error: completedError } = await supabase
      .from('user_tasks')
      .select('credits_earned')
      .eq('status', 'completed');

    if (completedError) return { data: null, error: completedError };

    const totalCreditsSpent = completedTasks?.reduce((sum, task) => 
      sum + (task.credits_earned || 0), 0) || 0;

    return {
      data: {
        totalTasks: campaign.target_actions,
        completedTasks: campaign.completed_actions,
        totalCreditsSpent,
        completionRate: campaign.target_actions > 0 ? 
          (campaign.completed_actions / campaign.target_actions) * 100 : 0
      },
      error: null
    };
  },

  // Get campaign performance over time
  async getCampaignPerformance(campaignId: string, days = 30) {
    const { data, error } = await supabase
      .from('user_tasks')
      .select(`
        completed_at,
        credits_earned,
        tasks!inner (
          campaign_id
        )
      `)
      .eq('tasks.campaign_id', campaignId)
      .eq('status', 'completed')
      .gte('completed_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('completed_at', { ascending: true });

    return { data, error };
  },

  // Subscribe to campaign changes
  subscribeToCampaigns(userId: string, callback: (campaign: Campaign) => void) {
    const channel = supabase
      .channel('campaign-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `user_id=eq.${userId}`
        },
        (payload) => callback(payload.new as Campaign)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
};