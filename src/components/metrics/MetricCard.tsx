
import React from 'react';
import { CircularProgress } from "@/components/ui/circular-progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  tooltip?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
  };
  progressValue?: number;
  gradientClass?: string;
}

export const MetricCard = ({
  icon: Icon,
  value,
  label,
  tooltip,
  trend,
  progressValue = 100,
  gradientClass = "from-sky-500/10 to-blue-500/10 hover:from-sky-500/20 hover:to-blue-500/20"
}: MetricCardProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 backdrop-blur-xl transition-all duration-300",
            "bg-gradient-to-br",
            gradientClass,
            "hover:scale-[1.02]"
          )}>
            <div className="relative">
              <CircularProgress value={progressValue} size={48} className="text-sky-500/20">
                <Icon className="text-sky-400 absolute inset-0 m-auto" size={24} />
                {trend && (
                  <div className={cn(
                    "absolute -right-1 -top-1 w-2 h-2 rounded-full",
                    trend.direction === 'up' ? "bg-green-500" : 
                    trend.direction === 'down' ? "bg-red-500" : 
                    "bg-sky-500"
                  )} />
                )}
              </CircularProgress>
            </div>
            <span className="text-xl font-mono text-white font-medium mt-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {value}
            </span>
            <span className="text-sm text-gray-400 font-medium mt-1">{label}</span>
          </div>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent side="bottom" className="bg-gray-900/95 border-gray-800">
            <p>{tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
