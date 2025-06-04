
import React from 'react';
import { Exercise } from '@/types/exercise';
import { VirtualizedExerciseList } from './VirtualizedExerciseList';
import { LazyExerciseCard, ExerciseCardSkeleton } from './LazyExerciseCard';
import { ExerciseEmptyState } from './ExerciseEmptyState';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface ExerciseTabsContentProps {
  exercises: Exercise[];
  isLoading: boolean;
  isSearching: boolean;
  variant: 'library-manage' | 'workout-add';
  useVirtualization: boolean;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onAdd?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
  onDuplicate?: (exercise: Exercise) => void;
  onAddExercise?: () => void;
  onClearFilters?: () => void;
  isOnline?: boolean;
  className?: string;
}

export const ExerciseTabsContent = React.memo<ExerciseTabsContentProps>(({
  exercises,
  isLoading,
  isSearching,
  variant,
  useVirtualization,
  showPagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onDuplicate,
  onAddExercise,
  onClearFilters,
  isOnline = true,
  className = ""
}) => {
  // Loading state with skeletons
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 4 }).map((_, index) => (
          <ExerciseCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state
  if (exercises.length === 0) {
    const emptyStateType = isSearching ? 'no-results' : 
                          !isOnline ? 'offline' : 
                          'no-exercises';
    
    return (
      <ExerciseEmptyState
        type={emptyStateType}
        onAddExercise={onAddExercise}
        onClearFilters={onClearFilters}
        className={className}
      />
    );
  }

  // Virtualized list for large datasets
  if (useVirtualization && exercises.length > 50 && !showPagination) {
    return (
      <div className={className}>
        <VirtualizedExerciseList
          exercises={exercises}
          variant={variant}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          onDuplicate={onDuplicate}
          containerHeight={600}
          itemHeight={120}
        />
      </div>
    );
  }

  // Standard list view
  return (
    <div className={`space-y-2 ${className}`}>
      {exercises.map((exercise) => (
        <LazyExerciseCard
          key={exercise.id}
          exercise={exercise}
          variant={variant}
          onAdd={onAdd ? () => onAdd(exercise) : undefined}
          onEdit={onEdit ? () => onEdit(exercise) : undefined}
          onDelete={onDelete ? () => onDelete(exercise) : undefined}
          onViewDetails={onViewDetails ? () => onViewDetails(exercise) : undefined}
          onDuplicate={onDuplicate ? () => onDuplicate(exercise) : undefined}
        />
      ))}
      
      {/* Pagination */}
      {showPagination && totalPages > 1 && onPageChange && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            <PaginationItem>
              <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
            </PaginationItem>
            
            {currentPage > 3 && (
              <PaginationItem>
                <span className="px-2">...</span>
              </PaginationItem>
            )}
            
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(currentPage - 1)}>
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationLink isActive>{currentPage}</PaginationLink>
            </PaginationItem>
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(currentPage + 1)}>
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}
            
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <span className="px-2">...</span>
              </PaginationItem>
            )}
            
            {currentPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(currentPage + 1)}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
});

ExerciseTabsContent.displayName = 'ExerciseTabsContent';
