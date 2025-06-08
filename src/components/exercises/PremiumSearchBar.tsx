
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Filter, Sparkles, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PremiumSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  totalExercises: number;
  filteredCount: number;
  onFiltersToggle?: () => void;
  hasActiveFilters?: boolean;
  isLoading?: boolean;
  className?: string;
}

const popularSearches = [
  'Push ups', 'Squats', 'Deadlift', 'Bench press', 'Pull ups', 'Rows'
];

const trendingSearches = [
  'Hip thrusts', 'Bulgarian split squats', 'Face pulls', 'Lateral raises'
];

export const PremiumSearchBar: React.FC<PremiumSearchBarProps> = ({
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
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external changes with local state
  useEffect(() => {
    if (searchTerm !== localTerm) {
      setLocalTerm(searchTerm);
    }
  }, [searchTerm]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalTerm(newValue);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new debounced timeout
    debounceTimeoutRef.current = setTimeout(() => {
      onSearchChange(newValue);
    }, 300);
  }, [onSearchChange]);

  const handleClear = useCallback(() => {
    setLocalTerm('');
    onSearchChange('');
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    inputRef.current?.focus();
  }, [onSearchChange]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setLocalTerm(suggestion);
    onSearchChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  }, [onSearchChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setShowSuggestions(!localTerm);
  }, [localTerm]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const resultText = React.useMemo(() => {
    if (isLoading) return 'Searching...';
    if (searchTerm || hasActiveFilters) {
      return `${filteredCount} of ${totalExercises} exercises`;
    }
    return `${totalExercises} exercises available`;
  }, [isLoading, searchTerm, hasActiveFilters, filteredCount, totalExercises]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Search Input */}
      <div className="relative">
        <div className={cn(
          "relative rounded-lg border bg-gray-900/50 backdrop-blur-sm transition-all duration-300",
          isFocused 
            ? "border-purple-500 ring-2 ring-purple-500/20 bg-gray-900/80" 
            : "border-gray-700 hover:border-gray-600"
        )}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
          
          <Input
            ref={inputRef}
            placeholder="Search exercises, muscle groups, equipment..."
            className={cn(
              "pl-12 pr-20 h-14 bg-transparent border-0 text-white placeholder:text-gray-500",
              "focus:ring-0 focus:border-0 text-lg font-medium"
            )}
            value={localTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoComplete="off"
            spellCheck={false}
          />
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {onFiltersToggle && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-full transition-all duration-200",
                  hasActiveFilters 
                    ? "text-purple-400 bg-purple-400/20 hover:bg-purple-400/30" 
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-700/50"
                )}
                onClick={onFiltersToggle}
                type="button"
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
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && !localTerm && (
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-gray-900/95 backdrop-blur-sm border-gray-700 animate-in fade-in duration-200">
            <CardContent className="p-4">
              <div className="space-y-4">
                {/* Popular Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-300">Popular</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((search) => (
                      <Button
                        key={search}
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                        onClick={() => handleSuggestionClick(search)}
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Trending Searches */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-gray-300">Trending</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {trendingSearches.map((search) => (
                      <Button
                        key={search}
                        variant="outline"
                        size="sm"
                        className="h-7 px-3 text-xs bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20 hover:text-green-300"
                        onClick={() => handleSuggestionClick(search)}
                      >
                        {search}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className={cn(
              "text-sm px-4 py-2 font-medium transition-all duration-200",
              filteredCount === totalExercises
                ? "bg-gray-900/50 border-gray-700 text-gray-300"
                : "bg-purple-900/30 border-purple-500/40 text-purple-300"
            )}
          >
            {resultText}
          </Badge>
          
          {hasActiveFilters && (
            <Badge 
              variant="outline" 
              className="text-sm bg-blue-900/30 border-blue-500/40 text-blue-300 px-3 py-1"
            >
              <Filter className="w-3 h-3 mr-1.5" />
              Filtered
            </Badge>
          )}
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            <span>Searching</span>
          </div>
        )}
      </div>
    </div>
  );
};
