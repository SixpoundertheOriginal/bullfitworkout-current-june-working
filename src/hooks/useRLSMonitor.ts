
import { useState, useEffect } from 'react';
import { auditAllRLS, validateWorkoutSessionsRLS, RLSAuditResult } from '@/services/rlsAuditService';
import { runRLSTests } from '@/services/rlsTestingService';

export interface RLSMonitorState {
  auditResults: RLSAuditResult[];
  workoutSessionsValidation: {
    isSecure: boolean;
    issues: string[];
    recommendations: string[];
  } | null;
  testResults: {
    passed: number;
    failed: number;
    total: number;
    results: any[];
  } | null;
  isLoading: boolean;
  lastChecked: Date | null;
}

/**
 * Hook for monitoring RLS security in development/testing
 */
export const useRLSMonitor = (autoRun: boolean = false) => {
  const [state, setState] = useState<RLSMonitorState>({
    auditResults: [],
    workoutSessionsValidation: null,
    testResults: null,
    isLoading: false,
    lastChecked: null
  });

  const runFullAudit = async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Run comprehensive RLS audit
      const auditResults = await auditAllRLS();
      
      // Validate workout_sessions specifically
      const workoutSessionsValidation = await validateWorkoutSessionsRLS();
      
      // Run security tests
      const testResults = await runRLSTests();

      setState({
        auditResults,
        workoutSessionsValidation,
        testResults,
        isLoading: false,
        lastChecked: new Date()
      });

      // Log results for debugging
      console.group('🔒 RLS Security Audit Results');
      console.log('Audit Results:', auditResults);
      console.log('Workout Sessions Validation:', workoutSessionsValidation);
      console.log('Test Results:', testResults);
      console.groupEnd();

      return {
        auditResults,
        workoutSessionsValidation,
        testResults
      };
    } catch (error) {
      console.error('RLS audit failed:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        lastChecked: new Date()
      }));
      throw error;
    }
  };

  // Auto-run audit on mount if enabled
  useEffect(() => {
    if (autoRun) {
      runFullAudit();
    }
  }, [autoRun]);

  return {
    ...state,
    runFullAudit
  };
};
