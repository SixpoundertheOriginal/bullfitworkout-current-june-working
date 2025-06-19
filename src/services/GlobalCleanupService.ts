
import { subscriptionManager } from './SubscriptionManager';
import { cleanupManager } from '@/hooks/useCleanup';

class GlobalCleanupService {
  private static instance: GlobalCleanupService;
  private isInitialized = false;

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

    // Set up ONLY essential cleanup listeners (remove aggressive monitoring)
    this.setupEssentialListeners();
    this.isInitialized = true;
    console.log('[GlobalCleanupService] Essential cleanup service initialized');
  }

  private setupEssentialListeners(): void {
    // Only cleanup on page visibility change (mobile backgrounding) - ESSENTIAL
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('[GlobalCleanupService] Page hidden - performing essential cleanup');
        this.performCleanup();
      }
    });

    // Only cleanup on page unload - ESSENTIAL
    window.addEventListener('beforeunload', () => {
      this.performCleanup();
    });

    // REMOVED: Aggressive memory monitoring intervals
    // REMOVED: Navigation cleanup (causes race conditions)
    // REMOVED: Memory pressure monitoring (too aggressive)
  }

  addCleanupTask(task: () => void, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    cleanupManager.registerCleanup('global', task, priority);
  }

  performCleanup(): void {
    console.log('[GlobalCleanupService] Performing essential cleanup only');
    
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
