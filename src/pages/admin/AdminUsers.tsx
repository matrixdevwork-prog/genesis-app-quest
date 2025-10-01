import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { Search, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import moderationService from '@/services/moderationService';
import { useAuth } from '@/contexts/AuthContext';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, username: string) => {
    if (!user) return;

    const confirmed = window.confirm(`Are you sure you want to ban ${username}?`);
    if (!confirmed) return;

    const reason = window.prompt('Enter ban reason:');
    if (!reason) return;

    try {
      await moderationService.banUser(userId, user.id, reason, 'temporary');
      toast({
        title: 'Success',
        description: 'User has been banned'
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to ban user',
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <img
                    src={user.avatar_url || '/placeholder.svg'}
                    alt={user.username || 'User'}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{user.username || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">{user.full_name}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">Level {user.level}</Badge>
                      <Badge variant="outline">{user.credits} credits</Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBanUser(user.id, user.username)}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban User
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
