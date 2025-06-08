
import React, { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@/types/exercise";
import { useExercises } from "@/hooks/useExercises";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useUnifiedExerciseFiltering } from "@/hooks/useUnifiedExerciseFiltering";
import { ExerciseSelectionProvider, useExerciseSelection } from "@/contexts/ExerciseSelectionContext";
import { UnifiedExerciseCard } from "./UnifiedExerciseCard";
import { SmartFilterChips } from "./SmartFilterChips";
import { VisualEquipmentFilter } from "./VisualEquipmentFilter";

interface ExerciseSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: Exercise) => void;
  trainingType?: string;
  title?: string;
  selectionMode?: 'single' | 'multiple';
}

const ExerciseSelectionModalContent: React.FC<Omit<ExerciseSelectionModalProps, 'selectionMode'>> = ({
  open,
  onOpenChange,
  onSelectExercise,
  trainingType = "",
  title = "Add an Exercise"
}) => {
  const [activeTab, setActiveTab] = useState<string>("suggested");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { exercises: allExercises } = useExercises();
  const { workouts } = useWorkoutHistory();
  
  const {
    filters,
    filteredExercises,
    setSearchQuery,
    setSelectedMuscleGroup,
    setSelectedEquipment,
    setSelectedDifficulty,
    clearAllFilters,
    hasActiveFilters
  } = useUnifiedExerciseFiltering({ 
    exercises: allExercises || [] 
  });

  // Get recent exercises from workout history
  const recentExercises = useMemo(() => {
    if (!workouts?.length || !Array.isArray(allExercises)) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
    workouts.slice(0, 10).forEach(workout => {
      const exerciseNames = new Set<string>();
      
      if (workout?.exerciseSets && Array.isArray(workout.exerciseSets)) {
        workout.exerciseSets.forEach(set => {
          if (set?.exercise_name) {
            exerciseNames.add(set.exercise_name);
          }
        });
      }
      
      exerciseNames.forEach(name => {
        const exercise = allExercises.find(e => e?.name === name);
        if (exercise && !exerciseMap.has(exercise.id)) {
          exerciseMap.set(exercise.id, exercise);
        }
      });
    });
    
    return Array.from(exerciseMap.values());
  }, [workouts, allExercises]);

  // Generate suggested exercises based on training type
  const suggestedExercises = useMemo(() => {
    if (!Array.isArray(allExercises)) return [];
    
    if (trainingType) {
      // Filter by training type if provided
      const trainingTypeLower = trainingType.toLowerCase();
      return allExercises.filter(exercise => 
        exercise?.primary_muscle_groups?.some(muscle => 
          muscle.toLowerCase().includes(trainingTypeLower)
        ) ||
        exercise?.name?.toLowerCase().includes(trainingTypeLower)
      ).slice(0, 20);
    }
    
    // Default suggestions - mix of popular compound exercises
    return allExercises.filter(exercise => 
      exercise?.is_compound || 
      exercise?.primary_muscle_groups?.some(muscle => 
        ['chest', 'back', 'legs', 'shoulders'].includes(muscle.toLowerCase())
      )
    ).slice(0, 20);
  }, [allExercises, trainingType]);

  const handleAddExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    onOpenChange(false);
  };

  const getExercisesForTab = () => {
    switch (activeTab) {
      case 'suggested':
        return hasActiveFilters ? filteredExercises : suggestedExercises;
      case 'recent':
        return hasActiveFilters 
          ? filteredExercises.filter(e => recentExercises.some(r => r.id === e.id))
          : recentExercises;
      case 'all':
        return filteredExercises;
      default:
        return [];
    }
  };

  const currentExercises = getExercisesForTab();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-xl border-t border-gray-700 bg-gray-900 p-0"
      >
        <div className="flex flex-col h-full">
          {/* Handle */}
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1.5 bg-gray-700 rounded-full"></div>
          </div>
          
          <div className="px-4 pb-2 h-full flex flex-col">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-xl font-bold text-center">{title}</SheetTitle>
            </SheetHeader>
            
            {/* Search and Filters */}
            <div className="space-y-4 mb-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search exercises..."
                  className="pl-9 bg-gray-800 border-gray-700"
                  value={filters.searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Quick Filter Chips */}
              <SmartFilterChips
                selectedMuscleGroup={filters.selectedMuscleGroup}
                selectedEquipment={filters.selectedEquipment}
                selectedDifficulty={filters.selectedDifficulty}
                onMuscleGroupChange={setSelectedMuscleGroup}
                onEquipmentChange={setSelectedEquipment}
                onDifficultyChange={setSelectedDifficulty}
                onClearAll={clearAllFilters}
              />

              {/* Advanced Filters Toggle */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="border-gray-700 text-gray-400 hover:text-gray-300"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced Filters
                </Button>
                
                {hasActiveFilters && (
                  <Badge variant="outline" className="bg-purple-600/20 border-purple-500/30 text-purple-300">
                    {filteredExercises.length} results
                  </Badge>
                )}
              </div>

              {/* Advanced Filters Panel */}
              {showAdvancedFilters && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <VisualEquipmentFilter
                    selectedEquipment={filters.selectedEquipment}
                    onEquipmentChange={setSelectedEquipment}
                  />
                </div>
              )}
            </div>
            
            {/* Tabs */}
            <Tabs defaultValue="suggested" className="w-full flex-1 flex flex-col" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="suggested">Suggested ({suggestedExercises.length})</TabsTrigger>
                <TabsTrigger value="recent">Recent ({recentExercises.length})</TabsTrigger>
                <TabsTrigger value="all">All ({allExercises?.length || 0})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="suggested" className="mt-0 flex-1 overflow-auto">
                <div className="grid grid-cols-1 gap-3 max-h-[calc(85vh-300px)] overflow-y-auto">
                  {currentExercises.length > 0 ? (
                    currentExercises.map(exercise => (
                      <UnifiedExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        variant="compact"
                        context="selection"
                        onAdd={handleAddExercise}
                        onSelectExercise={handleAddExercise}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-lg font-medium">No exercises found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="recent" className="mt-0 flex-1 overflow-auto">
                <div className="grid grid-cols-1 gap-3 max-h-[calc(85vh-300px)] overflow-y-auto">
                  {currentExercises.length > 0 ? (
                    currentExercises.map(exercise => (
                      <UnifiedExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        variant="compact"
                        context="selection"
                        onAdd={handleAddExercise}
                        onSelectExercise={handleAddExercise}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-lg font-medium">No recent exercises found</p>
                      <p className="text-sm">Start working out to see your recent exercises here</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="all" className="mt-0 flex-1 overflow-auto">
                <div className="grid grid-cols-1 gap-3 max-h-[calc(85vh-300px)] overflow-y-auto">
                  {currentExercises.length > 0 ? (
                    currentExercises.map(exercise => (
                      <UnifiedExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        variant="compact"
                        context="selection"
                        onAdd={handleAddExercise}
                        onSelectExercise={handleAddExercise}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-lg font-medium">No exercises found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const ExerciseSelectionModal: React.FC<ExerciseSelectionModalProps> = (props) => {
  return (
    <ExerciseSelectionProvider initialMode={props.selectionMode}>
      <ExerciseSelectionModalContent {...props} />
    </ExerciseSelectionProvider>
  );
};
