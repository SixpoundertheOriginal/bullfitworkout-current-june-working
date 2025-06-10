
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LayoutWrapper } from '@/components/layouts/LayoutWrapper';

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

// Enhanced loading component with layout preservation
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Route configuration with layout settings
const routeConfigs = {
  '/': { headerTitle: 'Today' },
  '/overview': { headerTitle: 'Overview' },
  '/training-session': { headerTitle: 'Workout' },
  '/all-exercises': { headerTitle: 'All Exercises' },
  '/profile': { headerTitle: 'Profile' },
  '/workout-complete': { headerTitle: 'Workout Complete' },
  '/developer': { headerTitle: 'Developer Tools' },
  '/design-system': { headerTitle: 'Design System' },
  '/auth': { noHeader: true, noFooter: true },
  '/workout-details': { headerTitle: 'Workout Details' }
};

export const RouterProvider = () => {
  return (
    <Suspense fallback={<LayoutWrapper><PageLoader /></LayoutWrapper>}>
      <Routes>
        <Route 
          path="/" 
          element={
            <LayoutWrapper config={routeConfigs['/']}>
              <Index />
            </LayoutWrapper>
          } 
        />
        <Route 
          path="/overview" 
          element={
            <LayoutWrapper config={routeConfigs['/overview']}>
              <Overview />
            </LayoutWrapper>
          } 
        />
        <Route 
          path="/training-session" 
          element={
            <LayoutWrapper config={routeConfigs['/training-session']}>
              <TrainingSession />
            </LayoutWrapper>
          } 
        />
        <Route 
          path="/all-exercises" 
          element={
            <LayoutWrapper config={routeConfigs['/all-exercises']}>
              <AllExercisesPage />
            </LayoutWrapper>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <LayoutWrapper config={routeConfigs['/profile']}>
              <ProfilePage />
            </LayoutWrapper>
          } 
        />
        <Route 
          path="/workout-details/:workoutId" 
          element={
            <LayoutWrapper config={routeConfigs['/workout-details']}>
              <WorkoutDetailsPage />
            </LayoutWrapper>
          } 
        />
        <Route 
          path="/workout-complete" 
          element={
            <LayoutWrapper config={routeConfigs['/workout-complete']}>
              <WorkoutCompletePage />
            </LayoutWrapper>
          } 
        />
        <Route 
          path="/developer" 
          element={
            <LayoutWrapper config={routeConfigs['/developer']}>
              <DeveloperPage />
            </LayoutWrapper>
          } 
        />
        <Route 
          path="/design-system" 
          element={
            <LayoutWrapper config={routeConfigs['/design-system']}>
              <DesignSystemPage />
            </LayoutWrapper>
          } 
        />
        <Route 
          path="/auth" 
          element={
            <LayoutWrapper config={routeConfigs['/auth']}>
              <Auth />
            </LayoutWrapper>
          } 
        />
        <Route 
          path="*" 
          element={
            <LayoutWrapper>
              <NotFound />
            </LayoutWrapper>
          } 
        />
      </Routes>
    </Suspense>
  );
};
