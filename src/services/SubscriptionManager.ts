
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
}

class SubscriptionManager {
  private static instance: SubscriptionManager;
  private subscriptions = new Map<string, ActiveSubscription>();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isCleaningUp = false;

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  private constructor() {
    this.startHealthCheck();
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
    
    // If subscription already exists, increment ref count
    if (this.subscriptions.has(key)) {
      const existing = this.subscriptions.get(key)!;
      existing.refCount++;
      existing.lastActivity = Date.now();
      console.log(`[SubscriptionManager] Reusing subscription ${key}, refCount: ${existing.refCount}`);
      
      return () => this.unsubscribe(key);
    }

    // Create new subscription with correct Supabase API
    console.log(`[SubscriptionManager] Creating new subscription ${key}`);
    
    const channel = supabase.channel(config.channelName);
    
    // Use the correct API: channel.on with proper event configuration
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
          // Update activity timestamp
          const subscription = this.subscriptions.get(key);
          if (subscription) {
            subscription.lastActivity = Date.now();
          }
        } catch (error) {
          console.error(`[SubscriptionManager] Callback error for ${key}:`, error);
        }
      });
    });

    // Subscribe to the channel with error handling
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
      lastActivity: Date.now()
    });

    return () => this.unsubscribe(key);
  }

  private unsubscribe(key: string): void {
    const subscription = this.subscriptions.get(key);
    if (!subscription) return;

    subscription.refCount--;
    console.log(`[SubscriptionManager] Decrementing refCount for ${key}, now: ${subscription.refCount}`);

    if (subscription.refCount <= 0) {
      console.log(`[SubscriptionManager] Removing subscription ${key}`);
      this.removeSubscription(key, subscription);
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
