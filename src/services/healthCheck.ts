
import { supabaseConfig } from '@/config/environment';
import { useState, useEffect } from 'react';

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  reason?: string;
  timestamp: string;
  database?: string;
}

/**
 * Ping the Supabase health check endpoint
 * Useful for monitoring database connectivity
 */
export const pingSupabase = async (): Promise<HealthCheckResponse> => {
  try {
    const response = await fetch(`${supabaseConfig.url}/functions/v1/ping-supabase`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        status: 'error',
        reason: errorData.reason || `HTTP ${response.status}: ${response.statusText}`,
        timestamp: new Date().toISOString()
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      status: 'error',
      reason: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Simple health check that returns a boolean
 * Useful for quick connectivity checks
 */
export const isSupabaseHealthy = async (): Promise<boolean> => {
  try {
    const result = await pingSupabase();
    return result.status === 'ok';
  } catch {
    return false;
  }
};

/**
 * Hook for React components to monitor Supabase health
 */
export const useSupabaseHealth = (intervalMs: number = 300000) => { // Default 5 minutes
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      if (isChecking) return;
      
      setIsChecking(true);
      try {
        const status = await pingSupabase();
        setHealthStatus(status);
      } catch (error) {
        setHealthStatus({
          status: 'error',
          reason: 'Health check failed',
          timestamp: new Date().toISOString()
        });
      } finally {
        setIsChecking(false);
      }
    };

    // Initial check
    checkHealth();

    // Set up interval for periodic checks
    const interval = setInterval(checkHealth, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, isChecking]);

  return { 
    healthStatus, 
    isChecking, 
    checkHealth: async () => {
      if (!isChecking) {
        setIsChecking(true);
        const status = await pingSupabase();
        setHealthStatus(status);
        setIsChecking(false);
      }
    }
  };
};
