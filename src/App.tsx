
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WeightUnitContextProvider } from "@/context/WeightUnitContext";
import { RouterProvider } from "./context/RouterProvider";
import { DateRangeProvider } from "@/context/DateRangeContext";
import { WorkoutNavigationContextProvider } from "./context/WorkoutNavigationContext";
import { WorkoutBanner } from './components/training/WorkoutBanner';

// Create the query client outside of the component
const queryClient = new QueryClient();

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <WeightUnitContextProvider>
              <DateRangeProvider>
                <WorkoutNavigationContextProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <RouterProvider />
                    <WorkoutBanner />
                  </TooltipProvider>
                </WorkoutNavigationContextProvider>
              </DateRangeProvider>
            </WeightUnitContextProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
