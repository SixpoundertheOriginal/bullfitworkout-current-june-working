
import { Exercise } from '@/types/exercise';
import { SearchFilters, SearchResult, SearchOptions, SearchEngineInterface } from '@/types/search';
import { ConcurrencyManagerInterface } from '@/types/concurrency';

interface SearchEngineConfig {
  cacheTimeout?: number;
  enableWorkerFallback?: boolean;
  maxConcurrentSearches?: number;
}

interface PredictiveCacheInterface {
  recordUserSearch: (query: string, filters: SearchFilters) => void;
  getCachedResults: (query: string, filters: SearchFilters) => Promise<any[] | null>;
  setCachedResults: (query: string, filters: SearchFilters, results: any[]) => void;
  preloadPopularSearches: () => Promise<void>;
  clearCache: () => void;
}

export class ConcurrentSearchEngine<TItem = Exercise> {
  private searchCache = new Map<string, { result: SearchResult<TItem>; timestamp: number }>();
  private readonly config: Required<SearchEngineConfig>;
  private searchEngine: SearchEngineInterface<TItem>;
  private concurrencyManager: ConcurrencyManagerInterface;
  private predictiveCache: PredictiveCacheInterface;

  constructor(
    searchEngine: SearchEngineInterface<TItem>,
    concurrencyManager: ConcurrencyManagerInterface,
    predictiveCache: PredictiveCacheInterface,
    config: SearchEngineConfig = {}
  ) {
    this.searchEngine = searchEngine;
    this.concurrencyManager = concurrencyManager;
    this.predictiveCache = predictiveCache;
    this.config = {
      cacheTimeout: config.cacheTimeout ?? 5 * 60 * 1000, // 5 minutes
      enableWorkerFallback: config.enableWorkerFallback ?? true,
      maxConcurrentSearches: config.maxConcurrentSearches ?? 5
    };
  }

  async search(
    query: string, 
    filters: SearchFilters = {}, 
    options: SearchOptions = {}
  ): Promise<SearchResult<TItem>> {
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
      this.concurrencyManager.enqueue({
        id: taskId,
        priority,
        tags: ['search', 'user-interaction'],
        signal,
        retryOnFail: false,
        maxRetries: 0,
        run: async () => {
          try {
            // Check if request was cancelled
            if (signal?.aborted) {
              throw new Error('Search cancelled');
            }

            const result = await this.searchEngine.search(query, filters);
            
            // Cache the result
            if (enableCache) {
              this.setCachedResult(searchKey, result as SearchResult<TItem>);
            }

            // Record for predictive caching
            if (enablePredictive) {
              this.predictiveCache.recordUserSearch(query, filters);
            }

            resolve(result as SearchResult<TItem>);
          } catch (error) {
            console.error('Search failed:', error);
            reject(error);
          }
        }
      });
    });
  }

  async indexItems(items: TItem[]): Promise<void> {
    if (this.searchEngine.indexItems) {
      await this.searchEngine.indexItems(items);
    }
  }

  async preloadPopularSearches(): Promise<void> {
    const taskId = 'preload-popular-searches';
    
    this.concurrencyManager.enqueue({
      id: taskId,
      priority: 'low',
      tags: ['preload', 'background-sync'],
      retryOnFail: true,
      maxRetries: 3,
      run: async () => {
        await this.predictiveCache.preloadPopularSearches();
      }
    });
  }

  async backgroundSync(): Promise<void> {
    const taskId = 'background-search-sync';
    
    this.concurrencyManager.enqueue({
      id: taskId,
      priority: 'low',
      tags: ['background-sync', 'indexing'],
      retryOnFail: true,
      maxRetries: 2,
      run: async () => {
        console.log('Background search sync completed');
      }
    });
  }

  cancelSearch(searchKey: string): void {
    const taskId = `search-${searchKey}`;
    this.concurrencyManager.cancel(taskId);
  }

  cancelAllSearches(): void {
    this.concurrencyManager.cancelByTag('search');
  }

  clearCache(): void {
    this.searchCache.clear();
    this.predictiveCache.clearCache();
    if (this.searchEngine.clearCache) {
      this.searchEngine.clearCache();
    }
  }

  getIndexedStatus(): boolean {
    return this.searchEngine.getIndexedStatus?.() ?? false;
  }

  getWorkerStatus(): { ready: boolean; available: boolean } {
    return this.searchEngine.getWorkerStatus?.() ?? { ready: false, available: false };
  }

  private generateSearchKey(query: string, filters: SearchFilters): string {
    const filterStr = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key as keyof SearchFilters]}`)
      .join('|');
    return `${query.toLowerCase()}#${filterStr}`;
  }

  private async getCachedResult(searchKey: string): Promise<SearchResult<TItem> | null> {
    // Check memory cache first
    const cached = this.searchCache.get(searchKey);
    if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
      return { ...cached.result, fromCache: true };
    }

    // Check predictive cache
    const [query, filterStr] = searchKey.split('#');
    const filters = this.parseFilters(filterStr);
    const predictiveCached = await this.predictiveCache.getCachedResults(query, filters);
    
    if (predictiveCached) {
      return {
        results: predictiveCached as TItem[],
        fromCache: true,
        fromWorker: false
      };
    }

    return null;
  }

  private setCachedResult(searchKey: string, result: SearchResult<TItem>): void {
    this.searchCache.set(searchKey, {
      result,
      timestamp: Date.now()
    });

    // Also cache in predictive cache
    const [query, filterStr] = searchKey.split('#');
    const filters = this.parseFilters(filterStr);
    this.predictiveCache.setCachedResults(query, filters, result.results);
  }

  private parseFilters(filterStr: string): SearchFilters {
    if (!filterStr) return {};
    
    const filters: SearchFilters = {};
    filterStr.split('|').forEach(pair => {
      const [key, value] = pair.split(':');
      if (key && value) {
        (filters as Record<string, string>)[key] = value;
      }
    });
    
    return filters;
  }

  getStats() {
    return {
      cacheSize: this.searchCache.size,
      concurrency: this.concurrencyManager.getStats()
    };
  }
}
