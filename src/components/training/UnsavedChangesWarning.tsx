
import React, { useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface UnsavedChangesWarningProps {
  hasUnsavedChanges: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
}

export const UnsavedChangesWarning: React.FC<UnsavedChangesWarningProps> = ({
  hasUnsavedChanges,
  onSave,
  onDiscard
}) => {
  const [showWarning, setShowWarning] = React.useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved workout data. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        setShowWarning(true);
        // Push the current state back to prevent navigation
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleSaveAndLeave = () => {
    if (onSave) {
      onSave();
    }
    setShowWarning(false);
    // Allow navigation after save
    window.history.back();
  };

  const handleDiscardAndLeave = () => {
    if (onDiscard) {
      onDiscard();
    }
    setShowWarning(false);
    // Allow navigation after discard
    window.history.back();
  };

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent className="bg-gray-900 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-100">
            Unsaved Workout Data
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            You have unsaved workout data that will be lost if you leave this page. 
            Would you like to save your progress first?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleDiscardAndLeave}
            className="bg-red-900/30 border-red-700 text-red-300 hover:bg-red-900/50"
          >
            Discard Changes
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSaveAndLeave}
            className="bg-green-900/30 border-green-700 text-green-300 hover:bg-green-900/50"
          >
            Save & Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
