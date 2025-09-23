import React, { useState, useEffect } from 'react';
import { Gift, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface DailyRewardProps {
  lastClaimTime?: Date;
  rewardAmount: number;
  bonusMultiplier?: number;
}

const DailyReward: React.FC<DailyRewardProps> = ({
  lastClaimTime,
  rewardAmount = 50,
  bonusMultiplier = 1
}) => {
  const [timeUntilNextReward, setTimeUntilNextReward] = useState<string>('');
  const [canClaim, setCanClaim] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showClaimAnimation, setShowClaimAnimation] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      if (!lastClaimTime) {
        setCanClaim(true);
        setTimeUntilNextReward('');
        return;
      }

      const now = new Date();
      const nextRewardTime = new Date(lastClaimTime);
      nextRewardTime.setHours(24, 0, 0, 0); // Next day at midnight

      if (now >= nextRewardTime) {
        setCanClaim(true);
        setTimeUntilNextReward('');
      } else {
        setCanClaim(false);
        const timeDiff = nextRewardTime.getTime() - now.getTime();
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        setTimeUntilNextReward(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lastClaimTime]);

  const handleClaimReward = async () => {
    setIsClaiming(true);
    setShowClaimAnimation(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsClaiming(false);
    setCanClaim(false);
    
    // Hide animation after 2 seconds
    setTimeout(() => setShowClaimAnimation(false), 2000);
    
    // TODO: Implement actual reward claiming logic in Phase 6
    console.log(`Claimed ${rewardAmount * bonusMultiplier} credits!`);
  };

  const progressPercentage = lastClaimTime 
    ? Math.max(0, 100 - ((new Date().getTime() - lastClaimTime.getTime()) / (24 * 60 * 60 * 1000)) * 100)
    : 0;

  return (
    <Card className="relative overflow-hidden">
      {showClaimAnimation && (
        <div className="absolute inset-0 bg-gradient-to-r from-warning/20 via-warning/10 to-warning/20 animate-pulse-slow z-10" />
      )}
      
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-warning/10 rounded-full">
            <Gift className="h-5 w-5 text-warning" />
          </div>
          Daily Reward
          {bonusMultiplier > 1 && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              {bonusMultiplier}x Bonus!
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Claim your daily reward to earn bonus credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-warning mb-2 animate-fade-in">
            {rewardAmount * bonusMultiplier}
            <span className="text-lg text-muted-foreground ml-1">credits</span>
          </div>
          
          {canClaim ? (
            <Button 
              onClick={handleClaimReward}
              disabled={isClaiming}
              className="w-full bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70 text-warning-foreground"
            >
              {isClaiming ? (
                <>
                  <Star className="h-4 w-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Claim Reward
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Next reward in: {timeUntilNextReward}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Cooldown Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-2 [&>[role=progressbar]]:bg-warning"
                />
              </div>
              
              <Button variant="outline" disabled className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Come Back Later
              </Button>
            </div>
          )}
        </div>

        {showClaimAnimation && (
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-warning/10 text-warning px-4 py-2 rounded-full">
              <Star className="h-4 w-4 animate-spin" />
              <span className="font-medium">
                +{rewardAmount * bonusMultiplier} credits claimed!
              </span>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Daily rewards reset at midnight
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyReward;