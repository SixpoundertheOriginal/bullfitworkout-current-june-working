
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
            "flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border border-white/8 backdrop-blur-2xl transition-all duration-300",
            "bg-gradient-to-br from-card/85 via-card/90 to-secondary/60",
            gradientClass,
            "hover:scale-[1.015] shadow-sm",
            "min-w-[84px] max-w-[108px] w-full"
          )}
        >
          <div className="mb-1 rounded-full bg-white/10 shadow-sm flex h-9 w-9 items-center justify-center">
            <Icon className="h-5 w-5 text-purple-300" />
          </div>
          {/* Value (prominent heading) */}
          <div
            className={cn(
              typography.headings.h3,
              "mt-1 text-center",
              valueClass
            )}
            style={{lineHeight: 1.05}}
          >
            {value}
          </div>
          {/* Label (subheading, muted) */}
          <div className={cn(
            typography.sections.label,
            "text-center mt-1",
            labelClass
          )}>
            {label}
          </div>
          {/* Progress (if present) */}
          {progressValue !== undefined && (
            <div className="w-full mt-2">
              <Progress
                value={progressValue}
                className="h-1 bg-gray-800 [&>div]:bg-purple-500"
              />
            </div>
          )}
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
