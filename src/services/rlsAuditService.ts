
import { supabase } from '@/integrations/supabase/client';

export interface RLSAuditResult {
  table: string;
  hasRLS: boolean;
  policies: Array<{
    name: string;
    command: string;
    definition: string;
    check: string;
  }>;
  testResults: {
    canAccessOwnData: boolean;
    cannotAccessOthersData: boolean;
    error?: string;
  };
}

/**
 * Audits RLS policies for a specific table
 */
export const auditTableRLS = async (tableName: string): Promise<RLSAuditResult> => {
  try {
    // Check if RLS is enabled on the table
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('check_rls_enabled', { table_name: tableName })
      .single();

    if (tableError) {
      console.error(`Error checking RLS for ${tableName}:`, tableError);
    }

    // Get RLS policies for the table
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: tableName });

    if (policiesError) {
      console.error(`Error fetching policies for ${tableName}:`, policiesError);
    }

    // Test actual data access
    const testResults = await testDataAccess(tableName);

    return {
      table: tableName,
      hasRLS: tableInfo?.rls_enabled || false,
      policies: policies || [],
      testResults
    };
  } catch (error) {
    console.error(`RLS audit failed for ${tableName}:`, error);
    return {
      table: tableName,
      hasRLS: false,
      policies: [],
      testResults: {
        canAccessOwnData: false,
        cannotAccessOthersData: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
};

/**
 * Tests actual data access to verify RLS is working
 */
const testDataAccess = async (tableName: string) => {
  try {
    // Test 1: Can access own data
    const { data: ownData, error: ownError } = await supabase
      .from(tableName)
      .select('id, user_id')
      .limit(1);

    const canAccessOwnData = !ownError && Array.isArray(ownData);

    // Test 2: Try to access all data (should be filtered by RLS)
    const { data: allData, error: allError } = await supabase
      .from(tableName)
      .select('id, user_id');

    // If RLS is working properly, we should only see our own data
    const cannotAccessOthersData = !allError && Array.isArray(allData) && 
      allData.every(row => row.user_id === (await supabase.auth.getUser()).data.user?.id);

    return {
      canAccessOwnData,
      cannotAccessOthersData,
      error: ownError?.message || allError?.message
    };
  } catch (error) {
    return {
      canAccessOwnData: false,
      cannotAccessOthersData: false,
      error: error instanceof Error ? error.message : 'Test failed'
    };
  }
};

/**
 * Comprehensive RLS audit for all critical tables
 */
export const auditAllRLS = async (): Promise<RLSAuditResult[]> => {
  const criticalTables = [
    'workout_sessions',
    'exercise_sets',
    'users'
  ];

  const results = await Promise.all(
    criticalTables.map(table => auditTableRLS(table))
  );

  return results;
};

/**
 * Validates that workout_sessions has proper user_id scoping
 */
export const validateWorkoutSessionsRLS = async (): Promise<{
  isSecure: boolean;
  issues: string[];
  recommendations: string[];
}> => {
  const audit = await auditTableRLS('workout_sessions');
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check if RLS is enabled
  if (!audit.hasRLS) {
    issues.push('RLS is not enabled on workout_sessions table');
    recommendations.push('Enable RLS: ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;');
  }

  // Check for user_id = auth.uid() policy
  const hasUserIdPolicy = audit.policies.some(policy => 
    policy.definition.includes('user_id') && 
    policy.definition.includes('auth.uid()')
  );

  if (!hasUserIdPolicy) {
    issues.push('No user_id = auth.uid() policy found');
    recommendations.push('Add policy: CREATE POLICY "Users can only access their own workouts" ON workout_sessions FOR ALL USING (user_id = auth.uid());');
  }

  // Check test results
  if (!audit.testResults.canAccessOwnData) {
    issues.push('Cannot access own data - RLS may be too restrictive');
  }

  if (!audit.testResults.cannotAccessOthersData) {
    issues.push('Can access other users data - RLS is not working properly');
  }

  return {
    isSecure: issues.length === 0,
    issues,
    recommendations
  };
};
