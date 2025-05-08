
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { WorkoutNavigationContextProvider } from "@/context/WorkoutNavigationContext";
import { MainLayout } from "@/components/layouts/MainLayout";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import TrainingSessionPage from "@/pages/TrainingSession";
import WorkoutComplete from "@/pages/WorkoutComplete";
import WorkoutDetailsPage from "@/pages/WorkoutDetailsPage";
import ProfilePage from "@/pages/ProfilePage";
import Auth from "@/pages/Auth";
import AllExercisesPage from "@/pages/AllExercisesPage";
import Overview from "@/pages/Overview";
import { WorkoutManagementPage } from "@/pages/WorkoutManagementPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Create a separate component for protected routes to avoid circular dependencies
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Loading...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

// Create a wrapper for main layout pages to reduce duplication
const ProtectedPage: React.FC<{ 
  element: React.ReactNode,
  noHeader?: boolean,
  noFooter?: boolean
}> = ({ element, noHeader, noFooter }) => {
  return (
    <ProtectedRoute>
      <MainLayout noHeader={noHeader} noFooter={noFooter}>
        {element}
      </MainLayout>
    </ProtectedRoute>
  );
};

export const RouterProvider: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  
  // Improve route organization with a more consistent pattern
  const routes = [
    { path: "/", element: <Index /> },
    { path: "/overview", element: <Overview /> },
    { path: "/workouts", element: <WorkoutManagementPage /> },
    { path: "/training-session", element: <TrainingSessionPage /> },
    { path: "/workout-complete", element: <WorkoutComplete /> },
    { path: "/workout-details", element: <WorkoutDetailsPage /> },
    { path: "/workout-details/:workoutId", element: <WorkoutDetailsPage /> },
    { path: "/profile", element: <ProfilePage /> },
    { path: "/all-exercises", element: <AllExercisesPage /> },
  ];

  return (
    <WorkoutNavigationContextProvider>
      <div className="bg-gray-900 min-h-screen">
        {isAuthPage ? (
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        ) : (
          <Routes>
            {routes.map(route => (
              <Route
                key={route.path}
                path={route.path}
                element={<ProtectedPage element={route.element} />}
              />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </div>
    </WorkoutNavigationContextProvider>
  );
};
