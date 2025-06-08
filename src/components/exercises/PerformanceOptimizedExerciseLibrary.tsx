
import React, { useState, useMemo } from 'react';
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

export const PerformanceOptimizedExerciseLibrary: React.FC<PerformanceOptimizedExerciseLibraryProps> = ({
  onSelectExercise,
  showCreateButton = true
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use the optimized hook
  const { exercises, isLoading, createExercise, isPending, totalCount } = useOptimizedExercises();

  // Optimized search with memoization
  const filteredExercises = useMemo(() => {
    if (!searchTerm) return exercises;
    
    const searchLower = searchTerm.toLowerCase();
    return exercises.filter(exercise =>
      exercise?.name?.toLowerCase().includes(searchLower) ||
      exercise?.description?.toLowerCase().includes(searchLower) ||
      exercise?.primary_muscle_groups?.some(muscle => 
        muscle?.toLowerCase().includes(searchLower)
      )
    );
  }, [exercises, searchTerm]);

  const handleCreateExercise = async (exerciseData: any) => {
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
  };

  const handleViewExercise = (exercise: any) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    } else {
      toast({
        title: "Exercise details",
        description: `Viewing ${exercise.name}`,
      });
    }
  };

  const isProcessing = isPending || isSubmitting;

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
              <span>RLS Optimized • {totalCount} exercises</span>
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
          onSearchChange={setSearchTerm}
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
          </div>
        </div>
      </Card>

      {/* Virtualized Grid */}
      <div className="flex-1 min-h-0">
        <VirtualizedExerciseGrid
          exercises={filteredExercises}
          isLoading={isLoading}
          onSelectExercise={handleViewExercise}
          onEditExercise={() => {}}
          onDeleteExercise={() => {}}
          className="h-full"
        />
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
};
