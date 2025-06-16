
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

    // Set up global cleanup listeners
    this.setupEventListeners();
    this.isInitialized = true;
    console.log('[GlobalCleanupService] Enterprise cleanup service initialized');
  }

  private setupEventListeners(): void {
    // Cleanup on page visibility change (mobile backgrounding)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.performCleanup();
      }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.performCleanup();
    });

    // Cleanup on navigation (SPA routing)
    window.addEventListener('popstate', () => {
      this.performCleanup();
    });

    // Memory pressure cleanup
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = (performance as any).memory;
        if (memInfo && memInfo.usedJSHeapSize > memInfo.totalJSHeapSize * 0.8) {
          console.warn('[GlobalCleanupService] High memory usage detected, performing cleanup');
          this.performCleanup();
        }
      }, 30000); // Check every 30 seconds
    }
  }

  addCleanupTask(task: () => void, priority: 'high' | 'medium' | 'low' = 'medium'): void {
    cleanupManager.registerCleanup('global', task, priority);
  }

  performCleanup(): void {
    console.log('[GlobalCleanupService] Performing enterprise cleanup');
    
    try {
      // Use the centralized cleanup manager
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
