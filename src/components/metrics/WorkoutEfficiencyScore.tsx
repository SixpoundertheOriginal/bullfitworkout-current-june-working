
import React from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseCard } from "@/components/ui/BaseCard";
import { typography } from "@/lib/typography";

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
    <BaseCard className={cn("hover:bg-gray-900/80 transition-all duration-200", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Activity className={cn("w-5 h-5", getScoreColor())} />
        <h3 className={typography.text.secondary}>Efficiency Score</h3>
      </div>
      <p className={cn(
        typography.headings.h2,
        "bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80"
      )}>
        {score}
      </p>
      <p className={typography.text.secondary}>
        {score >= 80 ? 'Excellent' :
         score >= 60 ? 'Good' :
         score >= 40 ? 'Fair' : 'Needs Improvement'}
      </p>
    </BaseCard>
  );
};
