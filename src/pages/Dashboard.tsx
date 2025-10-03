import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, TrendingUp, Users, Eye, Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';

// Dashboard Components
import StatsCard from '@/components/dashboard/StatsCard';
import CreditBalance from '@/components/dashboard/CreditBalance';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import ProgressBar from '@/components/dashboard/ProgressBar';
import AchievementBadges from '@/components/dashboard/AchievementBadges';

// Gamification Components
import LevelProgress from '@/components/gamification/LevelProgress';
import DailyReward from '@/components/gamification/DailyReward';
import StreakCounter from '@/components/gamification/StreakCounter';
import MilestoneCard from '@/components/gamification/MilestoneCard';

// Chart Components
import EarningsChart from '@/components/charts/EarningsChart';
import EngagementChart from '@/components/charts/EngagementChart';
import ActivityChart from '@/components/charts/ActivityChart';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent transactions
      const { data: transactionsData } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsData) {
        setTransactions(transactionsData.map(t => ({
          id: t.id,
          type: t.amount > 0 ? 'earned' : 'spent',
          amount: Math.abs(t.amount),
          description: t.description || t.transaction_type,
          timestamp: new Date(t.created_at)
        })));

        // Create activity feed from transactions
        setActivities(transactionsData.slice(0, 5).map(t => ({
          id: t.id,
          type: t.amount > 0 ? 'credits_earned' : 'campaign_created',
          description: t.description || t.transaction_type,
          timestamp: new Date(t.created_at),
          amount: t.amount > 0 ? t.amount : undefined
        })));
      }

      // Load achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', profile?.id);

      if (achievementsData) {
        setAchievements(achievementsData.map(a => ({
          id: a.id,
          title: a.achievement_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: 'Achievement earned',
          icon: 'trophy',
          rarity: 'common',
          earned: true,
          earnedAt: new Date(a.earned_at)
        })));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const userName = profile?.full_name?.split(' ')[0] || profile?.username || 'there';
  const currentLevel = profile?.level || 1;
  const currentXP = profile?.xp || 0;
  const nextLevelXP = currentLevel * 1000;
  const totalXP = profile?.xp || 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your channel today
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button asChild>
              <Link to="/tasks">
                <Play className="h-4 w-4 mr-2" />
                Start Earning
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/promote">
                <TrendingUp className="h-4 w-4 mr-2" />
                Promote Content
              </Link>
            </Button>
          </div>
        </div>

        {/* Credit Balance & Level Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CreditBalance 
            balance={profile?.credits || 0} 
            transactions={transactions}
          />
          <LevelProgress
            currentLevel={currentLevel}
            currentXP={currentXP}
            nextLevelXP={nextLevelXP}
            totalXP={totalXP}
          />
        </div>

        {/* Gamification Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DailyReward 
            lastClaimTime={new Date(Date.now() - 25 * 60 * 60 * 1000)}
            rewardAmount={50}
            bonusMultiplier={1}
          />
          <StreakCounter
            currentStreak={profile?.streak_count || 0}
            longestStreak={profile?.streak_count || 0}
            lastLoginDate={profile?.last_login_date ? new Date(profile.last_login_date) : new Date()}
          />
          {activities.length > 0 && (
            <div className="md:col-span-2 lg:col-span-1">
              <ActivityFeed activities={activities} />
            </div>
          )}
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="grid grid-cols-1">
            <AchievementBadges achievements={achievements} />
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-3" asChild>
                <Link to="/tasks">
                  <Play className="h-8 w-8 text-primary" />
                  <div className="text-center">
                    <div className="font-semibold">Browse Tasks</div>
                    <div className="text-sm text-muted-foreground">Find tasks to earn credits</div>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-3" asChild>
                <Link to="/promote">
                  <TrendingUp className="h-8 w-8 text-secondary" />
                  <div className="text-center">
                    <div className="font-semibold">Create Campaign</div>
                    <div className="text-sm text-muted-foreground">Promote your content</div>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-3" asChild>
                <Link to="/leaderboard">
                  <Users className="h-8 w-8 text-warning" />
                  <div className="text-center">
                    <div className="font-semibold">View Leaderboard</div>
                    <div className="text-sm text-muted-foreground">See your ranking</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
