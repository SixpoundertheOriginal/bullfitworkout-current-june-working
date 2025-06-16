
import { useEffect, useRef, useCallback } from 'react';

interface CleanupTask {
  id: string;
  cleanup: () => void;
  priority: 'high' | 'medium' | 'low';
}

class CleanupManager {
  private static instance: CleanupManager;
  private scopes = new Map<string, CleanupTask[]>();
  private globalCleanups: CleanupTask[] = [];

  static getInstance(): CleanupManager {
    if (!CleanupManager.instance) {
      CleanupManager.instance = new CleanupManager();
    }
    return CleanupManager.instance;
  }

  createScope(scopeId: string): string {
    if (!this.scopes.has(scopeId)) {
      this.scopes.set(scopeId, []);
    }
    return scopeId;
  }

  registerCleanup(scopeId: string, cleanup: () => void, priority: 'high' | 'medium' | 'low' = 'medium'): string {
    const taskId = `${scopeId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const task: CleanupTask = { id: taskId, cleanup, priority };

    if (scopeId === 'global') {
      this.globalCleanups.push(task);
    } else {
      const scopeTasks = this.scopes.get(scopeId) || [];
      scopeTasks.push(task);
      this.scopes.set(scopeId, scopeTasks);
    }

    return taskId;
  }

  cleanupScope(scopeId: string): void {
    const tasks = this.scopes.get(scopeId) || [];
    this.executeTasks(tasks);
    this.scopes.delete(scopeId);
  }

  globalCleanup(): void {
    // Cleanup all scopes first
    for (const [scopeId] of this.scopes) {
      this.cleanupScope(scopeId);
    }

    // Then run global cleanups
    this.executeTasks(this.globalCleanups);
    this.globalCleanups = [];
  }

  private executeTasks(tasks: CleanupTask[]): void {
    // Sort by priority: high -> medium -> low
    const sortedTasks = tasks.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });

    for (const task of sortedTasks) {
      try {
        task.cleanup();
      } catch (error) {
        console.error(`[CleanupManager] Cleanup error for task ${task.id}:`, error);
      }
    }
  }
}

export const cleanupManager = CleanupManager.getInstance();

export function useCleanup(componentId?: string) {
  const scopeId = useRef<string>();
  const cleanupFunctions = useRef<(() => void)[]>([]);

  useEffect(() => {
    // Create cleanup scope
    const id = componentId || `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    scopeId.current = cleanupManager.createScope(id);

    return () => {
      // Cleanup on unmount
      if (scopeId.current) {
        cleanupManager.cleanupScope(scopeId.current);
      }
      
      // Run local cleanups as fallback
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn('[useCleanup] Local cleanup failed:', error);
        }
      });
      cleanupFunctions.current = [];
    };
  }, [componentId]);

  const registerCleanup = useCallback((cleanup: () => void, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (scopeId.current) {
      cleanupManager.registerCleanup(scopeId.current, cleanup, priority);
    }
    // Also store locally as backup
    cleanupFunctions.current.push(cleanup);
  }, []);

  return { registerCleanup };
}
