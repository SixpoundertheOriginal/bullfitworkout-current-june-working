
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer } from './ResponsiveContainer';

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  height?: number | string;
  aspectRatio?: string;
  loading?: boolean;
  error?: string;
  actions?: React.ReactNode;
}

const ChartLoadingSkeleton: React.FC<{ height?: number | string }> = ({ height = 250 }) => (
  <div 
    className="chart-skeleton animate-pulse bg-gray-800/30 rounded"
    style={{ height }}
  >
    <div className="h-full w-full bg-gradient-to-r from-gray-800/20 to-gray-700/20 rounded" />
  </div>
);

const ChartErrorDisplay: React.FC<{ error: string; height?: number | string }> = ({ 
  error, 
  height = 250 
}) => (
  <div 
    className="chart-error flex items-center justify-center bg-red-900/20 border border-red-500/30 text-red-300 rounded"
    style={{ height }}
  >
    <div className="text-center">
      <p className="font-medium">Chart Error</p>
      <p className="text-sm text-red-400 mt-1">{error}</p>
    </div>
  </div>
);

export const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(({
  children,
  className,
  title,
  height = 250,
  aspectRatio,
  loading = false,
  error,
  actions
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'chart-container chart-responsive',
        'bg-card border border-border rounded-lg overflow-hidden',
        'flex flex-col',
        'w-full h-full relative',
        aspectRatio && `aspect-[${aspectRatio}]`,
        className
      )}
      style={{
        minHeight: typeof height === 'number' ? `${height}px` : height,
        maxHeight: '600px'
      }}
    >
      {title && (
        <div className="chart-header flex items-center justify-between p-4 border-b border-border">
          <h3 className="chart-title font-medium text-gray-200 truncate">
            {title}
          </h3>
          {actions && (
            <div className="chart-actions flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div className="chart-content flex-1 p-4 min-h-0">
        {loading ? (
          <ChartLoadingSkeleton height={height} />
        ) : error ? (
          <ChartErrorDisplay error={error} height={height} />
        ) : (
          <div className="chart-wrapper h-full w-full">
            {children}
          </div>
        )}
      </div>
    </div>
  );
});

ChartContainer.displayName = 'ChartContainer';
