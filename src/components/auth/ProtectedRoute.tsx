
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowPublic?: boolean; // For testing purposes
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowPublic = false 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] Checking access:', {
    pathname: location.pathname,
    hasUser: !!user,
    loading,
    allowPublic,
    userId: user?.id
  });

  if (loading) {
    console.log('[ProtectedRoute] Still loading, showing skeleton');
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
        <Skeleton className="h-4 w-[250px] mb-2 bg-gray-800" />
        <Skeleton className="h-4 w-[200px] bg-gray-800" />
        <p className="text-gray-400 mt-4 text-sm">Loading your account...</p>
      </div>
    );
  }

  if (!user && !allowPublic) {
    console.log('[ProtectedRoute] No user and not public, redirecting to home with auth state');
    // Redirect them to the home page with auth state
    return <Navigate to="/" state={{ from: location, needsAuth: true }} replace />;
  }

  if (!user && allowPublic) {
    console.log('[ProtectedRoute] No user but route is public, allowing access');
  }

  if (user) {
    console.log('[ProtectedRoute] User authenticated, allowing access');
  }

  return children;
};
