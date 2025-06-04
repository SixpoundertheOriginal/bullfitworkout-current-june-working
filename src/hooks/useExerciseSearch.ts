
import { useState, useEffect, useCallback, useRef } from 'react';
import { Exercise } from '@/types/exercise';
import { exerciseSearchEngine, SearchFilters, SearchResult } from '@/services/exerciseSearchEngine';
import { useExercises } from '@/hooks/useExercises';

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

  // Index exercises when they're loaded
  useEffect(() => {
    if (exercises.length > 0) {
      exerciseSearchEngine.indexExercises(exercises);
      setIsIndexed(true);
    }
  }, [exercises]);

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
      const result: SearchResult = await exerciseSearchEngine.search(searchQuery, searchFilters);
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
    
    setQuery('');
    setFilters({});
    setResults([]);
    setFromCache(false);
    setFromWorker(false);
    lastSearchRef.current = '';
  }, []);

  // Auto-search when query or filters change (debounced)
  useEffect(() => {
    if (autoSearch && isIndexed) {
      searchDebounced(query, filters);
    }
  }, [query, filters, autoSearch, isIndexed, searchDebounced]);

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
    workerStatus: exerciseSearchEngine.getWorkerStatus()
  };
}
