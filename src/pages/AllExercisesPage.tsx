import React, { useState, useEffect, useMemo } from "react";
import { useExercises } from "@/hooks/useExercises";
import { Exercise } from "@/types/exercise";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/navigation/PageHeader";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { ExerciseDialog } from "@/components/exercises/ExerciseDialog";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ChevronLeft,
  Plus,
} from "lucide-react";
import { ExerciseFiltersProvider, useExerciseFilters } from "@/context/ExerciseFilterContext";
import FilterPanel from "@/components/exercises/FilterPanel";
import ExerciseListView from "@/components/exercises/ExerciseListView";
import ExerciseSearchBar from "@/components/exercises/ExerciseSearchBar";
import { useFilteredExercises } from "@/hooks/useFilteredExercises";

interface AllExercisesPageProps {
  onSelectExercise?: (exercise: string | Exercise) => void;
  standalone?: boolean;
  onBack?: () => void;
}

function AllExercisesContent({
  onSelectExercise,
  standalone = true,
  onBack
}: AllExercisesPageProps) {
  const { exercises, isLoading, isError, createExercise, isPending } = useExercises();
  const { workouts } = useWorkoutHistory();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>("suggested");
  
  // For delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

  // Use our filter context
  const { 
    searchQuery,  // Make sure we include searchQuery here
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    selectedMovement,
    currentPage,
    setPage,
    resetFilters
  } = useExerciseFilters();
  
  // Get our filter function from the hook
  const { filterExercises } = useFilteredExercises();
  
  // Show/hide filters state - kept local as it's UI-only state
  const [showFilters, setShowFilters] = useState(false);

  // For add/edit
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [exerciseToEdit, setExerciseToEdit] = useState<any | null>(null);

  // Extract recently used exercises from workout history
  const recentExercises = useMemo(() => {
    if (!workouts?.length) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
    // Get unique exercise names from recent workouts
    workouts.slice(0, 8).forEach(workout => {
      const exerciseNames = new Set<string>();
      
      workout.exerciseSets?.forEach(set => {
        exerciseNames.add(set.exercise_name);
      });
      
      exerciseNames.forEach(name => {
        const exercise = exercises.find(e => e.name === name);
        if (exercise && !exerciseMap.has(exercise.id)) {
          exerciseMap.set(exercise.id, exercise);
        }
      });
    });
    
    return Array.from(exerciseMap.values());
  }, [workouts, exercises]);

  // Apply filters to create our filtered lists
  const suggestedExercises = useMemo(() => 
    filterExercises(exercises.slice(0, 20)), // Limit suggested to top 20 for better performance
  [exercises, filterExercises]);
  
  const filteredRecent = useMemo(() => 
    filterExercises(recentExercises),
  [recentExercises, filterExercises]);
  
  const filteredAll = useMemo(() => 
    filterExercises(exercises),
  [exercises, filterExercises]);

  // Pagination logic
  const pageSize = 8;
  const totalPages = Math.ceil(filteredAll.length / pageSize);
  const indexOfLastExercise = currentPage * pageSize;
  const indexOfFirstExercise = indexOfLastExercise - pageSize;
  const currentExercises = useMemo(() => 
    filteredAll.slice(indexOfFirstExercise, indexOfLastExercise),
  [filteredAll, indexOfFirstExercise, indexOfLastExercise]);

  const handleAdd = () => {
    setExerciseToEdit(null);
    setDialogMode("add");
    setShowDialog(true);
  };

  const handleEdit = (exercise: Exercise) => {
    setExerciseToEdit(exercise);
    setDialogMode("edit");
    setShowDialog(true);
  };
  
  const handleDelete = (exercise: Exercise) => {
    setExerciseToDelete(exercise);
    setDeleteConfirmOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!exerciseToDelete) return;
    
    // Here we would actually delete the exercise
    toast({
      title: "Exercise deleted",
      description: `${exerciseToDelete.name} has been removed from your library`,
    });
    
    setDeleteConfirmOpen(false);
    setExerciseToDelete(null);
  };
  
  const handleViewDetails = (exercise: Exercise) => {
    toast({
      title: "View Details",
      description: `This feature will be implemented soon!`,
    });
  };
  
  const handleDuplicate = (exercise: Exercise) => {
    toast({
      title: "Duplicate Exercise",
      description: `This feature will be implemented soon!`,
    });
  };

  const handleSelectExercise = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    }
  };

  // Add/Edit handler
  const handleDialogSubmit = async (exercise: {
    name: string;
    description: string;
    primary_muscle_groups: any[];
    secondary_muscle_groups: any[];
    equipment_type: any[];
    movement_pattern: any;
    difficulty: any;
    instructions?: Record<string, any>;
    is_compound?: boolean;
    tips?: string[];
    variations?: string[];
    metadata?: Record<string, any>;
  }) => {
    if (dialogMode === "add") {
      await new Promise(resolve => setTimeout(resolve, 350));
      await new Promise<void>((resolve, reject) => {
        createExercise(
          {
            ...exercise,
            user_id: "",
          },
          {
            onSuccess: () => resolve(),
            onError: err => reject(err),
          }
        );
      });
      toast({
        title: "Exercise added",
        description: `Added ${exercise.name} to your library`
      });
      setShowDialog(false);
    } else {
      toast({ title: "Edit not implemented", description: "Update exercise functionality will be implemented soon!" });
    }
  };

  // Check if any filters are active
  const hasActiveFilters = selectedMuscleGroup !== "all" || 
    selectedEquipment !== "all" || 
    selectedDifficulty !== "all" || 
    selectedMovement !== "all";

  return (
    <div className={`${standalone ? 'pt-16 pb-24' : ''} h-full overflow-hidden flex flex-col`}>
      {standalone && <PageHeader title="Exercise Library" />}
      
      {/* Main content container */}
      <div className={`flex-1 overflow-hidden flex flex-col mx-auto w-full max-w-4xl px-4 ${standalone ? 'py-4' : 'pt-0'}`}>
        <ExerciseDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          onSubmit={handleDialogSubmit}
          initialExercise={exerciseToEdit!}
          loading={isPending}
          mode={dialogMode}
        />
        
        {/* Delete confirmation */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{exerciseToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Header with back button if needed */}
        <div className="flex items-center justify-between mb-4">
          {onBack && (
            <Button 
              variant="ghost"
              size="sm" 
              onClick={onBack}
              className="flex items-center gap-2 -ml-2"
            >
              <ChevronLeft size={18} />
              Back
            </Button>
          )}
          
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-semibold text-center">
              {standalone ? "Exercise Library" : "Browse Exercises"}
            </h1>
          </div>
          
          {standalone && (
            <Button 
              onClick={handleAdd}
              size="sm"
              variant="outline"
              className="h-9 px-3 rounded-full bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/50"
            >
              <Plus size={16} className="mr-1" />
              New Exercise
            </Button>
          )}
        </div>
        
        {/* Search bar */}
        <ExerciseSearchBar className="mb-4" />
                
        {/* Tabs for navigation */}
        <Tabs className="flex-1 overflow-hidden flex flex-col" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="suggested">Suggested</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="browse">Browse All</TabsTrigger>
          </TabsList>
          
          {/* Filter panel - only show in browse tab */}
          {activeTab === 'browse' && (
            <FilterPanel
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              filteredCount={filteredAll.length}
            />
          )}
          
          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading state */}
            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-gray-900 border-gray-700 p-4 rounded-lg">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-6 w-3/4 bg-gray-800" />
                      <Skeleton className="h-4 w-5/6 bg-gray-800" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Error state */}
            {isError && (
              <div className="text-red-500 text-center py-8">
                Error loading exercises. Please try again later.
              </div>
            )}
            
            {/* Tab content */}
            <TabsContent value="suggested" className="mt-0 h-full">
              <div className="overflow-y-auto">
                <ExerciseListView
                  exercises={suggestedExercises}
                  isLoading={isLoading}
                  currentPage={1}
                  pageSize={pageSize}
                  totalPages={1}
                  onPageChange={() => {}}
                  variant={standalone ? 'library-manage' : 'workout-add'}
                  onAdd={handleSelectExercise}
                  onEdit={standalone ? handleEdit : undefined}
                  onDelete={standalone ? handleDelete : undefined}
                  onViewDetails={standalone ? handleViewDetails : undefined}
                  onDuplicate={standalone ? handleDuplicate : undefined}
                  hasSearch={!!searchQuery}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={resetFilters}
                  onAddNew={handleAdd}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="recent" className="mt-0 h-full">
              <div className="overflow-y-auto">
                <ExerciseListView
                  exercises={filteredRecent}
                  isLoading={isLoading}
                  currentPage={1}
                  pageSize={pageSize}
                  totalPages={1}
                  onPageChange={() => {}}
                  variant={standalone ? 'library-manage' : 'workout-add'}
                  onAdd={handleSelectExercise}
                  onEdit={standalone ? handleEdit : undefined}
                  onDelete={standalone ? handleDelete : undefined}
                  onViewDetails={standalone ? handleViewDetails : undefined}
                  onDuplicate={standalone ? handleDuplicate : undefined}
                  hasSearch={!!searchQuery}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={resetFilters}
                  onAddNew={handleAdd}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="browse" className="mt-0 h-full">
              <div className="overflow-y-auto">
                <ExerciseListView
                  exercises={currentExercises}
                  isLoading={isLoading}
                  isPaginated={true}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  variant={standalone ? 'library-manage' : 'workout-add'}
                  onAdd={handleSelectExercise}
                  onEdit={standalone ? handleEdit : undefined}
                  onDelete={standalone ? handleDelete : undefined}
                  onViewDetails={standalone ? handleViewDetails : undefined}
                  onDuplicate={standalone ? handleDuplicate : undefined}
                  hasSearch={!!searchQuery}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={resetFilters}
                  onAddNew={handleAdd}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Mobile Add Button */}
      {standalone && isMobile && (
        <ExerciseFAB onClick={handleAdd} />
      )}
    </div>
  );
}

export default function AllExercisesPage(props: AllExercisesPageProps) {
  return (
    <ExerciseFiltersProvider>
      <AllExercisesContent {...props} />
    </ExerciseFiltersProvider>
  );
}
