
import React, { useMemo } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WeightUnitContextProvider } from "@/context/WeightUnitContext";
import { RouterProvider } from "./context/RouterProvider";
import { DateRangeProvider } from "@/context/DateRangeContext";
import { WorkoutNavigationContextProvider } from "./context/WorkoutNavigationContext";
import { LayoutProvider } from "./context/LayoutContext";
import { ExerciseFiltersProvider } from "./context/ExerciseFilterContext";

// Create the query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppProviders>
            <TooltipProvider>
              <Toaster />
              <RouterProvider />
            </TooltipProvider>
          </AppProviders>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

// Extract providers to a separate component for better organization
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WeightUnitContextProvider>
        <DateRangeProvider>
          <WorkoutNavigationContextProvider>
            <LayoutProvider>
              <ExerciseFiltersProvider>
                {children}
              </ExerciseFiltersProvider>
            </LayoutProvider>
          </WorkoutNavigationContextProvider>
        </DateRangeProvider>
      </WeightUnitContextProvider>
    </AuthProvider>
  );
}

export default App;
