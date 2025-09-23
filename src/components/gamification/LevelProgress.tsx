import React from 'react';
import { TrendingUp, Star, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LevelProgressProps {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
}

const LevelProgress: React.FC<LevelProgressProps> = ({
  currentLevel,
  currentXP,
  nextLevelXP,
  totalXP
}) => {
  const progressPercentage = (currentXP / nextLevelXP) * 100;
  const xpNeeded = nextLevelXP - currentXP;

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'from-warning/20 to-warning/5 border-warning/30';
    if (level >= 15) return 'from-secondary/20 to-secondary/5 border-secondary/30';
    if (level >= 10) return 'from-primary/20 to-primary/5 border-primary/30';
    if (level >= 5) return 'from-success/20 to-success/5 border-success/30';
    return 'from-muted/20 to-muted/5 border-muted/30';
  };

  const getLevelIcon = (level: number) => {
    if (level >= 15) return <Award className="h-6 w-6 text-warning" />;
    if (level >= 10) return <Star className="h-6 w-6 text-secondary" />;
    return <TrendingUp className="h-6 w-6 text-primary" />;
  };

  return (
    <Card className={cn("bg-gradient-to-br border-2", getLevelColor(currentLevel))}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getLevelIcon(currentLevel)}
            <span>Level Progress</span>
          </div>
          <Badge 
            variant="outline" 
            className="text-lg px-3 py-1 font-bold"
          >
            {currentLevel}
          </Badge>
        </CardTitle>
        <CardDescription>
          {xpNeeded.toLocaleString()} XP needed for level {currentLevel + 1}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Experience Points</span>
            <span className="text-muted-foreground">
              {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={progressPercentage} 
              className="h-3 [&>[role=progressbar]]:bg-gradient-to-r [&>[role=progressbar]]:from-primary [&>[role=progressbar]]:to-secondary"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-foreground drop-shadow-sm">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground animate-pulse-slow">
              {totalXP.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-primary animate-bounce-gentle">
              {currentLevel}
            </p>
            <p className="text-xs text-muted-foreground">Current Level</p>
          </div>
        </div>

        {/* Level Milestones */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Next Milestones</h4>
          <div className="space-y-1">
            {[currentLevel + 1, currentLevel + 2, currentLevel + 3].map((level) => (
              <div key={level} className="flex justify-between text-xs">
                <span className="text-muted-foreground">Level {level}</span>
                <span className="text-muted-foreground">
                  {(level * 1000).toLocaleString()} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LevelProgress;