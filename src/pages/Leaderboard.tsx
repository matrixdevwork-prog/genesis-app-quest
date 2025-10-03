import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Modal, 
  ModalContent, 
  ModalDescription, 
  ModalHeader, 
  ModalTitle, 
  ModalTrigger 
} from '@/components/ui/modal';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [timePeriod, setTimePeriod] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, [timePeriod]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, credits, level, xp')
        .order('credits', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedData = (data || []).map((profile, index) => ({
        id: profile.id,
        rank: index + 1,
        username: profile.username || profile.full_name || 'Anonymous',
        avatar: profile.avatar_url || '',
        credits: profile.credits,
        level: profile.level,
        tasksCompleted: 0,
        subscribersGained: 0,
        isCurrentUser: profile.id === user?.id,
      }));

      setLeaderboardData(formattedData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const topThree = leaderboardData.slice(0, 3);
  const otherUsers = leaderboardData.slice(3);
  const currentUser = leaderboardData.find(u => u.isCurrentUser);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-warning" />;
      case 2: return <Medal className="h-6 w-6 text-muted-foreground" />;
      case 3: return <Award className="h-6 w-6 text-orange-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-warning/20 to-warning/5 border-warning/20';
      case 2: return 'from-muted/20 to-muted/5 border-muted/20';
      case 3: return 'from-orange-200/20 to-orange-100/5 border-orange-200/20';
      default: return 'from-muted/10 to-background border-muted/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other creators</p>
        </div>

        {/* Time Period Filter */}
        <Tabs value={timePeriod} onValueChange={setTimePeriod} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="allTime">All Time</TabsTrigger>
          </TabsList>

          <TabsContent value={timePeriod} className="space-y-6">
            {/* Podium - Top 3 */}
            {topThree.length > 0 && (
              <Card className="overflow-hidden">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-warning" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center items-end gap-4 py-6">
                    {/* 2nd Place */}
                    {topThree[1] && (
                      <div className="flex flex-col items-center">
                        <div className="mb-2">
                          <Avatar className="h-16 w-16 border-2 border-muted">
                            <AvatarImage src={topThree[1].avatar} />
                            <AvatarFallback className="text-lg">
                              {topThree[1].username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className={`w-20 h-16 bg-gradient-to-t ${getRankColor(2)} rounded-t-lg flex items-center justify-center border-t border-l border-r`}>
                          <Medal className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-center mt-2">
                          <p className="font-semibold text-sm">{topThree[1].username}</p>
                          <p className="text-xs text-muted-foreground">{topThree[1].credits} credits</p>
                        </div>
                      </div>
                    )}

                    {/* 1st Place */}
                    {topThree[0] && (
                      <div className="flex flex-col items-center">
                        <div className="mb-2">
                          <Avatar className="h-20 w-20 border-4 border-warning shadow-lg">
                            <AvatarImage src={topThree[0].avatar} />
                            <AvatarFallback className="text-xl">
                              {topThree[0].username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className={`w-24 h-20 bg-gradient-to-t ${getRankColor(1)} rounded-t-lg flex items-center justify-center border-t border-l border-r`}>
                          <Crown className="h-10 w-10 text-warning" />
                        </div>
                        <div className="text-center mt-2">
                          <p className="font-bold">{topThree[0].username}</p>
                          <p className="text-sm text-muted-foreground">{topThree[0].credits} credits</p>
                        </div>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                      <div className="flex flex-col items-center">
                        <div className="mb-2">
                          <Avatar className="h-16 w-16 border-2 border-orange-600">
                            <AvatarImage src={topThree[2].avatar} />
                            <AvatarFallback className="text-lg">
                              {topThree[2].username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className={`w-20 h-12 bg-gradient-to-t ${getRankColor(3)} rounded-t-lg flex items-center justify-center border-t border-l border-r`}>
                          <Award className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="text-center mt-2">
                          <p className="font-semibold text-sm">{topThree[2].username}</p>
                          <p className="text-xs text-muted-foreground">{topThree[2].credits} credits</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Your Position */}
            {currentUser && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                      <span className="text-lg font-bold text-primary">#{currentUser.rank}</span>
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={currentUser.avatar} />
                      <AvatarFallback>
                        {currentUser.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{currentUser.username}</p>
                      <p className="text-sm text-muted-foreground">Level {currentUser.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{currentUser.credits}</p>
                      <p className="text-xs text-muted-foreground">credits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Full Rankings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Full Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {otherUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No other users yet</p>
                ) : (
                  otherUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        user.isCurrentUser ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(user.rank)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">Level {user.level}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{user.credits}</p>
                        <p className="text-xs text-muted-foreground">credits</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leaderboard;
