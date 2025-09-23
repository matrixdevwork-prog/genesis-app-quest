import React, { useState } from 'react';
import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  Coins,
  TrendingUp,
  Settings,
  Gift,
  User,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'earnings' | 'promotions' | 'system' | 'achievements' | 'social';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: any;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'earnings',
      title: 'Credits Earned!',
      message: 'You earned 15 credits for completing "Watch Guitar Tutorial" task',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      priority: 'medium',
      metadata: { credits: 15, taskType: 'watch' }
    },
    {
      id: '2',
      type: 'achievements',
      title: 'Achievement Unlocked!',
      message: 'Congratulations! You have reached Level 5',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: false,
      priority: 'high',
      metadata: { level: 5 }
    },
    {
      id: '3',
      type: 'promotions',
      title: 'Campaign Update',
      message: 'Your "Cooking Masterclass" campaign has received 50+ views',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      read: true,
      priority: 'medium',
      metadata: { campaignName: 'Cooking Masterclass', views: 50 }
    },
    {
      id: '4',
      type: 'system',
      title: 'Daily Reward Available',
      message: 'Your daily reward of 50 credits is ready to claim',
      timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
      read: true,
      priority: 'low',
      metadata: { rewardAmount: 50 }
    },
    {
      id: '5',
      type: 'social',
      title: 'New Referral',
      message: 'Someone joined using your referral code! You both earned bonus credits',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      read: true,
      priority: 'medium',
      metadata: { bonusCredits: 10 }
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'earnings' | 'promotions' | 'system' | 'achievements' | 'social'>('all');

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'earnings': return <Coins className={iconClass} />;
      case 'promotions': return <TrendingUp className={iconClass} />;
      case 'system': return <Settings className={iconClass} />;
      case 'achievements': return <Gift className={iconClass} />;
      case 'social': return <User className={iconClass} />;
      default: return <Bell className={iconClass} />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'earnings': return 'text-warning bg-warning/10';
      case 'promotions': return 'text-primary bg-primary/10';
      case 'system': return 'text-muted-foreground bg-muted/20';
      case 'achievements': return 'text-success bg-success/10';
      case 'social': return 'text-secondary bg-secondary/10';
      default: return 'text-muted-foreground bg-muted/20';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-destructive';
      case 'medium': return 'border-l-warning';
      case 'low': return 'border-l-muted';
      default: return 'border-l-muted';
    }
  };

  const formatNotificationTime = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } else if (isYesterday(timestamp)) {
      return 'Yesterday';
    } else {
      return format(timestamp, 'MMM d');
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = isToday(notification.timestamp) 
      ? 'Today'
      : isYesterday(notification.timestamp)
        ? 'Yesterday'
        : format(notification.timestamp, 'MMMM d, yyyy');
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">Stay updated with your latest activities</p>
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-6">
            {notifications.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-muted rounded-full">
                      <BellOff className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">No notifications</h3>
                      <p className="text-muted-foreground">
                        You're all caught up! Check back later for updates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : Object.keys(groupedNotifications).length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-muted rounded-full">
                      <Filter className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">No {filter} notifications</h3>
                      <p className="text-muted-foreground">
                        No notifications found for this category.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedNotifications).map(([date, dayNotifications]) => (
                <div key={date} className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {date}
                  </h3>
                  
                  <div className="space-y-3">
                    {dayNotifications.map((notification, index) => (
                      <Card 
                        key={notification.id}
                        className={cn(
                          "transition-all duration-200 hover:shadow-md border-l-4 animate-fade-in",
                          getPriorityColor(notification.priority),
                          !notification.read && "bg-muted/30"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "p-2 rounded-full",
                              getNotificationColor(notification.type)
                            )}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className={cn(
                                    "font-medium text-foreground",
                                    !notification.read && "font-semibold"
                                  )}>
                                    {notification.title}
                                    {!notification.read && (
                                      <span className="ml-2 w-2 h-2 bg-primary rounded-full inline-block" />
                                    )}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      {formatNotificationTime(notification.timestamp)}
                                    </span>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {notification.type}
                                    </Badge>
                                    {notification.priority === 'high' && (
                                      <Badge variant="destructive" className="text-xs">
                                        High Priority
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => markAsRead(notification.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteNotification(notification.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Notifications;