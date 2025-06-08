
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load pages for better performance
const Index = lazy(() => import('@/pages/Index'));
const Overview = lazy(() => import('@/pages/Overview'));
const TrainingSession = lazy(() => import('@/pages/TrainingSession'));
const AllExercisesPage = lazy(() => import('@/pages/AllExercisesPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const WorkoutDetailsPage = lazy(() => import('@/pages/WorkoutDetailsPage'));
const WorkoutCompletePage = lazy(() => import('@/pages/WorkoutCompletePage'));
const DeveloperPage = lazy(() => import('@/pages/DeveloperPage'));
const DesignSystemPage = lazy(() => import('@/pages/DesignSystemPage'));
const Auth = lazy(() => import('@/pages/Auth'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

export const RouterProvider = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/training-session" element={<TrainingSession />} />
        <Route path="/all-exercises" element={<AllExercisesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/workout-details/:workoutId" element={<WorkoutDetailsPage />} />
        <Route path="/workout-complete" element={<WorkoutCompletePage />} />
        <Route path="/developer" element={<DeveloperPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
