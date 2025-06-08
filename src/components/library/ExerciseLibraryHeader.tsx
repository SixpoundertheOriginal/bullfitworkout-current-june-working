
import React from 'react';
import { Plus, Sparkles, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ActionButton } from '@/components/ui/ActionButton';
import { OptimizedExerciseSearchBar } from '@/components/exercises/OptimizedExerciseSearchBar';

interface ExerciseLibraryHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  totalExercises: number;
  filteredCount: number;
  hasActiveFilters: boolean;
  isLoading: boolean;
  onCreateExercise: () => void;
  onFiltersToggle: () => void;
  isProcessing?: boolean;
}

export const ExerciseLibraryHeader: React.FC<ExerciseLibraryHeaderProps> = ({
  searchTerm,
  onSearchChange,
  totalExercises,
  filteredCount,
  hasActiveFilters,
  isLoading,
  onCreateExercise,
  onFiltersToggle,
  isProcessing = false
}) => {
  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Exercise Library
            </h1>
            <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
              <Activity className="w-3 h-3 mr-1" />
              RLS Optimized
            </Badge>
          </div>
          <p className="text-gray-400 mt-1">
            Discover and manage your exercise collection with enhanced performance
          </p>
        </div>
        
        <ActionButton
          variant="primary"
          icon={Sparkles}
          onClick={onCreateExercise}
          disabled={isProcessing}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25"
          aria-label="Create new exercise"
        >
          {isProcessing ? 'Creating...' : 'Create Exercise'}
        </ActionButton>
      </div>

      {/* Search Section */}
      <div className="bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm rounded-lg p-6">
        <OptimizedExerciseSearchBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          totalExercises={totalExercises}
          filteredCount={filteredCount}
          onFiltersToggle={onFiltersToggle}
          hasActiveFilters={hasActiveFilters}
          isLoading={isLoading}
        />
      </div>

      {/* Performance Stats */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Sparkles className="w-3 h-3" />
        <span>
          Optimized for {totalExercises}+ exercises • Enhanced RLS policies • Sub-100ms response time
        </span>
      </div>
    </div>
  );
};
