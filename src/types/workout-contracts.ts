
// Data contract validation for workout data flow
export interface WorkoutDataContract {
  // Core workout structure
  workout: {
    id?: string;
    name: string;
    training_type: string;
    start_time: string;
    end_time: string;
    duration: number;
    notes?: string;
    user_id: string;
    metadata?: any;
  };
  
  // Exercise sets structure
  exerciseSets: Array<{
    exercise_name: string;
    weight: number;
    reps: number;
    set_number: number;
    completed: boolean;
    rest_time?: number;
  }>;
  
  // Validation metadata
  validation: {
    timestamp: string;
    version: string;
    source: string;
  };
}

export interface WorkoutSaveResult {
  success: boolean;
  workoutId?: string;
  error?: {
    type: 'validation' | 'network' | 'database' | 'unknown';
    message: string;
    details?: any;
  };
  metrics: {
    saveTime: number;
    dataSize: number;
    retryCount: number;
  };
}

// Validation rules
export const WorkoutValidationRules = {
  workout: {
    name: { required: true, minLength: 1, maxLength: 100 },
    duration: { required: true, min: 0, max: 86400 }, // max 24 hours
    training_type: { required: true, allowedValues: ['strength', 'cardio', 'flexibility', 'sports'] }
  },
  exerciseSets: {
    minSets: 1,
    maxSetsPerExercise: 50,
    weight: { min: 0, max: 10000 },
    reps: { min: 0, max: 1000 }
  }
} as const;
