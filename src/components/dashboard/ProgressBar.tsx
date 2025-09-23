import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  label: string;
  current: number;
  max: number;
  unit?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
  showPercentage?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  max,
  unit = '',
  color = 'primary',
  showPercentage = true,
  className
}) => {
  const percentage = Math.min(100, (current / max) * 100);
  
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'secondary':
        return 'text-secondary [&>[role=progressbar]]:bg-secondary';
      case 'success':
        return 'text-success [&>[role=progressbar]]:bg-success';
      case 'warning':
        return 'text-warning [&>[role=progressbar]]:bg-warning';
      case 'destructive':
        return 'text-destructive [&>[role=progressbar]]:bg-destructive';
      default:
        return 'text-primary [&>[role=progressbar]]:bg-primary';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {current.toLocaleString()}{unit} / {max.toLocaleString()}{unit}
          {showPercentage && ` (${Math.round(percentage)}%)`}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn("h-2", getColorClasses(color))}
      />
    </div>
  );
};

export default ProgressBar;