
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2, Wifi, WifiOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCleanup } from '@/hooks/useCleanup';
import { useNetworkStatus } from '@/utils/serviceWorker';

interface ExerciseSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoading?: boolean;
  fromCache?: boolean;
  isIndexed?: boolean;
  totalExercises?: number;
  placeholder?: string;
  className?: string;
}

export const ExerciseSearchBar = React.memo<ExerciseSearchBarProps>(({
  searchTerm,
  onSearchChange,
  isLoading = false,
  fromCache = false,
  isIndexed = false,
  totalExercises = 0,
  placeholder = "Search exercises...",
  className = ""
}) => {
  const [localTerm, setLocalTerm] = useState(searchTerm);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const isOnline = useNetworkStatus();
  const { registerCleanup } = useCleanup('exercise-search-bar');

  // Sync local term with prop
  useEffect(() => {
    setLocalTerm(searchTerm);
  }, [searchTerm]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = e.target.value;
    setLocalTerm(newTerm);

    // Debounced update to parent
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      onSearchChange(newTerm);
    }, 300);
  }, [onSearchChange]);

  const handleClear = useCallback(() => {
    setLocalTerm('');
    onSearchChange('');
    inputRef.current?.focus();
  }, [onSearchChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  }, [handleClear]);

  // Register cleanup for debounce timeout
  useEffect(() => {
    registerCleanup(() => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    });
  }, [registerCleanup]);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          className="pl-9 pr-24 bg-gray-800 border-gray-700 focus:border-purple-500 transition-colors"
          value={localTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        
        <div className="absolute right-2 top-1.5 flex items-center gap-1">
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center justify-center w-7 h-7">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            </div>
          )}
          
          {/* Cache indicator */}
          {fromCache && !isLoading && (
            <Badge variant="outline" className="text-xs bg-green-900/30 border-green-500/30 text-green-400">
              Cached
            </Badge>
          )}
          
          {/* Clear button */}
          {localTerm && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 hover:bg-gray-700"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search status indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isIndexed && (
            <Badge variant="outline" className="text-xs bg-green-900/30 border-green-500/30 text-green-400">
              Search Ready ({totalExercises} exercises indexed)
            </Badge>
          )}
          {fromCache && (
            <Badge variant="outline" className="text-xs bg-blue-900/30 border-blue-500/30 text-blue-400">
              Cached Results
            </Badge>
          )}
          {!isOnline && (
            <Badge variant="outline" className="text-xs bg-amber-900/30 border-amber-500/30 text-amber-400">
              Offline Mode
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-400">
          {isOnline ? (
            <Wifi size={12} className="text-green-400" />
          ) : (
            <WifiOff size={12} className="text-amber-400" />
          )}
        </div>
      </div>
    </div>
  );
});

ExerciseSearchBar.displayName = 'ExerciseSearchBar';
