
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { DateRangeProvider } from "@/context/DateRangeContext";
import { WeightUnitProvider } from "@/context/WeightUnitContext";
import { WorkoutDataProvider } from "@/context/WorkoutDataProvider";
import { WorkoutNavigationContextProvider } from "@/context/WorkoutNavigationContext";
import { WorkoutStatsProvider } from "@/context/WorkoutStatsProvider";
import { LayoutProvider } from "@/context/LayoutContext";
import { RealtimeSubscriptionProvider } from "@/context/RealtimeSubscriptionProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LayoutWrapper } from "@/components/layouts/LayoutWrapper";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import "./App.css";
import "./styles/safe-area.css";

const Overview = lazy(() => import("@/pages/Overview"));
const Profile = lazy(() => import("@/pages/ProfilePage"));
const AllExercises = lazy(() => import("@/pages/AllExercisesPage"));
const TrainingSession = lazy(() => import("@/pages/TrainingSession"));
const WorkoutDetails = lazy(() => import("@/pages/WorkoutDetailsPage"));
const DesignSystemPage = lazy(() => import("@/pages/DesignSystemPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  console.log('[App] Rendering application');

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <RealtimeSubscriptionProvider>
                <DateRangeProvider>
                  <WeightUnitProvider>
                    <WorkoutStatsProvider>
                      <WorkoutDataProvider>
                        <WorkoutNavigationContextProvider>
                          <LayoutProvider>
                            <div className="min-h-screen bg-background font-sans antialiased">
                              <Suspense fallback={
                                <div className="flex items-center justify-center min-h-screen">
                                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                                </div>
                              }>
                                <Routes>
                                  <Route path="/" element={
                                    <LayoutWrapper>
                                      <Index />
                                    </LayoutWrapper>
                                  } />
                                  <Route path="/auth" element={<Auth />} />
                                  <Route path="/overview" element={
                                    <ProtectedRoute>
                                      <LayoutWrapper>
                                        <Overview />
                                      </LayoutWrapper>
                                    </ProtectedRoute>
                                  } />
                                  <Route path="/profile" element={
                                    <ProtectedRoute>
                                      <LayoutWrapper>
                                        <Profile />
                                      </LayoutWrapper>
                                    </ProtectedRoute>
                                  } />
                                  <Route path="/all-exercises" element={
                                    <ProtectedRoute allowPublic={true}>
                                      <LayoutWrapper>
                                        <AllExercises />
                                      </LayoutWrapper>
                                    </ProtectedRoute>
                                  } />
                                  <Route path="/training-session" element={
                                    <ProtectedRoute>
                                      <TrainingSession />
                                    </ProtectedRoute>
                                  } />
                                  <Route path="/workout/:id" element={
                                    <ProtectedRoute>
                                      <LayoutWrapper>
                                        <WorkoutDetails />
                                      </LayoutWrapper>
                                    </ProtectedRoute>
                                  } />
                                  <Route path="/design-system" element={
                                    <LayoutWrapper>
                                      <DesignSystemPage />
                                    </LayoutWrapper>
                                  } />
                                </Routes>
                              </Suspense>
                              <Toaster />
                              <Sonner />
                            </div>
                          </LayoutProvider>
                        </WorkoutNavigationContextProvider>
                      </WorkoutDataProvider>
                    </WorkoutStatsProvider>
                  </WeightUnitProvider>
                </DateRangeProvider>
              </RealtimeSubscriptionProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
