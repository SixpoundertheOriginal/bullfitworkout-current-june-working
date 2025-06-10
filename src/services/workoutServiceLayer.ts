
// Service layer abstraction for workout operations
import { workoutDataValidator } from './workoutDataValidator';
import { workoutLogger } from './workoutLogger';
import { WorkoutDataContract, WorkoutSaveResult } from '@/types/workout-contracts';
import { saveWorkout as originalSaveWorkout } from './workoutSaveService';
import { EnhancedExerciseSet } from '@/types/workout';

interface WorkoutServiceConfig {
  validateBeforeSave: boolean;
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  enableLogging: boolean;
}

class WorkoutServiceLayer {
  private config: WorkoutServiceConfig = {
    validateBeforeSave: true,
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    enableLogging: true
  };

  async saveWorkout(
    userData: { id: string; [key: string]: any },
    workoutData: any,
    exercises: Record<string, EnhancedExerciseSet[]>
  ): Promise<WorkoutSaveResult> {
    const startTime = performance.now();
    workoutLogger.startPerformanceMark('workout_save_complete');
    
    try {
      workoutLogger.logSaveOperation('start', {
        workoutName: workoutData.name,
        exerciseCount: Object.keys(exercises).length,
        totalSets: Object.values(exercises).reduce((sum, sets) => sum + sets.length, 0)
      }, { userId: userData.id });

      // Convert to data contract format
      const contractData = this.convertToContract(workoutData, exercises, userData.id);
      
      if (!contractData) {
        const error = new Error('Failed to convert workout data to contract format');
        workoutLogger.logError('Data conversion failed', error, { userId: userData.id });
        return {
          success: false,
          error: {
            type: 'validation',
            message: 'Invalid workout data format',
            details: error
          },
          metrics: {
            saveTime: performance.now() - startTime,
            dataSize: 0,
            retryCount: 0
          }
        };
      }

      // Validate data if enabled
      if (this.config.validateBeforeSave) {
        const validation = workoutDataValidator.validateWorkoutContract(contractData);
        
        if (!validation.isValid) {
          workoutLogger.logError('Workout validation failed', validation.errors, { userId: userData.id });
          return {
            success: false,
            error: {
              type: 'validation',
              message: `Validation failed: ${validation.errors.join(', ')}`,
              details: validation
            },
            metrics: {
              saveTime: performance.now() - startTime,
              dataSize: JSON.stringify(contractData).length,
              retryCount: 0
            }
          };
        }

        if (validation.warnings.length > 0) {
          workoutLogger.logWarn('Workout validation warnings', validation.warnings, { userId: userData.id });
        }
      }

      // Attempt save with retry logic
      let lastError: any;
      let retryCount = 0;

      while (retryCount <= this.config.maxRetries) {
        try {
          workoutLogger.logDataFlow(`Save attempt ${retryCount + 1}`, { 
            workoutName: workoutData.name 
          }, { userId: userData.id });

          const result = await originalSaveWorkout({
            userData,
            workoutData,
            exercises,
            onProgressUpdate: (progress) => {
              workoutLogger.logDataFlow(`Save progress: ${progress.step}`, progress, { userId: userData.id });
            }
          });

          if (result.success) {
            const saveTime = workoutLogger.endPerformanceMark('workout_save_complete', 'save');
            
            workoutLogger.logSaveOperation('success', {
              workoutId: result.workoutId,
              partialSave: result.partialSave,
              saveTime
            }, { 
              userId: userData.id, 
              workoutId: result.workoutId 
            });

            return {
              success: true,
              workoutId: result.workoutId,
              metrics: {
                saveTime: performance.now() - startTime,
                dataSize: JSON.stringify(contractData).length,
                retryCount
              }
            };
          } else {
            lastError = result.error;
            break; // Don't retry if the service explicitly failed
          }

        } catch (error) {
          lastError = error;
          retryCount++;

          if (retryCount <= this.config.maxRetries && this.config.enableRetry) {
            workoutLogger.logWarn(`Save attempt ${retryCount} failed, retrying in ${this.config.retryDelay}ms`, error, { userId: userData.id });
            await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
          }
        }
      }

      // All retry attempts failed
      workoutLogger.logSaveOperation('failure', {
        error: lastError,
        retryCount,
        finalAttempt: true
      }, { userId: userData.id });

      return {
        success: false,
        error: {
          type: lastError?.type || 'unknown',
          message: lastError?.message || 'Save failed after all retry attempts',
          details: lastError
        },
        metrics: {
          saveTime: performance.now() - startTime,
          dataSize: JSON.stringify(contractData).length,
          retryCount
        }
      };

    } catch (error) {
      const saveTime = workoutLogger.endPerformanceMark('workout_save_complete', 'save');
      workoutLogger.logError('Unexpected error in workout service layer', error, { userId: userData.id });

      return {
        success: false,
        error: {
          type: 'unknown',
          message: 'Unexpected error occurred',
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

  private convertToContract(
    workoutData: any, 
    exercises: Record<string, EnhancedExerciseSet[]>, 
    userId: string
  ): WorkoutDataContract | null {
    try {
      // Convert exercises to contract format
      const exerciseSets = Object.entries(exercises).flatMap(([exerciseName, sets]) => 
        sets.map((set, index) => ({
          exercise_name: exerciseName,
          weight: set.weight || 0,
          reps: set.reps || 0,
          set_number: index + 1,
          completed: set.completed || false,
          rest_time: set.restTime || 60
        }))
      );

      return {
        workout: {
          ...workoutData,
          user_id: userId
        },
        exerciseSets,
        validation: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          source: 'workoutServiceLayer'
        }
      };
    } catch (error) {
      workoutLogger.logError('Failed to convert workout data to contract', error);
      return null;
    }
  }

  // Configuration methods
  updateConfig(newConfig: Partial<WorkoutServiceConfig>) {
    this.config = { ...this.config, ...newConfig };
    workoutLogger.logInfo('Workout service configuration updated', newConfig);
  }

  getConfig(): WorkoutServiceConfig {
    return { ...this.config };
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: any }> {
    try {
      workoutLogger.startPerformanceMark('health_check');
      
      // Test validation
      const testValidation = workoutDataValidator.validateWorkoutContract({
        workout: {
          name: 'Test Workout',
          training_type: 'strength',
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          duration: 60,
          user_id: 'test'
        },
        exerciseSets: [{
          exercise_name: 'Test Exercise',
          weight: 100,
          reps: 10,
          set_number: 1,
          completed: true
        }]
      });

      const checkTime = workoutLogger.endPerformanceMark('health_check', 'healthCheck');

      return {
        status: testValidation.isValid ? 'healthy' : 'degraded',
        details: {
          validationWorking: testValidation.isValid,
          responseTime: checkTime,
          configValid: this.config.validateBeforeSave !== undefined
        }
      };
    } catch (error) {
      workoutLogger.logError('Health check failed', error);
      return {
        status: 'unhealthy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}

export const workoutServiceLayer = new WorkoutServiceLayer();
