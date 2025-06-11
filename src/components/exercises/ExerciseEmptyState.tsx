
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Dumbbell } from 'lucide-react';

interface ExerciseEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateExercise?: () => void;
  showCreateButton?: boolean;
}

export const ExerciseEmptyState: React.FC<ExerciseEmptyStateProps> = React.memo(({
  hasFilters,
  onClearFilters,
  onCreateExercise,
  showCreateButton = false
}) => {
  if (hasFilters) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-amber-400" />
          </div>
          <div className="space-y-2 mb-6">
            <h3 className="text-lg font-medium text-gray-200">No exercises match your filters</h3>
            <p className="text-sm text-gray-400">
              Try adjusting your search criteria or clear all filters to see more results.
            </p>
          </div>
          <Button variant="outline" onClick={onClearFilters}>
            Clear All Filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
          <Dumbbell className="w-8 h-8 text-purple-400" />
        </div>
        <div className="space-y-2 mb-6">
          <h3 className="text-lg font-medium text-gray-200">No exercises found</h3>
          <p className="text-sm text-gray-400">
            Get started by creating your first exercise or browse the exercise library.
          </p>
        </div>
        {showCreateButton && onCreateExercise && (
          <Button 
            onClick={onCreateExercise}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Exercise
          </Button>
        )}
      </CardContent>
    </Card>
  );
});

ExerciseEmptyState.displayName = 'ExerciseEmptyState';
