
import { subscriptionManager } from './SubscriptionManager';

class GlobalCleanupService {
  private static instance: GlobalCleanupService;
  private cleanupTasks: (() => void)[] = [];

  static getInstance(): GlobalCleanupService {
    if (!GlobalCleanupService.instance) {
      GlobalCleanupService.instance = new GlobalCleanupService();
    }
    return GlobalCleanupService.instance;
  }

  addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  performCleanup(): void {
    console.log('[GlobalCleanupService] Performing global cleanup');
    
    // Clean up all subscriptions
    subscriptionManager.cleanup();
    
    // Run all registered cleanup tasks
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('[GlobalCleanupService] Error during cleanup:', error);
      }
    });
    
    this.cleanupTasks = [];
  }
}

export const globalCleanupService = GlobalCleanupService.getInstance();

// Set up global cleanup listeners
if (typeof window !== 'undefined') {
  // Cleanup on page visibility change (mobile backgrounding)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      globalCleanupService.performCleanup();
    }
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    globalCleanupService.performCleanup();
  });

  // Cleanup on navigation (SPA routing)
  window.addEventListener('popstate', () => {
    globalCleanupService.performCleanup();
  });
}
