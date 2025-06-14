
import { supabase } from '@/integrations/supabase/client';

export interface RLSTestCase {
  name: string;
  description: string;
  test: () => Promise<boolean>;
  expectedResult: boolean;
}

/**
 * Creates test cases for RLS validation
 */
export const createRLSTestCases = (): RLSTestCase[] => [
  {
    name: 'workout_sessions_own_data_access',
    description: 'User can access their own workout sessions',
    test: async () => {
      try {
        const { data, error } = await supabase
          .from('workout_sessions')
          .select('id, user_id')
          .limit(1);
        
        return !error && Array.isArray(data);
      } catch {
        return false;
      }
    },
    expectedResult: true
  },
  {
    name: 'workout_sessions_insert_with_auth',
    description: 'User can insert workout session with proper user_id',
    test: async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return false;

        const { data, error } = await supabase
          .from('workout_sessions')
          .insert({
            name: 'RLS Test Workout',
            user_id: user.user.id,
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            duration: 30,
            training_type: 'test'
          })
          .select()
          .single();

        // Clean up test data
        if (data?.id) {
          await supabase.from('workout_sessions').delete().eq('id', data.id);
        }

        return !error && !!data;
      } catch {
        return false;
      }
    },
    expectedResult: true
  },
  {
    name: 'workout_sessions_cannot_insert_wrong_user_id',
    description: 'User cannot insert workout session with different user_id',
    test: async () => {
      try {
        const { error } = await supabase
          .from('workout_sessions')
          .insert({
            name: 'Malicious Test Workout',
            user_id: 'fake-user-id-12345',
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            duration: 30,
            training_type: 'test'
          });

        // Should fail due to RLS
        return !!error;
      } catch {
        return true; // Exception means RLS blocked it
      }
    },
    expectedResult: true
  },
  {
    name: 'exercise_sets_user_scoping',
    description: 'Exercise sets are properly scoped to user workouts',
    test: async () => {
      try {
        const { data, error } = await supabase
          .from('exercise_sets')
          .select(`
            id,
            workout_id,
            workout_sessions!inner(user_id)
          `)
          .limit(10);

        if (error) return false;

        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return false;

        // All exercise sets should belong to workouts owned by current user
        return Array.isArray(data) && data.every(set => 
          set.workout_sessions?.user_id === user.user.id
        );
      } catch {
        return false;
      }
    },
    expectedResult: true
  }
];

/**
 * Runs all RLS test cases and returns results
 */
export const runRLSTests = async (): Promise<{
  passed: number;
  failed: number;
  total: number;
  results: Array<{
    test: RLSTestCase;
    passed: boolean;
    actualResult: boolean;
    error?: string;
  }>;
}> => {
  const testCases = createRLSTestCases();
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    try {
      console.log(`Running RLS test: ${testCase.name}`);
      const actualResult = await testCase.test();
      const testPassed = actualResult === testCase.expectedResult;
      
      if (testPassed) {
        passed++;
      } else {
        failed++;
      }

      results.push({
        test: testCase,
        passed: testPassed,
        actualResult
      });
    } catch (error) {
      failed++;
      results.push({
        test: testCase,
        passed: false,
        actualResult: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return {
    passed,
    failed,
    total: testCases.length,
    results
  };
};

/**
 * Simulates unauthorized access attempts for security testing
 */
export const simulateUnauthorizedAccess = async (): Promise<{
  attemptBlocked: boolean;
  details: string;
}> => {
  try {
    // Attempt to access workout_sessions without authentication
    const { error } = await supabase
      .from('workout_sessions')
      .select('*')
      .limit(1);

    if (error) {
      return {
        attemptBlocked: true,
        details: `Access properly blocked: ${error.message}`
      };
    }

    return {
      attemptBlocked: false,
      details: 'Unauthorized access was not blocked - security issue detected'
    };
  } catch (error) {
    return {
      attemptBlocked: true,
      details: `Access blocked with exception: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
