import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface ActivityData {
  date: string;
  completed: number;
  started: number;
}

interface ActivityChartProps {
  data: ActivityData[];
  timeRange?: '7d' | '30d' | '90d';
}

const ActivityChart: React.FC<ActivityChartProps> = ({ 
  data, 
  timeRange = '7d' 
}) => {
  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    if (timeRange === '7d') {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
  const totalStarted = data.reduce((sum, item) => sum + item.started, 0);
  const completionRate = totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-success" />
          Task Activity
        </CardTitle>
        <CardDescription>
          {totalCompleted} tasks completed ({completionRate}% completion rate) in the last {timeRange}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorStarted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                className="text-xs fill-muted-foreground"
              />
              <YAxis className="text-xs fill-muted-foreground" />
              <Area
                type="monotone"
                dataKey="started"
                stackId="1"
                stroke="hsl(var(--primary))"
                fill="url(#colorStarted)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="2"
                stroke="hsl(var(--success))"
                fill="url(#colorCompleted)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;