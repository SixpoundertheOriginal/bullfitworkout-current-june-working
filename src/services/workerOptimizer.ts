
interface WorkerMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
}

interface WorkerPerformanceMetrics {
  messagesSent: number;
  messagesReceived: number;
  averageLatency: number;
  queueDepth: number;
}

class WorkerOptimizer {
  private worker: Worker | null = null;
  private messageQueue: WorkerMessage[] = [];
  private pendingMessages = new Map<string, { resolve: Function; reject: Function; timestamp: number }>();
  private performanceMetrics: WorkerPerformanceMetrics = {
    messagesSent: 0,
    messagesReceived: 0,
    averageLatency: 0,
    queueDepth: 0
  };
  private batchTimeout: number | null = null;
  private processingBatch = false;

  constructor(workerScript: string) {
    this.initializeWorker(workerScript);
  }

  private initializeWorker(workerScript: string) {
    try {
      this.worker = new Worker(workerScript);
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
    } catch (error) {
      console.error('Failed to initialize worker:', error);
    }
  }

  sendMessage<T>(type: string, payload: any, priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'): Promise<T> {
    return new Promise((resolve, reject) => {
      const message: WorkerMessage = {
        id: this.generateMessageId(),
        type,
        payload,
        timestamp: performance.now(),
        priority
      };

      this.pendingMessages.set(message.id, { resolve, reject, timestamp: message.timestamp });
      this.addToQueue(message);
      this.scheduleQueueProcessing();
    });
  }

  private addToQueue(message: WorkerMessage) {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    const insertIndex = this.messageQueue.findIndex(
      existing => priorityOrder[existing.priority] > priorityOrder[message.priority]
    );

    if (insertIndex === -1) {
      this.messageQueue.push(message);
    } else {
      this.messageQueue.splice(insertIndex, 0, message);
    }

    this.performanceMetrics.queueDepth = this.messageQueue.length;
  }

  private scheduleQueueProcessing() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    const hasCritical = this.messageQueue.some(msg => msg.priority === 'critical');
    
    if (hasCritical && !this.processingBatch) {
      this.processQueue();
      return;
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        if (!this.processingBatch) {
          this.processQueue();
        }
      }, { timeout: 16 });
    } else {
      this.batchTimeout = setTimeout(() => {
        if (!this.processingBatch) {
          this.processQueue();
        }
      }, 8) as unknown as number;
    }
  }

  private processQueue() {
    if (!this.worker || this.processingBatch || this.messageQueue.length === 0) {
      return;
    }

    this.processingBatch = true;
    const batchSize = Math.min(this.messageQueue.length, 5);
    const batch = this.messageQueue.splice(0, batchSize);

    requestAnimationFrame(() => {
      try {
        batch.forEach(message => {
          this.worker!.postMessage({
            id: message.id,
            type: message.type,
            payload: message.payload
          });
          this.performanceMetrics.messagesSent++;
        });

        this.performanceMetrics.queueDepth = this.messageQueue.length;
        
        if (this.messageQueue.length > 0) {
          requestAnimationFrame(() => {
            this.processingBatch = false;
            this.scheduleQueueProcessing();
          });
        } else {
          this.processingBatch = false;
        }
      } catch (error) {
        console.error('Worker message processing failed:', error);
        this.processingBatch = false;
        
        batch.forEach(message => {
          const pending = this.pendingMessages.get(message.id);
          if (pending) {
            pending.reject(error);
            this.pendingMessages.delete(message.id);
          }
        });
      }
    });
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { id, result, error } = event.data;
    this.performanceMetrics.messagesReceived++;

    const pending = this.pendingMessages.get(id);
    if (!pending) return;

    const latency = performance.now() - pending.timestamp;
    this.updateLatencyMetrics(latency);

    if (error) {
      pending.reject(new Error(error));
    } else {
      pending.resolve(result);
    }

    this.pendingMessages.delete(id);
  }

  private updateLatencyMetrics(latency: number) {
    const { averageLatency, messagesReceived } = this.performanceMetrics;
    
    this.performanceMetrics.averageLatency = 
      messagesReceived === 1 ? latency : 
      (averageLatency * 0.9) + (latency * 0.1);
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('Worker error:', error);
    
    this.pendingMessages.forEach(({ reject }) => {
      reject(new Error('Worker error occurred'));
    });
    this.pendingMessages.clear();
    this.messageQueue.length = 0;
    this.performanceMetrics.queueDepth = 0;
  }

  private generateMessageId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getPerformanceMetrics(): WorkerPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  terminate() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.pendingMessages.forEach(({ reject }) => {
      reject(new Error('Worker terminated'));
    });
    this.pendingMessages.clear();

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.messageQueue.length = 0;
  }
}

export const createOptimizedWorker = (workerScript: string): WorkerOptimizer => {
  return new WorkerOptimizer(workerScript);
};

export { WorkerOptimizer };
