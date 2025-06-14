
import React from 'react';
import { Slot } from '@radix-ui/react-slot';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const VisuallyHidden = React.forwardRef<
  HTMLElement,
  VisuallyHiddenProps & React.HTMLAttributes<HTMLElement>
>(({ children, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span';
  return (
    <Comp
      ref={ref as any}
      style={{
        position: 'absolute',
        border: 0,
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        wordWrap: 'normal',
      }}
      {...props}
    >
      {children}
    </Comp>
  );
});

VisuallyHidden.displayName = 'VisuallyHidden';

export { VisuallyHidden };
