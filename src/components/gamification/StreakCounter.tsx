import React from 'react';
import { Flame, Calendar, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  lastLoginDate?: Date;
  streakBonus?: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  lastLoginDate,
  streakBonus = 5
}) => {
  const isStreakActive = lastLoginDate && 
    new Date().getTime() - lastLoginDate.getTime() < 24 * 60 * 60 * 1000; // Within 24 hours

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'from-warning/20 to-warning/5 border-warning/30 text-warning';
    if (streak >= 14) return 'from-secondary/20 to-secondary/5 border-secondary/30 text-secondary';
    if (streak >= 7) return 'from-primary/20 to-primary/5 border-primary/30 text-primary';
    if (streak >= 3) return 'from-success/20 to-success/5 border-success/30 text-success';
    return 'from-muted/20 to-muted/5 border-muted/30 text-muted-foreground';
  };

  const getStreakTitle = (streak: number) => {
    if (streak >= 30) return 'Legendary Streak!';
    if (streak >= 14) return 'Amazing Streak!';
    if (streak >= 7) return 'Great Streak!';
    if (streak >= 3) return 'Good Streak!';
    return 'Building Streak';
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⭐';
    return '📅';
  };

  return (
    <Card className={cn("bg-gradient-to-br border-2", getStreakColor(currentStreak))}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-current/10 rounded-full">
            <Flame className="h-5 w-5" />
          </div>
          Login Streak
          {currentStreak >= 7 && (
            <Badge variant="outline" className="bg-current/10 border-current/30">
              {getStreakEmoji(currentStreak)}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {getStreakTitle(currentStreak)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2 animate-fade-in">
            {currentStreak}
            <span className="text-lg text-muted-foreground ml-1">days</span>
          </div>
          
          {currentStreak > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <Star className="h-4 w-4" />
              <span>+{currentStreak * streakBonus} bonus credits earned</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">
              {longestStreak}
            </p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">
              {currentStreak * streakBonus}
            </p>
            <p className="text-xs text-muted-foreground">Bonus Credits</p>
          </div>
        </div>

        {/* Streak milestones */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Next Milestones</h4>
          <div className="grid grid-cols-4 gap-2">
            {[3, 7, 14, 30].map((milestone) => (
              <div
                key={milestone}
                className={cn(
                  "text-center p-2 rounded-lg border text-xs transition-all",
                  currentStreak >= milestone
                    ? "bg-current/10 border-current/30 text-current"
                    : "bg-muted/30 border-muted text-muted-foreground"
                )}
              >
                <div className="font-bold">{milestone}</div>
                <div className="text-xs">days</div>
                {currentStreak >= milestone && (
                  <div className="text-xs">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {isStreakActive 
              ? "Keep it up! Log in daily to maintain your streak"
              : currentStreak > 0 
                ? "Your streak is at risk! Log in to continue"
                : "Start your streak by logging in daily"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCounter;