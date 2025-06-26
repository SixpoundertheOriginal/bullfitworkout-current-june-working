
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
        <Skeleton className="h-4 w-[250px] mb-2 bg-gray-800" />
        <Skeleton className="h-4 w-[200px] bg-gray-800" />
        <p className="text-gray-400 mt-4 text-sm">Loading your account...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect them to the home page with auth state
    return <Navigate to="/" state={{ from: location, needsAuth: true }} replace />;
  }

  return children;
};
