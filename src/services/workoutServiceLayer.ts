
import { workoutDataValidator } from './workoutDataValidator';
import { workoutLogger } from './workoutLogger';
import { saveWorkout } from './workoutSaveService';
import { EnhancedExerciseSet } from '@/types/workout';

interface ServiceLayerResult {
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

class WorkoutServiceLayer {
  private static instance: WorkoutServiceLayer;
  
  static getInstance(): WorkoutServiceLayer {
    if (!WorkoutServiceLayer.instance) {
      WorkoutServiceLayer.instance = new WorkoutServiceLayer();
    }
    return WorkoutServiceLayer.instance;
  }

  async saveWorkout(
    userData: { id: string },
    workoutData: any,
    exercises: Record<string, EnhancedExerciseSet[]>
  ): Promise<ServiceLayerResult> {
    const startTime = performance.now();
    
    try {
      // Create data contract for validation
      const contractData = {
        workout: {
          ...workoutData,
          user_id: userData.id
        },
        exerciseSets: Object.entries(exercises).flatMap(([exerciseName, sets]) => 
          sets.map((set, index) => ({
            exercise_name: exerciseName,
            weight: set.weight,
            reps: set.reps,
            set_number: index + 1,
            completed: set.completed,
            rest_time: set.restTime
          }))
        ),
        validation: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          source: 'workoutServiceLayer'
        }
      };

      // Validate data before save
      const validation = workoutDataValidator.validateWorkoutContract(contractData);
      
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            type: 'validation',
            message: 'Workout data validation failed: ' + validation.errors.join(', '),
            details: validation.errors
          },
          metrics: {
            saveTime: performance.now() - startTime,
            dataSize: JSON.stringify(contractData).length,
            retryCount: 0
          }
        };
      }

      // Proceed with save using the enhanced exercises
      const result = await saveWorkout({
        userData,
        workoutData,
        exercises
      });

      const metrics = {
        saveTime: performance.now() - startTime,
        dataSize: JSON.stringify(contractData).length,
        retryCount: 0
      };

      if (result.success) {
        workoutLogger.logInfo('Workout saved successfully via service layer', {
          workoutId: result.workoutId,
          metrics
        });

        return {
          success: true,
          workoutId: result.workoutId,
          metrics
        };
      } else {
        return {
          success: false,
          error: result.error,
          metrics
        };
      }

    } catch (error) {
      workoutLogger.logError('Service layer save failed', error, {
        userId: userData.id
      });

      return {
        success: false,
        error: {
          type: 'unknown',
          message: 'Service layer error: ' + (error instanceof Error ? error.message : 'Unknown error'),
          details: error
        },
        metrics: {
          saveTime: performance.now() - startTime,
          dataSize: 0,
          retryCount: 0
        }
      };
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      responseTime: number;
      timestamp: string;
    };
  }> {
    const startTime = performance.now();
    
    try {
      // Basic health checks
      const responseTime = performance.now() - startTime;
      
      return {
        status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
        details: {
          responseTime,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          responseTime: performance.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  getConfig() {
    return {
      validateBeforeSave: true,
      enableRetries: true,
      maxRetries: 3,
      enableLogging: true
    };
  }
}

export const workoutServiceLayer = WorkoutServiceLayer.getInstance();
