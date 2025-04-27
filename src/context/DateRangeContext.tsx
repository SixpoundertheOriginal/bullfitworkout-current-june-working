
import React, { createContext, useContext, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { startOfWeek, endOfWeek, subDays, subWeeks, subMonths, addDays } from 'date-fns';

export type TimeRange = 'this-week' | 'previous-week' | 'last-30-days' | 'last-90-days' | 'custom';

interface DateRangeState {
  timeRange: TimeRange;
  customDateRange: DateRange | undefined;
  dateRange: { start: Date; end: Date };
  setTimeRange: (range: TimeRange) => void;
  setCustomDateRange: (range: DateRange | undefined) => void;
  getFormattedDateRangeText: () => string;
}

const DateRangeContext = createContext<DateRangeState | undefined>(undefined);

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [timeRange, setTimeRange] = useState<TimeRange>('this-week');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

  // Calculate the actual date range based on selected timeframe
  const getDateRange = (): { start: Date; end: Date } => {
    const today = new Date();
    let start: Date;
    let end: Date = today;
    
    switch(timeRange) {
      case 'previous-week':
        // Previous full week (Monday to Sunday)
        end = subDays(startOfWeek(today, { weekStartsOn: 1 }), 1); // Sunday before this week
        start = subDays(end, 6); // Monday of previous week
        break;
      case 'last-30-days':
        start = subDays(today, 29); // 30 days including today
        break;
      case 'last-90-days':
        start = subDays(today, 89); // 90 days including today
        break;
      case 'custom':
        if (customDateRange?.from && customDateRange?.to) {
          return {
            start: customDateRange.from,
            end: customDateRange.to
          };
        }
        // Fallback to current week if no custom range is set
        start = startOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'this-week':
      default:
        // Current week (Monday to today)
        start = startOfWeek(today, { weekStartsOn: 1 });
        break;
    }
    
    return { start, end };
  };

  // Format the date range for display
  const getFormattedDateRangeText = () => {
    const { start, end } = getDateRange();
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    if (timeRange === 'this-week') {
      return `${formatDate(start)} - ${formatDate(end)} (This Week)`;
    } else if (timeRange === 'previous-week') {
      return `${formatDate(start)} - ${formatDate(end)} (Previous Week)`;
    } else if (timeRange === 'last-30-days') {
      return `Last 30 Days`;
    } else if (timeRange === 'last-90-days') {
      return `Last 90 Days`;
    } else {
      return `${formatDate(start)} - ${formatDate(end)} (Custom)`;
    }
  };

  return (
    <DateRangeContext.Provider
      value={{
        timeRange,
        setTimeRange,
        customDateRange, 
        setCustomDateRange,
        dateRange: getDateRange(),
        getFormattedDateRangeText
      }}
    >
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateRangeProvider');
  }
  return context;
}
