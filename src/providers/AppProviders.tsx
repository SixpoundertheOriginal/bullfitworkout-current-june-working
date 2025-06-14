
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { WeightUnitProvider } from '@/context/WeightUnitContext';
import { WorkoutNavigationContextProvider } from '@/context/WorkoutNavigationContext';
import { DateRangeProvider } from '@/context/DateRangeContext'; // Added DateRangeProvider

interface AppProvidersProps {
  children: React.ReactNode;
}

// Configure QueryClient (same as in App.tsx)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <WeightUnitProvider>
            <DateRangeProvider> {/* Added DateRangeProvider here */}
              <WorkoutNavigationContextProvider>
                {children}
              </WorkoutNavigationContextProvider>
            </DateRangeProvider>
          </WeightUnitProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
