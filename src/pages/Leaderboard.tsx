import React, { useState } from 'react';
import { Trophy, Medal, Award, Crown, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Modal, 
  ModalContent, 
  ModalDescription, 
  ModalHeader, 
  ModalTitle, 
  ModalTrigger 
} from '@/components/ui/modal';

const Leaderboard: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState('weekly');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Mock leaderboard data
  const leaderboardData = {
    weekly: [
      {
        id: 1,
        rank: 1,
        username: 'TechGuru2024',
        avatar: '',
        credits: 1250,
        level: 8,
        tasksCompleted: 145,
        subscribersGained: 89,
        isCurrentUser: false,
      },
      {
        id: 2,
        rank: 2,
        username: 'MusicMaster',
        avatar: '',
        credits: 1180,
        level: 7,
        tasksCompleted: 132,
        subscribersGained: 76,
        isCurrentUser: false,
      },
      {
        id: 3,
        rank: 3,
        username: 'CookingQueen',
        avatar: '',
        credits: 1095,
        level: 7,
        tasksCompleted: 128,
        subscribersGained: 67,
        isCurrentUser: false,
      },
      {
        id: 4,
        rank: 4,
        username: 'GameStreamer',
        avatar: '',
        credits: 980,
        level: 6,
        tasksCompleted: 115,
        subscribersGained: 54,
        isCurrentUser: false,
      },
      {
        id: 5,
        rank: 5,
        username: 'FitnessLife',
        avatar: '',
        credits: 875,
        level: 6,
        tasksCompleted: 98,
        subscribersGained: 45,
        isCurrentUser: false,
      },
      {
        id: 6,
        rank: 12,
        username: 'You',
        avatar: '',
        credits: 650,
        level: 5,
        tasksCompleted: 76,
        subscribersGained: 32,
        isCurrentUser: true,
      },
    ],
    monthly: [
      // Similar structure with different data
    ],
    allTime: [
      // Similar structure with different data
    ],
  };

  const currentData = leaderboardData[timePeriod as keyof typeof leaderboardData] || leaderboardData.weekly;
  const topThree = currentData.slice(0, 3);
  const otherUsers = currentData.slice(3);
  const currentUser = currentData.find(user => user.isCurrentUser);

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
                    <Modal>
                      <ModalTrigger asChild>
                        <div className="flex flex-col items-center cursor-pointer group">
                          <div className="mb-2 transition-transform group-hover:scale-105">
                            <Avatar className="h-16 w-16 border-2 border-muted">
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
                      </ModalTrigger>
                      <ModalContent>
                        <ModalHeader>
                          <ModalTitle>{topThree[1].username} - Rank #2</ModalTitle>
                          <ModalDescription>User profile and statistics</ModalDescription>
                        </ModalHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarFallback className="text-xl">
                                {topThree[1].username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold">{topThree[1].username}</h3>
                              <p className="text-muted-foreground">Level {topThree[1].level}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-primary">{topThree[1].credits}</div>
                              <div className="text-xs text-muted-foreground">Credits</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-secondary">{topThree[1].tasksCompleted}</div>
                              <div className="text-xs text-muted-foreground">Tasks</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-success">{topThree[1].subscribersGained}</div>
                              <div className="text-xs text-muted-foreground">Subscribers</div>
                            </div>
                          </div>
                        </div>
                      </ModalContent>
                    </Modal>
                  )}

                  {/* 1st Place */}
                  {topThree[0] && (
                    <Modal>
                      <ModalTrigger asChild>
                        <div className="flex flex-col items-center cursor-pointer group">
                          <div className="mb-2 transition-transform group-hover:scale-105">
                            <Avatar className="h-20 w-20 border-4 border-warning shadow-lg">
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
                      </ModalTrigger>
                      <ModalContent>
                        <ModalHeader>
                          <ModalTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-warning" />
                            {topThree[0].username} - Champion
                          </ModalTitle>
                          <ModalDescription>Top performer profile and statistics</ModalDescription>
                        </ModalHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-2 border-warning">
                              <AvatarFallback className="text-xl">
                                {topThree[0].username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold">{topThree[0].username}</h3>
                              <p className="text-muted-foreground">Level {topThree[0].level}</p>
                              <Badge className="bg-warning/10 text-warning border-warning/20">
                                <Crown className="h-3 w-3 mr-1" />
                                Champion
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-primary">{topThree[0].credits}</div>
                              <div className="text-xs text-muted-foreground">Credits</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-secondary">{topThree[0].tasksCompleted}</div>
                              <div className="text-xs text-muted-foreground">Tasks</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-success">{topThree[0].subscribersGained}</div>
                              <div className="text-xs text-muted-foreground">Subscribers</div>
                            </div>
                          </div>
                        </div>
                      </ModalContent>
                    </Modal>
                  )}

                  {/* 3rd Place */}
                  {topThree[2] && (
                    <Modal>
                      <ModalTrigger asChild>
                        <div className="flex flex-col items-center cursor-pointer group">
                          <div className="mb-2 transition-transform group-hover:scale-105">
                            <Avatar className="h-16 w-16 border-2 border-orange-600">
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
                      </ModalTrigger>
                      <ModalContent>
                        <ModalHeader>
                          <ModalTitle>{topThree[2].username} - Rank #3</ModalTitle>
                          <ModalDescription>User profile and statistics</ModalDescription>
                        </ModalHeader>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarFallback className="text-xl">
                                {topThree[2].username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-lg font-semibold">{topThree[2].username}</h3>
                              <p className="text-muted-foreground">Level {topThree[2].level}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-primary">{topThree[2].credits}</div>
                              <div className="text-xs text-muted-foreground">Credits</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-secondary">{topThree[2].tasksCompleted}</div>
                              <div className="text-xs text-muted-foreground">Tasks</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-success">{topThree[2].subscribersGained}</div>
                              <div className="text-xs text-muted-foreground">Subscribers</div>
                            </div>
                          </div>
                        </div>
                      </ModalContent>
                    </Modal>
                  )}
                </div>
              </CardContent>
            </Card>

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
                {otherUsers.map((user) => (
                  <Modal key={user.id}>
                    <ModalTrigger asChild>
                      <div className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        user.isCurrentUser ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/30'
                      }`}>
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankIcon(user.rank)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">Level {user.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{user.credits}</p>
                          <p className="text-xs text-muted-foreground">credits</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{user.tasksCompleted}</p>
                          <p className="text-xs text-muted-foreground">tasks</p>
                        </div>
                      </div>
                    </ModalTrigger>
                    <ModalContent>
                      <ModalHeader>
                        <ModalTitle>{user.username} - Rank #{user.rank}</ModalTitle>
                        <ModalDescription>User profile and statistics</ModalDescription>
                      </ModalHeader>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-xl">
                              {user.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold">{user.username}</h3>
                            <p className="text-muted-foreground">Level {user.level}</p>
                            {user.isCurrentUser && (
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                You
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-primary">{user.credits}</div>
                            <div className="text-xs text-muted-foreground">Credits</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-secondary">{user.tasksCompleted}</div>
                            <div className="text-xs text-muted-foreground">Tasks</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-success">{user.subscribersGained}</div>
                            <div className="text-xs text-muted-foreground">Subscribers</div>
                          </div>
                        </div>
                      </div>
                    </ModalContent>
                  </Modal>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leaderboard;