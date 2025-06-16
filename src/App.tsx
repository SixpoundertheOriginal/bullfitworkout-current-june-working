
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from '@/components/layouts/MainLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'; 
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { WorkoutNavigationContextProvider } from '@/context/WorkoutNavigationContext';
import { GlobalProviders } from '@/providers/GlobalProviders';

// Lazy load all pages for enterprise-grade performance optimization.
const IndexPage = lazy(() => import('@/pages/Index'));
const AuthPage = lazy(() => import('@/pages/AuthPage'));
const ExerciseLibraryPage = lazy(() => import('@/pages/ExerciseLibraryPage'));
const AllExercisesPage = lazy(() => import('@/pages/AllExercisesPage'));
const OverviewPage = lazy(() => import('@/pages/Overview'));
const WorkoutDetailsPage = lazy(() => import('@/pages/WorkoutDetailsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const TrainingSessionPage = lazy(() => import('@/pages/TrainingSession'));

// A reusable loader for our suspense fallback.
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[80vh] w-full">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <GlobalProviders>
      <ErrorBoundary>
        <Router>
          <WorkoutNavigationContextProvider>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<IndexPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/exercises" element={<ExerciseLibraryPage />} />
                  <Route 
                    path="/all-exercises" 
                    element={
                      <ProtectedRoute>
                        <AllExercisesPage />
                      </ProtectedRoute>
                    } 
                  />
                  
                  <Route 
                    path="/overview" 
                    element={
                      <ProtectedRoute>
                        <OverviewPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/workout/:workoutId" 
                    element={
                      <ProtectedRoute>
                        <WorkoutDetailsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/training-session" 
                    element={
                      <ProtectedRoute>
                        <TrainingSessionPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </Suspense>
            </MainLayout>
          </WorkoutNavigationContextProvider>
          <Toaster />
        </Router>
      </ErrorBoundary>
    </GlobalProviders>
  );
}

export default App;
