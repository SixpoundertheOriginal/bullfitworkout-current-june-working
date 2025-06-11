
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonScreenProps {
  variant?: 'exercise-card' | 'exercise-list' | 'workout-session' | 'profile';
  count?: number;
  className?: string;
}

export const SkeletonScreen: React.FC<SkeletonScreenProps> = React.memo(({
  variant = 'exercise-card',
  count = 1,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'exercise-card':
        return (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 animate-pulse">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-800 rounded w-full"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                </div>
                <div className="h-8 w-8 bg-gray-800 rounded"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-2 bg-gray-800 rounded-full w-full"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-800 rounded-full"></div>
                  <div className="h-6 w-20 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <div className="h-8 flex-1 bg-gray-800 rounded"></div>
                <div className="h-8 flex-1 bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        );

      case 'exercise-list':
        return (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-gray-800 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-800 rounded w-1/2"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                <div className="flex gap-2">
                  <div className="h-5 w-12 bg-gray-800 rounded-full"></div>
                  <div className="h-5 w-16 bg-gray-800 rounded-full"></div>
                </div>
              </div>
              <div className="h-8 w-20 bg-gray-800 rounded"></div>
            </div>
          </div>
        );

      case 'workout-session':
        return (
          <div className="space-y-6 animate-pulse">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="space-y-4">
                <div className="h-8 bg-gray-800 rounded w-1/3"></div>
                <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                <div className="flex gap-4">
                  <div className="h-12 bg-gray-800 rounded w-20"></div>
                  <div className="h-12 bg-gray-800 rounded w-20"></div>
                  <div className="h-12 bg-gray-800 rounded w-20"></div>
                </div>
              </div>
            </div>
            
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-800 rounded w-1/2"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-16 bg-gray-800 rounded"></div>
                    <div className="h-16 bg-gray-800 rounded"></div>
                    <div className="h-16 bg-gray-800 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6 animate-pulse">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-gray-800 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-800 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-800 rounded w-3/4"></div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-800 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
});

SkeletonScreen.displayName = 'SkeletonScreen';
