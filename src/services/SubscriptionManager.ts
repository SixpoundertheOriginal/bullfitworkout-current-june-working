import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionConfig {
  channelName: string;
  table: string;
  events: ('INSERT' | 'UPDATE' | 'DELETE')[];
  callback: (payload: any) => void;
  filter?: string;
}

interface ActiveSubscription {
  channel: RealtimeChannel;
  refCount: number;
  config: SubscriptionConfig;
  lastActivity: number;
  saveOperationInProgress?: boolean;
  connectionAttempts: number;
  lastConnectionAttempt: number;
  isHealthy: boolean;
}

// Global save operation tracker
const activeSaveOperations = new Set<string>();

class SubscriptionManager {
  private static instance: SubscriptionManager;
  private subscriptions = new Map<string, ActiveSubscription>();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isCleaningUp = false;
  private readonly CLEANUP_DELAY_MS = 8000;
  private readonly MAX_CONNECTION_ATTEMPTS = 5;
  private readonly CONNECTION_RETRY_BASE_DELAY = 1000;

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  private constructor() {
    this.startHealthCheck();
  }

  // Mark save operation as active
  markSaveOperationActive(operationId: string): void {
    activeSaveOperations.add(operationId);
    console.log(`[SubscriptionManager] Save operation marked active: ${operationId}`);
    console.log(`[SubscriptionManager] Active save operations: ${activeSaveOperations.size}`);
    
    // Mark all subscriptions as having save operation in progress
    this.subscriptions.forEach(sub => {
      sub.saveOperationInProgress = true;
    });
  }

  // Mark save operation as complete
  markSaveOperationComplete(operationId: string): void {
    const wasActive = activeSaveOperations.has(operationId);
    activeSaveOperations.delete(operationId);
    console.log(`[SubscriptionManager] Save operation completed: ${operationId}, was active: ${wasActive}`);
    console.log(`[SubscriptionManager] Remaining active operations: ${activeSaveOperations.size}`);
    
    // If no more save operations, clear the flag after a small delay
    if (activeSaveOperations.size === 0) {
      setTimeout(() => {
        if (activeSaveOperations.size === 0) {
          this.subscriptions.forEach(sub => {
            sub.saveOperationInProgress = false;
          });
          console.log('[SubscriptionManager] All save operations complete, subscriptions ready for normal cleanup');
        }
      }, 1000);
    }
  }

  // Check if any save operations are active
  private hasSaveOperationsInProgress(): boolean {
    return activeSaveOperations.size > 0;
  }

  private generateSubscriptionKey(config: SubscriptionConfig): string {
    const filter = config.filter ? `-${config.filter}` : '';
    return `${config.channelName}-${config.table}-${config.events.join(',')}${filter}`;
  }

  subscribe(config: SubscriptionConfig): () => void {
    if (this.isCleaningUp) {
      console.warn('[SubscriptionManager] Cannot subscribe during cleanup');
      return () => {};
    }

    const key = this.generateSubscriptionKey(config);
    
    if (this.subscriptions.has(key)) {
      const existing = this.subscriptions.get(key)!;
      existing.refCount++;
      existing.lastActivity = Date.now();
      console.log(`[SubscriptionManager] Reusing subscription ${key}, refCount: ${existing.refCount}`);
      
      return () => this.unsubscribe(key);
    }

    // Check connection attempts for circuit breaker pattern
    const now = Date.now();
    
    console.log(`[SubscriptionManager] Creating new subscription ${key}`);
    
    const channel = supabase.channel(config.channelName);
    
    config.events.forEach(event => {
      const eventConfig: any = {
        event,
        schema: 'public',
        table: config.table
      };
      
      if (config.filter) {
        eventConfig.filter = config.filter;
      }

      channel.on('postgres_changes', eventConfig, (payload) => {
        console.log(`[SubscriptionManager] Received ${event} for ${config.table}:`, payload);
        try {
          config.callback(payload);
          const subscription = this.subscriptions.get(key);
          if (subscription) {
            subscription.lastActivity = Date.now();
            subscription.isHealthy = true;
          }
        } catch (error) {
          console.error(`[SubscriptionManager] Callback error for ${key}:`, error);
        }
      });
    });

    channel.subscribe((status, err) => {
      const subscription = this.subscriptions.get(key);
      
      if (status === 'SUBSCRIBED') {
        console.log(`[SubscriptionManager] Successfully subscribed to ${key}`);
        if (subscription) {
          subscription.connectionAttempts = 0;
          subscription.isHealthy = true;
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[SubscriptionManager] Subscription error for ${key}:`, err);
        if (subscription) {
          subscription.isHealthy = false;
        }
        this.handleSubscriptionError(key);
      } else if (status === 'TIMED_OUT') {
        console.warn(`[SubscriptionManager] Subscription timeout for ${key}`);
        if (subscription) {
          subscription.isHealthy = false;
        }
        this.handleSubscriptionError(key);
      } else if (status === 'CLOSED') {
        console.log(`[SubscriptionManager] Subscription closed for ${key}`);
        if (subscription) {
          subscription.isHealthy = false;
        }
      }
    });

    this.subscriptions.set(key, {
      channel,
      refCount: 1,
      config,
      lastActivity: Date.now(),
      saveOperationInProgress: false,
      connectionAttempts: 0,
      lastConnectionAttempt: now,
      isHealthy: false
    });

    return () => this.unsubscribe(key);
  }

  private unsubscribe(key: string): void {
    const subscription = this.subscriptions.get(key);
    if (!subscription) return;

    subscription.refCount--;
    console.log(`[SubscriptionManager] Decrementing refCount for ${key}, now: ${subscription.refCount}`);

    if (subscription.refCount <= 0) {
      const hasSaveOps = this.hasSaveOperationsInProgress();
      const subHasSaveOp = subscription.saveOperationInProgress;
      
      if (hasSaveOps || subHasSaveOp) {
        console.log(`[SubscriptionManager] Delaying cleanup for ${key} due to save operations`);
        
        setTimeout(() => {
          const sub = this.subscriptions.get(key);
          if (sub && sub.refCount <= 0 && !this.hasSaveOperationsInProgress() && !sub.saveOperationInProgress) {
            console.log(`[SubscriptionManager] Executing delayed cleanup for ${key}`);
            this.removeSubscription(key, sub);
          }
        }, this.CLEANUP_DELAY_MS);
      } else {
        console.log(`[SubscriptionManager] Removing subscription ${key} immediately`);
        this.removeSubscription(key, subscription);
      }
    }
  }

  private removeSubscription(key: string, subscription: ActiveSubscription): void {
    try {
      console.log(`[SubscriptionManager] Removing channel for ${key}`);
      supabase.removeChannel(subscription.channel);
    } catch (error) {
      console.error(`[SubscriptionManager] Error removing channel for ${key}:`, error);
    }
    this.subscriptions.delete(key);
    console.log(`[SubscriptionManager] Subscription ${key} removed from manager`);
  }

  private handleSubscriptionError(key: string): void {
    console.error(`[SubscriptionManager] Handling error for subscription ${key}`);
    const subscription = this.subscriptions.get(key);
    if (!subscription || this.isCleaningUp) return;

    subscription.connectionAttempts++;
    const now = Date.now();

    // Circuit breaker: stop retrying after max attempts
    if (subscription.connectionAttempts >= this.MAX_CONNECTION_ATTEMPTS) {
      console.error(`[SubscriptionManager] Max connection attempts reached for ${key}, stopping retries`);
      return;
    }

    // Exponential backoff with jitter
    const backoffDelay = Math.min(
      this.CONNECTION_RETRY_BASE_DELAY * Math.pow(2, subscription.connectionAttempts - 1),
      30000 // Max 30 seconds
    );
    const jitter = Math.random() * 1000;
    const totalDelay = backoffDelay + jitter;

    console.log(`[SubscriptionManager] Retrying ${key} in ${totalDelay}ms (attempt ${subscription.connectionAttempts})`);

    // Remove the failed subscription
    this.removeSubscription(key, subscription);
    
    // Attempt to recreate after delay
    setTimeout(() => {
      if (!this.isCleaningUp && !this.subscriptions.has(key)) {
        console.log(`[SubscriptionManager] Attempting to recreate subscription ${key}`);
        this.subscribe(subscription.config);
      }
    }, totalDelay);
  }

  private startHealthCheck(): void {
    if (this.healthCheckInterval) return;
    
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Check every minute
  }

  private performHealthCheck(): void {
    if (this.isCleaningUp) return;

    const now = Date.now();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes

    for (const [key, subscription] of this.subscriptions.entries()) {
      const timeSinceActivity = now - subscription.lastActivity;
      
      if (timeSinceActivity > staleThreshold && !subscription.isHealthy) {
        console.warn(`[SubscriptionManager] Unhealthy stale subscription detected: ${key}`);
        // Could implement health recovery here
      }
    }

    console.log(`[SubscriptionManager] Health check: ${this.subscriptions.size} active subscriptions, ${activeSaveOperations.size} save operations`);
  }

  cleanup(): void {
    console.log(`[SubscriptionManager] Cleaning up all subscriptions`);
    this.isCleaningUp = true;

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.subscriptions.forEach(({ channel }, key) => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.error(`[SubscriptionManager] Cleanup error for ${key}:`, error);
      }
    });
    this.subscriptions.clear();
    activeSaveOperations.clear();
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  getSubscriptionHealth(): { [key: string]: { refCount: number; lastActivity: number; isHealthy: boolean; connectionAttempts: number } } {
    const health: { [key: string]: { refCount: number; lastActivity: number; isHealthy: boolean; connectionAttempts: number } } = {};
    for (const [key, subscription] of this.subscriptions.entries()) {
      health[key] = {
        refCount: subscription.refCount,
        lastActivity: subscription.lastActivity,
        isHealthy: subscription.isHealthy,
        connectionAttempts: subscription.connectionAttempts
      };
    }
    return health;
  }
}

export const subscriptionManager = SubscriptionManager.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    subscriptionManager.cleanup();
  });
}
