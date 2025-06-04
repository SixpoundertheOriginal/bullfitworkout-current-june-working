
import { useState, useEffect, useCallback, useRef } from 'react';
import { concurrencyManager } from '../concurrency/ConcurrencyManager';
import { useCleanup } from '@/hooks/useCleanup';

export interface SearchFilters {
  [key: string]: any;
}

export interface SearchResult<T> {
  results: T[];
  fromCache?: boolean;
  fromWorker?: boolean;
}

export interface SearchEngine<T> {
  search: (query: string, filters?: SearchFilters) => Promise<SearchResult<T>>;
  indexItems?: (items: T[]) => Promise<void>;
  clearCache?: () => void;
}

export interface SearchHookOptions {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  debounceMs?: number;
  autoSearch?: boolean;
  enableIndexing?: boolean;
}

export interface SearchHookReturn<T> {
  results: T[];
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

export function createSearchHook<T>(
  searchEngine: SearchEngine<T>,
  hookId: string
) {
  return function useSearch(
    items: T[] = [],
    options: SearchHookOptions = {}
  ): SearchHookReturn<T> {
    const {
      initialQuery = '',
      initialFilters = {},
      debounceMs = 300,
      autoSearch = true,
      enableIndexing = true
    } = options;

    const [results, setResults] = useState<T[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [query, setQuery] = useState(initialQuery);
    const [filters, setFilters] = useState<SearchFilters>(initialFilters);
    const [isIndexed, setIsIndexed] = useState(false);
    const [fromCache, setFromCache] = useState(false);
    const [fromWorker, setFromWorker] = useState(false);
    
    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const lastSearchRef = useRef<string>('');
    const searchControllerRef = useRef<AbortController>();
    
    const { registerCleanup } = useCleanup(`search-hook-${hookId}`);

    // Index items when they're loaded
    useEffect(() => {
      if (enableIndexing && items.length > 0 && searchEngine.indexItems) {
        const taskId = `index-${hookId}-items`;
        
        concurrencyManager.enqueue({
          id: taskId,
          priority: 'high',
          tags: ['indexing'],
          maxRetries: 1,
          run: async () => {
            await searchEngine.indexItems!(items);
            setIsIndexed(true);
          }
        });
      } else if (!enableIndexing) {
        setIsIndexed(true);
      }
    }, [items, enableIndexing, hookId]);

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
        
        const result: SearchResult<T> = await searchEngine.search(
          searchQuery, 
          searchFilters
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
    }, [isSearching, searchEngine]);

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
      
      // Cancel all search tasks for this hook
      concurrencyManager.cancelByTag(`search-${hookId}`);
      
      // Clear search engine cache if available
      if (searchEngine.clearCache) {
        searchEngine.clearCache();
      }
      
      setQuery('');
      setFilters({});
      setResults([]);
      setFromCache(false);
      setFromWorker(false);
      lastSearchRef.current = '';
    }, [hookId, searchEngine]);

    // Auto-search when query or filters change (debounced)
    useEffect(() => {
      if (autoSearch && isIndexed) {
        searchDebounced(query, filters);
      }
    }, [query, filters, autoSearch, isIndexed, searchDebounced]);

    // Register cleanup functions
    useEffect(() => {
      registerCleanup(() => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        if (searchControllerRef.current) {
          searchControllerRef.current.abort();
        }
      });
    }, [registerCleanup]);

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

    const concurrencyStats = concurrencyManager.getStats();
    
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
        available: concurrencyStats.running < 5
      }
    };
  };
}
