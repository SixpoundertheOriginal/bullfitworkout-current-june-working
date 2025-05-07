
import React, { createContext, useContext, useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { startOfWeek, endOfWeek } from 'date-fns';
import { createContext as createContextUtil } from '@/utils/createContext';

interface DateRangeContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}

// Switch to the utility function pattern
const [DateRangeProvider, useDateRange] = createContextUtil<DateRangeContextType>();

export { useDateRange };

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with the current week (Monday to Sunday)
  const now = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
    to: endOfWeek(now, { weekStartsOn: 1 }), // Sunday
  });
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ 
    dateRange, 
    setDateRange 
  }), [dateRange]);

  return (
    <DateRangeProvider value={contextValue}>
      {children}
    </DateRangeProvider>
  );
}
