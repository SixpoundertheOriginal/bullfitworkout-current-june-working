
import React from 'react';

interface DevOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const DevOnly: React.FC<DevOnlyProps> = ({ children, fallback = null }) => {
  // Only show in development environment
  const isDevelopment = import.meta.env.DEV;
  
  return isDevelopment ? <>{children}</> : <>{fallback}</>;
};
