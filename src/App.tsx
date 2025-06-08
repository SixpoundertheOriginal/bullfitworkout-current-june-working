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
import { DevOnly } from "@/components/debug/DevOnly";
import { serviceWorkerManager } from "@/utils/serviceWorker";
import { cleanupManager } from "@/services/cleanupManager";

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
  React.useEffect(() => {
    // Register ServiceWorker for offline support and caching
    serviceWorkerManager.register().then((registered) => {
      if (registered) {
        console.log('ServiceWorker registered for offline support');
      }
    });

    // Listen for ServiceWorker updates
    const handleSwUpdate = () => {
      console.log('ServiceWorker update available');
      // Could show a toast or banner to user
    };

    // Listen for route changes to trigger cleanup
    const handleRouteChange = () => {
      // Clean up old scopes when navigating
      const stats = cleanupManager.getStats();
      const oldScopes = stats.scopeDetails.filter(scope => scope.age > 60000); // 1 minute
      oldScopes.forEach(scope => cleanupManager.cleanupScope(scope.id));
    };

    window.addEventListener('sw-update-available', handleSwUpdate);
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('sw-update-available', handleSwUpdate);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

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
