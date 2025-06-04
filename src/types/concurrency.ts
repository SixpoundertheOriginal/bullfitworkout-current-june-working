
export interface ConcurrencyTask {
  id: string;
  run: () => Promise<any>;
  priority: "high" | "normal" | "low";
  retryOnFail?: boolean;
  tags?: string[];
  signal?: AbortSignal;
  createdAt: number;
  attempts: number;
  maxRetries?: number;
}

export interface ConcurrencyStats {
  running: number;
  queued: number;
  completed: number;
  failed: number;
  cancelled: number;
  byPriority: {
    high: number;
    normal: number;
    low: number;
  };
  runningTaskIds: string[];
  queuedTaskIds: string[];
  memoryPressure: string;
}

export interface ConcurrencyManagerInterface {
  enqueue: (task: Omit<ConcurrencyTask, 'createdAt' | 'attempts'>) => string;
  cancel: (taskId: string) => boolean;
  cancelByTag: (tag: string) => number;
  prioritize: (taskId: string, newPriority: ConcurrencyTask['priority']) => boolean;
  getStats: () => ConcurrencyStats;
  isTaskRunning: (taskId: string) => boolean;
  isTaskQueued: (taskId: string) => boolean;
}
