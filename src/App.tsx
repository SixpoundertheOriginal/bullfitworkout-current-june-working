
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// QueryClient and QueryClientProvider are now handled in AppProviders
import { Toaster } from "@/components/ui/toaster";
// AuthProvider, WeightUnitProvider, WorkoutNavigationContextProvider are now handled in AppProviders
// ThemeProvider is now handled in AppProviders
import { AppProviders } from '@/providers/AppProviders'; // Import the new AppProviders
import { MainLayout } from '@/components/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { ExerciseLibraryPage } from '@/pages/ExerciseLibraryPage';
import WorkoutDetailsPage from '@/pages/WorkoutDetailsPage'; // Corrected path
import { ProfilePage } from '@/pages/ProfilePage';
import { OverviewPage } from '@/pages/Overview';
import TrainingSessionPage from '@/pages/TrainingSession';
import { WorkoutBanner } from '@/components/training/WorkoutBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// queryClient configuration is moved to AppProviders.tsx

function App() {
  return (
    <ErrorBoundary>
      <AppProviders> {/* Use the new AppProviders component */}
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/exercises" element={<ExerciseLibraryPage />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/workout/:id" element={<WorkoutDetailsPage />} /> {/* Ensured path is correct, assuming it was src/pages/WorkoutDetailsPage.tsx */}
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/training-session" element={<TrainingSessionPage />} />
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
