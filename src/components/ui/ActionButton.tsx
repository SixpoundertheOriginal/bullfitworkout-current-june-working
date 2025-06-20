
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon, Loader2 } from 'lucide-react';

export interface ActionButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  children,
  onClick,
  className,
  'aria-label': ariaLabel,
  ...props
}) => {
  const buttonVariants = {
    primary: 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white border border-purple-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 text-white border border-gray-600',
    outline: 'border-2 border-gray-600 hover:bg-gray-800 disabled:border-gray-600/50 text-gray-300',
    ghost: 'hover:bg-gray-800 disabled:hover:bg-transparent text-gray-400 hover:text-gray-300',
    destructive: 'bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white border border-red-500'
  };

  const sizeVariants = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  // Show loading spinner when loading, otherwise show provided icon
  const DisplayIcon = loading ? Loader2 : Icon;

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={cn(
        // Base mobile-first styling
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
        // Mobile touch optimization
        'touch-manipulation select-none',
        'active:scale-95 disabled:active:scale-100',
        // Apply variant and size styles
        buttonVariants[variant],
        sizeVariants[size],
        className
      )}
      {...props}
    >
      {DisplayIcon && iconPosition === 'left' && (
        <DisplayIcon 
          size={iconSizes[size]} 
          className={loading ? 'animate-spin' : ''} 
        />
      )}
      
      <span className="font-medium">{children}</span>
      
      {DisplayIcon && iconPosition === 'right' && (
        <DisplayIcon 
          size={iconSizes[size]} 
          className={loading ? 'animate-spin' : ''} 
        />
      )}
    </Button>
  );
};
