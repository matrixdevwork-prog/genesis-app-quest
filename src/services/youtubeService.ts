import { supabase } from '@/integrations/supabase/client';

export const youtubeService = {
  // Fetch video metadata using edge function
  async fetchVideoMetadata(videoUrl: string) {
    const { data, error } = await supabase.functions.invoke('campaign-management', {
      body: {
        action: 'fetch_video_metadata',
        videoUrl
      }
    });

    return { data: data?.data, error };
  },

  // Create campaign with video integration
  async createCampaign(userId: string, videoUrl: string, title: string, creditsAllocated: number, targetActions: number) {
    const { data, error } = await supabase.functions.invoke('campaign-management', {
      body: {
        action: 'create',
        // userId is extracted from JWT in edge function, not sent from client
        videoUrl,
        title,
        creditsAllocated,
        targetActions
      }
    });

    return { data: data?.data, error };
  },

  // Update campaign status
  async updateCampaignStatus(campaignId: string, status: 'active' | 'paused' | 'completed' | 'cancelled') {
    const { data, error } = await supabase.functions.invoke('campaign-management', {
      body: {
        action: 'update_status',
        campaignId,
        status
      }
    });

    return { data: data?.data, error };
  },

  // Get campaign analytics
  async getCampaignAnalytics(campaignId: string) {
    const { data, error } = await supabase.functions.invoke('campaign-management', {
      body: {
        action: 'get_analytics',
        campaignId
      }
    });

    return { data: data?.data, error };
  }
};

export default youtubeService;