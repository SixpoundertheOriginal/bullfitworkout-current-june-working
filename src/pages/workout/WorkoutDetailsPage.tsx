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
import { ExerciseSet } from "@/types/exercise";

const WorkoutDetailsPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { weightUnit } = useWeightUnit();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    workoutDetails,
    exerciseSets, // This is Record<string, ExerciseSet[]> from useWorkoutDetails
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
    exerciseSetsToEdit, // This should be ExerciseSet[] from useExerciseManagement
    deleteAlertOpen,
    setDeleteAlertOpen,
    exerciseToDelete,
    showAddDialog,
    setShowAddDialog,
    handleSaveWorkoutEdit,
    handleEditExercise,
    handleSaveExerciseSets, // (updatedSets: ExerciseSet[]) => Promise<void> from useExerciseManagement
    handleAddExercise,
    handleDeleteExercise
  } = useExerciseManagement(workoutId, setExerciseSets);

  const deleteWorkoutOperation = useDeleteOperation(deleteWorkout, {
    successMessage: "Workout deleted successfully",
    errorMessage: "Failed to delete workout",
    redirectPath: "/training?tab=history",
    navigate
  });

  // Initialize metrics with safe defaults outside the conditional rendering
  const groupedExercises = useMemo(() => {
    // Ensure exerciseSets (Record<string, ExerciseSet[]>) is correctly typed
    const map: Record<string, ExerciseSet[]> = {};
    if (workoutDetails && exerciseSets) {
      // The exerciseSets from useWorkoutDetails is already Record<string, ExerciseSet[]>
      // where ExerciseSet is the canonical one.
      // The issue might be if any set within this structure is incomplete.
      // The loop below assumes exercise_name exists on each set if it's an array of raw sets.
      // However, `exerciseSets` is already grouped.
      if (typeof exerciseSets === "object" && exerciseSets !== null) {
         Object.entries(exerciseSets).forEach(([name, setsArray]) => {
           map[name] = setsArray.map(s => ({
             ...s, // Spread the existing set
             exercise_name: s.exercise_name || name, // Ensure exercise_name
             duration: s.duration || '0:00',
             volume: s.volume || (s.weight * s.reps),
             restTime: s.restTime || 60,
             isEditing: s.isEditing || false,
           } as ExerciseSet)); // Cast to ensure all fields for canonical ExerciseSet
         });
      }
    }
    return map;
  }, [workoutDetails, exerciseSets]);

  // Calculate metrics safely - ensure this runs unconditionally
  const metrics = useMemo(() => {
    if (!workoutDetails) {
      // Return default/empty metrics when workoutDetails isn't available
      return {
        duration: 0,
        totalVolume: 0,
        adjustedVolume: 0,
        density: 0,
        exerciseCount: 0,
        setCount: { 
          total: 0, 
          completed: 0,
          failed: 0
        },
        densityMetrics: {
          setsPerMinute: 0,
          volumePerMinute: 0,
          overallDensity: 0,
          activeOnlyDensity: 0,
          formattedOverallDensity: "0.0 kg/min",
          formattedActiveOnlyDensity: "0.0 kg/min"
        },
        intensityMetrics: {
          averageRpe: 0,
          peakLoad: 0,
          averageLoad: 0
        },
        intensity: 0,
        efficiency: 0,
        muscleFocus: {},
        estimatedEnergyExpenditure: 0,
        movementPatterns: {},
        timeDistribution: { 
          activeTime: 0, 
          restTime: 0, 
          activeTimePercentage: 0, 
          restTimePercentage: 0 
        },
        composition: {
          compound: { count: 0, percentage: 0 },
          isolation: { count: 0, percentage: 0 },
          bodyweight: { count: 0, percentage: 0 },
          isometric: { count: 0, percentage: 0 },
          totalExercises: 0
        },
        durationByTimeOfDay: {
          morning: 0,
          afternoon: 0,
          evening: 0,
          night: 0
        }
      } as ProcessedWorkoutMetrics;
    }

    // Pass optional workout object with start_time property to enable time-of-day feature 
    const workoutWithTiming = workoutDetails ? {
      start_time: workoutDetails.start_time,
      duration: workoutDetails.duration || 0
    } : undefined;

    return processWorkoutMetrics(
      groupedExercises, // Use the sanitized groupedExercises
      workoutDetails.duration || 0,
      weightUnit as WeightUnit,
      undefined, // userBodyInfo
      workoutWithTiming // Pass the workout timing data
    );
  }, [groupedExercises, workoutDetails, weightUnit]);

  if (loadingDetails || !workoutDetails) {
    return <WorkoutDetailsLoading />;
  }

  // Use type assertion and add null checks for accessing properties
  const metricValues = metrics as ProcessedWorkoutMetrics;
  
  // Calculate max load and session max for new summary card
  const sessionMax = metricValues.intensityMetrics?.peakLoad || 0;
  
  // For exercise volume history chart - create from muscle focus data
  const exerciseVolumeHistory = metricValues.muscleFocus ? 
    Object.entries(metricValues.muscleFocus).map(([name, value]) => ({
      exercise_name: name,
      trend: 'stable' as 'increasing' | 'decreasing' | 'stable' | 'fluctuating',
      percentChange: 0,
      // Adding missing properties for ExerciseVolumeHistoryData if needed by ExerciseDetailsTable
      // Assuming ExerciseDetailsTable can handle this structure
    })) : [];

  // Prepare metrics for child components
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
              <BreadcrumbItem>{workoutDetails.name || "Workout Details"}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header card */}
          <WorkoutDetailsHeader
            workoutDetails={workoutDetails}
            onEditClick={() => setEditModalOpen(true)}
            onDeleteClick={() => setDeleteDialogOpen(true)}
          />

          {/* Workout Metrics Summary */}
          <WorkoutMetricCards
            workoutDetails={workoutDetails}
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
            notes={workoutDetails.notes} 
            workoutName={workoutDetails.name || "Workout"}
            className="mb-6"
          />

          {/* Raw exercise list & editing */}
          {/* The 'exercises' prop for WorkoutDetailsEnhanced expects Record<string, ExerciseSet[]>
              where ExerciseSet is the canonical one. groupedExercises should match this. */}
          <WorkoutDetailsEnhanced
            workout={workoutDetails}
            exercises={groupedExercises} 
            onEditClick={() => setEditModalOpen(true)}
            onEditExercise={handleEditExercise}
          />
        </main>

        {/* Modals & dialogs */}
        <EditWorkoutModal
          workout={workoutDetails}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSave={async updated => {
            const saved = await handleSaveWorkoutEdit(updated);
            if (saved) setWorkoutDetails(saved); // Ensure 'saved' matches 'workoutDetails' structure
          }}
        />
        <EditExerciseSetModal
          sets={exerciseSetsToEdit} // ExerciseSet[] from useExerciseManagement
          exerciseName={currentExercise}
          open={exerciseSetModalOpen}
          onOpenChange={setExerciseSetModalOpen}
          onSave={handleSaveExerciseSets} // (updatedSets: ExerciseSet[]) => Promise<void>
        />
        <ExerciseDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSubmit={async ex => ex.name && handleAddExercise(ex.name)} // handleAddExercise takes string
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
