import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface EngagementData {
  campaign: string;
  views: number;
  likes: number;
  subscribers: number;
}

interface EngagementChartProps {
  data: EngagementData[];
}

const EngagementChart: React.FC<EngagementChartProps> = ({ data }) => {
  const totalViews = data.reduce((sum, item) => sum + item.views, 0);
  const totalLikes = data.reduce((sum, item) => sum + item.likes, 0);
  const totalSubscribers = data.reduce((sum, item) => sum + item.subscribers, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-secondary" />
          Campaign Performance
        </CardTitle>
        <CardDescription>
          {totalViews} views, {totalLikes} likes, {totalSubscribers} subscribers across all campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="campaign" 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis className="text-xs fill-muted-foreground" />
              <Legend />
              <Bar 
                dataKey="views" 
                fill="hsl(var(--primary))" 
                name="Views"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="likes" 
                fill="hsl(var(--secondary))" 
                name="Likes"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="subscribers" 
                fill="hsl(var(--success))" 
                name="Subscribers"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementChart;