
import { useCallback, useRef, useEffect, useState } from 'react';
import { Exercise } from '@/types/exercise';
import { SearchFilters } from '@/types/search';
import { exerciseSearchEngine } from '@/services/exerciseSearchEngine';
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

  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const searchControllerRef = useRef<AbortController>();
  const lastSearchRef = useRef<string>('');
  const indexingRef = useRef<boolean>(false);

  // Ensure exercises is always an array and add debug logging
  const safeExercises = exercises && Array.isArray(exercises) ? exercises : [];
  
  console.log('useExerciseSearch: exercises available:', safeExercises.length);

  // Index exercises when they become available
  useEffect(() => {
    if (safeExercises.length > 0 && !indexingRef.current) {
      indexingRef.current = true;
      console.log('useExerciseSearch: Starting indexing for', safeExercises.length, 'exercises');
      
      exerciseSearchEngine.indexExercises(safeExercises).then(() => {
        setIsIndexed(true);
        console.log('useExerciseSearch: Indexing completed');
      }).catch(error => {
        console.error('useExerciseSearch: Indexing failed:', error);
        indexingRef.current = false;
      });
    }
  }, [safeExercises]);

  // Optimized search function with proper error handling
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters = {}) => {
    const searchKey = `${searchQuery}:${JSON.stringify(searchFilters)}`;
    
    // Cancel previous search if still running
    if (searchControllerRef.current) {
      searchControllerRef.current.abort();
    }
    
    // Create new abort controller for this search
    searchControllerRef.current = new AbortController();
    
    // Avoid duplicate searches
    if (lastSearchRef.current === searchKey) {
      return;
    }
    
    lastSearchRef.current = searchKey;
    setIsSearching(true);

    try {
      console.log('useExerciseSearch: Performing search for query:', searchQuery, 'filters:', searchFilters);
      
      const result = await exerciseSearchEngine.search(searchQuery, searchFilters);
      
      // Only update if this search wasn't cancelled
      if (!searchControllerRef.current?.signal.aborted) {
        console.log('useExerciseSearch: Search completed with', result.results.length, 'results');
        setResults(result.results);
        setFromCache(result.fromCache || false);
        setFromWorker(result.fromWorker || false);
      }
    } catch (error) {
      if (!searchControllerRef.current?.signal.aborted) {
        console.error('useExerciseSearch: Search error:', error);
        setResults([]);
        setFromCache(false);
        setFromWorker(false);
      }
    } finally {
      if (!searchControllerRef.current?.signal.aborted) {
        setIsSearching(false);
      }
    }
  }, []);

  // Stable search functions using useCallback
  const search = useCallback((searchQuery: string, searchFilters?: SearchFilters) => {
    return performSearch(searchQuery, searchFilters || filters);
  }, [performSearch, filters]);

  const searchDebounced = useCallback((searchQuery: string, searchFilters?: SearchFilters) => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery, searchFilters || filters);
    }, debounceMs);
  }, [performSearch, filters, debounceMs]);

  const clearSearch = useCallback(() => {
    // Cancel any pending searches
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
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
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (searchControllerRef.current) {
        searchControllerRef.current.abort();
      }
    };
  }, []);

  // Add debug logging for search results
  console.log('useExerciseSearch: returning results:', results.length);
  
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
