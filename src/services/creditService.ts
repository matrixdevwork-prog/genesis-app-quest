import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type CreditTransaction = Tables<'credit_transactions'>;

export const creditService = {
  // Get user's credit balance
  async getCreditBalance(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    return { balance: data?.credits || 0, error };
  },

  // Get credit transaction history
  async getTransactionHistory(userId: string, limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return { data, error };
  },

  // Get credit statistics
  async getCreditStats(userId: string) {
    const { data: transactions, error } = await supabase
      .from('credit_transactions')
      .select('amount, transaction_type, created_at')
      .eq('user_id', userId);

    if (error) return { data: null, error };

    const totalEarned = transactions
      ?.filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    const totalSpent = Math.abs(transactions
      ?.filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0) || 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEarned = transactions
      ?.filter(t => t.amount > 0 && new Date(t.created_at) >= todayStart)
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weeklyEarned = transactions
      ?.filter(t => t.amount > 0 && new Date(t.created_at) >= weekStart)
      .reduce((sum, t) => sum + t.amount, 0) || 0;

    return {
      data: {
        totalEarned,
        totalSpent,
        todayEarned,
        weeklyEarned,
        netBalance: totalEarned - totalSpent
      },
      error: null
    };
  },

  // Add credits manually (admin function)
  async addCredits(
    userId: string,
    amount: number,
    transactionType: string,
    description?: string,
    referenceId?: string
  ) {
    const { data, error } = await supabase.rpc('add_credits', {
      target_user_id: userId,
      credit_amount: amount,
      transaction_type: transactionType,
      reference_id: referenceId,
      description: description
    });

    return { data, error };
  },

  // Get earnings chart data
  async getEarningsChartData(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('credit_transactions')
      .select('amount, created_at, transaction_type')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) return { data: null, error };

    // Group by date and sum earnings
    const dailyEarnings = data?.reduce((acc, transaction) => {
      const date = new Date(transaction.created_at).toDateString();
      if (!acc[date]) {
        acc[date] = { date, earned: 0, spent: 0 };
      }
      
      if (transaction.amount > 0) {
        acc[date].earned += transaction.amount;
      } else {
        acc[date].spent += Math.abs(transaction.amount);
      }
      
      return acc;
    }, {} as Record<string, { date: string; earned: number; spent: number }>);

    return {
      data: Object.values(dailyEarnings || {}),
      error: null
    };
  },

  // Subscribe to credit balance changes
  subscribeToCreditBalance(userId: string, callback: (balance: number) => void) {
    const channel = supabase
      .channel('credit-balance')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          const newProfile = payload.new as Tables<'profiles'>;
          callback(newProfile.credits);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // Subscribe to new transactions
  subscribeToTransactions(userId: string, callback: (transaction: CreditTransaction) => void) {
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
        (payload) => callback(payload.new as CreditTransaction)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
};