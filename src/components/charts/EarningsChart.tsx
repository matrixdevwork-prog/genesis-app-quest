import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface EarningsData {
  date: string;
  credits: number;
  tasks: number;
}

interface EarningsChartProps {
  data: EarningsData[];
  timeRange?: '7d' | '30d' | '90d';
}

const EarningsChart: React.FC<EarningsChartProps> = ({ 
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

  const totalCredits = data.reduce((sum, item) => sum + item.credits, 0);
  const totalTasks = data.reduce((sum, item) => sum + item.tasks, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Credit Earnings
        </CardTitle>
        <CardDescription>
          {totalCredits} credits earned from {totalTasks} tasks in the last {timeRange}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                className="text-xs fill-muted-foreground"
              />
              <YAxis className="text-xs fill-muted-foreground" />
              <Line 
                type="monotone" 
                dataKey="credits" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsChart;