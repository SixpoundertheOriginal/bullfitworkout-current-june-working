import { useState, useEffect, useCallback, useRef } from 'react';
import { Exercise } from '@/types/exercise';
import { SearchFilters, SearchResult } from '@/services/exerciseSearchEngine';
import { concurrentSearchEngine } from '@/services/concurrentSearchEngine';
import { useExercises } from '@/hooks/useExercises';
import { useConcurrencyManager } from '@/hooks/useConcurrencyManager';

export interface UseExerciseSearchOptions {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  debounceMs?: number;
  autoSearch?: boolean;
}

export interface UseExerciseSearchReturn {
  results: Exercise[];
  isSearching: boolean;
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  searchDebounced: (query: string, filters?: SearchFilters) => void;
  query: string;
  filters: SearchFilters;
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  clearSearch: () => void;
  isIndexed: boolean;
  fromCache: boolean;
  fromWorker: boolean;
  workerStatus: { ready: boolean; available: boolean };
}

export function useExerciseSearch(options: UseExerciseSearchOptions = {}): UseExerciseSearchReturn {
  const {
    initialQuery = '',
    initialFilters = {},
    debounceMs = 300,
    autoSearch = true
  } = options;

  const { exercises } = useExercises();
  const [results, setResults] = useState<Exercise[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [isIndexed, setIsIndexed] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [fromWorker, setFromWorker] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSearchRef = useRef<string>('');
  const searchControllerRef = useRef<AbortController>();

  // Use concurrency manager for task coordination
  const { enqueue, cancel, getStats } = useConcurrencyManager({
    autoCancel: true,
    defaultPriority: 'normal',
    componentTag: 'exercise-search'
  });

  // Index exercises when they're loaded
  useEffect(() => {
    if (exercises.length > 0) {
      enqueue({
        id: 'index-exercises',
        priority: 'high',
        tags: ['indexing'],
        run: async () => {
          const { exerciseSearchEngine } = await import('@/services/exerciseSearchEngine');
          exerciseSearchEngine.indexExercises(exercises);
          setIsIndexed(true);
        }
      });
    }
  }, [exercises, enqueue]);

  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters = {}) => {
    const searchKey = `${searchQuery}:${JSON.stringify(searchFilters)}`;
    
    // Cancel previous search if still running
    if (searchControllerRef.current) {
      searchControllerRef.current.abort();
    }
    
    // Create new abort controller for this search
    searchControllerRef.current = new AbortController();
    
    // Avoid duplicate searches
    if (lastSearchRef.current === searchKey && !isSearching) {
      return;
    }
    
    lastSearchRef.current = searchKey;
    setIsSearching(true);

    try {
      const startTime = performance.now();
      
      // Use concurrent search engine with high priority for user searches
      const result: SearchResult = await concurrentSearchEngine.search(
        searchQuery, 
        searchFilters,
        {
          priority: 'high',
          enableCache: true,
          enablePredictive: true,
          signal: searchControllerRef.current.signal
        }
      );
      
      const duration = performance.now() - startTime;
      
      // Only update if this search wasn't cancelled
      if (!searchControllerRef.current?.signal.aborted && lastSearchRef.current === searchKey) {
        setResults(result.results);
        setFromCache(result.fromCache || false);
        setFromWorker(result.fromWorker || false);
        
        // Log performance for debugging
        console.log(`Search completed in ${duration.toFixed(2)}ms, fromWorker: ${result.fromWorker}, results: ${result.results.length}`);
      }
    } catch (error) {
      if (!searchControllerRef.current?.signal.aborted) {
        console.error('Search error:', error);
        setResults([]);
        setFromCache(false);
        setFromWorker(false);
      }
    } finally {
      if (!searchControllerRef.current?.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, [isSearching]);

  const search = useCallback((searchQuery: string, searchFilters?: SearchFilters) => {
    return performSearch(searchQuery, searchFilters || filters);
  }, [performSearch, filters]);

  const searchDebounced = useCallback((searchQuery: string, searchFilters?: SearchFilters) => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery, searchFilters || filters);
    }, debounceMs);
  }, [performSearch, filters, debounceMs]);

  const clearSearch = useCallback(() => {
    // Cancel any pending searches
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchControllerRef.current) {
      searchControllerRef.current.abort();
    }
    
    // Cancel all search tasks
    cancel('search');
    concurrentSearchEngine.cancelAllSearches();
    
    setQuery('');
    setFilters({});
    setResults([]);
    setFromCache(false);
    setFromWorker(false);
    lastSearchRef.current = '';
  }, [cancel]);

  // Auto-search when query or filters change (debounced)
  useEffect(() => {
    if (autoSearch && isIndexed) {
      searchDebounced(query, filters);
    }
  }, [query, filters, autoSearch, isIndexed, searchDebounced]);

  // Preload popular searches in background
  useEffect(() => {
    if (isIndexed) {
      enqueue({
        id: 'preload-popular-searches',
        priority: 'low',
        tags: ['preload', 'background-sync'],
        retryOnFail: true,
        run: async () => {
          await concurrentSearchEngine.preloadPopularSearches();
        }
      });
    }
  }, [isIndexed, enqueue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (searchControllerRef.current) {
        searchControllerRef.current.abort();
      }
    };
  }, []);

  const concurrencyStats = getStats();
  
  return {
    results,
    isSearching,
    search,
    searchDebounced,
    query,
    filters,
    setQuery,
    setFilters,
    clearSearch,
    isIndexed,
    fromCache,
    fromWorker,
    workerStatus: {
      ready: isIndexed,
      available: concurrencyStats.running < 5 // Based on max concurrent tasks
    }
  };
}
