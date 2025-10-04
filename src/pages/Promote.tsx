import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { youtubeService } from '@/services/youtubeService';
import { Plus, Play, Pause, BarChart3, Eye, Heart, UserPlus, Coins, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Modal, 
  ModalContent, 
  ModalDescription, 
  ModalHeader, 
  ModalTitle, 
  ModalTrigger,
  ModalFooter 
} from '@/components/ui/modal';

const Promote: React.FC = () => {
  const { user, profile } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [newCampaign, setNewCampaign] = useState({
    title: '',
    videoUrl: '',
    creditsToAllocate: [50],
    targetActions: [] as string[],
    description: '',
  });

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          videos (
            id,
            youtube_id,
            title,
            description,
            thumbnail_url,
            channel_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!user || !profile) {
      toast.error('Please log in to create campaigns');
      return;
    }

    if (!newCampaign.videoUrl || !newCampaign.title) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newCampaign.targetActions.length === 0) {
      toast.error('Please select at least one target action');
      return;
    }

    if (profile.credits < newCampaign.creditsToAllocate[0]) {
      toast.error('Insufficient credits');
      return;
    }

    setIsCreating(true);
    try {
      // Use the campaign-management edge function to create campaign with tasks
      const { data, error } = await youtubeService.createCampaign(
        user.id,
        newCampaign.videoUrl,
        newCampaign.title,
        newCampaign.creditsToAllocate[0],
        newCampaign.targetActions.length * 50 // Each action type gets 50 tasks
      );

      if (error) {
        console.error('Campaign creation error:', error);
        throw error;
      }

      toast.success(`Campaign created! ${data.tasksCreated} tasks generated.`);
      setShowCreateModal(false);
      setNewCampaign({
        title: '',
        videoUrl: '',
        creditsToAllocate: [50],
        targetActions: [],
        description: '',
      });
      fetchCampaigns();
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCampaignAction = async (campaignId: string, action: string) => {
    try {
      const newStatus = action === 'pause' ? 'paused' : 'active';
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaignId);

      if (error) throw error;

      setCampaigns(campaigns.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, status: newStatus }
          : campaign
      ));
      
      toast.success(`Campaign ${newStatus === 'paused' ? 'paused' : 'resumed'}`);
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'paused': return 'bg-warning/10 text-warning border-warning/20';
      case 'completed': return 'bg-muted text-muted-foreground border-muted/20';
      default: return 'bg-muted text-muted-foreground border-muted/20';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'watch': return Play;
      case 'like': return Heart;
      case 'subscribe': return UserPlus;
      default: return Eye;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Promote Content</h1>
          <p className="text-muted-foreground">Manage your promotion campaigns</p>
        </div>
        
        <Modal open={showCreateModal} onOpenChange={setShowCreateModal}>
          <ModalTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </ModalTrigger>
          <ModalContent className="max-w-2xl">
            <ModalHeader>
              <ModalTitle>Create New Campaign</ModalTitle>
              <ModalDescription>
                Set up a promotion campaign for your YouTube video
              </ModalDescription>
            </ModalHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="video-url">YouTube Video URL</Label>
                <Input
                  id="video-url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={newCampaign.videoUrl}
                  onChange={(e) => setNewCampaign({...newCampaign, videoUrl: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for your campaign"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your video to attract more engagement"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <Label>Target Actions</Label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'watch', label: 'Watch', icon: Play, cost: 1 },
                    { id: 'like', label: 'Like', icon: Heart, cost: 2 },
                    { id: 'subscribe', label: 'Subscribe', icon: UserPlus, cost: 5 },
                  ].map((action) => {
                    const ActionIcon = action.icon;
                    const isSelected = newCampaign.targetActions.includes(action.id);
                    return (
                      <Card 
                        key={action.id}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          setNewCampaign({
                            ...newCampaign,
                            targetActions: isSelected 
                              ? newCampaign.targetActions.filter(a => a !== action.id)
                              : [...newCampaign.targetActions, action.id]
                          });
                        }}
                      >
                        <CardContent className="p-4 text-center">
                          <ActionIcon className="h-6 w-6 mx-auto mb-2" />
                          <div className="font-medium">{action.label}</div>
                          <div className="text-sm text-muted-foreground">{action.cost} credits</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Credits to Allocate: {newCampaign.creditsToAllocate[0]}</Label>
                <Slider
                  value={newCampaign.creditsToAllocate}
                  onValueChange={(value) => setNewCampaign({...newCampaign, creditsToAllocate: value})}
                  max={500}
                  min={10}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>10 credits</span>
                  <span>500 credits</span>
                </div>
              </div>
            </div>

            <ModalFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCampaign} disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Campaign'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      {isLoading ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">Loading campaigns...</p>
          </CardContent>
        </Card>
      ) : campaigns.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No campaigns yet</h3>
                <p className="text-muted-foreground">
                  Create your first promotion campaign to start growing your audience
                </p>
              </div>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Thumbnail */}
                  <div className="w-48 h-32 flex-shrink-0 bg-muted">
                    {campaign.videos?.thumbnail_url ? (
                      <img 
                        src={campaign.videos.thumbnail_url} 
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Campaign Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Created {new Date(campaign.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCampaignAction(campaign.id, campaign.status === 'active' ? 'pause' : 'resume')}
                        >
                          {campaign.status === 'active' ? (
                            <>
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Resume
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground">{campaign.completed_actions}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Completed
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground">{campaign.target_actions}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center">
                          <Eye className="h-3 w-3 mr-1" />
                          Target
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground">
                          {campaign.credits_allocated - campaign.credits_spent}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center">
                          <Coins className="h-3 w-3 mr-1" />
                          Credits Left
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Credits Used</span>
                        <span className="text-foreground">
                          {campaign.credits_spent} / {campaign.credits_allocated}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ 
                            width: `${Math.min(100, (campaign.credits_spent / campaign.credits_allocated) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Promote;