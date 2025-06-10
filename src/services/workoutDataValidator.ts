
import { WorkoutDataContract, WorkoutValidationRules } from '@/types/workout-contracts';
import { workoutLogger } from './workoutLogger';

export class WorkoutDataValidator {
  private static instance: WorkoutDataValidator;
  
  static getInstance(): WorkoutDataValidator {
    if (!WorkoutDataValidator.instance) {
      WorkoutDataValidator.instance = new WorkoutDataValidator();
    }
    return WorkoutDataValidator.instance;
  }

  validateWorkoutContract(data: Partial<WorkoutDataContract>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Validate workout structure
      if (!data.workout) {
        errors.push('Missing workout data');
        return { isValid: false, errors, warnings };
      }

      const workout = data.workout;
      
      // Required fields validation
      if (!workout.name || workout.name.length < WorkoutValidationRules.workout.name.minLength) {
        errors.push('Workout name is required and must be at least 1 character');
      }
      
      if (workout.name && workout.name.length > WorkoutValidationRules.workout.name.maxLength) {
        errors.push(`Workout name cannot exceed ${WorkoutValidationRules.workout.name.maxLength} characters`);
      }

      if (typeof workout.duration !== 'number' || workout.duration < 0) {
        errors.push('Duration must be a positive number');
      }

      if (workout.duration > WorkoutValidationRules.workout.duration.max) {
        warnings.push('Workout duration exceeds 24 hours - this seems unusually long');
      }

      if (!workout.training_type) {
        errors.push('Training type is required');
      }

      // Validate exercise sets
      if (!data.exerciseSets || !Array.isArray(data.exerciseSets)) {
        errors.push('Exercise sets must be provided as an array');
      } else {
        if (data.exerciseSets.length < WorkoutValidationRules.exerciseSets.minSets) {
          errors.push('At least one exercise set is required');
        }

        // Validate each set
        data.exerciseSets.forEach((set, index) => {
          if (!set.exercise_name) {
            errors.push(`Set ${index + 1}: Exercise name is required`);
          }
          
          if (typeof set.weight !== 'number' || set.weight < 0) {
            errors.push(`Set ${index + 1}: Weight must be a positive number`);
          }
          
          if (typeof set.reps !== 'number' || set.reps < 0) {
            errors.push(`Set ${index + 1}: Reps must be a positive number`);
          }

          if (set.weight > WorkoutValidationRules.exerciseSets.weight.max) {
            warnings.push(`Set ${index + 1}: Weight ${set.weight} seems unusually high`);
          }

          if (set.reps > WorkoutValidationRules.exerciseSets.reps.max) {
            warnings.push(`Set ${index + 1}: Reps ${set.reps} seems unusually high`);
          }
        });

        // Check for too many sets per exercise
        const exerciseSetCounts = data.exerciseSets.reduce((acc, set) => {
          acc[set.exercise_name] = (acc[set.exercise_name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        Object.entries(exerciseSetCounts).forEach(([exercise, count]) => {
          if (count > WorkoutValidationRules.exerciseSets.maxSetsPerExercise) {
            warnings.push(`${exercise}: ${count} sets seems unusually high`);
          }
        });
      }

      const result = {
        isValid: errors.length === 0,
        errors,
        warnings
      };

      // Log validation result
      workoutLogger.logValidation({
        isValid: result.isValid,
        errorCount: errors.length,
        warningCount: warnings.length,
        workout: workout.name || 'Unknown',
        setCount: data.exerciseSets?.length || 0
      });

      return result;
      
    } catch (error) {
      workoutLogger.logError('Validation failed with exception', error, {
        operation: 'validateWorkoutContract'
      });
      
      return {
        isValid: false,
        errors: ['Validation failed due to unexpected error'],
        warnings: []
      };
    }
  }

  sanitizeWorkoutData(data: Partial<WorkoutDataContract>): WorkoutDataContract | null {
    try {
      if (!data.workout || !data.exerciseSets) {
        return null;
      }

      // Sanitize workout data
      const sanitizedWorkout = {
        ...data.workout,
        name: data.workout.name?.trim() || '',
        duration: Math.max(0, Math.min(data.workout.duration || 0, WorkoutValidationRules.workout.duration.max)),
        notes: data.workout.notes?.trim() || null
      };

      // Sanitize exercise sets
      const sanitizedSets = data.exerciseSets
        .filter(set => set.exercise_name && set.exercise_name.trim())
        .map((set, index) => ({
          ...set,
          exercise_name: set.exercise_name.trim(),
          weight: Math.max(0, Math.min(set.weight || 0, WorkoutValidationRules.exerciseSets.weight.max)),
          reps: Math.max(0, Math.min(set.reps || 0, WorkoutValidationRules.exerciseSets.reps.max)),
          set_number: set.set_number || index + 1,
          completed: Boolean(set.completed),
          rest_time: set.rest_time || 60
        }));

      return {
        workout: sanitizedWorkout,
        exerciseSets: sanitizedSets,
        validation: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          source: 'workoutDataValidator'
        }
      };
      
    } catch (error) {
      workoutLogger.logError('Data sanitization failed', error, {
        operation: 'sanitizeWorkoutData'
      });
      return null;
    }
  }
}

export const workoutDataValidator = WorkoutDataValidator.getInstance();
