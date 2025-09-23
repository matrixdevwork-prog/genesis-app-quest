import React, { useState } from 'react';
import { 
  User, 
  Camera, 
  Settings, 
  Shield, 
  Bell, 
  Share2, 
  Copy, 
  LogOut,
  BarChart3,
  Trophy,
  Coins,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Modal, 
  ModalContent, 
  ModalDescription, 
  ModalHeader, 
  ModalTitle, 
  ModalTrigger,
  ModalFooter 
} from '@/components/ui/modal';
import { toast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Mock user data
  const user = {
    id: '1',
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    avatar: '',
    joinedDate: '2024-01-15',
    referralCode: 'JOHN2024',
    stats: {
      totalEarned: 1250,
      currentLevel: 5,
      subscribersGained: 145,
      totalTasks: 89,
    },
    settings: {
      emailNotifications: true,
      pushNotifications: false,
      marketingEmails: false,
    }
  };

  const [settings, setSettings] = useState(user.settings);

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved.",
    });
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast({
      title: "Referral code copied!",
      description: "Share it with friends to earn bonus credits.",
    });
  };

  const handleShareReferral = () => {
    const shareText = `Join Sub4Sub with my referral code ${user.referralCode} and we both get bonus credits!`;
    if (navigator.share) {
      navigator.share({
        title: 'Sub4Sub Referral',
        text: shareText,
        url: `${window.location.origin}?ref=${user.referralCode}`
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.origin}?ref=${user.referralCode}`);
      toast({
        title: "Referral link copied!",
        description: "Share it with friends to earn bonus credits.",
      });
    }
  };

  const handleLogout = () => {
    // TODO: Implement actual logout logic in Phase 4
    console.log('Logging out...');
    setShowLogoutModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Member since {new Date(user.joinedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Level {user.stats.currentLevel}
                  </Badge>
                  <Badge variant="outline">
                    {user.stats.totalEarned} Credits Earned
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-foreground">{user.stats.totalEarned}</div>
              <div className="text-sm text-muted-foreground">Total Credits</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold text-foreground">{user.stats.currentLevel}</div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold text-foreground">{user.stats.subscribersGained}</div>
              <div className="text-sm text-muted-foreground">Subscribers</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold text-foreground">{user.stats.totalTasks}</div>
              <div className="text-sm text-muted-foreground">Tasks Done</div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Refer Friends
            </CardTitle>
            <CardDescription>
              Invite friends and earn bonus credits when they join
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={user.referralCode} 
                readOnly 
                className="font-mono"
              />
              <Button variant="outline" onClick={handleCopyReferralCode}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={handleShareReferral}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              You and your friend both get 10 bonus credits when they complete their first task!
            </p>
          </CardContent>
        </Card>

        {/* Settings Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={user.username} />
              </div>
              <Button className="w-full">Update Profile</Button>
            </CardContent>
          </Card>

          {/* Privacy & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive task updates via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new tasks
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive promotional content
                  </p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logout Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Sign Out</h3>
                <p className="text-sm text-muted-foreground">
                  Sign out of your Sub4Sub account
                </p>
              </div>
              
              <Modal open={showLogoutModal} onOpenChange={setShowLogoutModal}>
                <ModalTrigger asChild>
                  <Button variant="destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </ModalTrigger>
                <ModalContent>
                  <ModalHeader>
                    <ModalTitle>Confirm Sign Out</ModalTitle>
                    <ModalDescription>
                      Are you sure you want to sign out of your account?
                    </ModalDescription>
                  </ModalHeader>
                  <ModalFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowLogoutModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleLogout}
                    >
                      Sign Out
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;