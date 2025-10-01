import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import moderationService from '@/services/moderationService';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle } from 'lucide-react';

const AdminModeration: React.FC = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [queueResult, reportsResult] = await Promise.all([
        moderationService.getModerationQueue(),
        moderationService.getAllReports()
      ]);

      setQueue(queueResult.data || []);
      setReports(reportsResult.data || []);
    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load moderation data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (queueId: string, status: 'approved' | 'rejected') => {
    if (!user) return;

    try {
      await moderationService.moderateContent(queueId, user.id, status);
      toast({
        title: 'Success',
        description: `Content ${status}`
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to moderate content',
        variant: 'destructive'
      });
    }
  };

  const handleReviewReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    if (!user) return;

    try {
      await moderationService.reviewReport(reportId, user.id, status);
      toast({
        title: 'Success',
        description: `Report ${status}`
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to review report',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Content Moderation</h1>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Moderation Queue ({queue.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {queue.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {item.content_type} - {item.content_id}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={item.priority === 'critical' ? 'destructive' : 'secondary'}>
                        {item.priority}
                      </Badge>
                      {item.auto_flagged && <Badge variant="outline">Auto-flagged</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleModerate(item.id, 'approved')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleModerate(item.id, 'rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {item.flag_reasons && (
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <strong>Flags:</strong> {JSON.stringify(item.flag_reasons)}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {report.content_type} Report
                    </CardTitle>
                    <div className="mt-2">
                      <Badge>{report.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      <strong>Reason:</strong> {report.reason}
                    </div>
                    {report.description && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Description:</strong> {report.description}
                      </div>
                    )}
                  </div>
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleReviewReport(report.id, 'resolved')}
                      >
                        Resolve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReviewReport(report.id, 'dismissed')}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminModeration;
