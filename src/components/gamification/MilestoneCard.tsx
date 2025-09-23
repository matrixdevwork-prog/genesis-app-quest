import React, { useState } from 'react';
import { Trophy, Star, Gift, Sparkles, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Modal, 
  ModalContent, 
  ModalDescription, 
  ModalHeader, 
  ModalTitle,
  ModalTrigger 
} from '@/components/ui/modal';
import { cn } from '@/lib/utils';

interface Milestone {
  id: string;
  title: string;
  description: string;
  type: 'level' | 'credits' | 'tasks' | 'streak' | 'referral';
  icon: 'trophy' | 'star' | 'gift' | 'sparkles';
  reward: {
    type: 'credits' | 'badge' | 'multiplier';
    amount?: number;
    description: string;
  };
  achieved: boolean;
  achievedAt?: Date;
  celebration?: boolean;
}

interface MilestoneCardProps {
  milestones: Milestone[];
  showCelebration?: boolean;
  onCelebrationComplete?: () => void;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestones,
  showCelebration = false,
  onCelebrationComplete
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showCelebrationModal, setShowCelebrationModal] = useState(showCelebration);

  const getIcon = (iconType: Milestone['icon']) => {
    const iconClass = "h-6 w-6";
    switch (iconType) {
      case 'trophy': return <Trophy className={iconClass} />;
      case 'star': return <Star className={iconClass} />;
      case 'gift': return <Gift className={iconClass} />;
      case 'sparkles': return <Sparkles className={iconClass} />;
      default: return <Trophy className={iconClass} />;
    }
  };

  const getTypeColor = (type: Milestone['type']) => {
    switch (type) {
      case 'level': return 'bg-primary/10 text-primary border-primary/20';
      case 'credits': return 'bg-warning/10 text-warning border-warning/20';
      case 'tasks': return 'bg-success/10 text-success border-success/20';
      case 'streak': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'referral': return 'bg-purple-100/10 text-purple-600 border-purple-200/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const recentAchievements = milestones.filter(m => m.achieved).slice(0, 3);
  const upcomingMilestones = milestones.filter(m => !m.achieved).slice(0, 3);
  const celebrationMilestone = milestones.find(m => m.celebration);

  const handleCelebrationClose = () => {
    setShowCelebrationModal(false);
    onCelebrationComplete?.();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-warning" />
            Milestones
          </CardTitle>
          <CardDescription>Track your progress and achievements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recent Achievements */}
          {recentAchievements.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Recent Achievements</h4>
              <div className="space-y-2">
                {recentAchievements.map((milestone, index) => (
                  <Modal key={milestone.id}>
                    <ModalTrigger asChild>
                      <div 
                        className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20 cursor-pointer hover:bg-success/10 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="text-success">
                          {getIcon(milestone.icon)}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-semibold text-foreground">
                            {milestone.title}
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            {milestone.description}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getTypeColor(milestone.type)}
                        >
                          ✓ Completed
                        </Badge>
                      </div>
                    </ModalTrigger>
                    <ModalContent>
                      <ModalHeader>
                        <ModalTitle className="flex items-center gap-2">
                          <div className="text-success">
                            {getIcon(milestone.icon)}
                          </div>
                          {milestone.title}
                        </ModalTitle>
                        <ModalDescription>{milestone.description}</ModalDescription>
                      </ModalHeader>
                      <div className="space-y-4">
                        <div className="text-center">
                          <Badge 
                            variant="outline" 
                            className="bg-success/10 text-success border-success/20"
                          >
                            ✓ Achievement Unlocked
                          </Badge>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h5 className="font-medium mb-2">Reward Earned:</h5>
                          <p className="text-sm text-muted-foreground">
                            {milestone.reward.description}
                          </p>
                        </div>
                        {milestone.achievedAt && (
                          <p className="text-xs text-muted-foreground text-center">
                            Achieved on {milestone.achievedAt.toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </ModalContent>
                  </Modal>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Milestones */}
          {upcomingMilestones.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Next Milestones</h4>
              <div className="space-y-2">
                {upcomingMilestones.map((milestone) => (
                  <Modal key={milestone.id}>
                    <ModalTrigger asChild>
                      <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors">
                        <div className="text-muted-foreground">
                          {getIcon(milestone.icon)}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-foreground">
                            {milestone.title}
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            {milestone.description}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getTypeColor(milestone.type)}
                        >
                          {milestone.type}
                        </Badge>
                      </div>
                    </ModalTrigger>
                    <ModalContent>
                      <ModalHeader>
                        <ModalTitle className="flex items-center gap-2">
                          <div className="text-muted-foreground">
                            {getIcon(milestone.icon)}
                          </div>
                          {milestone.title}
                        </ModalTitle>
                        <ModalDescription>{milestone.description}</ModalDescription>
                      </ModalHeader>
                      <div className="space-y-4">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h5 className="font-medium mb-2">Reward Preview:</h5>
                          <p className="text-sm text-muted-foreground">
                            {milestone.reward.description}
                          </p>
                        </div>
                        <div className="text-center">
                          <Badge 
                            variant="outline" 
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            Keep going to unlock this milestone!
                          </Badge>
                        </div>
                      </div>
                    </ModalContent>
                  </Modal>
                ))}
              </div>
            </div>
          )}

          {milestones.length === 0 && (
            <div className="text-center py-6">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No milestones yet</p>
              <p className="text-sm text-muted-foreground">Complete tasks to unlock milestones</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Celebration Modal */}
      {celebrationMilestone && (
        <Modal open={showCelebrationModal} onOpenChange={setShowCelebrationModal}>
          <ModalContent className="max-w-md">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-warning/20 via-warning/10 to-warning/20 animate-pulse-slow" />
              <div className="relative p-6 text-center space-y-4">
                <div className="text-6xl animate-bounce-gentle">🎉</div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Milestone Achieved!
                  </h2>
                  <h3 className="text-lg font-semibold text-primary mb-1">
                    {celebrationMilestone.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {celebrationMilestone.description}
                  </p>
                </div>
                
                <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                  <h4 className="font-medium mb-2 text-warning">Reward Earned:</h4>
                  <p className="text-sm text-foreground">
                    {celebrationMilestone.reward.description}
                  </p>
                </div>

                <Button 
                  onClick={handleCelebrationClose}
                  className="w-full bg-gradient-to-r from-warning to-warning/80"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Awesome! Continue
                </Button>
              </div>
            </div>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default MilestoneCard;