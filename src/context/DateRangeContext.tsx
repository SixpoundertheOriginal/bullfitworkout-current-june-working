
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { startOfWeek, endOfWeek } from 'date-fns';

interface DateRangeContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

const DateRangeContext = createContext<DateRangeContextType | undefined>(undefined);

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initialization to prevent Date object recreation on every render
  const [dateRange, setDateRangeState] = useState<DateRange>(() => {
    const now = new Date();
    return {
      from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
      to: endOfWeek(now, { weekStartsOn: 1 }), // Sunday
    };
  });

  // Memoize the setDateRange function to ensure stable reference
  const setDateRange = useCallback((range: DateRange | undefined) => {
    setDateRangeState(range);
  }, []);

  // CRITICAL FIX: Memoize the context value with stable dependencies
  const contextValue = useMemo(() => ({
    dateRange,
    setDateRange,
  }), [dateRange, setDateRange]);

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
  return context;
}
