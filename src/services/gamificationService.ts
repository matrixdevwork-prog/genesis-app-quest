import { supabase } from '@/integrations/supabase/client';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: number;
}

export interface XPReward {
  xpAwarded: number;
  newXP: number;
  newLevel: number;
  leveledUp: boolean;
  nextLevelXP: number;
}

export interface LeaderboardEntry {
  id: string;
  full_name: string;
  username: string;
  level: number;
  xp: number;
  avatar_url: string;
  rank: number;
}

export const gamificationService = {
  // Calculate and award XP for task completion
  async awardXP(userId: string, taskType: 'watch' | 'like' | 'subscribe'): Promise<{ data: XPReward | null; error: any }> {
    const { data, error } = await supabase.functions.invoke('gamification-system', {
      body: {
        action: 'calculate_xp',
        userId,
        taskType
      }
    });

    return { data: data?.data, error };
  },

  // Check and award new achievements
  async checkAchievements(userId: string) {
    const { data, error } = await supabase.functions.invoke('gamification-system', {
      body: {
        action: 'check_achievements',
        userId
      }
    });

    return { data: data?.data, error };
  },

  // Update daily login streak
  async updateStreak(userId: string) {
    const { data, error } = await supabase.functions.invoke('gamification-system', {
      body: {
        action: 'update_streak',
        userId
      }
    });

    return { data: data?.data, error };
  },

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<{ data: LeaderboardEntry[] | null; error: any }> {
    const { data, error } = await supabase.functions.invoke('gamification-system', {
      body: {
        action: 'get_leaderboard',
        limit
      }
    });

    return { data: data?.data, error };
  },

  // Claim daily reward
  async claimDailyReward(userId: string) {
    const { data, error } = await supabase.functions.invoke('gamification-system', {
      body: {
        action: 'daily_reward',
        userId
      }
    });

    return { data: data?.data, error };
  },

  // Get user achievements
  async getUserAchievements(userId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    return { data, error };
  },

  // Get user level progress
  async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('level, xp, streak_count')
      .eq('id', userId)
      .single();

    if (error) return { data: null, error };

    // Calculate next level XP requirement
    const levelThresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000, 23000, 30000, 40000, 50000];
    const currentLevel = data.level;
    const nextLevelXP = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
    const currentLevelXP = levelThresholds[currentLevel - 1] || 0;
    const progressToNext = data.xp - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;

    return {
      data: {
        ...data,
        nextLevelXP,
        currentLevelXP,
        progressToNext,
        xpNeeded,
        progressPercentage: Math.min(100, (progressToNext / xpNeeded) * 100)
      },
      error: null
    };
  }
};

export default gamificationService;