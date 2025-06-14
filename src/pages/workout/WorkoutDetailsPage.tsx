// src/pages/workout/WorkoutDetailsPage.tsx

import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkoutDetailsLoading } from "@/components/workouts/WorkoutDetailsLoading";
import { WorkoutDetailsHeader } from "@/components/workouts/WorkoutDetailsHeader";
import { WorkoutDetailsEnhanced } from "@/components/workouts/WorkoutDetailsEnhanced";
import { WorkoutMetricCards } from "@/components/workouts/WorkoutMetricCards";
import { WorkoutComposition } from "@/components/workouts/WorkoutComposition";
import { WorkoutAnalysis } from "@/components/workouts/WorkoutAnalysis";
import { ExerciseDetailsTable } from "@/components/workouts/ExerciseDetailsTable";
import { WorkoutNotes } from "@/components/workouts/WorkoutNotes";
import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";
import { useExerciseManagement } from "@/hooks/useExerciseManagement";
import { processWorkoutMetrics, ProcessedWorkoutMetrics } from "@/utils/workoutMetricsProcessor";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { EditExerciseSetModal } from "@/components/EditExerciseSetModal";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useDeleteOperation } from "@/hooks/useAsyncOperation";
import { deleteWorkout } from "@/services/workoutService";
import { Loader2 } from "lucide-react";
import { WeightUnit } from "@/utils/unitConversion";
import { ExerciseSet } from "@/types/exercise"; // Canonical ExerciseSet

// Define an interface for the workout details used in metrics processing
interface WorkoutInfoForMetrics {
  id: string;
  name: string; // Changed from optional to required
  notes: string | null; // Explicitly string | null
  start_time: string;
  end_time: string | null; // Explicitly string | null
  duration: number;
  training_type: string | null; // Explicitly string | null
  metadata: Record<string, any> | null; // Explicitly Record<string, any> | null
}

const WorkoutDetailsPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { weightUnit } = useWeightUnit();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    workoutDetails, // This is 'any' from useWorkoutDetails
    exerciseSets,
    loading: loadingDetails,
    setWorkoutDetails,
    setExerciseSets
  } = useWorkoutDetails(workoutId);

  const {
    editModalOpen,
    setEditModalOpen,
    exerciseSetModalOpen,
    setExerciseSetModalOpen,
    currentExercise,
    exerciseSetsToEdit, // This is ExerciseSet[] from useExerciseManagement (canonical)
    deleteAlertOpen,
    setDeleteAlertOpen,
    // exerciseToDelete, // This seems to be unused, currentExercise is used in the dialog
    showAddDialog,
    setShowAddDialog,
    handleSaveWorkoutEdit,
    handleEditExercise,
    handleSaveExerciseSets, // Expects (updatedSets: Partial<ExerciseSet>[])
    handleAddExercise,
    handleDeleteExercise,
    // confirmDeleteExercise // This was not used in the JSX directly, but in the alert dialog action
  } = useExerciseManagement(workoutId, setExerciseSets);

  const deleteWorkoutOperation = useDeleteOperation(deleteWorkout, {
    successMessage: "Workout deleted successfully",
    errorMessage: "Failed to delete workout",
    redirectPath: "/training?tab=history",
    navigate
  });

  const groupedExercises = useMemo(() => {
    const map: Record<string, ExerciseSet[]> = {};
    if (workoutDetails && exerciseSets) {
      if (typeof exerciseSets === "object" && exerciseSets !== null) {
         Object.entries(exerciseSets).forEach(([name, setsArray]) => {
           map[name] = setsArray.map(s => ({
             ...s,
             exercise_name: s.exercise_name || name, // Ensure exercise_name
             workout_id: s.workout_id || workoutId || '', // Ensure workout_id
             duration: s.duration || '0:00',
             volume: s.volume || (s.weight * s.reps),
             restTime: s.restTime || 60,
             isEditing: typeof s.isEditing === 'boolean' ? s.isEditing : false,
           } as ExerciseSet));
         });
      }
    }
    return map;
  }, [workoutDetails, exerciseSets, workoutId]);

  if (loadingDetails || !workoutDetails) {
    return <WorkoutDetailsLoading />;
  }

  // Construct typedWorkoutDetails ensuring it conforms to WorkoutInfoForMetrics
  const typedWorkoutDetails: WorkoutInfoForMetrics = {
    id: workoutDetails.id || workoutId!, // workoutId is string | undefined, so workoutId! assumes it's defined
    name: workoutDetails.name || "Unnamed Workout",
    notes: workoutDetails.notes || null,
    start_time: workoutDetails.start_time || new Date().toISOString(), // Provide a default if undefined
    end_time: workoutDetails.end_time || null,
    duration: workoutDetails.duration || 0,
    training_type: workoutDetails.training_type || null,
    metadata: workoutDetails.metadata || null,
  };

  const metricValues: ProcessedWorkoutMetrics = processWorkoutMetrics(
    exerciseSets, // Swapped: exerciseSets is first
    typedWorkoutDetails, // Swapped: typedWorkoutDetails is second
    weightUnit as WeightUnit
  );
  
  const sessionMax = metricValues.intensityMetrics?.peakLoad || 0;
  
  const exerciseVolumeHistory = metricValues.muscleFocus ? 
    Object.entries(metricValues.muscleFocus).map(([name, value]) => ({
      exercise_name: name,
      trend: 'stable' as 'increasing' | 'decreasing' | 'stable' | 'fluctuating',
      percentChange: 0,
    })) : [];

  const workoutMetrics = {
    duration: metricValues.duration || 0,
    exerciseCount: metricValues.exerciseCount || 0,
    setCount: metricValues.setCount || { total: 0, completed: 0, failed: 0 },
    totalVolume: metricValues.totalVolume || 0,
    sessionMax
  };

  const analysisMetrics = {
    duration: metricValues.duration || 0,
    totalVolume: metricValues.totalVolume || 0,
    timeDistribution: metricValues.timeDistribution || { activeTime: 0, restTime: 0, activeTimePercentage: 0, restTimePercentage: 0 },
    densityMetrics: metricValues.densityMetrics || { overallDensity: 0, activeOnlyDensity: 0, formattedOverallDensity: "0.0 kg/min", formattedActiveOnlyDensity: "0.0 kg/min" },
    intensity: metricValues.intensity || 0,
    efficiency: metricValues.timeDistribution?.activeTimePercentage || 0,
    durationByTimeOfDay: metricValues.durationByTimeOfDay || {
      morning: 0, afternoon: 0, evening: 0, night: 0
    },
    muscleFocus: metricValues.muscleFocus || {}
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <main className="flex-1 overflow-auto px-4 py-6 pb-24 mt-16">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/training?tab=history">Workouts</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{typedWorkoutDetails.name || "Workout Details"}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header card */}
          <WorkoutDetailsHeader
            workoutDetails={typedWorkoutDetails}
            onEditClick={() => setEditModalOpen(true)}
            onDeleteClick={() => setDeleteDialogOpen(true)}
          />

          {/* Workout Metrics Summary */}
          <WorkoutMetricCards
            workoutDetails={typedWorkoutDetails}
            metrics={workoutMetrics}
            weightUnit={weightUnit as WeightUnit}
          />

          {/* Workout Analysis Charts */}
          <WorkoutAnalysis
            metrics={analysisMetrics}
            weightUnit={weightUnit as WeightUnit}
          />

          {/* Side by side: Composition and Exercise Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <WorkoutComposition composition={metricValues.composition || {
              compound: { count: 0, percentage: 0 },
              isolation: { count: 0, percentage: 0 },
              bodyweight: { count: 0, percentage: 0 },
              isometric: { count: 0, percentage: 0 },
              totalExercises: 0
            }} />
            
            <ExerciseDetailsTable exerciseVolumeHistory={exerciseVolumeHistory} />
          </div>

          {/* Workout Notes */}
          <WorkoutNotes 
            notes={typedWorkoutDetails.notes} 
            workoutName={typedWorkoutDetails.name || "Workout"}
            className="mb-6"
          />

          <WorkoutDetailsEnhanced
            workout={typedWorkoutDetails}
            exercises={groupedExercises} 
            onEditClick={() => setEditModalOpen(true)}
            onEditExercise={(exerciseName) => handleEditExercise(exerciseName, groupedExercises)}
          />
        </main>

        {/* Modals & dialogs */}
        <EditWorkoutModal
          workout={typedWorkoutDetails}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSave={async updated => {
            const saved = await handleSaveWorkoutEdit(updated);
            // The 'workoutDetails' state is 'any'.
            // The conversion to WorkoutInfoForMetrics with defaults happens when 'typedWorkoutDetails' is derived.
            if (saved) setWorkoutDetails(saved); 
          }}
        />
        <EditExerciseSetModal
          sets={exerciseSetsToEdit} // Removed 'as ExerciseSet[]' cast
          exerciseName={currentExercise}
          open={exerciseSetModalOpen}
          onOpenChange={setExerciseSetModalOpen}
          onSave={handleSaveExerciseSets}
        />
        <ExerciseDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSubmit={async ex => ex.name && handleAddExercise(ex.name)}
          mode="add"
        />
        <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove {currentExercise}? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteExercise}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Workout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this workout? This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteWorkoutOperation.execute(workoutId!)}
                disabled={deleteWorkoutOperation.isLoading}
              >
                {deleteWorkoutOperation.isLoading
                  ? <><Loader2 className="animate-spin mr-2 h-4 w-4"/>Deleting...</>
                  : "Delete Workout"
                }
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ErrorBoundary>
  );
};

export default WorkoutDetailsPage;
