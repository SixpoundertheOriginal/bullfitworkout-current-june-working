
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AppProviders } from '@/providers/AppProviders';
import { MainLayout } from '@/components/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { ExerciseLibraryPage } from '@/pages/ExerciseLibraryPage';
import WorkoutDetailsPage from '@/pages/WorkoutDetailsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { OverviewPage } from '@/pages/Overview';
import TrainingSessionPage from '@/pages/TrainingSession';
import AuthPage from '@/pages/AuthPage'; // Import the new AuthPage
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'; // Import ProtectedRoute
import { WorkoutBanner } from '@/components/training/WorkoutBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} /> {/* New Auth Route */}
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
                path="/workout/:workoutId" // Ensure param name matches WorkoutDetailsPage
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
            <WorkoutBanner />
          </MainLayout>
        </Router>
      </AppProviders>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
