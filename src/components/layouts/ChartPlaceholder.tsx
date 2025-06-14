
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChartPlaceholderProps {
  type?: 'bar' | 'line' | 'pie' | 'area' | 'metric';
  height?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  title?: string;
}

export const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({
  type = 'bar',
  height = 'md',
  className,
  title
}) => {
  const getHeight = () => {
    switch (height) {
      case 'sm': return 'h-32';
      case 'md': return 'h-48';
      case 'lg': return 'h-64';
      case 'xl': return 'h-80';
      default: return 'h-48';
    }
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <div className="flex items-end justify-between space-x-2 h-full">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className={cn(
                  "w-full bg-gray-800",
                  i % 3 === 0 ? 'h-3/4' : i % 2 === 0 ? 'h-1/2' : 'h-full'
                )} 
              />
            ))}
          </div>
        );
      
      case 'line':
        return (
          <div className="relative h-full">
            <Skeleton className="absolute inset-0 bg-gray-800" />
            <div className="absolute inset-4 flex items-end justify-between">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-purple-400 rounded-full" />
              ))}
            </div>
          </div>
        );
      
      case 'pie':
        return (
          <div className="flex items-center justify-center h-full">
            <Skeleton className="w-32 h-32 rounded-full bg-gray-800" />
          </div>
        );
      
      case 'area':
        return (
          <div className="relative h-full">
            <Skeleton className="absolute inset-0 bg-gray-800" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-400/20 to-transparent" />
          </div>
        );
      
      case 'metric':
        return (
          <div className="space-y-3">
            <Skeleton className="h-8 w-20 bg-gray-800" />
            <Skeleton className="h-4 w-32 bg-gray-800" />
            <Skeleton className="h-2 w-full bg-gray-800" />
          </div>
        );
      
      default:
        return <Skeleton className="h-full bg-gray-800" />;
    }
  };

  return (
    <div className={cn("bg-gray-900/50 border border-gray-800 rounded-lg p-4", className)}>
      {title && (
        <div className="mb-4">
          <Skeleton className="h-5 w-1/2 bg-gray-800" />
        </div>
      )}
      <div className={getHeight()}>
        {renderChart()}
      </div>
    </div>
  );
};
