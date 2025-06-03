
import React, { createContext, useContext, useState, useMemo, useRef, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays, startOfWeek, endOfWeek } from 'date-fns';

interface DateRangeContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

// Performance tracking for development
let renderCount = 0;
let contextValueCreations = 0;

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  // Track renders in development
  renderCount++;
  console.log(`[DateRangeProvider] Render #${renderCount}`);
  
  // Initialize with the current week (Monday to Sunday)
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
    to: endOfWeek(now, { weekStartsOn: 1 }), // Sunday
  });

  // Track when setDateRange function is recreated
  const setDateRangeRef = useRef(setDateRange);
  useEffect(() => {
    if (setDateRangeRef.current !== setDateRange) {
      console.log('[DateRangeProvider] setDateRange function recreated');
      setDateRangeRef.current = setDateRange;
    }
  });

  // CRITICAL FIX: Memoize the context value to prevent unnecessary re-renders
  // This is the key optimization that prevents infinite loops
  const contextValue = useMemo(() => {
    contextValueCreations++;
    console.log(`[DateRangeProvider] Context value created #${contextValueCreations}`, {
      dateRange,
      renderCount,
      contextValueCreations
    });
    
    return {
      dateRange,
      setDateRange,
    };
  }, [dateRange]); // Only recreate when dateRange actually changes

  // Log performance metrics
  useEffect(() => {
    console.log(`[DateRangeProvider] Performance Metrics:`, {
      totalRenders: renderCount,
      contextValueCreations,
      efficiency: `${((contextValueCreations / renderCount) * 100).toFixed(1)}%`,
      explanation: contextValueCreations < renderCount ? 
        'OPTIMIZED: Context value memoized successfully' : 
        'ISSUE: Context value recreating on every render'
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
  
  // Track hook usage for performance monitoring
  console.log('[useDateRange] Hook called, context value:', {
    hasDateRange: !!context.dateRange,
    dateRangeFrom: context.dateRange?.from?.toISOString(),
    dateRangeTo: context.dateRange?.to?.toISOString()
  });
  
  return context;
}
