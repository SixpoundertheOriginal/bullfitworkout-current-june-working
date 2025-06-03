
import React from 'react';
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
import { WorkoutStatsProvider } from "@/context/WorkoutStatsProvider";

// Create the query client with optimized settings for enterprise performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    }
  }
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <WeightUnitContextProvider>
              <DateRangeProvider>
                <WorkoutStatsProvider>
                  <WorkoutNavigationContextProvider>
                    <LayoutProvider>
                      <TooltipProvider>
                        <Toaster />
                        <RouterProvider />
                      </TooltipProvider>
                    </LayoutProvider>
                  </WorkoutNavigationContextProvider>
                </WorkoutStatsProvider>
              </DateRangeProvider>
            </WeightUnitContextProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
