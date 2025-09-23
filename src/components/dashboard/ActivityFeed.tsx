import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Play, Heart, UserPlus, Coins, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: string;
  type: 'task_completed' | 'credits_earned' | 'level_up' | 'campaign_created';
  description: string;
  timestamp: Date;
  amount?: number;
  meta?: any;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  maxItems = 5 
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'task_completed':
        return <Play className="h-4 w-4 text-primary" />;
      case 'credits_earned':
        return <Coins className="h-4 w-4 text-warning" />;
      case 'level_up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'campaign_created':
        return <Heart className="h-4 w-4 text-secondary" />;
      default:
        return <Play className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'task_completed':
        return 'bg-primary/10';
      case 'credits_earned':
        return 'bg-warning/10';
      case 'level_up':
        return 'bg-success/10';
      case 'campaign_created':
        return 'bg-secondary/10';
      default:
        return 'bg-muted/10';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Your latest actions and achievements</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground">Complete tasks to see your progress here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, maxItems).map((activity, index) => (
              <div 
                key={activity.id} 
                className="flex items-start gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                    {activity.amount && (
                      <Badge variant="outline" className="text-xs">
                        +{activity.amount} credits
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;