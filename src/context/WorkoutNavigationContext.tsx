
import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkoutState } from '@/hooks/useWorkoutState';
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
  const { isActive, updateLastActiveRoute } = useWorkoutState();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const isTrainingRoute = location.pathname === '/training-session';
  
  // Update last active route if we're on the training session page
  useEffect(() => {
    if (isTrainingRoute) {
      updateLastActiveRoute(location.pathname);
      console.log('Updated last active route:', location.pathname);
    }
  }, [isTrainingRoute, location.pathname, updateLastActiveRoute]);

  // Log debug info for navigation context
  useEffect(() => {
    console.log('WorkoutNavigationContext state:', { 
      isActive, 
      currentPath: location.pathname,
      isTrainingRoute
    });
  }, [isActive, location.pathname, isTrainingRoute]);

  const confirmNavigation = useCallback((to: string) => {
    // Skip confirmation if navigating to the same page
    if (to === location.pathname) {
      return;
    }
    
    if (isActive && isTrainingRoute) {
      setShowDialog(true);
      setPendingNavigation(to);
      console.log('Confirming navigation from workout to:', to);
    } else {
      navigate(to);
    }
  }, [isActive, isTrainingRoute, navigate, location.pathname]);

  return (
    <Provider value={{ confirmNavigation }}>
      {children}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Active Workout in Progress</AlertDialogTitle>
            <AlertDialogDescription>
              You have an active workout. Are you sure you want to leave? Your progress will be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDialog(false)}>
              Return to Workout
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingNavigation) {
                  navigate(pendingNavigation);
                }
                setShowDialog(false);
              }}
            >
              Leave Workout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Provider>
  );
}

export { useWorkoutNavigation };
