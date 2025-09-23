import React from 'react';
import { Trophy, Star, Medal, Award, Crown, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'medal' | 'award' | 'crown' | 'zap';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedAt?: Date;
  progress?: {
    current: number;
    target: number;
  };
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  maxDisplay?: number;
}

const AchievementBadges: React.FC<AchievementBadgesProps> = ({ 
  achievements, 
  maxDisplay = 6 
}) => {
  const getIcon = (iconType: Achievement['icon']) => {
    const iconClass = "h-6 w-6";
    switch (iconType) {
      case 'trophy': return <Trophy className={iconClass} />;
      case 'star': return <Star className={iconClass} />;
      case 'medal': return <Medal className={iconClass} />;
      case 'award': return <Award className={iconClass} />;
      case 'crown': return <Crown className={iconClass} />;
      case 'zap': return <Zap className={iconClass} />;
      default: return <Trophy className={iconClass} />;
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-muted-foreground/20 bg-muted/5';
      case 'rare': return 'border-primary/30 bg-primary/5';
      case 'epic': return 'border-secondary/30 bg-secondary/5';
      case 'legendary': return 'border-warning/30 bg-warning/5';
      default: return 'border-muted-foreground/20 bg-muted/5';
    }
  };

  const getRarityTextColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground';
      case 'rare': return 'text-primary';
      case 'epic': return 'text-secondary';
      case 'legendary': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const inProgressAchievements = achievements.filter(a => !a.earned && a.progress);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          Achievements
        </CardTitle>
        <CardDescription>
          {earnedAchievements.length} of {achievements.length} unlocked
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Earned Achievements */}
        {earnedAchievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Earned</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {earnedAchievements.slice(0, maxDisplay).map((achievement, index) => (
                <div
                  key={achievement.id}
                  className={cn(
                    "p-3 rounded-lg border-2 text-center transition-all duration-200 hover:shadow-md animate-scale-in",
                    getRarityColor(achievement.rarity)
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={cn(
                    "flex justify-center mb-2",
                    getRarityTextColor(achievement.rarity)
                  )}>
                    {getIcon(achievement.icon)}
                  </div>
                  <h5 className="text-xs font-semibold text-foreground mb-1">
                    {achievement.title}
                  </h5>
                  <p className="text-xs text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs capitalize",
                      getRarityTextColor(achievement.rarity)
                    )}
                  >
                    {achievement.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Progress Achievements */}
        {inProgressAchievements.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">In Progress</h4>
            <div className="space-y-2">
              {inProgressAchievements.slice(0, 3).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border"
                >
                  <div className="text-muted-foreground">
                    {getIcon(achievement.icon)}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-foreground">
                      {achievement.title}
                    </h5>
                    <p className="text-xs text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    {achievement.progress && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {achievement.progress.current} / {achievement.progress.target}
                          </span>
                          <span className="text-muted-foreground">
                            {Math.round((achievement.progress.current / achievement.progress.target) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${Math.min(100, (achievement.progress.current / achievement.progress.target) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {achievements.length === 0 && (
          <div className="text-center py-6">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No achievements yet</p>
            <p className="text-sm text-muted-foreground">Complete tasks to unlock achievements</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementBadges;