
import { subscriptionManager } from './SubscriptionManager';
import { cleanupManager } from '@/hooks/useCleanup';

class GlobalCleanupService {
  private static instance: GlobalCleanupService;
  private isInitialized = false;
  private cleanupTimeout: NodeJS.Timeout | null = null;
  private readonly CLEANUP_DELAY = 5000; // 5 seconds
  private isCleanupDisabled = false;

  static getInstance(): GlobalCleanupService {
    if (!GlobalCleanupService.instance) {
      GlobalCleanupService.instance = new GlobalCleanupService();
    }
    return GlobalCleanupService.instance;
  }

  private constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Register subscription manager cleanup with high priority
    cleanupManager.registerCleanup('global', () => {
      subscriptionManager.cleanup();
    }, 'high');

    // Set up debounced cleanup listeners
    this.setupDebouncedListeners();
    this.isInitialized = true;
    console.log('[GlobalCleanupService] Debounced cleanup service initialized');
  }

  private setupDebouncedListeners(): void {
    // Debounced page visibility change - only cleanup after sustained backgrounding
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Still cleanup on page unload - this should be immediate
    window.addEventListener('beforeunload', () => {
      this.performCleanup();
    });
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page is hidden - start cleanup timer
      console.log('[GlobalCleanupService] Page hidden - starting cleanup timer (5s delay)');
      this.cleanupTimeout = setTimeout(() => {
        // Double-check page is still hidden and it's safe to cleanup
        if (document.hidden && this.isSafeToCleanup()) {
          console.log('[GlobalCleanupService] Page remained hidden - performing cleanup');
          this.performCleanup();
        } else {
          console.log('[GlobalCleanupService] Cleanup cancelled - page visible or operations in progress');
        }
      }, this.CLEANUP_DELAY);
    } else {
      // Page is visible again - cancel cleanup
      if (this.cleanupTimeout) {
        console.log('[GlobalCleanupService] Page visible again - cancelling cleanup timer');
        clearTimeout(this.cleanupTimeout);
        this.cleanupTimeout = null;
      }
    }
  }

  private isSafeToCleanup(): boolean {
    // Don't cleanup if explicitly disabled
    if (this.isCleanupDisabled) {
      return false;
    }

    // Check if React Query has pending mutations
    try {
      // Access the global query client if available
      const queryClient = (window as any).__REACT_QUERY_CLIENT__;
      if (queryClient && queryClient.isMutating && queryClient.isMutating() > 0) {
        console.log('[GlobalCleanupService] React Query mutations in progress - deferring cleanup');
        return false;
      }
    } catch (error) {
      // If we can't check React Query state, err on the side of caution
      console.warn('[GlobalCleanupService] Could not check React Query state:', error);
    }

    // Check if page has focus (additional safety check)
    if (document.hasFocus && document.hasFocus()) {
      console.log('[GlobalCleanupService] Page still has focus - deferring cleanup');
      return false;
    }

    return true;
  }

  // Method to temporarily disable cleanup during critical operations
  disableCleanupTemporarily(duration: number = 10000): void {
    this.isCleanupDisabled = true;
    console.log(`[GlobalCleanupService] Cleanup disabled for ${duration}ms`);
    
    setTimeout(() => {
      this.isCleanupDisabled = false;
      console.log('[GlobalCleanupService] Cleanup re-enabled');
    }, duration);
  }

  addCleanupTask(task: () => void, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    cleanupManager.registerCleanup('global', task, priority);
  }

  performCleanup(): void {
    // Cancel any pending cleanup timer
    if (this.cleanupTimeout) {
      clearTimeout(this.cleanupTimeout);
      this.cleanupTimeout = null;
    }

    console.log('[GlobalCleanupService] Performing cleanup');
    
    try {
      cleanupManager.globalCleanup();
    } catch (error) {
      console.error('[GlobalCleanupService] Error during cleanup:', error);
    }
  }

  getHealth(): { subscriptions: any; cleanup: { scopes: number } } {
    return {
      subscriptions: subscriptionManager.getSubscriptionHealth(),
      cleanup: {
        scopes: Object.keys(cleanupManager).length || 0
      }
    };
  }
}

export const globalCleanupService = GlobalCleanupService.getInstance();
