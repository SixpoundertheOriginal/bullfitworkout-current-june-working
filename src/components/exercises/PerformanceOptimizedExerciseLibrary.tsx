
import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Activity, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOptimizedExercises } from '@/hooks/useOptimizedExercises';
import { VirtualizedExerciseGrid } from './VirtualizedExerciseGrid';
import { OptimizedExerciseSearchBar } from './OptimizedExerciseSearchBar';
import { ExerciseCreationWizard } from './ExerciseCreationWizard';
import { toast } from '@/hooks/use-toast';
import { useAuth } from "@/context/AuthContext";

interface PerformanceOptimizedExerciseLibraryProps {
  onSelectExercise?: (exercise: any) => void;
  showCreateButton?: boolean;
}

export const PerformanceOptimizedExerciseLibrary: React.FC<PerformanceOptimizedExerciseLibraryProps> = React.memo(({
  onSelectExercise,
  showCreateButton = true
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use the optimized hook
  const { exercises, isLoading, createExercise, isPending, totalCount } = useOptimizedExercises();

  // Memoized search function with performance optimization
  const filteredExercises = useMemo(() => {
    console.log('Filtering exercises:', { exerciseCount: exercises.length, searchTerm });
    
    if (!searchTerm.trim()) {
      console.log('No search term, returning all exercises:', exercises.length);
      return exercises;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = exercises.filter(exercise => {
      if (!exercise) return false;
      
      return exercise.name?.toLowerCase().includes(searchLower) ||
             exercise.description?.toLowerCase().includes(searchLower) ||
             exercise.primary_muscle_groups?.some(muscle => 
               muscle?.toLowerCase().includes(searchLower)
             ) ||
             exercise.secondary_muscle_groups?.some(muscle => 
               muscle?.toLowerCase().includes(searchLower)
             ) ||
             exercise.equipment_type?.some(equipment => 
               equipment?.toLowerCase().includes(searchLower)
             );
    });

    console.log('Filtered exercises result:', { originalCount: exercises.length, filteredCount: filtered.length, searchTerm });
    return filtered;
  }, [exercises, searchTerm]);

  // Memoized search handler to prevent unnecessary rerenders
  const handleSearchChange = useCallback((newSearchTerm: string) => {
    console.log('Search term changed:', newSearchTerm);
    setSearchTerm(newSearchTerm);
  }, []);

  const handleCreateExercise = useCallback(async (exerciseData: any) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create exercises",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createExercise({
        ...exerciseData,
        user_id: user.id
      });
      
      setShowCreateWizard(false);
      toast({
        title: "Exercise created successfully! 🎉",
        description: `${exerciseData.name} has been added with optimized performance`,
      });
    } catch (error) {
      console.error('Failed to create exercise:', error);
      toast({
        title: "Failed to create exercise",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [createExercise, toast, user?.id]);

  const handleViewExercise = useCallback((exercise: any) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    } else {
      toast({
        title: "Exercise details",
        description: `Viewing ${exercise.name}`,
      });
    }
  }, [onSelectExercise, toast]);

  const isProcessing = isPending || isSubmitting;

  // Debug logging for exercise display
  React.useEffect(() => {
    console.log('PerformanceOptimizedExerciseLibrary render:', {
      exerciseCount: exercises.length,
      filteredCount: filteredExercises.length,
      isLoading,
      searchTerm
    });
  }, [exercises.length, filteredExercises.length, isLoading, searchTerm]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Performance Indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-green-500" />
          <div>
            <h2 className="text-xl font-semibold text-white">Exercise Library</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span>RLS Optimized • {totalCount} exercises loaded</span>
              <Badge variant="secondary" className="text-xs">
                Enhanced Performance
              </Badge>
            </div>
          </div>
        </div>
        
        {showCreateButton && (
          <Button
            onClick={() => setShowCreateWizard(true)}
            disabled={isProcessing}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isProcessing ? 'Creating...' : 'Create Exercise'}
          </Button>
        )}
      </div>

      {/* Optimized Search */}
      <Card className="p-4 bg-gray-900/50 border-gray-700/50">
        <OptimizedExerciseSearchBar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          totalExercises={totalCount}
          filteredCount={filteredExercises.length}
          onFiltersToggle={() => {}}
          hasActiveFilters={false}
          isLoading={isLoading}
        />
        
        {/* Performance Stats */}
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Performance: Optimized RLS</span>
            <span>•</span>
            <span>Indexed Queries: Active</span>
            <span>•</span>
            <span>Cache Strategy: Enhanced</span>
            <span>•</span>
            <span>Exercises Showing: {filteredExercises.length}</span>
          </div>
        </div>
      </Card>

      {/* Virtualized Grid */}
      <div className="flex-1 min-h-0">
        {filteredExercises.length > 0 ? (
          <VirtualizedExerciseGrid
            exercises={filteredExercises}
            isLoading={isLoading}
            onSelectExercise={handleViewExercise}
            onEditExercise={() => {}}
            onDeleteExercise={() => {}}
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                {isLoading ? 'Loading exercises...' : searchTerm ? 'No exercises found' : 'No exercises available'}
              </h3>
              <p className="text-gray-500">
                {isLoading ? 'Please wait while we load your exercises' : 
                 searchTerm ? 'Try adjusting your search terms' : 
                 'Create your first exercise to get started'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Creation Wizard */}
      <ExerciseCreationWizard
        open={showCreateWizard}
        onOpenChange={setShowCreateWizard}
        onSubmit={handleCreateExercise}
        loading={isProcessing}
      />
    </div>
  );
});

PerformanceOptimizedExerciseLibrary.displayName = 'PerformanceOptimizedExerciseLibrary';
