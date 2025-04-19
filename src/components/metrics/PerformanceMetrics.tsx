
import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PerformanceMetricsProps {
  volume: number;
  intensity: number;
  density: number;
  efficiency: number;
  className?: string;
}

export const PerformanceMetrics = ({
  volume,
  intensity,
  density,
  efficiency,
  className
}: PerformanceMetricsProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="text-purple-400" size={20} />
        <h3 className="text-sm font-medium text-gray-300">Performance Metrics</h3>
      </div>
      
      <div className="space-y-3">
        <MetricBar label="Volume" value={volume} color="from-blue-500 to-sky-500" />
        <MetricBar label="Intensity" value={intensity} color="from-purple-500 to-pink-500" />
        <MetricBar label="Density" value={density} color="from-emerald-500 to-teal-500" />
        <MetricBar label="Efficiency" value={efficiency} color="from-orange-500 to-yellow-500" />
      </div>
    </div>
  );
};

interface MetricBarProps {
  label: string;
  value: number;
  color: string;
}

const MetricBar = ({ label, value, color }: MetricBarProps) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-300">{value}%</span>
    </div>
    <Progress
      value={value}
      className={cn(
        "h-1.5 bg-gray-800/50",
        "[&>div]:bg-gradient-to-r",
        `[&>div]:${color}`
      )}
    />
  </div>
);
