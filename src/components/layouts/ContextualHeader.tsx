
import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContextualHeaderProps {
  title?: string;
  variant?: 'default' | 'overlay' | 'minimal';
  showBackButton?: boolean;
  showCloseButton?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const ContextualHeader: React.FC<ContextualHeaderProps> = ({
  title,
  variant = 'default',
  showBackButton = false,
  showCloseButton = false,
  onBack,
  onClose,
  actions,
  className
}) => {
  const isOverlay = variant === 'overlay';

  return (
    <div className={cn(
      "flex items-center justify-between h-16",
      isOverlay ? "text-white" : "text-white",
      className
    )}>
      {/* Left Section */}
      <div className="flex items-center space-x-2">
        {showBackButton && (
          <Button
            variant={isOverlay ? "ghost" : "ghost"}
            size="icon"
            onClick={onBack}
            className={cn(
              "h-10 w-10",
              isOverlay && "hover:bg-white/10"
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        {title && (
          <h1 className={cn(
            "text-lg font-semibold truncate",
            isOverlay && "text-white/90"
          )}>
            {title}
          </h1>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {actions}
        {showCloseButton && (
          <Button
            variant={isOverlay ? "ghost" : "ghost"}
            size="icon"
            onClick={onClose}
            className={cn(
              "h-10 w-10",
              isOverlay && "hover:bg-white/10"
            )}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};
