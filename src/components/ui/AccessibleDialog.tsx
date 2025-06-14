
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { cn } from "@/lib/utils";

interface AccessibleDialogProps extends DialogPrimitive.DialogProps {
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode; // Content for the main body of the dialog
  footerContent?: React.ReactNode; // Optional content for DialogFooter
  hideTitleVisually?: boolean;
  dialogProps?: Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>, 'open' | 'onOpenChange' | 'modal' | 'defaultOpen' | 'children'>;
  contentProps?: Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, 'children'>;
  contentClassName?: string;
}

const AccessibleDialog = React.memo(
  ({
    trigger,
    title,
    description,
    children,
    footerContent,
    hideTitleVisually = false,
    open,
    onOpenChange,
    dialogProps,
    contentProps,
    contentClassName,
    ...restRootProps // Catches modal, defaultOpen etc for DialogPrimitive.Root
  }: AccessibleDialogProps) => {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        {...dialogProps}
        {...restRootProps}
      >
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent
          className={cn(contentClassName)}
          {...contentProps}
          // Prevent focus on DialogContent if it's not explicitly managed
          // Radix handles focus scoping automatically
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            // Allow consumer to add their own onOpenAutoFocus logic
            contentProps?.onOpenAutoFocus?.(event);
          }}
        >
          <DialogHeader>
            {hideTitleVisually ? (
              <VisuallyHidden>
                <DialogTitle>{title}</DialogTitle>
              </VisuallyHidden>
            ) : (
              <DialogTitle>{title}</DialogTitle>
            )}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
          {footerContent && <DialogFooter>{footerContent}</DialogFooter>}
        </DialogContent>
      </Dialog>
    );
  }
);

AccessibleDialog.displayName = "AccessibleDialog";

export { AccessibleDialog };
