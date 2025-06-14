
import React from 'react';
import { cn } from '@/lib/utils';
import WorkoutErrorBoundary from '@/components/ui/WorkoutErrorBoundary';

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

interface DashboardSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  span?: 'full' | 'half' | 'third' | 'quarter';
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "grid gap-6",
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      "auto-rows-min",
      className
    )}>
      {children}
    </div>
  );
};

export const DashboardSection: React.FC<DashboardSectionProps> = ({ 
  children, 
  className, 
  title,
  span = 'quarter'
}) => {
  const getSpanClass = () => {
    switch (span) {
      case 'full':
        return 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-4';
      case 'half':
        return 'col-span-1 md:col-span-1 lg:col-span-2 xl:col-span-2';
      case 'third':
        return 'col-span-1 md:col-span-1 lg:col-span-1 xl:col-span-1';
      case 'quarter':
      default:
        return 'col-span-1';
    }
  };

  return (
    <WorkoutErrorBoundary
      fallback={
        <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Chart Error</h3>
          <p className="text-sm">Failed to load {title || 'chart'}</p>
        </div>
      }
    >
      <div className={cn(getSpanClass(), className)}>
        {title && (
          <h3 className="text-lg font-semibold mb-4 text-gray-200">{title}</h3>
        )}
        {children}
      </div>
    </WorkoutErrorBoundary>
  );
};
