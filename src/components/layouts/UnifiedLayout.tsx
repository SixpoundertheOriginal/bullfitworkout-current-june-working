
import React from 'react';
import { cn } from '@/lib/utils';
import { layoutManagerService } from '@/services/LayoutManagerService';

interface UnifiedLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'training' | 'minimal';
  timerComponent?: React.ReactNode;
  headerComponent?: React.ReactNode;
  className?: string;
}

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({
  children,
  variant = 'default',
  timerComponent,
  headerComponent,
  className
}) => {
  const layoutClasses = layoutManagerService.getLayoutClasses();
  const isTrainingSession = variant === 'training';

  return (
    <div className={cn(
      "min-h-screen bg-gray-900 text-white relative",
      layoutClasses.safeAreaTop,
      layoutClasses.safeAreaBottom,
      className
    )}>
      {/* Timer Component - Highest Priority in Training Mode */}
      {isTrainingSession && timerComponent && (
        <div className={cn(
          layoutClasses.timerContainer,
          "bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50"
        )}>
          <div className="container mx-auto px-4 py-4">
            {timerComponent}
          </div>
        </div>
      )}

      {/* Header Component - Overlay or Standard */}
      {headerComponent && (
        <div className={cn(
          isTrainingSession ? layoutClasses.headerOverlay : "relative",
          isTrainingSession && "bg-transparent"
        )}>
          {!isTrainingSession && (
            <div className="bg-gray-900 border-b border-gray-800">
              <div className="container mx-auto px-4">
                {headerComponent}
              </div>
            </div>
          )}
          {isTrainingSession && (
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              {headerComponent}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1",
        isTrainingSession ? layoutClasses.contentContainer : "pt-16"
      )}>
        {children}
      </main>
    </div>
  );
};
