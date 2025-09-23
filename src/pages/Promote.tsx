import React, { useState } from 'react';
import { Plus, Play, Pause, BarChart3, Eye, Heart, UserPlus, Coins, Settings } from 'lucide-react';
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      title: 'My Guitar Tutorial',
      videoUrl: 'https://youtube.com/watch?v=example1',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop',
      status: 'active',
      creditsAllocated: 100,
      creditsUsed: 65,
      targetActions: ['watch', 'like'],
      stats: {
        views: 234,
        likes: 45,
        subscribers: 12,
      },
      createdAt: '2024-01-15',
    },
    {
      id: 2,
      title: 'Cooking Masterclass',
      videoUrl: 'https://youtube.com/watch?v=example2',
      thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop',
      status: 'paused',
      creditsAllocated: 50,
      creditsUsed: 20,
      targetActions: ['watch', 'subscribe'],
      stats: {
        views: 89,
        likes: 15,
        subscribers: 8,
      },
      createdAt: '2024-01-10',
    },
  ]);

  const [newCampaign, setNewCampaign] = useState({
    title: '',
    videoUrl: '',
    creditsToAllocate: [50],
    targetActions: [] as string[],
    description: '',
  });

  const handleCreateCampaign = () => {
    // TODO: Implement actual campaign creation in Phase 6
    console.log('Creating campaign:', newCampaign);
    setShowCreateModal(false);
    // Reset form
    setNewCampaign({
      title: '',
      videoUrl: '',
      creditsToAllocate: [50],
      targetActions: [],
      description: '',
    });
  };

  const handleCampaignAction = (campaignId: number, action: string) => {
    setCampaigns(campaigns.map(campaign => 
      campaign.id === campaignId 
        ? { ...campaign, status: action === 'pause' ? 'paused' : 'active' }
        : campaign
    ));
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
              <Button onClick={handleCreateCampaign}>
                Create Campaign
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      {campaigns.length === 0 ? (
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
                  <div className="w-48 h-32 flex-shrink-0">
                    <img 
                      src={campaign.thumbnail} 
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Campaign Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Created {campaign.createdAt}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <div className="flex gap-1">
                            {campaign.targetActions.map((action) => {
                              const ActionIcon = getActionIcon(action);
                              return (
                                <div key={action} className="flex items-center text-xs text-muted-foreground">
                                  <ActionIcon className="h-3 w-3 mr-1" />
                                  {action}
                                </div>
                              );
                            })}
                          </div>
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
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground">{campaign.stats.views}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center">
                          <Eye className="h-3 w-3 mr-1" />
                          Views
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground">{campaign.stats.likes}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center">
                          <Heart className="h-3 w-3 mr-1" />
                          Likes
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground">{campaign.stats.subscribers}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center">
                          <UserPlus className="h-3 w-3 mr-1" />
                          Subscribers
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-foreground">
                          {campaign.creditsAllocated - campaign.creditsUsed}
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
                          {campaign.creditsUsed} / {campaign.creditsAllocated}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ 
                            width: `${Math.min(100, (campaign.creditsUsed / campaign.creditsAllocated) * 100)}%` 
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