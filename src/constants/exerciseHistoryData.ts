
export interface ExerciseHistoryData {
  [exerciseName: string]: {
    date: string;
    weight: number;
    reps: number;
    sets: number;
    exerciseGroup?: string;
  }[];
}

// Sample exercise history data with exercise groups
export const exerciseHistoryData: ExerciseHistoryData = {
  "Bench Press": [
    { date: "Apr 10", weight: 135, reps: 10, sets: 3, exerciseGroup: "chest" },
    { date: "Apr 3", weight: 130, reps: 10, sets: 3, exerciseGroup: "chest" },
    { date: "Mar 27", weight: 125, reps: 8, sets: 3, exerciseGroup: "chest" },
  ],
  "Squats": [
    { date: "Apr 9", weight: 185, reps: 8, sets: 3, exerciseGroup: "legs" },
    { date: "Apr 2", weight: 175, reps: 8, sets: 3, exerciseGroup: "legs" },
    { date: "Mar 26", weight: 165, reps: 8, sets: 3, exerciseGroup: "legs" },
  ],
  "Deadlift": [
    { date: "Apr 8", weight: 225, reps: 5, sets: 3, exerciseGroup: "back" },
    { date: "Apr 1", weight: 215, reps: 5, sets: 3, exerciseGroup: "back" },
    { date: "Mar 25", weight: 205, reps: 5, sets: 3, exerciseGroup: "back" },
  ],
  "Pull-ups": [
    { date: "Apr 7", weight: 0, reps: 8, sets: 3, exerciseGroup: "back" },
    { date: "Mar 31", weight: 0, reps: 7, sets: 3, exerciseGroup: "back" },
    { date: "Mar 24", weight: 0, reps: 6, sets: 3, exerciseGroup: "back" },
  ],
};
