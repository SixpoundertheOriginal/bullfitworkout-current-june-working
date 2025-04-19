
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-lg hover:shadow-purple-500/25",
      },
      shape: {
        default: "rounded-md",
        pill: "rounded-full",
        square: "rounded-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10 p-2",
      },
      iconPosition: {
        left: "[&_svg]:ml-0 [&_svg]:mr-2",
        right: "[&_svg]:ml-2 [&_svg]:mr-0",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
      iconPosition: "left",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  iconOnly?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, iconPosition, icon, children, iconOnly = false, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const effectiveSize = iconOnly ? "icon" : size
    const effectiveIconPosition = iconOnly ? "none" : iconPosition

    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant, 
            size: effectiveSize, 
            shape,
            iconPosition: effectiveIconPosition,
            className 
          })
        )}
        ref={ref}
        {...props}
      >
        {icon}
        {!iconOnly && children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
