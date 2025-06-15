
interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface SyncStrategy {
  immediate: boolean;
  background: boolean;
  periodic: boolean;
}

class OfflineManager {
  private actionQueue: QueuedAction[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private maxQueueSize: number = 50;
  private retryDelay: number = 1000; // Start with 1 second

  constructor() {
    this.setupNetworkListeners();
    this.setupPeriodicSync();
    this.loadQueueFromStorage();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Network: Online');
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.log('📱 Network: Offline');
      this.isOnline = false;
    });

    // Update online status immediately
    this.isOnline = navigator.onLine;
  }

  private setupPeriodicSync() {
    // Try to sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline && this.actionQueue.length > 0 && !this.syncInProgress) {
        this.processQueue();
      }
    }, 30000);
  }

  private loadQueueFromStorage() {
    try {
      const stored = localStorage.getItem('offline_queue');
      if (stored) {
        this.actionQueue = JSON.parse(stored);
        console.log(`📦 Loaded ${this.actionQueue.length} queued actions from storage`);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.actionQueue = [];
    }
  }

  private saveQueueToStorage() {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(this.actionQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  public queueAction(type: string, payload: any, options: Partial<QueuedAction> = {}): string {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedAction: QueuedAction = {
      id: actionId,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      ...options
    };

    // Remove oldest actions if queue is full
    if (this.actionQueue.length >= this.maxQueueSize) {
      this.actionQueue.shift();
    }

    this.actionQueue.push(queuedAction);
    this.saveQueueToStorage();

    console.log(`📝 Queued action: ${type}`, { actionId, queueSize: this.actionQueue.length });

    // Try to process immediately if online
    if (this.isOnline) {
      this.processQueue();
    }

    return actionId;
  }

  public async processQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.actionQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Processing ${this.actionQueue.length} queued actions`);

    const actionsToProcess = [...this.actionQueue];
    const successfulActions: string[] = [];

    for (const action of actionsToProcess) {
      try {
        await this.processAction(action);
        successfulActions.push(action.id);
        console.log(`✅ Processed action: ${action.type}`);
      } catch (error) {
        console.error(`❌ Failed to process action: ${action.type}`, error);
        
        action.retryCount++;
        if (action.retryCount >= action.maxRetries) {
          console.warn(`⚠️ Max retries reached for action: ${action.type}`);
          successfulActions.push(action.id); // Remove from queue
        } else {
          // Exponential backoff for retry
          const delay = this.retryDelay * Math.pow(2, action.retryCount);
          setTimeout(() => {
            if (this.isOnline) {
              this.processQueue();
            }
          }, delay);
        }
      }
    }

    // Remove successful actions from queue
    this.actionQueue = this.actionQueue.filter(action => !successfulActions.includes(action.id));
    this.saveQueueToStorage();

    this.syncInProgress = false;
    console.log(`✅ Queue processing complete. ${this.actionQueue.length} actions remaining`);
  }

  private async processAction(action: QueuedAction): Promise<void> {
    // This would be implemented based on your specific action types
    switch (action.type) {
      case 'SAVE_WORKOUT':
        return this.saveWorkout(action.payload);
      case 'UPDATE_EXERCISE':
        return this.updateExercise(action.payload);
      case 'SAVE_SET':
        return this.saveSet(action.payload);
      case 'UPDATE_PROFILE':
        return this.updateProfile(action.payload);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Example action processors - these would integrate with your actual API
  private async saveWorkout(payload: any): Promise<void> {
    // Implement actual workout saving logic
    console.log('Saving workout:', payload);
    // await workoutService.save(payload);
  }

  private async updateExercise(payload: any): Promise<void> {
    // Implement actual exercise update logic
    console.log('Updating exercise:', payload);
    // await exerciseService.update(payload);
  }

  private async saveSet(payload: any): Promise<void> {
    // Implement actual set saving logic
    console.log('Saving set:', payload);
    // await setService.save(payload);
  }

  private async updateProfile(payload: any): Promise<void> {
    // Implement actual profile update logic
    console.log('Updating profile:', payload);
    // await profileService.update(payload);
  }

  public getQueueStatus() {
    return {
      isOnline: this.isOnline,
      queueSize: this.actionQueue.length,
      syncInProgress: this.syncInProgress,
      oldestAction: this.actionQueue.length > 0 ? this.actionQueue[0].timestamp : null
    };
  }

  public clearQueue(): void {
    this.actionQueue = [];
    this.saveQueueToStorage();
    console.log('🗑️ Offline queue cleared');
  }

  public forceSync(): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    return this.processQueue();
  }
}

export const offlineManager = new OfflineManager();
