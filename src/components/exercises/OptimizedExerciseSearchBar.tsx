
import React, { useState, useCallback, useMemo } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';

interface OptimizedExerciseSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  totalExercises: number;
  filteredCount: number;
  onFiltersToggle?: () => void;
  hasActiveFilters?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const OptimizedExerciseSearchBar: React.FC<OptimizedExerciseSearchBarProps> = React.memo(({
  searchTerm,
  onSearchChange,
  totalExercises,
  filteredCount,
  onFiltersToggle,
  hasActiveFilters = false,
  isLoading = false,
  className = ""
}) => {
  const [localTerm, setLocalTerm] = useState(searchTerm);
  const debouncedSearch = useDebounce(localTerm, 150);

  // Sync debounced value with parent
  React.useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange, searchTerm]);

  // Sync external changes
  React.useEffect(() => {
    if (searchTerm !== localTerm) {
      setLocalTerm(searchTerm);
    }
  }, [searchTerm, localTerm]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTerm(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setLocalTerm('');
    onSearchChange('');
  }, [onSearchChange]);

  const resultText = useMemo(() => {
    if (isLoading) return 'Searching...';
    if (searchTerm || hasActiveFilters) {
      return `${filteredCount} of ${totalExercises} exercises`;
    }
    return `${totalExercises} exercises`;
  }, [isLoading, searchTerm, hasActiveFilters, filteredCount, totalExercises]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search exercises, muscle groups, equipment..."
          className="pl-9 pr-20 h-11 bg-gray-800/50 border-gray-700 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
          value={localTerm}
          onChange={handleInputChange}
        />
        
        <div className="absolute right-2 top-1.5 flex items-center gap-1">
          {onFiltersToggle && (
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 rounded-full transition-all duration-200 ${
                hasActiveFilters 
                  ? 'text-purple-400 bg-purple-400/10 hover:bg-purple-400/20' 
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
              }`}
              onClick={onFiltersToggle}
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
          
          {localTerm && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 transition-all duration-200"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs bg-gray-900/50 border-gray-700 text-gray-300 px-3 py-1">
            {resultText}
          </Badge>
          
          {hasActiveFilters && (
            <Badge variant="outline" className="text-xs bg-purple-900/20 border-purple-500/30 text-purple-400 px-3 py-1">
              <Filter className="w-3 h-3 mr-1" />
              Filtered
            </Badge>
          )}
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <span>Searching</span>
          </div>
        )}
      </div>
    </div>
  );
});

OptimizedExerciseSearchBar.displayName = 'OptimizedExerciseSearchBar';
