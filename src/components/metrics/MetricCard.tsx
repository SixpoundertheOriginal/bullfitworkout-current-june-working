
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
  valueClass = "text-white",
  labelClass = "text-gray-400" 
}: MetricCardProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 backdrop-blur-xl transition-all duration-300",
          "bg-gradient-to-br",
          gradientClass || "from-gray-500/10 to-gray-700/10 hover:from-gray-500/20 hover:to-gray-700/20",
          "hover:scale-[1.02]"
        )}>
          <div className="mb-2">
            <Icon className={cn("h-7 w-7", valueClass)} />
          </div>
          <div className={cn("text-2xl font-bold", valueClass)}>
            {value}
          </div>
          <div className={cn("text-sm", labelClass)}>
            {label}
          </div>
          
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
