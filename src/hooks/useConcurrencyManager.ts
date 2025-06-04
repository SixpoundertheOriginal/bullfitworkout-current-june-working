
import { useCallback, useEffect, useRef } from 'react';
import { concurrencyManager } from '@/lib/concurrency/ConcurrencyManager';
import { ConcurrencyTask } from '@/types/concurrency';
import { useCleanup } from './useCleanup';

interface UseConcurrencyManagerOptions {
  autoCancel?: boolean; // Automatically cancel tasks on unmount
  defaultPriority?: ConcurrencyTask['priority'];
  componentTag?: string; // Tag to identify tasks from this component
}

export function useConcurrencyManager(options: UseConcurrencyManagerOptions = {}) {
  const {
    autoCancel = true,
    defaultPriority = 'normal',
    componentTag = 'component'
  } = options;

  const taskIds = useRef<Set<string>>(new Set());
  const { registerCleanup } = useCleanup('concurrency-manager');

  const enqueue = useCallback((
    taskConfig: Omit<ConcurrencyTask, 'createdAt' | 'attempts' | 'priority' | 'maxRetries'> & {
      priority?: ConcurrencyTask['priority'];
      maxRetries?: number;
    }
  ): string => {
    const task = {
      ...taskConfig,
      priority: taskConfig.priority || defaultPriority,
      tags: [...(taskConfig.tags || []), componentTag],
      maxRetries: taskConfig.maxRetries
    };

    const taskId = concurrencyManager.enqueue(task);
    
    if (autoCancel) {
      taskIds.current.add(taskId);
    }
    
    return taskId;
  }, [defaultPriority, componentTag, autoCancel]);

  const cancel = useCallback((taskId: string): boolean => {
    const result = concurrencyManager.cancel(taskId);
    taskIds.current.delete(taskId);
    return result;
  }, []);

  const cancelByTag = useCallback((tag: string): number => {
    const result = concurrencyManager.cancelByTag(tag);
    // Remove cancelled task IDs from our tracking
    const stats = concurrencyManager.getStats();
    taskIds.current.forEach(taskId => {
      if (!stats.runningTaskIds.includes(taskId) && !stats.queuedTaskIds.includes(taskId)) {
        taskIds.current.delete(taskId);
      }
    });
    return result;
  }, []);

  const prioritize = useCallback((taskId: string, newPriority: ConcurrencyTask['priority']): boolean => {
    return concurrencyManager.prioritize(taskId, newPriority);
  }, []);

  const getStats = useCallback(() => {
    return concurrencyManager.getStats();
  }, []);

  const isTaskRunning = useCallback((taskId: string): boolean => {
    return concurrencyManager.isTaskRunning(taskId);
  }, []);

  const isTaskQueued = useCallback((taskId: string): boolean => {
    return concurrencyManager.isTaskQueued(taskId);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const cleanup = () => {
      if (autoCancel && taskIds.current.size > 0) {
        console.log(`Cleaning up ${taskIds.current.size} tasks from component`);
        taskIds.current.forEach(taskId => {
          concurrencyManager.cancel(taskId);
        });
        taskIds.current.clear();
      }
    };

    registerCleanup(cleanup);

    return cleanup;
  }, [autoCancel, registerCleanup]);

  return {
    enqueue,
    cancel,
    cancelByTag,
    prioritize,
    getStats,
    isTaskRunning,
    isTaskQueued,
    taskIds: Array.from(taskIds.current)
  };
}
