
import React from 'react';
import { cn } from '@/lib/utils';

export interface ModalHeaderProps {
  children: React.ReactNode;
  className?: string;
  showHandle?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  className,
  showHandle = true
}) => {
  return (
    <div className={cn("flex flex-col", className)}>
      {/* Modal Handle */}
      {showHandle && (
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
        </div>
      )}
      
      {/* Header Content */}
      <div className="px-4 pb-2">
        {children}
      </div>
    </div>
  );
};
