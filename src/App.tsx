import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { WeightUnitProvider } from '@/context/WeightUnitContext';
import { ThemeProvider } from '@/components/theme-provider';
import { MainLayout } from '@/components/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { ExerciseLibraryPage } from '@/pages/ExerciseLibraryPage';
import { WorkoutDetailsPage } from '@/pages/WorkoutDetailsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { OverviewPage } from '@/pages/Overview';
import TrainingSessionPage from '@/pages/TrainingSession';
import { WorkoutBanner } from '@/components/training/WorkoutBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AuthProvider>
            <WeightUnitProvider>
              <Router>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/exercises" element={<ExerciseLibraryPage />} />
                    <Route path="/overview" element={<OverviewPage />} />
                    <Route path="/workout/:id" element={<WorkoutDetailsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/training-session" element={<TrainingSessionPage />} />
                  </Routes>
                  <WorkoutBanner />
                </MainLayout>
              </Router>
            </WeightUnitProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
