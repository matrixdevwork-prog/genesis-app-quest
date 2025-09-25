import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Task = Tables<'tasks'>;
export type UserTask = Tables<'user_tasks'>;
export type Video = Tables<'videos'>;

export const taskService = {
  // Get available tasks for user
  async getAvailableTasks(userId: string, taskType?: 'watch' | 'like' | 'subscribe') {
    let query = supabase
      .from('tasks')
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
      .eq('status', 'pending')
      .neq('created_by', userId); // Don't show user's own tasks

    if (taskType) {
      query = query.eq('task_type', taskType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    return { data, error };
  },

  // Get user's assigned tasks
  async getUserTasks(userId: string, status?: 'pending' | 'in_progress' | 'completed' | 'failed') {
    let query = supabase
      .from('user_tasks')
      .select(`
        *,
        tasks (
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
        )
      `)
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    return { data, error };
  },

  // Assign task to user
  async assignTask(userId: string, taskId: string) {
    const { data, error } = await supabase
      .from('user_tasks')
      .insert({
        user_id: userId,
        task_id: taskId,
        status: 'in_progress'
      })
      .select()
      .single();

    return { data, error };
  },

  // Complete a task
  async completeTask(userId: string, taskId: string) {
    const { data, error } = await supabase.rpc('complete_task', {
      p_user_id: userId,
      p_task_id: taskId
    });

    return { data, error };
  },

  // Create a new task (for campaigns)
  async createTask(taskData: TablesInsert<'tasks'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    return { data, error };
  },

  // Update task status
  async updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed' | 'failed') {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .select()
      .single();

    return { data, error };
  },

  // Get task statistics for user
  async getTaskStats(userId: string) {
    const { data: completedTasks, error: completedError } = await supabase
      .from('user_tasks')
      .select('credits_earned')
      .eq('user_id', userId)
      .eq('status', 'completed');

    const { data: pendingTasks, error: pendingError } = await supabase
      .from('user_tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending');

    const totalEarned = completedTasks?.reduce((sum, task) => sum + (task.credits_earned || 0), 0) || 0;
    const totalCompleted = completedTasks?.length || 0;
    const totalPending = pendingTasks?.length || 0;

    return {
      data: {
        totalEarned,
        totalCompleted,
        totalPending
      },
      error: completedError || pendingError
    };
  },

  // Subscribe to task changes
  subscribeToTasks(callback: (task: Task) => void) {
    const channel = supabase
      .channel('task-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => callback(payload.new as Task)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // Subscribe to user task changes
  subscribeToUserTasks(userId: string, callback: (userTask: UserTask) => void) {
    const channel = supabase
      .channel('user-task-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_tasks',
          filter: `user_id=eq.${userId}`
        },
        (payload) => callback(payload.new as UserTask)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
};