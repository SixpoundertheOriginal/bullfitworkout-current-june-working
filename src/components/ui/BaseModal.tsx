
import React, { useEffect, useRef } from 'react';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { useModal } from '@/hooks/useModal';

export interface BaseModalProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full'
};

export const BaseModal: React.FC<BaseModalProps> = ({
  children,
  open,
  onOpenChange,
  className,
  side = 'bottom',
  size = 'lg',
  closeOnEscape = true,
  closeOnOutsideClick = true
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { closeModal } = useModal({
    defaultOpen: open,
    onOpenChange,
    closeOnEscape,
    closeOnOutsideClick
  });

  // Focus management
  useEffect(() => {
    if (open && contentRef.current) {
      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && closeOnEscape) {
      closeModal();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        ref={contentRef}
        side={side}
        className={cn(
          "border-t border-gray-700 bg-gray-900 p-0 focus:outline-none",
          side === 'bottom' && "h-[85vh] rounded-t-xl",
          side === 'top' && "h-[85vh] rounded-b-xl",
          side === 'left' && "w-[85vw] rounded-r-xl",
          side === 'right' && "w-[85vw] rounded-l-xl",
          sizeClasses[size],
          className
        )}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </SheetContent>
    </Sheet>
  );
};
