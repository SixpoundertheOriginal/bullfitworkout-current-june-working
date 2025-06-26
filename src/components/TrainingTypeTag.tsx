
import React from 'react';
import { cn } from "@/lib/utils";

export type StrengthTrainingType = 'Strength Training' | 'Hypertrophy' | 'Calisthenics';

interface TrainingTypeTagProps {
  type: StrengthTrainingType;
  className?: string;
  size?: 'sm' | 'default';
  variant?: 'default' | 'large';
}

const typeStyles: Record<StrengthTrainingType, string> = {
  'Strength Training': 'bg-purple-500/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30',
  'Hypertrophy': 'bg-pink-500/20 text-pink-200 border-pink-500/30 hover:bg-pink-500/30',
  'Calisthenics': 'bg-blue-500/20 text-blue-200 border-blue-500/30 hover:bg-blue-500/30'
};

export const TrainingTypeTag = ({ type, className, size = 'default', variant = 'default' }: TrainingTypeTagProps) => {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border transition-colors",
      size === 'sm' ? "px-2 py-0.5 text-xs font-medium" : 
      variant === 'default' ? "px-2.5 py-0.5 text-xs font-medium" : "px-4 py-2 text-sm font-semibold",
      typeStyles[type],
      className
    )}>
      {type}
    </span>
  );
};

export const strengthTrainingTypes: StrengthTrainingType[] = [
  'Strength Training',
  'Hypertrophy',
  'Calisthenics'
];

export function isValidStrengthTrainingType(type: string): type is StrengthTrainingType {
  return strengthTrainingTypes.includes(type as StrengthTrainingType);
}
