
/**
 * Types related to training configuration and sessions
 */

import { MuscleGroup } from "@/constants/exerciseMetadata";

export interface Training {
  id?: string;
  name: string;
  bodyFocus: MuscleGroup[];
  trainingType: string;
  movementPattern: string[];
  sets?: number;
  isCustom?: boolean;
  createdAt?: string;
  userId?: string;
}

export interface TrainingType {
  id: string;
  name: string;
  color?: string;
  icon?: React.ReactNode;
  description?: string;
  isCustom?: boolean;
}

export interface TrainingSession {
  id: string;
  trainingId: string;
  startTime: string;
  endTime?: string;
  completed: boolean;
  exercises: string[];
  metrics?: {
    volumeTotal: number;
    setCount: number;
    muscleGroups: Record<string, number>;
  };
}
