
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as ShadcnThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { WeightUnitProvider } from '@/context/WeightUnitContext';
import { DateRangeProvider } from '@/context/DateRangeContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { WorkoutStatsProvider } from '@/context/WorkoutStatsProvider';

interface GlobalProvidersProps {
  children: React.ReactNode;
}

// Configure QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

export const GlobalProviders: React.FC<GlobalProvidersProps> = React.memo(({ children }) => {
  console.log('GlobalProviders rendering'); // For debugging purposes
  return (
    <QueryClientProvider client={queryClient}>
      <ShadcnThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <AuthProvider>
            <WeightUnitProvider>
              <DateRangeProvider>
                <WorkoutStatsProvider>
                  {children}
                </WorkoutStatsProvider>
              </DateRangeProvider>
            </WeightUnitProvider>
          </AuthProvider>
        </TooltipProvider>
      </ShadcnThemeProvider>
    </QueryClientProvider>
  );
});

GlobalProviders.displayName = 'GlobalProviders';
