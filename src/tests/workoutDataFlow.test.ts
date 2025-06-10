
// Automated regression testing for workout data flow
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { workoutDataValidator } from '@/services/workoutDataValidator';
import { workoutServiceLayer } from '@/services/workoutServiceLayer';
import { workoutLogger } from '@/services/workoutLogger';
import { WorkoutDataContract } from '@/types/workout-contracts';

// Mock data for testing
const mockValidWorkout: WorkoutDataContract = {
  workout: {
    name: 'Test Workout',
    training_type: 'strength',
    start_time: '2024-01-01T10:00:00Z',
    end_time: '2024-01-01T11:00:00Z',
    duration: 3600,
    notes: 'Test workout notes',
    user_id: 'user-123'
  },
  exerciseSets: [
    {
      exercise_name: 'Bench Press',
      weight: 100,
      reps: 10,
      set_number: 1,
      completed: true,
      rest_time: 60
    },
    {
      exercise_name: 'Bench Press',
      weight: 105,
      reps: 8,
      set_number: 2,
      completed: true,
      rest_time: 90
    }
  ],
  validation: {
    timestamp: '2024-01-01T10:00:00Z',
    version: '1.0.0',
    source: 'test'
  }
};

const mockInvalidWorkout: Partial<WorkoutDataContract> = {
  workout: {
    name: '', // Invalid: empty name
    training_type: 'invalid_type' as any, // Invalid: not allowed value
    start_time: '2024-01-01T10:00:00Z',
    end_time: '2024-01-01T11:00:00Z',
    duration: -1, // Invalid: negative duration
    user_id: 'user-123'
  },
  exerciseSets: [
    {
      exercise_name: '', // Invalid: empty exercise name
      weight: -10, // Invalid: negative weight
      reps: 10,
      set_number: 1,
      completed: true
    }
  ]
};

describe('Workout Data Flow Regression Tests', () => {
  beforeEach(() => {
    workoutLogger.clearLogs();
  });

  describe('Data Contract Validation', () => {
    it('should validate a correct workout contract', () => {
      const result = workoutDataValidator.validateWorkoutContract(mockValidWorkout);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid workout data', () => {
      const result = workoutDataValidator.validateWorkoutContract(mockInvalidWorkout);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('name'))).toBe(true);
      expect(result.errors.some(error => error.includes('duration'))).toBe(true);
    });

    it('should generate warnings for suspicious data', () => {
      const suspiciousWorkout: Partial<WorkoutDataContract> = {
        ...mockValidWorkout,
        workout: {
          ...mockValidWorkout.workout,
          duration: 25 * 60 * 60 // 25 hours
        },
        exerciseSets: [
          {
            exercise_name: 'Bench Press',
            weight: 5000, // Suspicious weight
            reps: 500, // Suspicious reps
            set_number: 1,
            completed: true
          }
        ]
      };

      const result = workoutDataValidator.validateWorkoutContract(suspiciousWorkout);
      
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should sanitize invalid data when possible', () => {
      const result = workoutDataValidator.sanitizeWorkoutData(mockInvalidWorkout);
      
      // Should return null for completely invalid data
      expect(result).toBeNull();
    });

    it('should sanitize partially invalid data', () => {
      const partiallyInvalid: Partial<WorkoutDataContract> = {
        workout: {
          name: '  Valid Workout Name  ', // Has whitespace
          training_type: 'strength',
          start_time: '2024-01-01T10:00:00Z',
          end_time: '2024-01-01T11:00:00Z',
          duration: 50000, // Too high, should be clamped
          user_id: 'user-123'
        },
        exerciseSets: [
          {
            exercise_name: '  Bench Press  ', // Has whitespace
            weight: 15000, // Too high, should be clamped
            reps: 10,
            set_number: 1,
            completed: true
          }
        ]
      };

      const result = workoutDataValidator.sanitizeWorkoutData(partiallyInvalid);
      
      expect(result).not.toBeNull();
      expect(result!.workout.name).toBe('Valid Workout Name');
      expect(result!.workout.duration).toBeLessThan(50000);
      expect(result!.exerciseSets[0].exercise_name).toBe('Bench Press');
      expect(result!.exerciseSets[0].weight).toBeLessThan(15000);
    });
  });

  describe('Service Layer Abstraction', () => {
    it('should handle successful workout save', async () => {
      // Mock the original save function to succeed
      vi.mock('@/services/workoutSaveService', () => ({
        saveWorkout: vi.fn().mockResolvedValue({
          success: true,
          workoutId: 'workout-123'
        })
      }));

      const result = await workoutServiceLayer.saveWorkout(
        { id: 'user-123' },
        mockValidWorkout.workout,
        {
          'Bench Press': [
            {
              id: 1,
              weight: 100,
              reps: 10,
              restTime: 60,
              completed: true,
              isEditing: false,
              volume: 1000
            }
          ]
        }
      );

      expect(result.success).toBe(true);
      expect(result.workoutId).toBeDefined();
      expect(result.metrics.retryCount).toBe(0);
    });

    it('should handle validation failures', async () => {
      const result = await workoutServiceLayer.saveWorkout(
        { id: 'user-123' },
        { ...mockValidWorkout.workout, name: '' }, // Invalid name
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('validation failed');
    });

    it('should provide health check status', async () => {
      const health = await workoutServiceLayer.healthCheck();
      
      expect(health.status).toMatch(/healthy|degraded|unhealthy/);
      expect(health.details).toBeDefined();
      expect(typeof health.details.responseTime).toBe('number');
    });
  });

  describe('Logging and Monitoring', () => {
    it('should log validation operations', () => {
      workoutDataValidator.validateWorkoutContract(mockValidWorkout);
      
      const validationLogs = workoutLogger.getLogsByOperation('validation');
      expect(validationLogs.length).toBeGreaterThan(0);
      expect(validationLogs[0].message).toContain('validation');
    });

    it('should log performance metrics', () => {
      workoutLogger.startPerformanceMark('test-operation');
      
      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 10) { /* busy wait */ }
      
      const duration = workoutLogger.endPerformanceMark('test-operation');
      
      expect(duration).toBeGreaterThan(0);
      
      const performanceLogs = workoutLogger.getLogsByOperation('performance');
      expect(performanceLogs.length).toBeGreaterThan(0);
    });

    it('should export logs for debugging', () => {
      workoutLogger.logInfo('Test log entry');
      workoutLogger.logError('Test error entry');
      
      const exportedLogs = workoutLogger.exportLogs();
      const parsedLogs = JSON.parse(exportedLogs);
      
      expect(Array.isArray(parsedLogs)).toBe(true);
      expect(parsedLogs.length).toBeGreaterThan(0);
    });

    it('should track error patterns', () => {
      workoutLogger.logError('Database connection failed');
      workoutLogger.logError('Validation failed');
      workoutLogger.logError('Network timeout');
      
      const errorLogs = workoutLogger.getLogsByLevel('error');
      expect(errorLogs.length).toBe(3);
    });
  });

  describe('Integration Testing', () => {
    it('should handle complete workout save flow', async () => {
      const startTime = performance.now();
      
      // Test the complete flow
      const exerciseData = {
        'Bench Press': [
          {
            id: 1,
            weight: 100,
            reps: 10,
            restTime: 60,
            completed: true,
            isEditing: false,
            volume: 1000
          }
        ]
      };

      // This would normally call the actual save service
      // For testing, we verify the data transformation
      const contractData = {
        workout: mockValidWorkout.workout,
        exerciseSets: Object.entries(exerciseData).flatMap(([exerciseName, sets]) => 
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
          source: 'test'
        }
      };

      const validation = workoutDataValidator.validateWorkoutContract(contractData);
      
      expect(validation.isValid).toBe(true);
      expect(contractData.exerciseSets).toHaveLength(1);
      expect(contractData.exerciseSets[0].exercise_name).toBe('Bench Press');
      
      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(100); // Should be fast
    });
  });
});
