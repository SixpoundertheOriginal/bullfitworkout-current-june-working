
import { Exercise } from '@/types/exercise';
import { SearchFilters, SearchResult } from '@/services/exerciseSearchEngine';
import { concurrencyManager } from '../concurrency/ConcurrencyManager';
import { predictiveCache } from '@/services/predictiveCache';

interface SearchOptions {
  priority?: 'high' | 'normal' | 'low';
  enableCache?: boolean;
  enablePredictive?: boolean;
  signal?: AbortSignal;
}

interface SearchEngineConfig {
  cacheTimeout?: number;
  enableWorkerFallback?: boolean;
  maxConcurrentSearches?: number;
}

export interface SearchEngine<T> {
  search: (query: string, filters?: SearchFilters) => Promise<SearchResult>;
  indexItems?: (items: T[]) => Promise<void>;
  clearCache?: () => void;
}

export class ConcurrentSearchEngine<TItem = Exercise> {
  private searchCache = new Map<string, { result: SearchResult; timestamp: number }>();
  private readonly config: Required<SearchEngineConfig>;
  private searchEngine: SearchEngine<TItem>;

  constructor(searchEngine: SearchEngine<TItem>, config: SearchEngineConfig = {}) {
    this.searchEngine = searchEngine;
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
              this.setCachedResult(searchKey, result);
            }

            // Record for predictive caching
            if (enablePredictive) {
              predictiveCache.recordUserSearch(query, filters);
            }

            resolve(result);
          } catch (error) {
            console.error('Search failed:', error);
            reject(error);
          }
        }
      });
    });
  }

  async preloadPopularSearches(): Promise<void> {
    const taskId = 'preload-popular-searches';
    
    concurrencyManager.enqueue({
      id: taskId,
      priority: 'low',
      tags: ['preload', 'background-sync'],
      retryOnFail: true,
      maxRetries: 3,
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
      maxRetries: 2,
      run: async () => {
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
    if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
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

  getStats() {
    return {
      cacheSize: this.searchCache.size,
      concurrency: concurrencyManager.getStats()
    };
  }
}

// Create and export default instance for exercises
import { exerciseSearchEngine } from '@/services/exerciseSearchEngine';
export const concurrentExerciseSearchEngine = new ConcurrentSearchEngine<Exercise>(exerciseSearchEngine);
