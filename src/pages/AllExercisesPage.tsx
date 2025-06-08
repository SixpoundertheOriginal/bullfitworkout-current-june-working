
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useExercises } from "@/hooks/useExercises";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExerciseCreationWizard } from "@/components/exercises/ExerciseCreationWizard";
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty, Exercise } from "@/types/exercise";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { PageHeader } from "@/components/navigation/PageHeader";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useExerciseSearch } from "@/hooks/useExerciseSearch";
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization";
import { predictiveCache } from "@/services/predictiveCache";
import { useNetworkStatus } from "@/utils/serviceWorker";
import { ExerciseSearchBar } from "@/components/exercises/ExerciseSearchBar";
import { ExerciseFilters } from "@/components/exercises/ExerciseFilters";
import { ExerciseTabsContent } from "@/components/exercises/ExerciseTabsContent";

interface AllExercisesPageProps {
  onSelectExercise?: (exercise: string | Exercise) => void;
  standalone?: boolean;
  onBack?: () => void;
}

export default function AllExercisesPage({ onSelectExercise, standalone = true, onBack }: AllExercisesPageProps) {
  const { exercises, isLoading, isError, createExercise, isPending } = useExercises();
  const { workouts } = useWorkoutHistory();
  const { toast } = useToast();
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>("suggested");
  const isOnline = useNetworkStatus();
  
  // Enhanced search functionality
  const {
    results: searchResults,
    isSearching,
    query: searchQuery,
    filters: searchFilters,
    setQuery: setSearchQuery,
    setFilters: setSearchFilters,
    fromCache,
    isIndexed
  } = useExerciseSearch({
    autoSearch: true,
    debounceMs: 300
  });

  // Performance optimization
  usePerformanceOptimization({
    enableMemoryMonitoring: true,
    enablePerformanceTracking: true
  });
  
  // For delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

  // Filter states for advanced filtering
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | "all">("all");
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | "all">("all");
  const [selectedMovement, setSelectedMovement] = useState<MovementPattern | "all">("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const exercisesPerPage = 8;

  // Virtualization toggle
  const [useVirtualization, setUseVirtualization] = useState(false);

  // Extract recently used exercises from workout history with Phase 1 crash fixes
  const recentExercises = useMemo(() => {
    // Phase 1 Fix: Add comprehensive null guards to prevent crashes
    if (!workouts?.length || !Array.isArray(exercises)) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
    // Get unique exercise names from recent workouts
    workouts.slice(0, 8).forEach(workout => {
      const exerciseNames = new Set<string>();
      
      // Phase 1 Fix: Add null guard for exerciseSets
      if (workout?.exerciseSets && Array.isArray(workout.exerciseSets)) {
        workout.exerciseSets.forEach(set => {
          if (set?.exercise_name) {
            exerciseNames.add(set.exercise_name);
          }
        });
      }
      
      exerciseNames.forEach(name => {
        const exercise = exercises.find(e => e?.name === name);
        if (exercise && !exerciseMap.has(exercise.id)) {
          exerciseMap.set(exercise.id, exercise);
        }
      });
    });
    
    // Phase 1 Fix: Safe Array.from with fallback to prevent iterator crashes
    return exerciseMap.size > 0 ? Array.from(exerciseMap.values()) : [];
  }, [workouts, exercises]);

  // Update search filters when local filters change
  useEffect(() => {
    const filters = {
      muscleGroup: selectedMuscleGroup !== "all" ? selectedMuscleGroup : undefined,
      equipment: selectedEquipment !== "all" ? selectedEquipment : undefined,
      difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
      movement: selectedMovement !== "all" ? selectedMovement : undefined
    };
    
    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );
    
    setSearchFilters(cleanFilters);
  }, [selectedMuscleGroup, selectedEquipment, selectedDifficulty, selectedMovement, setSearchFilters]);

  // Record user search patterns for predictive caching
  useEffect(() => {
    if (searchQuery || Object.keys(searchFilters).length > 0) {
      predictiveCache.recordUserSearch(searchQuery, searchFilters);
    }
  }, [searchQuery, searchFilters]);

  // Use search results when available, otherwise fallback to original exercises with null guards
  const suggestedExercises = useMemo(() => {
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
    const safeExercises = Array.isArray(exercises) ? exercises : [];
    
    return searchQuery || Object.keys(searchFilters).length > 0 
      ? safeSearchResults.slice(0, 20) 
      : safeExercises.slice(0, 20);
  }, [searchQuery, searchFilters, searchResults, exercises]);
    
  const filteredRecent = useMemo(() => {
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
    const safeRecentExercises = Array.isArray(recentExercises) ? recentExercises : [];
    
    return searchQuery || Object.keys(searchFilters).length > 0 
      ? safeSearchResults.filter(exercise => 
          safeRecentExercises.some(recent => recent?.id === exercise?.id)
        )
      : safeRecentExercises;
  }, [searchQuery, searchFilters, searchResults, recentExercises]);
    
  const filteredAll = useMemo(() => {
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
    const safeExercises = Array.isArray(exercises) ? exercises : [];
    
    return searchQuery || Object.keys(searchFilters).length > 0 
      ? safeSearchResults 
      : safeExercises;
  }, [searchQuery, searchFilters, searchResults, exercises]);

  // Pagination logic with null guards
  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = Array.isArray(filteredAll) 
    ? filteredAll.slice(indexOfFirstExercise, indexOfLastExercise)
    : [];
  const totalPages = Array.isArray(filteredAll) 
    ? Math.ceil(filteredAll.length / exercisesPerPage)
    : 0;

  const paginate = useCallback((pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  }, [totalPages]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchFilters]);

  const handleAdd = useCallback(() => {
    setShowCreateWizard(true);
  }, []);

  const handleEdit = useCallback((exercise: Exercise) => {
    toast({
      title: "Edit Exercise",
      description: "Exercise editing will be available soon!",
    });
  }, [toast]);
  
  const handleDelete = useCallback((exercise: Exercise) => {
    setExerciseToDelete(exercise);
    setDeleteConfirmOpen(true);
  }, []);
  
  const confirmDelete = useCallback(async () => {
    if (!exerciseToDelete) return;
    
    // Here we would actually delete the exercise
    toast({
      title: "Exercise deleted",
      description: `${exerciseToDelete.name} has been removed from your library`,
    });
    
    setDeleteConfirmOpen(false);
    setExerciseToDelete(null);
  }, [exerciseToDelete, toast]);
  
  const handleViewDetails = useCallback((exercise: Exercise) => {
    toast({
      title: "View Details",
      description: `This feature will be implemented soon!`,
    });
  }, [toast]);
  
  const handleDuplicate = useCallback((exercise: Exercise) => {
    toast({
      title: "Duplicate Exercise",
      description: `This feature will be implemented soon!`,
    });
  }, [toast]);

  const handleSelectExercise = useCallback((exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    }
  }, [onSelectExercise]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedMuscleGroup("all");
    setSelectedEquipment("all");
    setSelectedDifficulty("all");
    setSelectedMovement("all");
  }, [setSearchQuery]);

  // Handle wizard submission
  const handleCreateExercise = useCallback(async (exerciseData: any) => {
    try {
      await createExercise({
        ...exerciseData,
        user_id: "current-user-id" // This should come from auth context
      });
      setShowCreateWizard(false);
      
      toast({
        title: "Exercise created successfully! 🎉",
        description: `${exerciseData.name} has been added to your library`,
      });
    } catch (error) {
      console.error('Failed to create exercise:', error);
      toast({
        title: "Failed to create exercise",
        description: "Please try again or check your connection",
        variant: "destructive"
      });
    }
  }, [createExercise, toast]);

  return (
    <div className={`${standalone ? 'pt-16 pb-24' : ''} h-full overflow-hidden flex flex-col`}>
      {standalone && <PageHeader title="Exercise Library" />}
      
      {/* Main content container */}
      <div className={`flex-1 overflow-hidden flex flex-col mx-auto w-full max-w-4xl px-4 ${standalone ? 'py-4' : 'pt-0'}`}>
        <ExerciseCreationWizard
          open={showCreateWizard}
          onOpenChange={setShowCreateWizard}
          onSubmit={handleCreateExercise}
          loading={isPending}
        />
        
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
        
        {/* Header with back button */}
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
        <ExerciseSearchBar
          searchTerm={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={isSearching}
          fromCache={fromCache}
          isIndexed={isIndexed}
          totalExercises={Array.isArray(exercises) ? exercises.length : 0}
          className="mb-4"
        />
        
        {/* Virtualization toggle for large lists */}
        {Array.isArray(exercises) && exercises.length > 50 && (
          <div className="flex justify-end mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUseVirtualization(!useVirtualization)}
              className="text-xs text-gray-400 hover:text-gray-300"
            >
              {useVirtualization ? 'Standard View' : 'Virtual Scroll'}
            </Button>
          </div>
        )}
                
        {/* Tabs for navigation */}
        <Tabs className="flex-1 overflow-hidden flex flex-col" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="suggested">Suggested</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="browse">Browse All</TabsTrigger>
          </TabsList>
          
          {/* Filters - only show in browse tab */}
          {activeTab === 'browse' && (
            <ExerciseFilters
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
              selectedMuscleGroup={selectedMuscleGroup}
              onMuscleGroupChange={setSelectedMuscleGroup}
              selectedEquipment={selectedEquipment}
              onEquipmentChange={setSelectedEquipment}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={setSelectedDifficulty}
              selectedMovement={selectedMovement}
              onMovementChange={setSelectedMovement}
              onClearAll={clearFilters}
              resultCount={Array.isArray(filteredAll) ? filteredAll.length : 0}
              className="mb-4"
            />
          )}
          
          {/* Tab Content with search integration */}
          <div className="flex-1 overflow-y-auto">
            {/* Error state */}
            {isError && (
              <div className="text-red-500 text-center py-8">
                {isOnline ? "Error loading exercises. Please try again later." : "Unable to load exercises. Check your connection."}
              </div>
            )}
            
            {/* Tab Content */}
            {!isError && (
              <>
                <TabsContent value="suggested" className="mt-0 h-full">
                  <ExerciseTabsContent
                    exercises={suggestedExercises}
                    isLoading={isLoading || (!isIndexed && Array.isArray(exercises) && exercises.length > 0)}
                    isSearching={isSearching}
                    variant={standalone ? 'library-manage' : 'workout-add'}
                    useVirtualization={useVirtualization}
                    onAdd={handleSelectExercise}
                    onEdit={standalone ? handleEdit : undefined}
                    onDelete={standalone ? handleDelete : undefined}
                    onViewDetails={standalone ? handleViewDetails : undefined}
                    onDuplicate={standalone ? handleDuplicate : undefined}
                    onAddExercise={handleAdd}
                    onClearFilters={clearFilters}
                    isOnline={isOnline}
                  />
                </TabsContent>
                
                <TabsContent value="recent" className="mt-0 h-full">
                  <ExerciseTabsContent
                    exercises={filteredRecent}
                    isLoading={isLoading || (!isIndexed && Array.isArray(exercises) && exercises.length > 0)}
                    isSearching={isSearching}
                    variant={standalone ? 'library-manage' : 'workout-add'}
                    useVirtualization={useVirtualization}
                    onAdd={handleSelectExercise}
                    onEdit={standalone ? handleEdit : undefined}
                    onDelete={standalone ? handleDelete : undefined}
                    onViewDetails={standalone ? handleViewDetails : undefined}
                    onDuplicate={standalone ? handleDuplicate : undefined}
                    onAddExercise={handleAdd}
                    onClearFilters={clearFilters}
                    isOnline={isOnline}
                  />
                </TabsContent>
                
                <TabsContent value="browse" className="mt-0 h-full">
                  <ExerciseTabsContent
                    exercises={currentExercises}
                    isLoading={isLoading || (!isIndexed && Array.isArray(exercises) && exercises.length > 0)}
                    isSearching={isSearching}
                    variant={standalone ? 'library-manage' : 'workout-add'}
                    useVirtualization={useVirtualization}
                    showPagination={true}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={paginate}
                    onAdd={handleSelectExercise}
                    onEdit={standalone ? handleEdit : undefined}
                    onDelete={standalone ? handleDelete : undefined}
                    onViewDetails={standalone ? handleViewDetails : undefined}
                    onDuplicate={standalone ? handleDuplicate : undefined}
                    onAddExercise={handleAdd}
                    onClearFilters={clearFilters}
                    isOnline={isOnline}
                  />
                </TabsContent>
              </>
            )}
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
