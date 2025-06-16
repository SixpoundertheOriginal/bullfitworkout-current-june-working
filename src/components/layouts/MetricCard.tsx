
import React from 'react';
import { cn } from '@/lib/utils';
import { ResponsiveContainer } from './ResponsiveContainer';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: LucideIcon;
  className?: string;
  loading?: boolean;
  subtitle?: string;
  actions?: React.ReactNode;
}

const MetricCardSkeleton: React.FC = () => (
  <div className="metric-card-skeleton animate-pulse">
    <div className="flex items-center justify-between mb-2">
      <div className="h-4 bg-gray-700 rounded w-20"></div>
      <div className="h-4 w-4 bg-gray-700 rounded"></div>
    </div>
    <div className="h-8 bg-gray-700 rounded w-16 mb-1"></div>
    <div className="h-3 bg-gray-700 rounded w-24"></div>
  </div>
);

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  className,
  loading = false,
  subtitle,
  actions
}) => {
  const getChangeColor = () => {
    if (!change) return '';
    switch (change.type) {
      case 'increase': return 'text-green-400';
      case 'decrease': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getChangeSymbol = () => {
    if (!change) return '';
    switch (change.type) {
      case 'increase': return '+';
      case 'decrease': return '-';
      default: return '';
    }
  };

  if (loading) {
    return (
      <ResponsiveContainer
        variant="metric"
        className={cn('metric-card', className)}
        minHeight="120px"
        maxHeight="180px"
      >
        <MetricCardSkeleton />
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer
      variant="metric"
      className={cn('metric-card metric-card-content', className)}
      minHeight="120px"
      maxHeight="180px"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="metric-card-title text-sm font-medium text-gray-400 truncate">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />}
          {actions}
        </div>
      </div>
      
      <div className="metric-card-value text-2xl font-bold text-white mb-1">
        {value}
      </div>
      
      <div className="flex items-center gap-2 text-xs">
        {change && (
          <span className={cn('font-medium', getChangeColor())}>
            {getChangeSymbol()}{Math.abs(change.value)}%
          </span>
        )}
        {subtitle && (
          <span className="text-gray-500 truncate">
            {subtitle || (change?.period && `vs ${change.period}`)}
          </span>
        )}
      </div>
    </ResponsiveContainer>
  );
};
