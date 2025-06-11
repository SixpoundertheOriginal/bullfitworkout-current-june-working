import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '@/store/workoutStore';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { useDebounce } from '@/hooks/useDebounce';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createContext } from '@/utils/createContext';

interface WorkoutNavigationContextType {
  confirmNavigation: (to: string) => void;
}

const [Provider, useWorkoutNavigation] = createContext<WorkoutNavigationContextType>();

export function WorkoutNavigationContextProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isActive, updateLastActiveRoute } = useWorkoutStore();
  const { isVisible } = usePageVisibility();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [lastPath, setLastPath] = useState<string>(location.pathname);

  // Debounce state updates to prevent excessive re-renders
  const debouncedIsActive = useDebounce(isActive, 150);
  const debouncedIsVisible = useDebounce(isVisible, 150);
  
  const isTrainingRoute = useMemo(() => 
    location.pathname === '/training-session', 
    [location.pathname]
  );
  
  // Update last active route with debounced values
  useEffect(() => {
    if (isTrainingRoute) {
      updateLastActiveRoute(location.pathname);
    }
    
    // Keep track of last path for recovery
    setLastPath(location.pathname);
  }, [isTrainingRoute, location.pathname, updateLastActiveRoute]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    confirmNavigation: (to: string) => {
      // Skip confirmation if navigating to the same page
      if (to === location.pathname) {
        return;
      }
      
      if (debouncedIsActive && isTrainingRoute) {
        setShowDialog(true);
        setPendingNavigation(to);
      } else {
        navigate(to);
      }
    }
  }), [debouncedIsActive, isTrainingRoute, navigate, location.pathname]);

  const handleDialogClose = useCallback(() => {
    setShowDialog(false);
  }, []);

  const handleLeaveWorkout = useCallback(() => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowDialog(false);
  }, [pendingNavigation, navigate]);

  return (
    <Provider value={contextValue}>
      {children}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Active Workout in Progress</AlertDialogTitle>
            <AlertDialogDescription>
              You have an active workout. Are you sure you want to leave? Your progress will be saved and you can return any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDialogClose}>
              Return to Workout
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveWorkout}>
              Leave Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Provider>
  );
}

export { useWorkoutNavigation };
