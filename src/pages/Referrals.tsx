import React, { useEffect, useState } from 'react';
import { Copy, Share2, Users, TrendingUp, Gift, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import referralService from '@/services/referralService';

const Referrals: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profile) {
      loadReferralStats();
    }
  }, [profile]);

  const loadReferralStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await referralService.getReferralStats(profile!.id);
      
      if (error) {
        console.error('Error loading referral stats:', error);
        return;
      }

      setStats(data);
    } catch (error) {
      console.error('Error loading referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (method: 'copy' | 'whatsapp' | 'twitter' | 'facebook') => {
    if (!profile?.referral_code) return;

    const result = await referralService.shareReferralCode(profile.referral_code, method);
    
    if (result.success) {
      toast.success(result.message);

      if (method === 'copy') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      toast.error(result.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const referralLink = profile?.referral_code 
    ? referralService.generateReferralLink(profile.referral_code)
    : '';

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl animate-fade-in">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Referral Program</h1>
          <p className="text-muted-foreground mt-1">
            Invite friends and earn bonus credits together
          </p>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold text-foreground">
                  {stats?.totalReferrals || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Referrals (30 days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="text-3xl font-bold text-foreground">
                  {stats?.recentReferrals || 0}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-warning" />
                <span className="text-3xl font-bold text-foreground">
                  {stats?.totalEarnings || 0}
                </span>
                <span className="text-sm text-muted-foreground">credits</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>
              Share this link with friends. When they sign up, you both get bonus credits!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 bg-muted px-4 py-3 rounded-md border border-border">
                <code className="text-sm text-foreground break-all">
                  {referralLink}
                </code>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleShare('copy')}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleShare('whatsapp')}
                className="flex-1 min-w-[120px]"
              >
                <Share2 className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleShare('twitter')}
                className="flex-1 min-w-[120px]"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleShare('facebook')}
                className="flex-1 min-w-[120px]"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral Code */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>
              Friends can also enter this code during signup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-2xl font-mono px-6 py-3">
                {profile?.referral_code}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(profile?.referral_code || '');
                  toast.success("Referral code copied to clipboard");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Share Your Link</h4>
                  <p className="text-sm text-muted-foreground">
                    Send your referral link to friends via WhatsApp, Twitter, or Facebook
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Friend Signs Up</h4>
                  <p className="text-sm text-muted-foreground">
                    When they create an account using your link, they get 25 bonus credits
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">You Both Earn</h4>
                  <p className="text-sm text-muted-foreground">
                    You receive 50 bonus credits for each successful referral
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referred Users */}
        {stats?.referredUsers && stats.referredUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Referrals</CardTitle>
              <CardDescription>
                People who joined using your referral code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.referredUsers.map((user: any) => (
                  <div 
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(user.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      <Gift className="h-3 w-3 mr-1" />
                      +50 credits
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Referrals;
