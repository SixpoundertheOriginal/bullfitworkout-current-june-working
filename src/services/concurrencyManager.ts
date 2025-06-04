
export interface ConcurrencyTask {
  id: string;
  run: () => Promise<any>;
  priority: "high" | "normal" | "low";
  retryOnFail?: boolean;
  tags?: string[];
  signal?: AbortSignal;
  createdAt: number;
  attempts: number;
  maxRetries: number;
}

interface TaskResult {
  success: boolean;
  result?: any;
  error?: Error;
  duration: number;
}

interface ConcurrencyStats {
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
}

class ConcurrencyManager {
  private readonly maxConcurrentTasks: number = 5;
  private readonly taskQueues = {
    high: [] as ConcurrencyTask[],
    normal: [] as ConcurrencyTask[],
    low: [] as ConcurrencyTask[]
  };
  private runningTasks = new Map<string, { task: ConcurrencyTask; startTime: number; promise: Promise<any> }>();
  private completedTasks = new Map<string, TaskResult>();
  private cancelledTasks = new Set<string>();
  private stats: ConcurrencyStats = {
    running: 0,
    queued: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    byPriority: { high: 0, normal: 0, low: 0 }
  };
  
  private memoryPressureLevel: 'low' | 'medium' | 'high' = 'low';
  private isPaused = false;

  constructor() {
    // Listen for memory pressure changes
    if (typeof window !== 'undefined') {
      window.addEventListener('memory-pressure', (event: any) => {
        this.handleMemoryPressure(event.detail?.level || 'low');
      });
      
      // Handle page visibility changes
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
      maxRetries: task.retryOnFail ? 3 : 0
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
    
    // Try to process queue
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
    // Find and move task to new priority queue
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

  getStats(): ConcurrencyStats & { 
    runningTaskIds: string[];
    queuedTaskIds: string[];
    memoryPressure: string;
  } {
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

    // Get next task by priority (high -> normal -> low)
    const nextTask = this.getNextTask();
    if (!nextTask) {
      return;
    }

    // Remove from queue
    this.removeTaskFromQueue(nextTask);
    this.stats.queued--;
    this.stats.byPriority[nextTask.priority]--;

    // Start running the task
    await this.runTask(nextTask);

    // Continue processing if there's capacity
    if (this.runningTasks.size < this.maxConcurrentTasks) {
      this.processQueue();
    }
  }

  private getNextTask(): ConcurrencyTask | null {
    // Respect memory pressure by limiting task types
    if (this.memoryPressureLevel === 'high') {
      // Only allow high priority tasks during high memory pressure
      return this.taskQueues.high.shift() || null;
    } else if (this.memoryPressureLevel === 'medium') {
      // Allow high and normal priority tasks
      return this.taskQueues.high.shift() || this.taskQueues.normal.shift() || null;
    } else {
      // Normal operation - all priorities
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
      } else if (task.retryOnFail && task.attempts < task.maxRetries) {
        // Retry the task
        task.attempts++;
        console.log(`Task ${task.id} failed, retrying (${task.attempts}/${task.maxRetries})`);
        this.taskQueues[task.priority].unshift(task); // Add to front of queue
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
      
      // Continue processing queue
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
      // Cancel all low priority tasks
      this.cancelByTag('low-priority');
      this.cancelByTag('background-sync');
      this.cancelByTag('prefetch');
      
      // Reduce concurrency limit
      this.setConcurrencyLimit(2);
    } else if (level === 'medium') {
      // Cancel only background tasks
      this.cancelByTag('background-sync');
      this.cancelByTag('prefetch');
      
      // Reduce concurrency limit slightly
      this.setConcurrencyLimit(3);
    } else {
      // Normal operation
      this.setConcurrencyLimit(5);
    }
  }

  private pauseLowPriorityTasks(): void {
    // Cancel low priority tasks when page is hidden
    this.cancelByTag('background-sync');
    this.cancelByTag('prefetch');
  }

  private resumeTasks(): void {
    // Resume normal operation when page becomes visible
    this.processQueue();
  }

  destroy(): void {
    console.log('Destroying ConcurrencyManager');
    
    // Cancel all tasks
    const allTaskIds = [
      ...Array.from(this.runningTasks.keys()),
      ...this.taskQueues.high.map(t => t.id),
      ...this.taskQueues.normal.map(t => t.id),
      ...this.taskQueues.low.map(t => t.id)
    ];
    
    allTaskIds.forEach(id => this.cancel(id));
    
    // Clear all data
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
