
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { createContext } from '@/utils/createContext';

interface LayoutContextProps {
  currentRoute: string;
  activeWorkoutId?: string | null;
  setActiveWorkoutId: (id: string | null) => void;
  isFilterVisible: boolean;
  setFilterVisible: (visible: boolean) => void;
}

const [LayoutProvider, useLayout] = createContext<LayoutContextProps>();

export { useLayout };

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [currentRoute, setCurrentRoute] = useState(location.pathname);
  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);
  const [isFilterVisible, setFilterVisible] = useState(false);
  
  // Update current route when location changes
  useEffect(() => {
    setCurrentRoute(location.pathname);
    
    // Show filter on overview page, hide on others
    setFilterVisible(location.pathname === '/overview');
  }, [location.pathname]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentRoute,
    activeWorkoutId,
    setActiveWorkoutId,
    isFilterVisible,
    setFilterVisible,
  }), [currentRoute, activeWorkoutId, isFilterVisible]);
  
  return <LayoutProvider value={value}>{children}</LayoutProvider>;
};
