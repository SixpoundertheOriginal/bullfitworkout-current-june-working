import { ConcurrencyTask, ConcurrencyStats, ConcurrencyManagerInterface } from '@/types/concurrency';

interface TaskResult {
  success: boolean;
  result?: any;
  error?: Error;
  duration: number;
}

export interface ConcurrencyManagerConfig {
  maxConcurrentTasks?: number;
  enableMemoryPressureHandling?: boolean;
  enableVisibilityHandling?: boolean;
}

export class ConcurrencyManager implements ConcurrencyManagerInterface {
  private readonly maxConcurrentTasks: number;
  private readonly taskQueues = {
    high: [] as ConcurrencyTask[],
    normal: [] as ConcurrencyTask[],
    low: [] as ConcurrencyTask[]
  };
  private runningTasks = new Map<string, { task: ConcurrencyTask; startTime: number; promise: Promise<any> }>();
  private completedTasks = new Map<string, TaskResult>();
  private cancelledTasks = new Set<string>();
  private stats: Omit<ConcurrencyStats, 'runningTaskIds' | 'queuedTaskIds' | 'memoryPressure'> = {
    running: 0,
    queued: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    byPriority: { high: 0, normal: 0, low: 0 }
  };
  
  private memoryPressureLevel: 'low' | 'medium' | 'high' = 'low';
  private isPaused = false;
  private config: Required<ConcurrencyManagerConfig>;

  constructor(config: ConcurrencyManagerConfig = {}) {
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks ?? 5,
      enableMemoryPressureHandling: config.enableMemoryPressureHandling ?? true,
      enableVisibilityHandling: config.enableVisibilityHandling ?? true
    };
    
    this.maxConcurrentTasks = this.config.maxConcurrentTasks;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    if (this.config.enableMemoryPressureHandling) {
      window.addEventListener('memory-pressure', (event: any) => {
        this.handleMemoryPressure(event.detail?.level || 'low');
      });
    }
    
    if (this.config.enableVisibilityHandling) {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseLowPriorityTasks();
        } else {
          this.resumeTasks();
        }
      });
    }
  }

  enqueue(task: Omit<ConcurrencyTask, 'createdAt' | 'attempts'>): string {
    const fullTask: ConcurrencyTask = {
      ...task,
      createdAt: Date.now(),
      attempts: 0,
      maxRetries: task.maxRetries ?? (task.retryOnFail ? 3 : 0)
    };

    // Check if task with same ID already exists
    if (this.isTaskRunning(task.id) || this.isTaskQueued(task.id)) {
      console.warn(`Task ${task.id} already exists, skipping`);
      return task.id;
    }

    this.taskQueues[task.priority].push(fullTask);
    this.stats.queued++;
    this.stats.byPriority[task.priority]++;

    console.log(`Task ${task.id} queued with priority ${task.priority}`);
    
    this.processQueue();
    return task.id;
  }

  cancel(taskId: string): boolean {
    // Check if task is running
    const runningTask = this.runningTasks.get(taskId);
    if (runningTask) {
      this.cancelledTasks.add(taskId);
      this.runningTasks.delete(taskId);
      this.stats.running--;
      this.stats.cancelled++;
      console.log(`Cancelled running task ${taskId}`);
      return true;
    }

    // Check if task is queued
    for (const priority of ['high', 'normal', 'low'] as const) {
      const queue = this.taskQueues[priority];
      const index = queue.findIndex(t => t.id === taskId);
      if (index !== -1) {
        queue.splice(index, 1);
        this.stats.queued--;
        this.stats.byPriority[priority]--;
        this.cancelledTasks.add(taskId);
        this.stats.cancelled++;
        console.log(`Cancelled queued task ${taskId}`);
        return true;
      }
    }

    return false;
  }

  cancelByTag(tag: string): number {
    let cancelledCount = 0;

    // Cancel running tasks with the tag
    for (const [taskId, { task }] of this.runningTasks) {
      if (task.tags?.includes(tag)) {
        if (this.cancel(taskId)) {
          cancelledCount++;
        }
      }
    }

    // Cancel queued tasks with the tag
    for (const priority of ['high', 'normal', 'low'] as const) {
      const queue = this.taskQueues[priority];
      for (let i = queue.length - 1; i >= 0; i--) {
        if (queue[i].tags?.includes(tag)) {
          if (this.cancel(queue[i].id)) {
            cancelledCount++;
          }
        }
      }
    }

    console.log(`Cancelled ${cancelledCount} tasks with tag: ${tag}`);
    return cancelledCount;
  }

  prioritize(taskId: string, newPriority: ConcurrencyTask['priority']): boolean {
    for (const priority of ['high', 'normal', 'low'] as const) {
      const queue = this.taskQueues[priority];
      const index = queue.findIndex(t => t.id === taskId);
      if (index !== -1) {
        const task = queue.splice(index, 1)[0];
        task.priority = newPriority;
        this.taskQueues[newPriority].push(task);
        
        this.stats.byPriority[priority]--;
        this.stats.byPriority[newPriority]++;
        
        console.log(`Task ${taskId} priority changed to ${newPriority}`);
        this.processQueue();
        return true;
      }
    }
    return false;
  }

  setConcurrencyLimit(limit: number): void {
    console.log(`Concurrency limit updated from ${this.maxConcurrentTasks} to ${limit}`);
    (this as any).maxConcurrentTasks = limit;
    this.processQueue();
  }

  pause(): void {
    this.isPaused = true;
    console.log('ConcurrencyManager paused');
  }

  resume(): void {
    this.isPaused = false;
    console.log('ConcurrencyManager resumed');
    this.processQueue();
  }

  getStats(): ConcurrencyStats {
    return {
      ...this.stats,
      runningTaskIds: Array.from(this.runningTasks.keys()),
      queuedTaskIds: [
        ...this.taskQueues.high.map(t => t.id),
        ...this.taskQueues.normal.map(t => t.id),
        ...this.taskQueues.low.map(t => t.id)
      ],
      memoryPressure: this.memoryPressureLevel
    };
  }

  isTaskRunning(taskId: string): boolean {
    return this.runningTasks.has(taskId);
  }

  isTaskQueued(taskId: string): boolean {
    return ['high', 'normal', 'low'].some(priority =>
      this.taskQueues[priority as keyof typeof this.taskQueues].some(t => t.id === taskId)
    );
  }

  private async processQueue(): Promise<void> {
    if (this.isPaused || this.runningTasks.size >= this.maxConcurrentTasks) {
      return;
    }

    const nextTask = this.getNextTask();
    if (!nextTask) {
      return;
    }

    this.removeTaskFromQueue(nextTask);
    this.stats.queued--;
    this.stats.byPriority[nextTask.priority]--;

    await this.runTask(nextTask);

    if (this.runningTasks.size < this.maxConcurrentTasks) {
      this.processQueue();
    }
  }

  private getNextTask(): ConcurrencyTask | null {
    if (this.memoryPressureLevel === 'high') {
      return this.taskQueues.high.shift() || null;
    } else if (this.memoryPressureLevel === 'medium') {
      return this.taskQueues.high.shift() || this.taskQueues.normal.shift() || null;
    } else {
      return this.taskQueues.high.shift() || this.taskQueues.normal.shift() || this.taskQueues.low.shift() || null;
    }
  }

  private removeTaskFromQueue(task: ConcurrencyTask): void {
    const queue = this.taskQueues[task.priority];
    const index = queue.findIndex(t => t.id === task.id);
    if (index !== -1) {
      queue.splice(index, 1);
    }
  }

  private async runTask(task: ConcurrencyTask): Promise<void> {
    const startTime = Date.now();
    
    this.runningTasks.set(task.id, {
      task,
      startTime,
      promise: this.executeTask(task)
    });
    
    this.stats.running++;

    try {
      const result = await this.executeTask(task);
      const duration = Date.now() - startTime;
      
      this.completedTasks.set(task.id, {
        success: true,
        result,
        duration
      });
      
      this.stats.completed++;
      console.log(`Task ${task.id} completed successfully in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (this.cancelledTasks.has(task.id)) {
        console.log(`Task ${task.id} was cancelled`);
      } else if (task.retryOnFail && task.attempts < (task.maxRetries || 0)) {
        task.attempts++;
        console.log(`Task ${task.id} failed, retrying (${task.attempts}/${task.maxRetries})`);
        this.taskQueues[task.priority].unshift(task);
        this.stats.queued++;
        this.stats.byPriority[task.priority]++;
      } else {
        this.completedTasks.set(task.id, {
          success: false,
          error: error as Error,
          duration
        });
        
        this.stats.failed++;
        console.error(`Task ${task.id} failed after ${task.attempts} attempts:`, error);
      }
    } finally {
      this.runningTasks.delete(task.id);
      this.stats.running--;
      this.cancelledTasks.delete(task.id);
      
      this.processQueue();
    }
  }

  private async executeTask(task: ConcurrencyTask): Promise<any> {
    if (task.signal?.aborted || this.cancelledTasks.has(task.id)) {
      throw new Error('Task was cancelled');
    }
    
    return await task.run();
  }

  private handleMemoryPressure(level: 'low' | 'medium' | 'high'): void {
    this.memoryPressureLevel = level;
    
    if (level === 'high') {
      this.cancelByTag('low-priority');
      this.cancelByTag('background-sync');
      this.cancelByTag('prefetch');
      this.setConcurrencyLimit(2);
    } else if (level === 'medium') {
      this.cancelByTag('background-sync');
      this.cancelByTag('prefetch');
      this.setConcurrencyLimit(3);
    } else {
      this.setConcurrencyLimit(this.config.maxConcurrentTasks);
    }
  }

  private pauseLowPriorityTasks(): void {
    this.cancelByTag('background-sync');
    this.cancelByTag('prefetch');
  }

  private resumeTasks(): void {
    this.processQueue();
  }

  destroy(): void {
    console.log('Destroying ConcurrencyManager');
    
    const allTaskIds = [
      ...Array.from(this.runningTasks.keys()),
      ...this.taskQueues.high.map(t => t.id),
      ...this.taskQueues.normal.map(t => t.id),
      ...this.taskQueues.low.map(t => t.id)
    ];
    
    allTaskIds.forEach(id => this.cancel(id));
    
    this.runningTasks.clear();
    this.completedTasks.clear();
    this.cancelledTasks.clear();
    Object.values(this.taskQueues).forEach(queue => queue.length = 0);
  }
}

// Global singleton instance
export const concurrencyManager = new ConcurrencyManager();

// Register global cleanup
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    concurrencyManager.destroy();
  });
}
