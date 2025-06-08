
import React, { useState, useCallback, useEffect } from 'react';
import { Exercise } from '@/types/exercise';
import { useSearchExercises, SearchFilters } from '@/hooks/useSearchExercises';
import { ExerciseSearchBar } from '@/components/exercises/ExerciseSearchBar';
import { ExerciseTabsContent } from '@/components/exercises/ExerciseTabsContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { History, TrendingUp } from 'lucide-react';

interface ExerciseSearchInterfaceProps {
  onSelectExercise?: (exercise: Exercise) => void;
  onAddExercise?: (exercise: Exercise) => void;
  variant?: 'library-manage' | 'workout-add';
  className?: string;
}

/**
 * Enterprise search interface with intelligent caching and suggestions
 * Optimized for real-time search across millions of exercises
 */
export const ExerciseSearchInterface: React.FC<ExerciseSearchInterfaceProps> = React.memo(({
  onSelectExercise,
  onAddExercise,
  variant = 'library-manage',
  className
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('results');

  const { 
    results, 
    isSearching, 
    error, 
    hasQuery, 
    resultsCount,
    prefetchPopularSearches
  } = useSearchExercises(query, filters);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('exercise-search-history');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved).slice(0, 10)); // Limit to 10 items
      } catch (e) {
        console.warn('Failed to load search history');
      }
    }
  }, []);

  // Save search to history
  const saveToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setSearchHistory(prev => {
      const updated = [searchQuery, ...prev.filter(h => h !== searchQuery)].slice(0, 10);
      localStorage.setItem('exercise-search-history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handle search with history saving
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      saveToHistory(searchQuery.trim());
    }
  }, [saveToHistory]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  // Popular search suggestions
  const popularSearches = ['chest', 'legs', 'shoulders', 'back', 'arms', 'core'];

  // Prefetch popular searches on mount
  useEffect(() => {
    prefetchPopularSearches();
  }, [prefetchPopularSearches]);

  const handleSelectExercise = useCallback((exercise: Exercise) => {
    onSelectExercise?.(exercise);
    onAddExercise?.(exercise);
  }, [onSelectExercise, onAddExercise]);

  const safeResults = results && Array.isArray(results) ? results : [];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Search Bar */}
      <ExerciseSearchBar
        searchTerm={query}
        onSearchChange={handleSearch}
        isLoading={isSearching}
        totalExercises={resultsCount}
        className="mb-4"
      />

      {/* Search Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="results">
            Results {hasQuery && `(${resultsCount})`}
          </TabsTrigger>
          <TabsTrigger value="history">
            <History size={16} className="mr-1" />
            History
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp size={16} className="mr-1" />
            Popular
          </TabsTrigger>
        </TabsList>

        {/* Search Results */}
        <TabsContent value="results" className="flex-1 overflow-hidden">
          {error ? (
            <div className="text-center py-8 text-red-400">
              Search temporarily unavailable. Please try again.
            </div>
          ) : !hasQuery ? (
            <div className="text-center py-8 text-gray-400">
              <p>Enter a search term to find exercises</p>
            </div>
          ) : (
            <ExerciseTabsContent
              exercises={safeResults}
              isLoading={isSearching}
              isSearching={isSearching}
              variant={variant}
              useVirtualization={safeResults.length > 50}
              onAdd={handleSelectExercise}
              isOnline={true}
            />
          )}
        </TabsContent>

        {/* Search History */}
        <TabsContent value="history" className="flex-1 overflow-auto">
          {searchHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No search history yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchHistory.map((historyQuery, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => handleSearch(historyQuery)}
                >
                  <History size={16} className="mr-2 text-gray-500" />
                  <span className="truncate">{historyQuery}</span>
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchHistory([]);
                  localStorage.removeItem('exercise-search-history');
                }}
                className="w-full mt-4"
              >
                Clear History
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Popular Searches */}
        <TabsContent value="trending" className="flex-1 overflow-auto">
          <div className="space-y-2">
            <p className="text-sm text-gray-400 mb-4">Popular exercise searches</p>
            {popularSearches.map((popularQuery) => (
              <Button
                key={popularQuery}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => handleSearch(popularQuery)}
              >
                <TrendingUp size={16} className="mr-2 text-gray-500" />
                <span className="capitalize">{popularQuery}</span>
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});

ExerciseSearchInterface.displayName = 'ExerciseSearchInterface';
