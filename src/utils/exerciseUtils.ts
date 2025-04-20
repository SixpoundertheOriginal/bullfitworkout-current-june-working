
export const isIsometricExercise = (exerciseName: string): boolean => {
  // Add your isometric exercise checks here
  return exerciseName.toLowerCase().includes('hold') || 
         exerciseName.toLowerCase().includes('plank') ||
         exerciseName.toLowerCase().includes('static');
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatIsometricSet = (
  duration: number,
  weight: number,
  weightUnit: string
): string => {
  return `${formatDuration(duration)} hold${weight > 0 ? ` @ ${weight}${weightUnit}` : ''}`;
};
