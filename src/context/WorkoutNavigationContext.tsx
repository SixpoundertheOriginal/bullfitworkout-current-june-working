
import React, { createContext, useContext, useState, useCallback } from 'react';
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

interface WorkoutNavigationContextType {
  confirmNavigation: (to: string) => void;
}

const [WorkoutNavigationProvider, useWorkoutNavigation] = createContext<WorkoutNavigationContextType>();

export function WorkoutNavigationContextProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { exercises, elapsedTime } = useWorkoutState();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const isWorkoutActive = Object.keys(exercises).length > 0 && elapsedTime > 0;
  const isTrainingRoute = location.pathname === '/training-session';

  const confirmNavigation = useCallback((to: string) => {
    if (isWorkoutActive && isTrainingRoute) {
      setShowDialog(true);
      setPendingNavigation(to);
    } else {
      navigate(to);
    }
  }, [isWorkoutActive, isTrainingRoute, navigate]);

  return (
    <WorkoutNavigationProvider value={{ confirmNavigation }}>
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
    </WorkoutNavigationProvider>
  );
}

export { useWorkoutNavigation };
