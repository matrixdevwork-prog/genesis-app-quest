import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Camera, 
  Settings, 
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
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { user, profile, signOut, updateProfile, uploadAvatar } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editedUsername, setEditedUsername] = useState(profile?.username || '');
  const [editedFullName, setEditedFullName] = useState(profile?.full_name || '');
  const [editedYoutubeChannel, setEditedYoutubeChannel] = useState(profile?.youtube_channel || '');
  
  const [settings, setSettings] = useState({
    emailNotifications: profile?.preferences?.notifications ?? true,
    pushNotifications: false,
    marketingEmails: false,
  });

  const handleSettingChange = async (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    const newPreferences = {
      ...profile?.preferences,
      notifications: setting === 'emailNotifications' ? value : settings.emailNotifications
    };
    
    await updateProfile({ preferences: newPreferences });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploadingAvatar(true);
    const { error } = await uploadAvatar(file);
    setIsUploadingAvatar(false);

    if (!error) {
      toast.success('Avatar updated successfully');
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    await updateProfile({
      username: editedUsername || null,
      full_name: editedFullName || null,
      youtube_channel: editedYoutubeChannel || null,
    });
    setIsUpdating(false);
  };

  const handleCopyReferralCode = () => {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    toast.success('Referral code copied to clipboard');
  };

  const handleShareReferral = () => {
    if (!profile?.referral_code) return;
    const shareText = `Join Sub For Sub with my referral code ${profile.referral_code} and we both get bonus credits!`;
    if (navigator.share) {
      navigator.share({
        title: 'Sub For Sub Referral',
        text: shareText,
        url: `${window.location.origin}?ref=${profile.referral_code}`
      });
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.origin}?ref=${profile.referral_code}`);
      toast.success('Referral link copied to clipboard');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setShowLogoutModal(false);
    navigate('/login');
  };

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || 'User'} />
                  <AvatarFallback className="text-2xl">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <Button 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.full_name || user?.email || 'Anonymous User'}
                </h1>
                {profile.username && <p className="text-muted-foreground">@{profile.username}</p>}
                <p className="text-sm text-muted-foreground mt-1">
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Level {profile.level}
                  </Badge>
                  <Badge variant="outline">
                    {profile.credits} Credits
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
              <div className="text-2xl font-bold text-foreground">{profile.credits}</div>
              <div className="text-sm text-muted-foreground">Current Credits</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold text-foreground">{profile.level}</div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold text-foreground">{profile.xp}</div>
              <div className="text-sm text-muted-foreground">Experience Points</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <div className="text-2xl font-bold text-foreground">{profile.streak_count}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
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
                value={profile.referral_code} 
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
                <Input id="email" value={user?.email || ''} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={editedFullName} 
                  onChange={(e) => setEditedFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={editedUsername} 
                  onChange={(e) => setEditedUsername(e.target.value)}
                  placeholder="Choose a username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube Channel URL</Label>
                <Input 
                  id="youtube" 
                  value={editedYoutubeChannel} 
                  onChange={(e) => setEditedYoutubeChannel(e.target.value)}
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleUpdateProfile}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </Button>
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