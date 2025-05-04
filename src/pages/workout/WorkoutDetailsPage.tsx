
// src/pages/workout/WorkoutDetailsPage.tsx

import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkoutDetailsLoading } from "@/components/workouts/WorkoutDetailsLoading";
import { WorkoutDetailsHeader } from "@/components/workouts/WorkoutDetailsHeader";
import { WorkoutDetailsEnhanced } from "@/components/workouts/WorkoutDetailsEnhanced";
import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";
import { useExerciseManagement } from "@/hooks/useExerciseManagement";
import { processWorkoutMetrics, ProcessedWorkoutMetrics } from "@/utils/workoutMetricsProcessor";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WorkoutDensityChart } from "@/components/metrics/WorkoutDensityChart";
import { TimeOfDayChart } from "@/components/metrics/TimeOfDayChart";
import { MuscleGroupChart } from "@/components/metrics/MuscleGroupChart";
import { TopExercisesTable } from "@/components/metrics/TopExercisesTable";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { EditExerciseSetModal } from "@/components/EditExerciseSetModal";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useDeleteOperation } from "@/hooks/useAsyncOperation";
import { deleteWorkout } from "@/services/workoutService";
import { Loader2 } from "lucide-react";
import { WeightUnit } from "@/utils/unitConversion";

const WorkoutDetailsPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { weightUnit } = useWeightUnit();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    workoutDetails,
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
    exerciseSetsToEdit,
    deleteAlertOpen,
    setDeleteAlertOpen,
    exerciseToDelete,
    showAddDialog,
    setShowAddDialog,
    handleSaveWorkoutEdit,
    handleEditExercise,
    handleSaveExerciseSets,
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
    const map: Record<string, any[]> = {};
    if (workoutDetails && exerciseSets) {
      if (Array.isArray(exerciseSets)) {
        exerciseSets.forEach(set => {
          const name = set.exercise_name || "Unknown";
          if (!map[name]) map[name] = [];
          map[name].push(set);
        });
      } else if (typeof exerciseSets === "object" && exerciseSets !== null) {
        Object.assign(map, exerciseSets);
      }
    }
    return map;
  }, [exerciseSets]);

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
        }
      } as ProcessedWorkoutMetrics;
    }

    return processWorkoutMetrics(
      groupedExercises,
      workoutDetails.duration || 0,
      weightUnit as WeightUnit
    );
  }, [groupedExercises, workoutDetails, weightUnit]);

  if (loadingDetails || !workoutDetails) {
    return <WorkoutDetailsLoading />;
  }

  // Use type assertion and add null checks for accessing properties
  const metricValues = metrics as ProcessedWorkoutMetrics;
  
  // Destructure with safe defaults - updating property names to match ProcessedWorkoutMetrics
  const totalVolume = metricValues.totalVolume || 0;
  
  // These properties are in the timeDistribution object in ProcessedWorkoutMetrics
  const activeTime = metricValues.timeDistribution?.activeTime || 0;
  const restTime = metricValues.timeDistribution?.restTime || 0;
  
  // These properties are in densityMetrics in ProcessedWorkoutMetrics
  const overallDensity = metricValues.densityMetrics?.overallDensity || 0;
  const activeOnlyDensity = metricValues.densityMetrics?.activeOnlyDensity || 0;
  
  // Create compatible data structures for charts that expect different formats
  // For time patterns chart
  const durationByTimeOfDay = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0
  };
  
  // For exercise volume history chart
  const exerciseVolumeHistory = metricValues.muscleFocus ? 
    Object.entries(metricValues.muscleFocus).map(([name, value]) => ({
      exercise_name: name,
      trend: 'stable' as 'increasing' | 'decreasing' | 'stable' | 'fluctuating',
      percentChange: 0
    })) : [];

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

          {/* Summary row */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
            {[
              { label: "Date", value: new Date(workoutDetails.start_time).toLocaleDateString() },
              { label: "Duration", value: `${workoutDetails.duration} min` },
              { label: "Exercises", value: exerciseCount },
              { label: "Sets", value: setCount },
              { label: "Volume", value: `${Math.round(totalVolume).toLocaleString()} ${weightUnit}` },
            ].map((item, idx) => (
              <Card key={idx} className="bg-gray-900 border-gray-800">
                <CardHeader><CardTitle className="text-sm">{item.label}</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-lg">{item.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Workout Density & Time Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader><CardTitle>Workout Density</CardTitle></CardHeader>
              <CardContent className="h-40">
                <WorkoutDensityChart
                  totalTime={metricValues.duration || 0}
                  activeTime={activeTime}
                  restTime={restTime}
                  totalVolume={totalVolume}
                  weightUnit={weightUnit}
                  overallDensity={overallDensity}
                  activeOnlyDensity={activeOnlyDensity}
                  height={160}
                />
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader><CardTitle>Time of Day</CardTitle></CardHeader>
              <CardContent className="h-40">
                <TimeOfDayChart
                  durationByTimeOfDay={durationByTimeOfDay}
                  height={200}
                />
              </CardContent>
            </Card>
          </div>

          {/* Muscle Focus */}
          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardHeader><CardTitle>Muscle Group Focus</CardTitle></CardHeader>
            <CardContent className="h-60">
              <MuscleGroupChart muscleFocus={metricValues.muscleFocus || {}} height={200} />
            </CardContent>
          </Card>

          {/* Top Exercises */}
          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardHeader><CardTitle>Top Exercises</CardTitle></CardHeader>
            <CardContent>
              <TopExercisesTable exerciseVolumeHistory={exerciseVolumeHistory} />
            </CardContent>
          </Card>

          {/* Raw exercise list & editing */}
          <WorkoutDetailsEnhanced
            workout={workoutDetails}
            exercises={exerciseSets}
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
            if (saved) setWorkoutDetails(saved);
          }}
        />
        <EditExerciseSetModal
          sets={exerciseSetsToEdit}
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
