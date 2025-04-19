
import React from 'react';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseVolumeCardProps {
  exerciseName: string;
  volume: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  percentChange: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ExerciseVolumeCard = ({
  exerciseName,
  volume,
  trend,
  percentChange,
  className,
  style
}: ExerciseVolumeCardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'increasing':
        return 'text-green-500';
      case 'decreasing':
        return 'text-red-500';
      case 'fluctuating':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className={cn("w-4 h-4", getTrendColor())} />;
      case 'decreasing':
        return <TrendingDown className={cn("w-4 h-4", getTrendColor())} />;
      default:
        return <BarChart3 className={cn("w-4 h-4", getTrendColor())} />;
    }
  };

  return (
    <div 
      className={cn(
        "p-4 rounded-xl border border-gray-800",
        "bg-gray-900/50 backdrop-blur-sm",
        "hover:bg-gray-900/80 transition-all duration-200",
        "hover:border-gray-700 hover:shadow-lg",
        "transform hover:-translate-y-0.5",
        className
      )}
      style={style}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-200">{exerciseName}</h3>
          <p className="text-2xl font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {volume.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-gray-800/50 px-2 py-1 rounded-full">
          {getTrendIcon()}
          <span className={cn("text-sm font-medium", getTrendColor())}>
            {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};
