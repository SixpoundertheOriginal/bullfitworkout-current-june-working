
import { Exercise } from '@/types/exercise';
import { exerciseSearchEngine, SearchFilters } from './exerciseSearchEngine';
import { requestCache } from './requestDeduplication';

interface UserPattern {
  searchTerms: string[];
  commonFilters: SearchFilters[];
  recentQueries: string[];
  timestamp: number;
}

class PredictiveCacheService {
  private patterns = requestCache.createNamespace('user-patterns');
  private prefetchQueue = new Set<string>();
  private maxPrefetchQueue = 10;
  private prefetchDelay = 2000; // 2 seconds after user interaction

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns() {
    // Load existing patterns from cache
    const savedPatterns = this.patterns.get('user-behavior');
    if (!savedPatterns) {
      this.patterns.set('user-behavior', {
        searchTerms: [],
        commonFilters: [],
        recentQueries: [],
        timestamp: Date.now()
      }, 86400000); // 24 hours TTL
    }
  }

  public recordUserSearch(query: string, filters: SearchFilters) {
    const patterns = this.patterns.get('user-behavior') as UserPattern || {
      searchTerms: [],
      commonFilters: [],
      recentQueries: [],
      timestamp: Date.now()
    };

    // Record search term
    if (query.trim() && !patterns.searchTerms.includes(query)) {
      patterns.searchTerms.push(query);
      if (patterns.searchTerms.length > 50) {
        patterns.searchTerms = patterns.searchTerms.slice(-50); // Keep last 50
      }
    }

    // Record recent query
    patterns.recentQueries.unshift(query);
    if (patterns.recentQueries.length > 20) {
      patterns.recentQueries = patterns.recentQueries.slice(0, 20);
    }

    // Record common filters
    if (Object.keys(filters).length > 0) {
      const filterExists = patterns.commonFilters.some(f => 
        JSON.stringify(f) === JSON.stringify(filters)
      );
      if (!filterExists) {
        patterns.commonFilters.push(filters);
        if (patterns.commonFilters.length > 20) {
          patterns.commonFilters = patterns.commonFilters.slice(-20);
        }
      }
    }

    patterns.timestamp = Date.now();
    this.patterns.set('user-behavior', patterns, 86400000);

    // Trigger predictive prefetching
    this.schedulePrefetch(query, filters);
  }

  private schedulePrefetch(currentQuery: string, currentFilters: SearchFilters) {
    setTimeout(() => {
      this.prefetchRelatedSearches(currentQuery, currentFilters);
    }, this.prefetchDelay);
  }

  private async prefetchRelatedSearches(currentQuery: string, currentFilters: SearchFilters) {
    if (this.prefetchQueue.size >= this.maxPrefetchQueue) {
      return; // Don't overwhelm the system
    }

    const patterns = this.patterns.get('user-behavior') as UserPattern;
    if (!patterns) return;

    const prefetchQueries = this.generatePrefetchQueries(currentQuery, currentFilters, patterns);

    for (const { query, filters } of prefetchQueries) {
      const cacheKey = `${query}:${JSON.stringify(filters)}`;
      if (!this.prefetchQueue.has(cacheKey)) {
        this.prefetchQueue.add(cacheKey);
        
        try {
          // Prefetch in background
          await exerciseSearchEngine.search(query, filters);
        } catch (error) {
          console.warn('Prefetch failed:', error);
        } finally {
          this.prefetchQueue.delete(cacheKey);
        }
      }
    }
  }

  private generatePrefetchQueries(currentQuery: string, currentFilters: SearchFilters, patterns: UserPattern) {
    const prefetchQueries: Array<{ query: string; filters: SearchFilters }> = [];

    // 1. Similar search terms (edit distance of 1-2)
    const similarTerms = patterns.searchTerms.filter(term => 
      term !== currentQuery && 
      this.calculateEditDistance(currentQuery, term) <= 2
    ).slice(0, 3);

    for (const term of similarTerms) {
      prefetchQueries.push({ query: term, filters: currentFilters });
    }

    // 2. Current query with common filters
    const relevantFilters = patterns.commonFilters.slice(0, 3);
    for (const filters of relevantFilters) {
      if (JSON.stringify(filters) !== JSON.stringify(currentFilters)) {
        prefetchQueries.push({ query: currentQuery, filters });
      }
    }

    // 3. Recent queries with current filters
    const recentQueries = patterns.recentQueries.slice(0, 2);
    for (const query of recentQueries) {
      if (query !== currentQuery) {
        prefetchQueries.push({ query, filters: currentFilters });
      }
    }

    return prefetchQueries.slice(0, 5); // Limit prefetch to 5 queries
  }

  private calculateEditDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  public getSuggestedQueries(currentQuery: string, limit = 5): string[] {
    const patterns = this.patterns.get('user-behavior') as UserPattern;
    if (!patterns) return [];

    // Combine recent queries and search terms
    const allQueries = [...patterns.recentQueries, ...patterns.searchTerms];
    const suggestions = allQueries
      .filter(query => 
        query !== currentQuery && 
        query.toLowerCase().includes(currentQuery.toLowerCase())
      )
      .slice(0, limit);

    return [...new Set(suggestions)]; // Remove duplicates
  }

  public clearCache() {
    this.patterns.clear();
    this.prefetchQueue.clear();
  }
}

export const predictiveCache = new PredictiveCacheService();
