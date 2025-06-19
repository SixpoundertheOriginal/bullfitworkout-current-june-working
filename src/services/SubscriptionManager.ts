
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
  connectionAttempts: number;
  lastConnectionAttempt: number;
  isHealthy: boolean;
}

class SubscriptionManager {
  private static instance: SubscriptionManager;
  private subscriptions = new Map<string, ActiveSubscription>();
  private isCleaningUp = false;
  private readonly MAX_CONNECTION_ATTEMPTS = 3; // REDUCED from 5
  private readonly CONNECTION_RETRY_BASE_DELAY = 1000;

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  private constructor() {
    // REMOVED: Health check intervals - too aggressive
  }

  // REMOVED: Complex save operation tracking
  // markSaveOperationActive, markSaveOperationComplete, hasSaveOperationsInProgress

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
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`[SubscriptionManager] Subscription error for ${key}:`, err || status);
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
      connectionAttempts: 0,
      lastConnectionAttempt: Date.now(),
      isHealthy: false
    });

    return () => this.unsubscribe(key);
  }

  private unsubscribe(key: string): void {
    const subscription = this.subscriptions.get(key);
    if (!subscription) return;

    subscription.refCount--;
    console.log(`[SubscriptionManager] Decrementing refCount for ${key}, now: ${subscription.refCount}`);

    // SIMPLIFIED: Immediate cleanup when refCount reaches 0
    if (subscription.refCount <= 0) {
      console.log(`[SubscriptionManager] Removing subscription ${key} immediately`);
      this.removeSubscription(key, subscription);
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

    // SIMPLIFIED: Stop retrying after max attempts
    if (subscription.connectionAttempts >= this.MAX_CONNECTION_ATTEMPTS) {
      console.error(`[SubscriptionManager] Max connection attempts reached for ${key}, removing subscription`);
      this.removeSubscription(key, subscription);
      return;
    }

    // SIMPLIFIED: Basic exponential backoff
    const backoffDelay = Math.min(
      this.CONNECTION_RETRY_BASE_DELAY * Math.pow(2, subscription.connectionAttempts - 1),
      10000 // Max 10 seconds
    );

    console.log(`[SubscriptionManager] Retrying ${key} in ${backoffDelay}ms (attempt ${subscription.connectionAttempts})`);

    // Remove the failed subscription
    this.removeSubscription(key, subscription);
    
    // Attempt to recreate after delay
    setTimeout(() => {
      if (!this.isCleaningUp && !this.subscriptions.has(key)) {
        console.log(`[SubscriptionManager] Attempting to recreate subscription ${key}`);
        this.subscribe(subscription.config);
      }
    }, backoffDelay);
  }

  // REMOVED: Health check intervals and complex monitoring

  cleanup(): void {
    console.log(`[SubscriptionManager] Cleaning up all subscriptions`);
    this.isCleaningUp = true;

    this.subscriptions.forEach(({ channel }, key) => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.error(`[SubscriptionManager] Cleanup error for ${key}:`, error);
      }
    });
    this.subscriptions.clear();
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
