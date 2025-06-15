
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/VisuallyHidden';
import { cn } from '@/lib/utils';

interface AccessibleDialogProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
  title: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
  showHeader?: boolean;
  hideTitleVisually?: boolean;
  footerContent?: React.ReactNode;
}

export const AccessibleDialog: React.FC<AccessibleDialogProps> = ({
  children,
  trigger,
  title,
  description,
  open,
  onOpenChange,
  className,
  contentClassName,
  showHeader = true,
  hideTitleVisually = false,
  footerContent
}) => {
  const dialogId = React.useId();
  const titleId = `${dialogId}-title`;
  const descriptionId = `${dialogId}-description`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent 
        className={cn("max-w-2xl", contentClassName || className)}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <DialogHeader className={showHeader && !hideTitleVisually ? '' : 'sr-only'}>
          <DialogTitle id={titleId} className={showHeader && !hideTitleVisually ? '' : 'sr-only'}>
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription id={descriptionId} className={showHeader && !hideTitleVisually ? '' : 'sr-only'}>
              {description}
            </DialogDescription>
          )}
          {!description && (
            <VisuallyHidden>
              <DialogDescription id={descriptionId}>
                {title} dialog
              </DialogDescription>
            </VisuallyHidden>
          )}
        </DialogHeader>
        {children}
        {footerContent && (
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-800/50">
            {footerContent}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
