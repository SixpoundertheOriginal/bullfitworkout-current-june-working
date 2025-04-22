
import { Dumbbell, Weight, Heart, ArrowUpRight } from "lucide-react";
import React from "react";

export interface TrainingTypeObj {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

export const trainingTypes: TrainingTypeObj[] = [
  { 
    id: 'strength', 
    name: 'Strength', 
    color: 'purple', 
    icon: React.createElement(Dumbbell, { size: 16 })
  },
  { 
    id: 'hypertrophy', 
    name: 'Hypertrophy', 
    color: 'pink', 
    icon: React.createElement(Weight, { size: 16 })
  },
  { 
    id: 'cardio', 
    name: 'Cardio', 
    color: 'red', 
    icon: React.createElement(Heart, { size: 16 })
  },
  { 
    id: 'calisthenics', 
    name: 'Calisthenics', 
    color: 'blue', 
    icon: React.createElement(ArrowUpRight, { size: 16 })
  },
  { 
    id: 'stretching', 
    name: 'Stretching', 
    color: 'teal', 
    icon: React.createElement(ArrowUpRight, { size: 16 })
  },
  { 
    id: 'yoga', 
    name: 'Yoga', 
    color: 'green', 
    icon: React.createElement(ArrowUpRight, { size: 16 })
  }
];
