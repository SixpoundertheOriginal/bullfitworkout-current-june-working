
import React, { useEffect, useState } from 'react';
import { Bell, X, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RestTimerNotificationProps {
  isVisible: boolean;
  overtimeSeconds: number;
  onDismiss: () => void;
  onStartNextSet?: () => void;
  className?: string;
}

export const RestTimerNotification: React.FC<RestTimerNotificationProps> = ({
  isVisible,
  overtimeSeconds,
  onDismiss,
  onStartNextSet,
  className
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-dismiss after 10 seconds if user doesn't interact
      const timeout = setTimeout(() => {
        onDismiss();
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, onDismiss]);

  const formatOvertimeTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-20 left-1/2 transform -translate-x-1/2 z-50",
      "bg-gray-900 border-2 border-red-500/50 rounded-2xl shadow-2xl",
      "p-4 min-w-80 max-w-md",
      "animate-slide-down",
      isAnimating && "animate-pulse-glow",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500/20 rounded-xl">
            <Bell className="w-5 h-5 text-red-400 animate-bounce" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Rest Time Complete!</h3>
            <p className="text-sm text-gray-400">Time to start your next set</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="mb-4">
        <div className="text-center">
          <div className="text-2xl font-mono font-bold text-red-400 mb-1">
            +{formatOvertimeTime(overtimeSeconds)}
          </div>
          <div className="text-sm text-gray-400">Overtime</div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDismiss}
          className="flex-1 bg-gray-800 border-gray-600 hover:bg-gray-700"
        >
          Dismiss
        </Button>
        {onStartNextSet && (
          <Button
            size="sm"
            onClick={() => {
              onStartNextSet();
              onDismiss();
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Next Set
          </Button>
        )}
      </div>
    </div>
  );
};
