import React, { useState, useEffect } from 'react';
import { Play, Heart, UserPlus, Filter, RefreshCw, Clock, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { taskService } from '@/services/taskService';

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  // Realtime subscribe to new tasks
  useEffect(() => {
    const channel = supabase
      .channel('tasks-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          const newTask = payload.new as any;
          if (newTask.status === 'pending' && newTask.created_by !== user?.id) {
            setTasks((prev) => [newTask, ...prev].slice(0, 50));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tasks')
        .select(`
          *,
          videos (
            id,
            title,
            thumbnail_url,
            duration,
            channel_name
          )
        `)
        .eq('status', 'pending')
        .limit(20);

      if (user?.id) {
        query = query.neq('created_by', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter(task => task.task_type === activeTab);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleTaskAction = async (task: any) => {
    try {
      const { error } = await taskService.completeTask(
        user!.id,
        task.id,
        task.task_type,
        task.videos?.youtube_id || ''
      );

      if (error) {
        toast.error(error.message || "Failed to complete task");
        return;
      }

      toast.success(`Task completed! You earned ${task.credits_reward} credits`);
      
      // Reload tasks
      await loadTasks();
    } catch (error) {
      console.error('Task completion error:', error);
      toast.error("Failed to complete task");
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'watch': return Play;
      case 'like': return Heart;
      case 'subscribe': return UserPlus;
      default: return Play;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'watch': return 'bg-primary/10 text-primary';
      case 'like': return 'bg-destructive/10 text-destructive';
      case 'subscribe': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Available Tasks</h1>
          <p className="text-muted-foreground">Complete tasks to earn credits</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="watch">Watch</TabsTrigger>
          <TabsTrigger value="like">Like</TabsTrigger>
          <TabsTrigger value="subscribe">Subscribe</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-muted rounded-full">
                    <Filter className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No tasks available</h3>
                    <p className="text-muted-foreground">
                      {activeTab === 'all' 
                        ? 'Check back later for new tasks'
                        : `No ${activeTab} tasks available right now`
                      }
                    </p>
                  </div>
                  <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Tasks
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task) => {
                const TaskIcon = getTaskIcon(task.task_type);
                const video = task.videos;
                
                return (
                  <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Thumbnail */}
                        <div className="relative w-48 h-32 flex-shrink-0 bg-muted">
                          {video?.thumbnail_url && (
                            <img 
                              src={video.thumbnail_url} 
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {video?.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              {video.duration}s
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground line-clamp-2">
                                  {video?.title || 'Video Task'}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {video?.channel_name || 'Unknown Channel'}
                                </p>
                              </div>
                              <Badge className={`ml-2 ${getTaskTypeColor(task.task_type)}`}>
                                <TaskIcon className="h-3 w-3 mr-1" />
                                {task.task_type}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {task.task_type === 'watch' && 'Watch for 30 seconds'}
                              {task.task_type === 'like' && 'Like the video'}
                              {task.task_type === 'subscribe' && 'Subscribe to channel'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center text-primary">
                              <Coins className="h-4 w-4 mr-1" />
                              <span className="font-semibold">{task.credits_reward} Credits</span>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => handleTaskAction(task)}
                            >
                              Start Task
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tasks;
