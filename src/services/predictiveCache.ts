
import { Exercise } from '@/types/exercise';
import { exerciseSearchEngine } from './exerciseSearchEngine';
import { requestDeduplication } from './requestDeduplication';

interface SearchPattern {
  query: string;
  filters: Record<string, any>;
  frequency: number;
  lastUsed: number;
}

interface CacheEntry {
  results: Exercise[];
  timestamp: number;
  hitCount: number;
}

class PredictiveCacheService {
  private searchPatterns = new Map<string, SearchPattern>();
  private cache = new Map<string, CacheEntry>();
  private readonly maxPatterns = 50;
  private readonly maxCacheEntries = 100;
  private readonly patternTTL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly cacheTTL = 10 * 60 * 1000; // 10 minutes

  recordUserSearch(query: string, filters: Record<string, any> = {}): void {
    const key = this.generateKey(query, filters);
    const now = Date.now();
    
    const existing = this.searchPatterns.get(key);
    if (existing) {
      existing.frequency++;
      existing.lastUsed = now;
    } else {
      // Remove oldest patterns if at capacity
      if (this.searchPatterns.size >= this.maxPatterns) {
        this.removeOldestPattern();
      }
      
      this.searchPatterns.set(key, {
        query,
        filters,
        frequency: 1,
        lastUsed: now
      });
    }
  }

  async getCachedResults(query: string, filters: Record<string, any> = {}): Promise<Exercise[] | null> {
    const key = this.generateKey(query, filters);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    
    cached.hitCount++;
    return cached.results;
  }

  setCachedResults(query: string, filters: Record<string, any> = {}, results: Exercise[]): void {
    const key = this.generateKey(query, filters);
    
    // Remove oldest cache entries if at capacity
    if (this.cache.size >= this.maxCacheEntries) {
      this.removeOldestCacheEntry();
    }
    
    this.cache.set(key, {
      results,
      timestamp: Date.now(),
      hitCount: 0
    });
  }

  async preloadPopularSearches(): Promise<void> {
    const popularPatterns = Array.from(this.searchPatterns.entries())
      .sort(([, a], [, b]) => b.frequency - a.frequency)
      .slice(0, 10);

    const preloadPromises = popularPatterns.map(async ([key, pattern]) => {
      try {
        const cached = await this.getCachedResults(pattern.query, pattern.filters);
        if (!cached) {
          // Use requestDeduplication to avoid duplicate searches
          const searchResult = await requestDeduplication.deduplicate(
            `preload-${key}`,
            () => exerciseSearchEngine.search(pattern.query, pattern.filters)
          );
          // Extract results from SearchResult object
          this.setCachedResults(pattern.query, pattern.filters, searchResult.results);
        }
      } catch (error) {
        console.warn('Failed to preload search:', error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  private generateKey(query: string, filters: Record<string, any>): string {
    const filterStr = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    return `${query.toLowerCase()}#${filterStr}`;
  }

  private removeOldestPattern(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, pattern] of this.searchPatterns) {
      if (pattern.lastUsed < oldestTime) {
        oldestTime = pattern.lastUsed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.searchPatterns.delete(oldestKey);
    }
  }

  private removeOldestCacheEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearPatterns(): void {
    this.searchPatterns.clear();
  }

  getStats() {
    return {
      patterns: this.searchPatterns.size,
      cacheEntries: this.cache.size,
      maxPatterns: this.maxPatterns,
      maxCacheEntries: this.maxCacheEntries
    };
  }
}

export const predictiveCache = new PredictiveCacheService();
