
// Hook for runtime regression testing in development
import { useEffect, useState } from 'react';
import { workoutServiceLayer } from '@/services/workoutServiceLayer';
import { workoutLogger } from '@/services/workoutLogger';

interface RegressionTestResult {
  passed: number;
  failed: number;
  duration: number;
  errors: string[];
}

export const useWorkoutRegressionTest = (enableAutoTest = false) => {
  const [testResult, setTestResult] = useState<RegressionTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runBasicFlowTest = async (): Promise<RegressionTestResult> => {
    const startTime = performance.now();
    const errors: string[] = [];
    let passed = 0;
    let failed = 0;

    try {
      workoutLogger.logInfo('Starting workout regression test');

      // Test 1: Service layer health check
      try {
        const health = await workoutServiceLayer.healthCheck();
        if (health.status === 'healthy') {
          passed++;
        } else {
          failed++;
          errors.push(`Health check failed: ${health.status}`);
        }
      } catch (error) {
        failed++;
        errors.push(`Health check exception: ${error}`);
      }

      // Test 2: Configuration test
      try {
        const config = workoutServiceLayer.getConfig();
        if (config.validateBeforeSave !== undefined) {
          passed++;
        } else {
          failed++;
          errors.push('Configuration is invalid');
        }
      } catch (error) {
        failed++;
        errors.push(`Configuration test failed: ${error}`);
      }

      // Test 3: Mock workout data validation
      try {
        const { workoutDataValidator } = await import('@/services/workoutDataValidator');
        const mockData = {
          workout: {
            name: 'Regression Test Workout',
            training_type: 'strength',
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            duration: 3600,
            user_id: 'test-user'
          },
          exerciseSets: [
            {
              exercise_name: 'Test Exercise',
              weight: 100,
              reps: 10,
              set_number: 1,
              completed: true
            }
          ]
        };

        const validation = workoutDataValidator.validateWorkoutContract(mockData);
        if (validation.isValid) {
          passed++;
        } else {
          failed++;
          errors.push(`Validation failed: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        failed++;
        errors.push(`Validation test failed: ${error}`);
      }

      const duration = performance.now() - startTime;
      
      workoutLogger.logInfo('Workout regression test completed', {
        passed,
        failed,
        duration,
        errors
      });

      return { passed, failed, duration, errors };

    } catch (error) {
      const duration = performance.now() - startTime;
      workoutLogger.logError('Regression test failed with exception', error);
      
      return {
        passed: 0,
        failed: 1,
        duration,
        errors: [`Test suite failed: ${error}`]
      };
    }
  };

  const runRegressionTest = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    try {
      const result = await runBasicFlowTest();
      setTestResult(result);
    } finally {
      setIsRunning(false);
    }
  };

  // Auto-run test on mount if enabled (development only)
  useEffect(() => {
    if (enableAutoTest && import.meta.env.DEV) {
      runRegressionTest();
    }
  }, [enableAutoTest]);

  return {
    testResult,
    isRunning,
    runRegressionTest,
    resetTest: () => setTestResult(null)
  };
};
