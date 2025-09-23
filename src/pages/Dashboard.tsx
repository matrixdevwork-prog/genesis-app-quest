import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, TrendingUp, Users, Eye, Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  // Mock user data
  const user = {
    name: 'John',
    credits: 1250,
    level: 5,
    currentXP: 750,
    nextLevelXP: 1000,
    totalXP: 4750,
    streak: 7,
    longestStreak: 12,
    lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
  };

  // Mock statistics data
  const stats = [
    {
      title: 'Total Subscribers',
      value: '2,345',
      description: '+12% from last month',
      icon: Users,
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Video Views',
      value: '48.2K',
      description: '+8% from last month',
      icon: Eye,
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Total Likes',
      value: '3,892',
      description: '+15% from last month',
      icon: Heart,
      trend: { value: 15, isPositive: true }
    },
    {
      title: 'Watch Time',
      value: '127h',
      description: '+5% from last month',
      icon: Clock,
      trend: { value: 5, isPositive: true }
    }
  ];

  // Mock activity data
  const activities = [
    {
      id: '1',
      type: 'task_completed' as const,
      description: 'Completed "Watch Guitar Tutorial" task',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      amount: 5
    },
    {
      id: '2',
      type: 'level_up' as const,
      description: 'Reached Level 5!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '3',
      type: 'credits_earned' as const,
      description: 'Daily reward claimed',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      amount: 50
    },
    {
      id: '4',
      type: 'campaign_created' as const,
      description: 'Created new promotion campaign',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    }
  ];

  // Mock transaction data
  const transactions = [
    {
      id: '1',
      type: 'earned' as const,
      amount: 5,
      description: 'Task completion',
      timestamp: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: '2',
      type: 'earned' as const,
      amount: 50,
      description: 'Daily reward',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'spent' as const,
      amount: 100,
      description: 'Campaign promotion',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
    }
  ];

  // Mock achievements data
  const achievements = [
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first task',
      icon: 'trophy' as const,
      rarity: 'common' as const,
      earned: true,
      earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Rising Star',
      description: 'Reach Level 5',
      icon: 'star' as const,
      rarity: 'rare' as const,
      earned: true,
      earnedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '3',
      title: 'Dedication',
      description: 'Login for 7 consecutive days',
      icon: 'medal' as const,
      rarity: 'epic' as const,
      earned: false,
      progress: { current: 7, target: 7 }
    },
    {
      id: '4',
      title: 'Master Promoter',
      description: 'Create 10 successful campaigns',
      icon: 'crown' as const,
      rarity: 'legendary' as const,
      earned: false,
      progress: { current: 3, target: 10 }
    }
  ];

  // Mock milestones data
  const milestones = [
    {
      id: '1',
      title: 'Level Up Champion',
      description: 'Reached Level 5',
      type: 'level' as const,
      icon: 'trophy' as const,
      reward: {
        type: 'credits' as const,
        amount: 100,
        description: '100 bonus credits'
      },
      achieved: true,
      achievedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Task Master',
      description: 'Complete 50 tasks',
      type: 'tasks' as const,
      icon: 'star' as const,
      reward: {
        type: 'multiplier' as const,
        description: '2x credit multiplier for 1 day'
      },
      achieved: false
    }
  ];

  // Mock chart data
  const earningsData = [
    { date: '2024-01-15', credits: 45, tasks: 3 },
    { date: '2024-01-16', credits: 62, tasks: 4 },
    { date: '2024-01-17', credits: 38, tasks: 2 },
    { date: '2024-01-18', credits: 71, tasks: 5 },
    { date: '2024-01-19', credits: 55, tasks: 3 },
    { date: '2024-01-20', credits: 89, tasks: 6 },
    { date: '2024-01-21', credits: 67, tasks: 4 }
  ];

  const engagementData = [
    { campaign: 'Guitar Tutorial', views: 234, likes: 45, subscribers: 12 },
    { campaign: 'Cooking Show', views: 189, likes: 32, subscribers: 8 },
    { campaign: 'Tech Review', views: 156, likes: 28, subscribers: 6 }
  ];

  const activityData = [
    { date: '2024-01-15', completed: 3, started: 4 },
    { date: '2024-01-16', completed: 4, started: 5 },
    { date: '2024-01-17', completed: 2, started: 3 },
    { date: '2024-01-18', completed: 5, started: 6 },
    { date: '2024-01-19', completed: 3, started: 4 },
    { date: '2024-01-20', completed: 6, started: 7 },
    { date: '2024-01-21', completed: 4, started: 5 }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user.name}! 👋
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

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={stat.title} style={{ animationDelay: `${index * 100}ms` }}>
              <StatsCard {...stat} />
            </div>
          ))}
        </div>

        {/* Credit Balance & Level Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CreditBalance 
            balance={user.credits} 
            transactions={transactions}
          />
          <LevelProgress
            currentLevel={user.level}
            currentXP={user.currentXP}
            nextLevelXP={user.nextLevelXP}
            totalXP={user.totalXP}
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
            currentStreak={user.streak}
            longestStreak={user.longestStreak}
            lastLoginDate={user.lastLogin}
          />
          <div className="md:col-span-2 lg:col-span-1">
            <ActivityFeed activities={activities} />
          </div>
        </div>

        {/* Progress Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Goals</CardTitle>
            <CardDescription>Track your progress towards weekly targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ProgressBar
              label="Tasks Completed"
              current={28}
              max={50}
              color="primary"
            />
            <ProgressBar
              label="Credits Earned"
              current={420}
              max={1000}
              color="warning"
            />
            <ProgressBar
              label="Campaigns Created"
              current={3}
              max={5}
              color="secondary"
            />
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EarningsChart data={earningsData} timeRange="7d" />
          <ActivityChart data={activityData} timeRange="7d" />
        </div>

        <div className="grid grid-cols-1">
          <EngagementChart data={engagementData} />
        </div>

        {/* Achievements & Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AchievementBadges achievements={achievements} />
          <MilestoneCard milestones={milestones} />
        </div>

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