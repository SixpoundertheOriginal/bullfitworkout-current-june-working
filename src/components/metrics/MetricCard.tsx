
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/typography";

interface MetricCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  tooltip?: string;
  progressValue?: number;
  gradientClass?: string;
  valueClass?: string;
  labelClass?: string;
}

export const MetricCard = ({
  icon: Icon,
  value,
  label,
  tooltip,
  progressValue,
  gradientClass,
  valueClass,
  labelClass
}: MetricCardProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex flex-col items-center justify-center p-4 rounded-2xl border border-white/10 backdrop-blur-xl transition-all duration-300",
            "bg-gradient-to-br from-gray-900/80 via-gray-800/40 to-gray-900/90",
            gradientClass,
            "hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10",
            "min-w-[100px] w-full",
            "relative overflow-hidden"
          )}
        >
          {/* Subtle glow effect in background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-80" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-2 rounded-full bg-white/8 shadow-inner flex h-12 w-12 items-center justify-center">
              <Icon className="h-6 w-6 text-purple-300" />
            </div>
            
            {/* Value (prominent heading) */}
            <div
              className={cn(
                typography.headings.h3,
                "mt-1 text-center font-bold text-2xl",
                valueClass
              )}
            >
              {value}
            </div>
            
            {/* Label (subheading, muted) */}
            <div className={cn(
              typography.sections.label,
              "text-center mt-1.5 text-white/70",
              labelClass
            )}>
              {label}
            </div>
            
            {/* Progress (if present) */}
            {progressValue !== undefined && (
              <div className="w-full mt-3">
                <Progress
                  value={progressValue}
                  className="h-1.5 bg-gray-800/60 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500 rounded-full"
                />
              </div>
            )}
          </div>
        </div>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent
          side="bottom"
          className="bg-gray-900 border border-gray-800 text-white"
        >
          {tooltip}
        </TooltipContent>
      )}
    </Tooltip>
  );
};
