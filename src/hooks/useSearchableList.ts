
import { useState, useMemo, useCallback } from 'react';

export interface SearchableListOptions<T> {
  items: T[];
  searchFields?: (keyof T)[];
  filterFn?: (item: T, filters: Record<string, any>) => boolean;
  sortFn?: (a: T, b: T) => number;
  initialFilters?: Record<string, any>;
}

export const useSearchableList = <T extends Record<string, any>>(
  options: SearchableListOptions<T>
) => {
  const { items, searchFields = [], filterFn, sortFn, initialFilters = {} } = options;
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(initialFilters);

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply search filter
    if (searchQuery.trim() && searchFields.length > 0) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          if (Array.isArray(value)) {
            return value.some(v => String(v).toLowerCase().includes(searchLower));
          }
          return String(value || '').toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply custom filters
    if (filterFn) {
      result = result.filter(item => filterFn(item, filters));
    }

    // Apply sorting
    if (sortFn) {
      result.sort(sortFn);
    }

    return result;
  }, [items, searchQuery, filters, searchFields, filterFn, sortFn]);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    filteredItems,
    totalItems: items.length,
    filteredCount: filteredItems.length
  };
};
