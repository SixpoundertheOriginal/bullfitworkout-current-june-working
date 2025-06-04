
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
  searchDebounced: (query: string, filters?: SearchFilters) => Promise<void>;
  query: string;
  filters: SearchFilters;
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  clearSearch: () => void;
  isIndexed: boolean;
  fromCache: boolean;
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
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSearchRef = useRef<string>('');

  // Index exercises when they're loaded
  useEffect(() => {
    if (exercises.length > 0) {
      exerciseSearchEngine.indexExercises(exercises);
      setIsIndexed(true);
    }
  }, [exercises]);

  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters = {}) => {
    const searchKey = `${searchQuery}:${JSON.stringify(searchFilters)}`;
    
    // Avoid duplicate searches
    if (lastSearchRef.current === searchKey && !isSearching) {
      return;
    }
    
    lastSearchRef.current = searchKey;
    setIsSearching(true);

    try {
      const result: SearchResult = await exerciseSearchEngine.search(searchQuery, searchFilters);
      
      // Only update if this is still the latest search
      if (lastSearchRef.current === searchKey) {
        setResults(result.results);
        setFromCache(result.fromCache || false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setFromCache(false);
    } finally {
      setIsSearching(false);
    }
  }, [isSearching]);

  const search = useCallback((searchQuery: string, searchFilters?: SearchFilters) => {
    return performSearch(searchQuery, searchFilters || filters);
  }, [performSearch, filters]);

  const searchDebounced = useCallback((searchQuery: string, searchFilters?: SearchFilters) => {
    return new Promise<void>((resolve) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        await performSearch(searchQuery, searchFilters || filters);
        resolve();
      }, debounceMs);
    });
  }, [performSearch, filters, debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({});
    setResults([]);
    setFromCache(false);
    lastSearchRef.current = '';
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // Auto-search when query or filters change
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
    fromCache
  };
}
