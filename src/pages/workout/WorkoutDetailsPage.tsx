// src/pages/workout/WorkoutDetailsPage.tsx

import React, { useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkoutDetailsLoading } from "@/components/workouts/WorkoutDetailsLoading";
import { WorkoutDetailsHeader } from "@/components/workouts/WorkoutDetailsHeader";
import { WorkoutDetailsEnhanced } from "@/components/workouts/WorkoutDetailsEnhanced";
import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";
import { useExerciseManagement } from "@/hooks/useExerciseManagement";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { EditExerciseSetModal } from "@/components/EditExerciseSetModal";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { useDeleteOperation } from "@/hooks/useAsyncOperation";
import { deleteWorkout } from "@/services/workoutService";
import { Loader2 } from "lucide-react";
import { processWorkoutMetrics } from "@/utils/workoutMetricsProcessor";
import { useWeightUnit } from "@/context/WeightUnitContext";

// 📊 New imports for cards & charts
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { WorkoutDensityChart } from "@/components/metrics/WorkoutDensityChart";
import { TimeOfDayChart } from "@/components/metrics/TimeOfDayChart";
import { MuscleGroupChart } from "@/components/metrics/MuscleGroupChart";
import { TopExercisesTable } from "@/components/metrics/TopExercisesTable";

const WorkoutDetailsPage: React.FC = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { weightUnit } = useWeightUnit();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    workoutDetails,
    exerciseSets,
    loading,
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
    handleDeleteExercise,
    confirmDeleteExercise
  } = useExerciseManagement(workoutId, setExerciseSets);

  const deleteWorkoutOperation = useDeleteOperation(deleteWorkout, {
    successMessage: "Workout deleted successfully",
    errorMessage: "Failed to delete workout",
    redirectPath: "/training?tab=history",
    navigate
  });

  if (loading) {
    return <WorkoutDetailsLoading />;
  }

  // Use our centralized metrics processor to get consistent metrics with null checks
  // Add fallback empty object for exerciseSets to prevent errors
  const metrics = processWorkoutMetrics(
    exerciseSets || {},
    workoutDetails ? workoutDetails.duration : 0,
    weightUnit
  );

  // Add null checks and default values for metrics
  const {
    volumeStats = { exerciseCount: 0, setCount: 0, total: 0 },
    densityStats = { activeTime: 0, overallDensity: 0, activeOnlyDensity: 0 },
    muscleFocus = {},
    timePatterns = { durationByTimeOfDay: {} },
    exerciseVolumeHistory = []
  } = metrics || {};

  // Helper to format ISO date to "MMM d, yyyy"
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <main className="flex-1 overflow-auto px-4 py-6 pb-24 mt-16">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/training?tab=history">
                  Workouts
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {workoutDetails?.name || "Workout Details"}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {workoutId && workoutDetails && (
            <>
              {/* Header */}
              <WorkoutDetailsHeader
                workoutDetails={workoutDetails}
                onEditClick={() => setEditModalOpen(true)}
                onDeleteClick={() => setDeleteDialogOpen(true)}
              />

              {/* ─── KPI CARDS ───────────────────────────────────────── */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xs">Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {formatDate(workoutDetails.start_time)}
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xs">Duration</CardTitle>
                  </CardHeader>
                  <CardContent>{workoutDetails.duration} min</CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xs">Exercises</CardTitle>
                  </CardHeader>
                  <CardContent>{volumeStats?.exerciseCount || 0}</CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xs">Sets</CardTitle>
                  </CardHeader>
                  <CardContent>{volumeStats?.setCount || 0}</CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-xs">Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(volumeStats?.total || 0).toLocaleString()} {weightUnit}
                  </CardContent>
                </Card>
              </div>

              {/* ─── DENSITY & TIME-OF-DAY CHARTS ────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Workout Density</CardTitle>
                  </CardHeader>
                  <CardContent className="h-48">
                    <WorkoutDensityChart
                      totalTime={workoutDetails.duration}
                      activeTime={densityStats?.activeTime || 0}
                      totalVolume={volumeStats?.total || 0}
                      weightUnit={weightUnit}
                      overallDensity={densityStats?.overallDensity || 0}
                      activeOnlyDensity={densityStats?.activeOnlyDensity || 0}
                      height={160}
                    />
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Time of Day</CardTitle>
                  </CardHeader>
                  <CardContent className="h-48">
                    <TimeOfDayChart
                      durationByTimeOfDay={timePatterns?.durationByTimeOfDay || {}}
                      height={160}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* ─── MUSCLE FOCUS DONUT ─────────────────────────────── */}
              <Card className="bg-gray-900 border-gray-800 mb-6">
                <CardHeader>
                  <CardTitle className="text-sm">Muscle Group Focus</CardTitle>
                </CardHeader>
                <CardContent className="h-48">
                  <MuscleGroupChart
                    muscleFocus={muscleFocus || {}}
                    height={160}
                  />
                </CardContent>
              </Card>

              {/* ─── TOP EXERCISES TABLE ────────────────────────────── */}
              <Card className="bg-gray-900 border-gray-800 mb-6">
                <CardHeader>
                  <CardTitle className="text-sm">Top Exercises</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopExercisesTable
                    exerciseVolumeHistory={exerciseVolumeHistory || []}
                  />
                </CardContent>
              </Card>

              {/* Existing "Enhanced" section */}
              <WorkoutDetailsEnhanced
                workout={workoutDetails}
                exercises={exerciseSets}
                onEditClick={() => setEditModalOpen(true)}
                onEditExercise={handleEditExercise}
              />
            </>
          )}
        </main>

        {/* Modals & Dialogs */}
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
          onSubmit={async exercise => {
            if (exercise.name) await handleAddExercise(exercise.name);
          }}
          mode="add"
        />

        <AlertDialog
          open={deleteAlertOpen}
          onOpenChange={setDeleteAlertOpen}
        >
          <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to remove {exerciseToDelete}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteExercise}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
        >
          <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Workout</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to delete this workout? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteWorkoutOperation.execute(workoutId!)}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={deleteWorkoutOperation.isLoading}
              >
                {deleteWorkoutOperation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                    "Delete Workout"
                  )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ErrorBoundary>
  );
};

export default WorkoutDetailsPage;
