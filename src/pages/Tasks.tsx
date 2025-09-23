import React, { useState } from 'react';
import { Play, Heart, UserPlus, Filter, RefreshCw, Clock, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

const Tasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  // Mock task data
  const tasks = [
    {
      id: 1,
      type: 'watch',
      title: 'Amazing Guitar Solo Cover',
      channel: 'MusicMaster',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
      duration: '3:45',
      credits: 1,
      requirement: 'Watch for 30 seconds',
    },
    {
      id: 2,
      type: 'like',
      title: 'How to Code Better',
      channel: 'DevTips',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop',
      duration: '12:30',
      credits: 2,
      requirement: 'Like the video',
    },
    {
      id: 3,
      type: 'subscribe',
      title: 'Travel Vlog - Paris',
      channel: 'WanderlustTV',
      thumbnail: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=300&h=200&fit=crop',
      duration: '8:15',
      credits: 5,
      requirement: 'Subscribe to channel',
    },
    {
      id: 4,
      type: 'watch',
      title: 'Cooking Masterclass',
      channel: 'ChefLife',
      thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
      duration: '15:20',
      credits: 1,
      requirement: 'Watch for 30 seconds',
    },
  ];

  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter(task => task.type === activeTab);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleTaskAction = (taskId: number, action: string) => {
    console.log(`Performing ${action} on task ${taskId}`);
    // TODO: Implement task completion logic in Phase 6
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
                const TaskIcon = getTaskIcon(task.type);
                return (
                  <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex">
                        {/* Thumbnail */}
                        <div className="relative w-48 h-32 flex-shrink-0">
                          <img 
                            src={task.thumbnail} 
                            alt={task.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {task.duration}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground line-clamp-2">
                                  {task.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {task.channel}
                                </p>
                              </div>
                              <Badge className={`ml-2 ${getTaskTypeColor(task.type)}`}>
                                <TaskIcon className="h-3 w-3 mr-1" />
                                {task.type}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {task.requirement}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center text-primary">
                              <Coins className="h-4 w-4 mr-1" />
                              <span className="font-semibold">{task.credits} Credits</span>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => handleTaskAction(task.id, task.type)}
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