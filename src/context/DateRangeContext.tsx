
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { startOfWeek, endOfWeek, subDays, subWeeks, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface DateRangeContextType {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  comparisonRange: DateRange | undefined;
  setComparisonRange: (range: DateRange | undefined) => void;
  enableComparison: boolean;
  setEnableComparison: (enabled: boolean) => void;
  presetRanges: DateRangePreset[];
  applyPreset: (preset: DateRangePreset) => void;
}

interface DateRangePreset {
  label: string;
  value: () => DateRange;
  comparison?: () => DateRange;
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

  const [comparisonRange, setComparisonRange] = useState<DateRange | undefined>();
  const [enableComparison, setEnableComparison] = useState(false);

  // Define preset ranges with comparison periods
  const presetRanges = useMemo<DateRangePreset[]>(() => {
    const now = new Date();
    
    return [
      {
        label: 'Today',
        value: () => ({ from: now, to: now }),
        comparison: () => {
          const yesterday = subDays(now, 1);
          return { from: yesterday, to: yesterday };
        }
      },
      {
        label: 'This Week',
        value: () => ({
          from: startOfWeek(now, { weekStartsOn: 1 }),
          to: endOfWeek(now, { weekStartsOn: 1 })
        }),
        comparison: () => {
          const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
          const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
          return { from: lastWeekStart, to: lastWeekEnd };
        }
      },
      {
        label: 'Last 7 Days',
        value: () => ({ from: subDays(now, 6), to: now }),
        comparison: () => ({ from: subDays(now, 13), to: subDays(now, 7) })
      },
      {
        label: 'Last 30 Days',
        value: () => ({ from: subDays(now, 29), to: now }),
        comparison: () => ({ from: subDays(now, 59), to: subDays(now, 30) })
      },
      {
        label: 'This Month',
        value: () => ({ from: startOfMonth(now), to: endOfMonth(now) }),
        comparison: () => {
          const lastMonth = subMonths(now, 1);
          return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
        }
      },
      {
        label: 'Year to Date',
        value: () => ({ from: startOfYear(now), to: now }),
        comparison: () => {
          const lastYear = new Date(now.getFullYear() - 1, 0, 1);
          return { from: lastYear, to: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()) };
        }
      },
      {
        label: 'All Time',
        value: () => ({ from: new Date(2020, 0, 1), to: now })
      }
    ];
  }, []);

  // Memoize the setDateRange function to ensure stable reference
  const setDateRange = useCallback((range: DateRange | undefined) => {
    setDateRangeState(range);
  }, []);

  const applyPreset = useCallback((preset: DateRangePreset) => {
    const range = preset.value();
    setDateRange(range);
    
    if (enableComparison && preset.comparison) {
      setComparisonRange(preset.comparison());
    }
  }, [enableComparison, setDateRange]);

  // CRITICAL FIX: Memoize the context value with stable dependencies
  const contextValue = useMemo(() => ({
    dateRange,
    setDateRange,
    comparisonRange,
    setComparisonRange,
    enableComparison,
    setEnableComparison,
    presetRanges,
    applyPreset,
  }), [dateRange, setDateRange, comparisonRange, enableComparison, presetRanges, applyPreset]);

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
