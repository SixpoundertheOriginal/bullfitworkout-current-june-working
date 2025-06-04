
import React from 'react';
import { Search, Plus, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ExerciseEmptyStateProps {
  type: 'no-results' | 'no-exercises' | 'offline';
  searchTerm?: string;
  onAddExercise?: () => void;
  onClearFilters?: () => void;
  className?: string;
}

export const ExerciseEmptyState = React.memo<ExerciseEmptyStateProps>(({
  type,
  searchTerm,
  onAddExercise,
  onClearFilters,
  className = ""
}) => {
  const getContent = () => {
    switch (type) {
      case 'no-results':
        return {
          icon: <Search className="w-12 h-12 text-gray-400 mb-4" />,
          title: searchTerm ? `No results for "${searchTerm}"` : 'No exercises match your filters',
          description: 'Try adjusting your search terms or filters to find more exercises.',
          actions: (
            <div className="flex gap-2">
              {onClearFilters && (
                <Button variant="outline" onClick={onClearFilters}>
                  Clear Filters
                </Button>
              )}
              {onAddExercise && (
                <Button onClick={onAddExercise}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              )}
            </div>
          )
        };
      
      case 'no-exercises':
        return {
          icon: <Dumbbell className="w-12 h-12 text-gray-400 mb-4" />,
          title: 'No exercises in your library',
          description: 'Start building your exercise library by adding your first exercise.',
          actions: onAddExercise && (
            <Button onClick={onAddExercise}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Exercise
            </Button>
          )
        };
      
      case 'offline':
        return {
          icon: <Search className="w-12 h-12 text-amber-400 mb-4" />,
          title: 'No cached exercises available',
          description: 'You\'re currently offline. Exercises will be available when you reconnect.',
          actions: null
        };
      
      default:
        return {
          icon: <Search className="w-12 h-12 text-gray-400 mb-4" />,
          title: 'No exercises found',
          description: 'Try a different search or check back later.',
          actions: null
        };
    }
  };

  const content = getContent();

  return (
    <Card className={`${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {content.icon}
        <h3 className="text-lg font-semibold text-gray-300 mb-2">
          {content.title}
        </h3>
        <p className="text-sm text-gray-400 mb-6 max-w-md">
          {content.description}
        </p>
        {content.actions}
      </CardContent>
    </Card>
  );
});

ExerciseEmptyState.displayName = 'ExerciseEmptyState';
