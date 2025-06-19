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
}

// Global save operation tracker
const activeSaveOperations = new Set<string>();

class SubscriptionManager {
  private static instance: SubscriptionManager;
  private subscriptions = new Map<string, ActiveSubscription>();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isCleaningUp = false;
  private readonly CLEANUP_DELAY_MS = 5000; // 5 second delay for save operations

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
    
    // Mark all subscriptions as having save operation in progress
    this.subscriptions.forEach(sub => {
      sub.saveOperationInProgress = true;
    });
  }

  // Mark save operation as complete
  markSaveOperationComplete(operationId: string): void {
    activeSaveOperations.delete(operationId);
    console.log(`[SubscriptionManager] Save operation completed: ${operationId}`);
    
    // If no more save operations, clear the flag
    if (activeSaveOperations.size === 0) {
      this.subscriptions.forEach(sub => {
        sub.saveOperationInProgress = false;
      });
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
          }
        } catch (error) {
          console.error(`[SubscriptionManager] Callback error for ${key}:`, error);
        }
      });
    });

    channel.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[SubscriptionManager] Successfully subscribed to ${key}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[SubscriptionManager] Subscription error for ${key}:`, err);
        this.handleSubscriptionError(key);
      } else if (status === 'TIMED_OUT') {
        console.warn(`[SubscriptionManager] Subscription timeout for ${key}`);
        this.handleSubscriptionError(key);
      } else if (status === 'CLOSED') {
        console.log(`[SubscriptionManager] Subscription closed for ${key}`);
      }
    });

    this.subscriptions.set(key, {
      channel,
      refCount: 1,
      config,
      lastActivity: Date.now(),
      saveOperationInProgress: false
    });

    return () => this.unsubscribe(key);
  }

  private unsubscribe(key: string): void {
    const subscription = this.subscriptions.get(key);
    if (!subscription) return;

    subscription.refCount--;
    console.log(`[SubscriptionManager] Decrementing refCount for ${key}, now: ${subscription.refCount}`);

    if (subscription.refCount <= 0) {
      // Check if we should delay cleanup due to save operations
      if (this.hasSaveOperationsInProgress() || subscription.saveOperationInProgress) {
        console.log(`[SubscriptionManager] Delaying cleanup for ${key} due to save operations`);
        
        // Schedule delayed cleanup
        setTimeout(() => {
          // Double-check if subscription still exists and no saves are in progress
          const sub = this.subscriptions.get(key);
          if (sub && sub.refCount <= 0 && !this.hasSaveOperationsInProgress()) {
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
      supabase.removeChannel(subscription.channel);
    } catch (error) {
      console.error(`[SubscriptionManager] Error removing channel for ${key}:`, error);
    }
    this.subscriptions.delete(key);
  }

  private handleSubscriptionError(key: string): void {
    console.error(`[SubscriptionManager] Handling error for subscription ${key}`);
    const subscription = this.subscriptions.get(key);
    if (subscription && !this.isCleaningUp) {
      // Remove the failed subscription
      this.removeSubscription(key, subscription);
      
      // Attempt to recreate after a delay with exponential backoff
      const retryDelay = Math.min(2000 * Math.pow(2, subscription.refCount), 10000);
      setTimeout(() => {
        if (!this.isCleaningUp && !this.subscriptions.has(key)) {
          console.log(`[SubscriptionManager] Attempting to recreate subscription ${key}`);
          this.subscribe(subscription.config);
        }
      }, retryDelay);
    }
  }

  private startHealthCheck(): void {
    if (this.healthCheckInterval) return;
    
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Check every 30 seconds
  }

  private performHealthCheck(): void {
    if (this.isCleaningUp) return;

    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes

    for (const [key, subscription] of this.subscriptions.entries()) {
      if (now - subscription.lastActivity > staleThreshold) {
        console.warn(`[SubscriptionManager] Stale subscription detected: ${key}`);
        // Could implement reconnection logic here if needed
      }
    }

    console.log(`[SubscriptionManager] Health check: ${this.subscriptions.size} active subscriptions`);
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

  getSubscriptionHealth(): { [key: string]: { refCount: number; lastActivity: number } } {
    const health: { [key: string]: { refCount: number; lastActivity: number } } = {};
    for (const [key, subscription] of this.subscriptions.entries()) {
      health[key] = {
        refCount: subscription.refCount,
        lastActivity: subscription.lastActivity
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
