import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Video = Tables<'videos'>;

export const videoService = {
  // Get all videos
  async getVideos() {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Get video by YouTube ID
  async getVideoByYouTubeId(youtubeId: string) {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('youtube_id', youtubeId)
      .single();

    return { data, error };
  },

  // Create a new video entry
  async createVideo(videoData: TablesInsert<'videos'>) {
    const { data, error } = await supabase
      .from('videos')
      .insert(videoData)
      .select()
      .single();

    return { data, error };
  },

  // Update video information
  async updateVideo(videoId: string, updates: Partial<Video>) {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', videoId)
      .select()
      .single();

    return { data, error };
  },

  // Delete video
  async deleteVideo(videoId: string) {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);

    return { error };
  },

  // Search videos by title or channel
  async searchVideos(query: string) {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .or(`title.ilike.%${query}%,channel_name.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Get popular videos (based on task count)
  async getPopularVideos(limit = 10) {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        tasks (
          id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Sort by task count
    const sortedData = data?.sort((a, b) => 
      (b.tasks?.length || 0) - (a.tasks?.length || 0)
    );

    return { data: sortedData, error };
  },

  // Extract video metadata from YouTube URL
  extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  },

  // Validate YouTube URL
  isValidYouTubeUrl(url: string): boolean {
    const youtubeId = this.extractYouTubeId(url);
    return youtubeId !== null;
  },

  // Get video thumbnail URL
  getYouTubeThumbnail(youtubeId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string {
    return `https://img.youtube.com/vi/${youtubeId}/${quality}default.jpg`;
  },

  // Subscribe to video changes
  subscribeToVideos(callback: (video: Video) => void) {
    const channel = supabase
      .channel('video-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos'
        },
        (payload) => callback(payload.new as Video)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
};