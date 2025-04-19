
import React from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutEfficiencyScoreProps {
  score: number;
  className?: string;
}

export const WorkoutEfficiencyScore = ({ score, className }: WorkoutEfficiencyScoreProps) => {
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <div className={cn(
      "p-4 rounded-xl border border-gray-800 bg-gray-900/50",
      "hover:bg-gray-900/80 transition-all duration-200",
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Activity className={cn("w-5 h-5", getScoreColor())} />
        <h3 className="text-sm font-medium text-gray-300">Efficiency Score</h3>
      </div>
      <p className={cn(
        "text-3xl font-bold bg-clip-text text-transparent",
        "bg-gradient-to-r from-white to-white/80"
      )}>
        {score}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {score >= 80 ? 'Excellent' :
         score >= 60 ? 'Good' :
         score >= 40 ? 'Fair' : 'Needs Improvement'}
      </p>
    </div>
  );
};
