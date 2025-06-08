
import React from 'react';
import { cn } from '@/lib/utils';

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn("px-4 py-3 border-t border-gray-700", className)}>
      {children}
    </div>
  );
};
