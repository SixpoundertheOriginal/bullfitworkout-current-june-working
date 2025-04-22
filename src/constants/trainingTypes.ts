
import { Dumbbell, Weight, Heart, ArrowUpRight } from "lucide-react";
import React from "react";

export interface TrainingTypeObj {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

export const trainingTypes: TrainingTypeObj[] = [
  { id: 'strength', name: 'Strength', color: 'purple', icon: <Dumbbell size={16} /> },
  { id: 'hypertrophy', name: 'Hypertrophy', color: 'pink', icon: <Weight size={16} /> },
  { id: 'cardio', name: 'Cardio', color: 'red', icon: <Heart size={16} /> },
  { id: 'calisthenics', name: 'Calisthenics', color: 'blue', icon: <ArrowUpRight size={16} /> },
  { id: 'stretching', name: 'Stretching', color: 'teal', icon: <ArrowUpRight size={16} /> },
  { id: 'yoga', name: 'Yoga', color: 'green', icon: <ArrowUpRight size={16} /> }
];
