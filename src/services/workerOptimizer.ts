
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

  // Optimized message sending with batching and prioritization
  sendMessage<T>(type: string, payload: any, priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'): Promise<T> {
    return new Promise((resolve, reject) => {
      const message: WorkerMessage = {
        id: this.generateMessageId(),
        type,
        payload,
        timestamp: performance.now(),
        priority
      };

      // Store promise handlers
      this.pendingMessages.set(message.id, { resolve, reject, timestamp: message.timestamp });

      // Add to queue with priority ordering
      this.addToQueue(message);

      // Process queue with frame-rate awareness
      this.scheduleQueueProcessing();
    });
  }

  private addToQueue(message: WorkerMessage) {
    // Insert message based on priority
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
    // Cancel existing timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // For critical messages, process immediately
    const hasCritical = this.messageQueue.some(msg => msg.priority === 'critical');
    
    if (hasCritical && !this.processingBatch) {
      this.processQueue();
      return;
    }

    // Batch non-critical messages using requestIdleCallback for 60fps maintenance
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        if (!this.processingBatch) {
          this.processQueue();
        }
      }, { timeout: 16 }); // Max 16ms to maintain 60fps
    } else {
      // Fallback with frame-rate consideration - use proper type casting
      this.batchTimeout = window.setTimeout(() => {
        if (!this.processingBatch) {
          this.processQueue();
        }
      }, 8); // Half frame time for safety
    }
  }

  private processQueue() {
    if (!this.worker || this.processingBatch || this.messageQueue.length === 0) {
      return;
    }

    this.processingBatch = true;

    // Process in batches to reduce communication overhead
    const batchSize = this.calculateOptimalBatchSize();
    const batch = this.messageQueue.splice(0, batchSize);

    // Use requestAnimationFrame to ensure smooth frame rate
    requestAnimationFrame(() => {
      try {
        // Send messages in batch
        batch.forEach(message => {
          this.worker!.postMessage({
            id: message.id,
            type: message.type,
            payload: message.payload,
            batchMode: batch.length > 1
          });
          this.performanceMetrics.messagesSent++;
        });

        this.performanceMetrics.queueDepth = this.messageQueue.length;
        
        // Schedule next batch if queue not empty
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
        
        // Reject pending messages
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

  private calculateOptimalBatchSize(): number {
    // Adaptive batch size based on queue depth and performance
    const queueDepth = this.messageQueue.length;
    const avgLatency = this.performanceMetrics.averageLatency;

    // Larger batches for high queue depth, smaller for low latency requirements
    if (queueDepth > 50) return 10;
    if (queueDepth > 20) return 5;
    if (avgLatency > 10) return 2; // Reduce batch size if communication is slow
    return Math.min(queueDepth, 3); // Default small batch for 60fps maintenance
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { id, result, error, type } = event.data;

    this.performanceMetrics.messagesReceived++;

    // Handle batch responses
    if (type === 'batch_response' && Array.isArray(result)) {
      result.forEach((item: any) => this.handleSingleResponse(item));
      return;
    }

    this.handleSingleResponse({ id, result, error });
  }

  private handleSingleResponse({ id, result, error }: any) {
    const pending = this.pendingMessages.get(id);
    if (!pending) return;

    // Calculate latency for performance monitoring
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
    
    // Exponential moving average for responsiveness
    this.performanceMetrics.averageLatency = 
      messagesReceived === 1 ? latency : 
      (averageLatency * 0.9) + (latency * 0.1);

    // Warn if communication is affecting 60fps target
    if (latency > 5) {
      console.warn(`Worker communication slow: ${latency.toFixed(2)}ms`);
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('Worker error:', error);
    
    // Reject all pending messages
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

  // Performance monitoring API
  getPerformanceMetrics(): WorkerPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  // Cleanup for optimal memory usage
  terminate() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // Reject pending messages
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

// Factory function for creating optimized workers
export const createOptimizedWorker = (workerScript: string): WorkerOptimizer => {
  return new WorkerOptimizer(workerScript);
};

// Performance monitoring for worker communication
export const monitorWorkerPerformance = (optimizer: WorkerOptimizer) => {
  setInterval(() => {
    const metrics = optimizer.getPerformanceMetrics();
    
    if (metrics.averageLatency > 5) {
      console.warn('Worker communication affecting 60fps target:', metrics);
    }
    
    if (metrics.queueDepth > 20) {
      console.warn('Worker queue depth high:', metrics.queueDepth);
    }
  }, 5000);
};

export { WorkerOptimizer };
