
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'card' | 'chart' | 'metric' | 'content';
  aspectRatio?: string;
  minHeight?: string;
  maxHeight?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  enableScrolling?: boolean;
}

const variantClasses = {
  card: 'bg-card border border-border rounded-lg shadow-sm',
  chart: 'bg-card border border-border rounded-lg overflow-hidden',
  metric: 'bg-card border border-border rounded-lg p-6',
  content: 'bg-background'
};

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  variant = 'content',
  aspectRatio,
  minHeight = '150px',
  maxHeight = '500px',
  padding = 'none',
  enableScrolling = false
}) => {
  const containerStyle: React.CSSProperties = {
    minHeight,
    maxHeight,
    aspectRatio: aspectRatio || 'auto'
  };

  return (
    <div 
      className={cn(
        'responsive-container',
        'w-full',
        'h-full',
        'relative',
        'container-type-inline-size', // Enable container queries
        variantClasses[variant],
        paddingClasses[padding],
        enableScrolling && 'overflow-auto',
        !enableScrolling && 'overflow-hidden',
        'transition-all',
        'duration-200',
        'ease-out',
        className
      )}
      style={containerStyle}
    >
      <div className="container-content h-full w-full">
        {children}
      </div>
    </div>
  );
};
