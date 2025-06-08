
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type MovementPattern = 'push' | 'pull' | 'squat' | 'hinge' | 'core' | 'carry';

interface MovementPatternBadgeProps {
  pattern: MovementPattern;
  size?: 'sm' | 'md';
  className?: string;
}

const PATTERN_CONFIG: Record<MovementPattern, { label: string; colorClass: string }> = {
  push: {
    label: 'Push',
    colorClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  },
  pull: {
    label: 'Pull',
    colorClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  },
  squat: {
    label: 'Squat',
    colorClass: 'bg-green-500/20 text-green-300 border-green-500/30'
  },
  hinge: {
    label: 'Hinge',
    colorClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  },
  core: {
    label: 'Core',
    colorClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  },
  carry: {
    label: 'Carry',
    colorClass: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
};

export const MovementPatternBadge: React.FC<MovementPatternBadgeProps> = ({
  pattern,
  size = 'sm',
  className
}) => {
  const config = PATTERN_CONFIG[pattern];
  
  return (
    <Badge 
      variant="outline"
      className={cn(
        'border font-medium',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        config.colorClass,
        className
      )}
    >
      {config.label}
    </Badge>
  );
};
