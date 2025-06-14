
import React, { createContext, useContext, useMemo } from 'react';
import { Exercise } from '@/types/exercise';
import { useExercises } from '@/hooks/useExercises';
import { useValidatedWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useUnifiedExerciseFiltering } from '@/hooks/useUnifiedExerciseFiltering';
import { useSearchableList } from '@/hooks/useSearchableList';
import { useTabs, TabItem } from '@/hooks/useTabs';

interface ExerciseSelectionModalContextType {
  // Exercise data
  allExercises: Exercise[];
  suggestedExercises: Exercise[];
  recentExercises: Exercise[];
  
  // Tab management
  tabs: TabItem[];
  activeTab: string;
  changeTab: (tabId: string) => void;
  
  // Search and filtering
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredExercises: Exercise[];
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
  
  // Current exercise list for active tab
  currentExercises: Exercise[];
}

const ExerciseSelectionModalContext = createContext<ExerciseSelectionModalContextType | undefined>(undefined);

interface ExerciseSelectionModalProviderProps {
  children: React.ReactNode;
  trainingType?: string;
}

export const ExerciseSelectionModalProvider: React.FC<ExerciseSelectionModalProviderProps> = ({
  children,
  trainingType = ""
}) => {
  const { exercises: allExercises = [] } = useExercises();
  const { data } = useValidatedWorkoutHistory();

  // Safely get workouts from validated data
  const workouts = data?.workouts || [];

  // Generate suggested exercises based on training type
  const suggestedExercises = useMemo(() => {
    if (!Array.isArray(allExercises)) return [];
    
    if (trainingType) {
      const trainingTypeLower = trainingType.toLowerCase();
      return allExercises.filter(exercise => 
        exercise?.primary_muscle_groups?.some(muscle => 
          muscle.toLowerCase().includes(trainingTypeLower)
        ) ||
        exercise?.name?.toLowerCase().includes(trainingTypeLower)
      ).slice(0, 20);
    }
    
    return allExercises.filter(exercise => 
      exercise?.is_compound || 
      exercise?.primary_muscle_groups?.some(muscle => 
        ['chest', 'back', 'legs', 'shoulders'].includes(muscle.toLowerCase())
      )
    ).slice(0, 20);
  }, [allExercises, trainingType]);

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

  // Setup tabs
  const tabs: TabItem[] = [
    { id: 'suggested', label: 'Suggested', count: suggestedExercises.length },
    { id: 'recent', label: 'Recent', count: recentExercises.length },
    { id: 'all', label: 'All', count: allExercises?.length || 0 }
  ];

  const { activeTab, changeTab } = useTabs(tabs, { defaultTab: 'suggested' });

  // Setup filtering
  const {
    filters,
    filteredExercises,
    setSearchQuery,
    clearAllFilters,
    hasActiveFilters
  } = useUnifiedExerciseFiltering({ 
    exercises: allExercises || [] 
  });

  // Get exercises for current tab
  const currentExercises = useMemo(() => {
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
  }, [activeTab, hasActiveFilters, filteredExercises, suggestedExercises, recentExercises]);

  const value = useMemo((): ExerciseSelectionModalContextType => ({
    allExercises,
    suggestedExercises,
    recentExercises,
    tabs,
    activeTab,
    changeTab,
    searchQuery: filters.searchQuery,
    setSearchQuery,
    filteredExercises,
    hasActiveFilters,
    clearAllFilters,
    currentExercises
  }), [
    allExercises,
    suggestedExercises,
    recentExercises,
    tabs,
    activeTab,
    changeTab,
    filters.searchQuery,
    setSearchQuery,
    filteredExercises,
    hasActiveFilters,
    clearAllFilters,
    currentExercises
  ]);

  return (
    <ExerciseSelectionModalContext.Provider value={value}>
      {children}
    </ExerciseSelectionModalContext.Provider>
  );
};

export const useExerciseSelectionModal = () => {
  const context = useContext(ExerciseSelectionModalContext);
  if (context === undefined) {
    throw new Error('useExerciseSelectionModal must be used within ExerciseSelectionModalProvider');
  }
  return context;
};
