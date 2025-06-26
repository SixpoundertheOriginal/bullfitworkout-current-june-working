
import { Dumbbell, Zap, Activity } from "lucide-react";
import React from "react";

export interface StrengthTrainingType {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
  description: string;
  focus: string;
  repRange: string;
}

export const strengthTrainingTypes: StrengthTrainingType[] = [
  { 
    id: 'strength', 
    name: 'Strength Training', 
    color: '#6E59A5', 
    icon: React.createElement(Dumbbell, { size: 16 }),
    description: 'Heavy compound movements for maximum strength',
    focus: 'Power & 1RM',
    repRange: '1-5 reps'
  },
  { 
    id: 'hypertrophy', 
    name: 'Hypertrophy', 
    color: '#F472B6', 
    icon: React.createElement(Zap, { size: 16 }),
    description: 'Muscle building with moderate weights',
    focus: 'Muscle Growth',
    repRange: '8-12 reps'
  },
  { 
    id: 'calisthenics', 
    name: 'Calisthenics', 
    color: '#3B82F6', 
    icon: React.createElement(Activity, { size: 16 }),
    description: 'Bodyweight strength and skill progression',
    focus: 'Bodyweight Mastery',
    repRange: '5-15 reps'
  }
];
