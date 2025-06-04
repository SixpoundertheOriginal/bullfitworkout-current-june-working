
type CleanupFunction = () => void;

interface CleanupScope {
  id: string;
  cleanupFunctions: CleanupFunction[];
  createdAt: number;
}

class CleanupManager {
  private scopes = new Map<string, CleanupScope>();
  private globalCleanups: CleanupFunction[] = [];
  private isCleaningUp = false;

  createScope(id: string): string {
    const scope: CleanupScope = {
      id,
      cleanupFunctions: [],
      createdAt: Date.now()
    };
    
    this.scopes.set(id, scope);
    console.log(`Cleanup scope created: ${id}`);
    return id;
  }

  registerCleanup(scopeId: string, cleanup: CleanupFunction): void {
    const scope = this.scopes.get(scopeId);
    if (scope) {
      scope.cleanupFunctions.push(cleanup);
    } else {
      // Fallback to global if scope doesn't exist
      this.globalCleanups.push(cleanup);
    }
  }

  registerGlobalCleanup(cleanup: CleanupFunction): void {
    this.globalCleanups.push(cleanup);
  }

  cleanupScope(scopeId: string): void {
    const scope = this.scopes.get(scopeId);
    if (!scope) return;

    console.log(`Cleaning up scope: ${scopeId} (${scope.cleanupFunctions.length} functions)`);
    
    scope.cleanupFunctions.forEach((cleanup, index) => {
      try {
        cleanup();
      } catch (error) {
        console.warn(`Cleanup function ${index} failed in scope ${scopeId}:`, error);
      }
    });

    this.scopes.delete(scopeId);
  }

  cleanupAll(): void {
    if (this.isCleaningUp) return;
    
    this.isCleaningUp = true;
    console.log('Running global cleanup...');

    // Clean up all scopes
    Array.from(this.scopes.keys()).forEach(scopeId => {
      this.cleanupScope(scopeId);
    });

    // Clean up global functions
    this.globalCleanups.forEach((cleanup, index) => {
      try {
        cleanup();
      } catch (error) {
        console.warn(`Global cleanup function ${index} failed:`, error);
      }
    });

    this.globalCleanups = [];
    this.isCleaningUp = false;
  }

  getStats() {
    return {
      activeScopes: this.scopes.size,
      globalCleanups: this.globalCleanups.length,
      scopeDetails: Array.from(this.scopes.entries()).map(([id, scope]) => ({
        id,
        cleanupCount: scope.cleanupFunctions.length,
        age: Date.now() - scope.createdAt
      }))
    };
  }
}

export const cleanupManager = new CleanupManager();

// Global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupManager.cleanupAll();
  });
  
  window.addEventListener('pagehide', () => {
    cleanupManager.cleanupAll();
  });
}
