
import { Exercise } from '@/types/exercise';
import { requestCache } from './requestDeduplication';

export interface SearchFilters {
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  movement?: string;
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  requestId: string;
}

export interface SearchResult {
  results: Exercise[];
  query: string;
  requestId: string;
  fromCache?: boolean;
}

class ExerciseSearchEngine {
  private worker: Worker | null = null;
  private isIndexed = false;
  private pendingRequests = new Map<string, (result: SearchResult) => void>();
  private searchCache = requestCache.createNamespace('search');
  private debounceTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    try {
      this.worker = new Worker('/search-worker.js', { type: 'module' });
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);
    } catch (error) {
      console.error('Failed to initialize search worker:', error);
      this.worker = null;
    }
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { type, payload } = event.data;

    switch (type) {
      case 'INDEX_COMPLETE':
        this.isIndexed = true;
        console.log(`Search index ready with ${payload.count} exercises`);
        break;

      case 'SEARCH_RESULTS':
        const { requestId, results, query } = payload;
        const resolver = this.pendingRequests.get(requestId);
        if (resolver) {
          // Cache the results
          const cacheKey = this.generateCacheKey(query, {});
          this.searchCache.set(cacheKey, results, 300000); // 5 minutes TTL

          resolver({
            results,
            query,
            requestId,
            fromCache: false
          });
          this.pendingRequests.delete(requestId);
        }
        break;

      default:
        console.warn('Unknown worker message type:', type);
    }
  }

  private handleWorkerError(error: ErrorEvent) {
    console.error('Search worker error:', error);
    // Fallback to client-side search if worker fails
    this.worker = null;
  }

  private generateCacheKey(query: string, filters: SearchFilters): string {
    return `search:${query}:${JSON.stringify(filters)}`;
  }

  public indexExercises(exercises: Exercise[]): void {
    if (!this.worker) {
      console.warn('Search worker not available, skipping indexing');
      return;
    }

    this.worker.postMessage({
      type: 'INDEX_EXERCISES',
      payload: { exercises }
    });
  }

  public updateExercise(exercise: Exercise): void {
    if (!this.worker) return;

    this.worker.postMessage({
      type: 'UPDATE_EXERCISE',
      payload: { exercise }
    });

    // Invalidate relevant cache entries
    this.searchCache.clear(); // Simple approach - clear all search cache
  }

  public search(query: string, filters: SearchFilters = {}): Promise<SearchResult> {
    return new Promise((resolve) => {
      // Check cache first
      const cacheKey = this.generateCacheKey(query, filters);
      const cachedResult = this.searchCache.get(cacheKey);
      
      if (cachedResult) {
        resolve({
          results: cachedResult,
          query,
          requestId: `cached-${Date.now()}`,
          fromCache: true
        });
        return;
      }

      // If no worker, return empty results
      if (!this.worker || !this.isIndexed) {
        resolve({
          results: [],
          query,
          requestId: `fallback-${Date.now()}`,
          fromCache: false
        });
        return;
      }

      const requestId = `search-${Date.now()}-${Math.random()}`;
      this.pendingRequests.set(requestId, resolve);

      this.worker.postMessage({
        type: 'SEARCH',
        payload: {
          query,
          filters,
          requestId
        }
      });

      // Timeout fallback
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          resolve({
            results: [],
            query,
            requestId,
            fromCache: false
          });
        }
      }, 5000);
    });
  }

  public searchDebounced(query: string, filters: SearchFilters = {}, delay = 300): Promise<SearchResult> {
    return new Promise((resolve) => {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      this.debounceTimeout = setTimeout(() => {
        this.search(query, filters).then(resolve);
      }, delay);
    });
  }

  public dispose(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
    this.searchCache.clear();
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
  }
}

// Singleton instance
export const exerciseSearchEngine = new ExerciseSearchEngine();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    exerciseSearchEngine.dispose();
  });
}
