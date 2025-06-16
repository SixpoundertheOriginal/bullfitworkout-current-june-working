
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface SubscriptionConfig {
  channelName: string;
  table: string;
  events: ('INSERT' | 'UPDATE' | 'DELETE')[];
  callback: (payload: any) => void;
}

interface ActiveSubscription {
  channel: RealtimeChannel;
  refCount: number;
  config: SubscriptionConfig;
}

class SubscriptionManager {
  private static instance: SubscriptionManager;
  private subscriptions = new Map<string, ActiveSubscription>();
  private abortController = new AbortController();

  static getInstance(): SubscriptionManager {
    if (!SubscriptionManager.instance) {
      SubscriptionManager.instance = new SubscriptionManager();
    }
    return SubscriptionManager.instance;
  }

  private generateSubscriptionKey(config: SubscriptionConfig): string {
    return `${config.channelName}-${config.table}-${config.events.join(',')}`;
  }

  subscribe(config: SubscriptionConfig): () => void {
    const key = this.generateSubscriptionKey(config);
    
    // If subscription already exists, increment ref count
    if (this.subscriptions.has(key)) {
      const existing = this.subscriptions.get(key)!;
      existing.refCount++;
      console.log(`[SubscriptionManager] Reusing subscription ${key}, refCount: ${existing.refCount}`);
      
      return () => this.unsubscribe(key);
    }

    // Create new subscription
    console.log(`[SubscriptionManager] Creating new subscription ${key}`);
    
    const channel = supabase.channel(config.channelName);
    
    // Add event listeners for each event type
    config.events.forEach(event => {
      channel.on('postgres_changes', {
        event,
        schema: 'public',
        table: config.table
      }, config.callback);
    });

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[SubscriptionManager] Successfully subscribed to ${key}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[SubscriptionManager] Subscription error for ${key}`);
        this.handleSubscriptionError(key);
      }
    });

    this.subscriptions.set(key, {
      channel,
      refCount: 1,
      config
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
      supabase.removeChannel(subscription.channel);
      this.subscriptions.delete(key);
    }
  }

  private handleSubscriptionError(key: string): void {
    console.error(`[SubscriptionManager] Handling error for subscription ${key}`);
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      // Remove the failed subscription
      supabase.removeChannel(subscription.channel);
      this.subscriptions.delete(key);
      
      // Attempt to recreate after a delay
      setTimeout(() => {
        console.log(`[SubscriptionManager] Attempting to recreate subscription ${key}`);
        this.subscribe(subscription.config);
      }, 2000);
    }
  }

  cleanup(): void {
    console.log(`[SubscriptionManager] Cleaning up all subscriptions`);
    this.subscriptions.forEach(({ channel }, key) => {
      supabase.removeChannel(channel);
    });
    this.subscriptions.clear();
    this.abortController.abort();
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }
}

export const subscriptionManager = SubscriptionManager.getInstance();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    subscriptionManager.cleanup();
  });
}
