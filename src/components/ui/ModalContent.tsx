
import React from 'react';
import { cn } from '@/lib/utils';

export interface ModalContentProps {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  className,
  scrollable = true
}) => {
  return (
    <div 
      className={cn(
        "flex-1 px-4",
        scrollable && "overflow-auto",
        className
      )}
    >
      {children}
    </div>
  );
};
