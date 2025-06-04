
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { theme, withTheme } from "@/lib/theme";
import { typography } from "@/lib/typography";

interface MetricCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  tooltip?: string;
  description?: string;
  progressValue?: number;
  gradientClass?: string;
  valueClass?: string;
  labelClass?: string;
  className?: string;
  onClick?: () => void;
  variant?: 'time' | 'exercises' | 'sets' | 'rest' | 'default';
}

const variantStyles = {
  time: {
    gradient: "from-sky-600/20 via-sky-800/10 to-sky-900/20 hover:from-sky-600/30 hover:to-sky-900/30",
    iconBg: "bg-sky-500/20",
    iconColor: "text-sky-300",
    valueColor: "text-sky-200 bg-gradient-to-br from-sky-200 to-sky-400 bg-clip-text text-transparent",
    glow: "hover:shadow-sky-500/20"
  },
  exercises: {
    gradient: "from-emerald-600/20 via-emerald-800/10 to-emerald-900/20 hover:from-emerald-600/30 hover:to-emerald-900/30",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-300",
    valueColor: "text-emerald-200 bg-gradient-to-br from-emerald-200 to-emerald-400 bg-clip-text text-transparent",
    glow: "hover:shadow-emerald-500/20"
  },
  sets: {
    gradient: "from-violet-600/20 via-violet-800/10 to-violet-900/20 hover:from-violet-600/30 hover:to-violet-900/30",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-300",
    valueColor: "text-violet-200 bg-gradient-to-br from-violet-200 to-violet-400 bg-clip-text text-transparent",
    glow: "hover:shadow-violet-500/20"
  },
  rest: {
    gradient: "from-orange-600/20 via-orange-800/10 to-orange-900/20 hover:from-orange-600/30 hover:to-orange-900/30",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-300",
    valueColor: "text-orange-200 bg-gradient-to-br from-orange-200 to-orange-400 bg-clip-text text-transparent",
    glow: "hover:shadow-orange-500/20"
  },
  default: {
    gradient: "from-gray-600/20 via-gray-800/10 to-gray-900/20 hover:from-gray-600/30 hover:to-gray-900/30",
    iconBg: "bg-white/10",
    iconColor: "text-white",
    valueColor: "text-white",
    glow: "hover:shadow-purple-500/10"
  }
};

export const MetricCard = ({
  icon: Icon,
  value,
  label,
  tooltip,
  description,
  progressValue,
  gradientClass,
  valueClass,
  labelClass,
  className,
  onClick,
  variant = 'default'
}: MetricCardProps) => {
  const styles = variantStyles[variant];
  const isInteractive = !!onClick;

  const CardWrapper = isInteractive ? 'button' : 'div';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CardWrapper
          onClick={onClick}
          className={cn(
            "group flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-white/10 backdrop-blur-xl transition-all duration-300",
            "bg-gradient-to-br",
            gradientClass || styles.gradient,
            isInteractive && "cursor-pointer active:scale-95 hover:scale-[1.02]",
            "hover:shadow-lg",
            styles.glow,
            "min-w-[80px] w-full",
            "relative overflow-hidden touch-target",
            className
          )}
          {...(isInteractive && {
            'aria-label': `View details for ${label}`,
            'role': 'button',
            'tabIndex': 0
          })}
        >
          {/* Subtle glow effect in background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-80" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Icon with enhanced styling */}
            <div className={cn(
              "mb-2 rounded-full shadow-inner flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center transition-all duration-300",
              styles.iconBg,
              isInteractive && "group-hover:scale-110"
            )}>
              <Icon className={cn(
                "h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300",
                styles.iconColor,
                isInteractive && "group-hover:drop-shadow-lg"
              )} />
            </div>

            {/* Value with enhanced typography */}
            <div
              className={cn(
                "mt-1 text-center font-bold text-lg sm:text-xl transition-all duration-300",
                valueClass || styles.valueColor,
                isInteractive && "group-hover:scale-105"
              )}
            >
              {value}
            </div>

            {/* Label with better hierarchy */}
            <div className={cn(
              "text-center mt-1.5 text-xs sm:text-sm font-medium transition-all duration-300",
              labelClass || "text-white/70",
              isInteractive && "group-hover:text-white/90"
            )}>
              {label}
            </div>

            {/* Description */}
            {description && (
              <div className={cn(
                "text-center text-xs mt-1 transition-all duration-300",
                "text-white/50",
                isInteractive && "group-hover:text-white/70"
              )}>
                {description}
              </div>
            )}

            {/* Progress with variant styling */}
            {progressValue !== undefined && (
              <div className="w-full mt-3">
                <Progress
                  value={progressValue}
                  className={cn(
                    "h-1.5 bg-gray-800/60 rounded-full transition-all duration-300",
                    variant === 'sets' && "[&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-purple-500",
                    variant === 'time' && "[&>div]:bg-gradient-to-r [&>div]:from-sky-500 [&>div]:to-blue-500",
                    variant === 'exercises' && "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-500",
                    variant === 'rest' && "[&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-red-500",
                    !['sets', 'time', 'exercises', 'rest'].includes(variant) && "[&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500"
                  )}
                />
              </div>
            )}

            {/* Interactive indicator */}
            {isInteractive && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </CardWrapper>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent
          side="bottom"
          className={withTheme("bg-gray-900 border border-gray-800 text-sm max-w-48", theme.colors.text.light)}
        >
          {tooltip}
        </TooltipContent>
      )}
    </Tooltip>
  );
};
