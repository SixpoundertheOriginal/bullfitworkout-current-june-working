
import React, { createContext, useContext, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { startOfWeek, endOfWeek } from 'date-fns';

interface DateRangeContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

// Performance tracking for development
let renderCount = 0;
let contextValueCreations = 0;

// Custom hook to debug dependency changes
function useDependencyDebugger(deps: any[], name: string) {
  const prevDeps = useRef<any[]>();
  
  useEffect(() => {
    if (prevDeps.current) {
      const changes = deps.map((dep, index) => {
        const prevDep = prevDeps.current![index];
        const hasChanged = dep !== prevDep;
        
        if (hasChanged) {
          console.log(`[${name}] Dependency ${index} changed:`, {
            previous: prevDep,
            current: dep,
            type: typeof dep,
            isObject: typeof dep === 'object' && dep !== null,
            isFunction: typeof dep === 'function'
          });
        }
        
        return hasChanged;
      });
      
      if (changes.some(Boolean)) {
        console.log(`[${name}] Dependencies that changed: ${changes.map((changed, i) => changed ? i : null).filter(x => x !== null).join(', ')}`);
      }
    }
    
    prevDeps.current = deps;
  });
}

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initialization to prevent Date object recreation on every render
  const [dateRange, setDateRangeState] = useState<DateRange>(() => {
    const now = new Date();
    const initialRange = {
      from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
      to: endOfWeek(now, { weekStartsOn: 1 }), // Sunday
    };
    
    console.log('[DateRangeProvider] Initial range created:', {
      from: initialRange.from.toISOString(),
      to: initialRange.to.toISOString()
    });
    
    return initialRange;
  });

  // Memoize the setDateRange function to ensure stable reference
  const setDateRange = useCallback((range: DateRange | undefined) => {
    console.log('[DateRangeProvider] setDateRange called with:', {
      from: range?.from?.toISOString(),
      to: range?.to?.toISOString()
    });
    setDateRangeState(range);
  }, []); // Empty dependency array - function never changes

  // Debug what's causing the context value to recreate
  useDependencyDebugger([dateRange, setDateRange], 'DateRangeProvider context value');

  // CRITICAL FIX: Memoize the context value with stable dependencies
  const contextValue = useMemo(() => {
    contextValueCreations++;
    
    // Only log context value creation, not on every render
    console.log(`[DateRangeProvider] Context value created #${contextValueCreations}`, {
      dateRangeFrom: dateRange?.from?.toISOString(),
      dateRangeTo: dateRange?.to?.toISOString(),
      setDateRangeRef: typeof setDateRange,
      renderCount,
      contextValueCreations
    });
    
    return {
      dateRange,
      setDateRange,
    };
  }, [dateRange, setDateRange]); // setDateRange is now stable thanks to useCallback

  // Performance tracking in useEffect to avoid render side effects
  useEffect(() => {
    renderCount++;
    console.log(`[DateRangeProvider] Render #${renderCount}`);
  });

  // Log performance metrics periodically, not on every render
  useEffect(() => {
    const efficiency = contextValueCreations > 0 ? ((contextValueCreations / renderCount) * 100).toFixed(1) : '0.0';
    
    console.log(`[DateRangeProvider] Performance Metrics:`, {
      totalRenders: renderCount,
      contextValueCreations,
      efficiency: `${efficiency}%`,
      explanation: contextValueCreations < renderCount ? 
        'OPTIMIZED: Context value memoized successfully' : 
        'ISSUE: Context value recreating on every render',
      optimization: contextValueCreations === 1 ? 'PERFECT: Context value created only once' : 
                   contextValueCreations < renderCount ? 'GOOD: Some optimization working' :
                   'BAD: No optimization - context recreates every render'
    });
  });

  return (
    <DateRangeContext.Provider value={contextValue}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  
  // Reduce logging frequency - only log when context actually changes
  const prevContextRef = useRef(context);
  useEffect(() => {
    if (prevContextRef.current !== context) {
      console.log('[useDateRange] Context changed:', {
        hasDateRange: !!context.dateRange,
        dateRangeFrom: context.dateRange?.from?.toISOString(),
        dateRangeTo: context.dateRange?.to?.toISOString(),
        setDateRangeType: typeof context.setDateRange
      });
      prevContextRef.current = context;
    }
  });
  
  return context;
}
