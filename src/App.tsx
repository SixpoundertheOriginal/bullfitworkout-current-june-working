
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
// AppProviders import is removed as GlobalProviders handles this in main.tsx
import { MainLayout } from '@/components/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { ExerciseLibraryPage } from '@/pages/ExerciseLibraryPage';
import WorkoutDetailsPage from '@/pages/WorkoutDetailsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { OverviewPage } from '@/pages/Overview';
import TrainingSessionPage from '@/pages/TrainingSession';
import AuthPage from '@/pages/AuthPage'; 
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'; 
// WorkoutBanner is part of MainLayout, so no direct provider change needed here
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { WorkoutNavigationContextProvider } from '@/context/WorkoutNavigationContext';

function App() {
  return (
    <ErrorBoundary>
      {/* AppProviders removed from here */}
      <Router>
        <WorkoutNavigationContextProvider>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/exercises" element={<ExerciseLibraryPage />} />
              
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
          </MainLayout>
        </WorkoutNavigationContextProvider>
      </Router>
      {/* AppProviders removed from here */}
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
