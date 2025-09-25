import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export const userService = {
  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  },

  // Update user profile
  async updateProfile(userId: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  },

  // Get user's credit transactions
  async getCreditTransactions(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  // Get user's role
  async getUserRole(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  // Check if user is admin
  async isAdmin(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();

    return { isAdmin: !!data && !error, error };
  },

  // Get leaderboard
  async getLeaderboard(limit = 100) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, credits, level, xp')
      .order('credits', { ascending: false })
      .limit(limit);

    return { data, error };
  },

  // Subscribe to profile changes
  subscribeToProfile(userId: string, callback: (profile: Profile) => void) {
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => callback(payload.new as Profile)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // Subscribe to credit transactions
  subscribeToCreditTransactions(userId: string, callback: (transaction: any) => void) {
    const channel = supabase
      .channel('credit-transactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'credit_transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => callback(payload.new)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
};