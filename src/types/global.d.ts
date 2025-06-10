
declare global {
  interface Window {
    onDeleteExercise?: (exerciseName: string) => void;
  }
}

export {};
