
import { Exercise } from '@/types/exercise';
import { exerciseSearchEngine, SearchFilters, SearchResult } from './exerciseSearchEngine';
import { concurrencyManager } from './concurrencyManager';
import { predictiveCache } from './predictiveCache';

interface ConcurrentSearchOptions {
  priority?: 'high' | 'normal' | 'low';
  enableCache?: boolean;
  enablePredictive?: boolean;
  signal?: AbortSignal;
}

class ConcurrentSearchEngine {
  private searchCache = new Map<string, { result: SearchResult; timestamp: number }>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async search(
    query: string, 
    filters: SearchFilters = {}, 
    options: ConcurrentSearchOptions = {}
  ): Promise<SearchResult> {
    const {
      priority = 'normal',
      enableCache = true,
      enablePredictive = true,
      signal
    } = options;

    const searchKey = this.generateSearchKey(query, filters);

    // Check cache first
    if (enableCache) {
      const cached = await this.getCachedResult(searchKey);
      if (cached) {
        return cached;
      }
    }

    // Create search task
    const taskId = `search-${searchKey}-${Date.now()}`;
    
    return new Promise((resolve, reject) => {
      concurrencyManager.enqueue({
        id: taskId,
        priority,
        tags: ['search', 'user-interaction'],
        signal,
        retryOnFail: false,
        run: async () => {
          try {
            // Check if request was cancelled
            if (signal?.aborted) {
              throw new Error('Search cancelled');
            }

            const result = await exerciseSearchEngine.search(query, filters);
            
            // Cache the result
            if (enableCache) {
              this.setCachedResult(searchKey, result);
            }

            // Record for predictive caching
            if (enablePredictive) {
              predictiveCache.recordUserSearch(query, filters);
            }

            return result;
          } catch (error) {
            console.error('Concurrent search failed:', error);
            throw error;
          }
        }
      });

      // Wait for task completion
      this.waitForTask(taskId)
        .then(resolve)
        .catch(reject);
    });
  }

  async preloadPopularSearches(): Promise<void> {
    const taskId = 'preload-popular-searches';
    
    concurrencyManager.enqueue({
      id: taskId,
      priority: 'low',
      tags: ['preload', 'background-sync'],
      retryOnFail: true,
      run: async () => {
        await predictiveCache.preloadPopularSearches();
      }
    });
  }

  async backgroundSync(): Promise<void> {
    const taskId = 'background-search-sync';
    
    concurrencyManager.enqueue({
      id: taskId,
      priority: 'low',
      tags: ['background-sync', 'indexing'],
      retryOnFail: true,
      run: async () => {
        // Perform background indexing or cache warming
        console.log('Background search sync completed');
      }
    });
  }

  cancelSearch(searchKey: string): void {
    const taskId = `search-${searchKey}`;
    concurrencyManager.cancel(taskId);
  }

  cancelAllSearches(): void {
    concurrencyManager.cancelByTag('search');
  }

  clearCache(): void {
    this.searchCache.clear();
    predictiveCache.clearCache();
  }

  private generateSearchKey(query: string, filters: SearchFilters): string {
    const filterStr = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key as keyof SearchFilters]}`)
      .join('|');
    return `${query.toLowerCase()}#${filterStr}`;
  }

  private async getCachedResult(searchKey: string): Promise<SearchResult | null> {
    // Check memory cache first
    const cached = this.searchCache.get(searchKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return { ...cached.result, fromCache: true };
    }

    // Check predictive cache
    const [query, filterStr] = searchKey.split('#');
    const filters = this.parseFilters(filterStr);
    const predictiveCached = await predictiveCache.getCachedResults(query, filters);
    
    if (predictiveCached) {
      return {
        results: predictiveCached,
        fromCache: true,
        fromWorker: false
      };
    }

    return null;
  }

  private setCachedResult(searchKey: string, result: SearchResult): void {
    this.searchCache.set(searchKey, {
      result,
      timestamp: Date.now()
    });

    // Also cache in predictive cache
    const [query, filterStr] = searchKey.split('#');
    const filters = this.parseFilters(filterStr);
    predictiveCache.setCachedResults(query, filters, result.results);
  }

  private parseFilters(filterStr: string): SearchFilters {
    if (!filterStr) return {};
    
    const filters: SearchFilters = {};
    filterStr.split('|').forEach(pair => {
      const [key, value] = pair.split(':');
      if (key && value) {
        (filters as any)[key] = value;
      }
    });
    
    return filters;
  }

  private async waitForTask(taskId: string): Promise<SearchResult> {
    return new Promise((resolve, reject) => {
      const checkTask = () => {
        const stats = concurrencyManager.getStats();
        
        if (!stats.runningTaskIds.includes(taskId) && !stats.queuedTaskIds.includes(taskId)) {
          // Task completed, check if it was successful
          // Since we can't directly access task results, we need to handle this differently
          // For now, we'll reject with a timeout error
          reject(new Error('Task completed but result unavailable'));
          return;
        }

        // Task still running or queued, check again
        setTimeout(checkTask, 100);
      };

      checkTask();
    });
  }

  getStats() {
    return {
      cacheSize: this.searchCache.size,
      concurrency: concurrencyManager.getStats()
    };
  }
}

export const concurrentSearchEngine = new ConcurrentSearchEngine();
