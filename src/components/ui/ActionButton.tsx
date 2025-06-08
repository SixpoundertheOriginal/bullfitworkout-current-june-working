
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

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
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    outline: 'border border-gray-600 hover:bg-gray-800 text-gray-300',
    ghost: 'hover:bg-gray-800 text-gray-400 hover:text-gray-300',
    destructive: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizeVariants = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center gap-2 font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900',
        buttonVariants[variant],
        sizeVariants[size],
        className
      )}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon size={iconSizes[size]} className={loading ? 'animate-spin' : ''} />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && (
        <Icon size={iconSizes[size]} className={loading ? 'animate-spin' : ''} />
      )}
    </Button>
  );
};
