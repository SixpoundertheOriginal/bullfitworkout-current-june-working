
import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EnhancedSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  isSearching?: boolean;
  fromCache?: boolean;
  placeholder?: string;
  className?: string;
  showCacheIndicator?: boolean;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  query,
  onQueryChange,
  isSearching = false,
  fromCache = false,
  placeholder = "Search exercises...",
  className = "",
  showCacheIndicator = true
}) => {
  const [localQuery, setLocalQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Sync local query with prop
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setLocalQuery(newQuery);

    // Debounced update to parent
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      onQueryChange(newQuery);
    }, 300);
  };

  const handleClear = () => {
    setLocalQuery('');
    onQueryChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          className="pl-9 pr-24 bg-gray-800 border-gray-700 focus:border-purple-500 transition-colors"
          value={localQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        
        <div className="absolute right-2 top-1.5 flex items-center gap-1">
          {/* Loading indicator */}
          {isSearching && (
            <div className="flex items-center justify-center w-7 h-7">
              <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            </div>
          )}
          
          {/* Cache indicator */}
          {showCacheIndicator && fromCache && !isSearching && (
            <Badge variant="outline" className="text-xs bg-green-900/30 border-green-500/30 text-green-400">
              Cached
            </Badge>
          )}
          
          {/* Clear button */}
          {localQuery && (
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
    </div>
  );
};
