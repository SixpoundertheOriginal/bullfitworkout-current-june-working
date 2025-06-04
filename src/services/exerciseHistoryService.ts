
import { exerciseHistoryData } from '@/constants/exerciseHistoryData';

export interface SessionData {
  date: string;
  weight: number;
  reps: number;
  sets: number;
  exerciseGroup?: string;
}

export const getPreviousSessionData = (exerciseName: string): SessionData => {
  const history = exerciseHistoryData[exerciseName] || [];
  if (history.length > 0) {
    return history[0];
  }
  
  return { date: "N/A", weight: 0, reps: 0, sets: 0, exerciseGroup: "" };
};

export const getOlderSessionData = (exerciseName: string): SessionData => {
  const history = exerciseHistoryData[exerciseName] || [];
  return history[1] || getPreviousSessionData(exerciseName);
};
