
import React, { memo } from 'react';
import { Exercise } from "@/types/exercise";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CommonExerciseCard } from "@/components/exercises/CommonExerciseCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ExerciseListViewProps {
  exercises: Exercise[];
  isLoading: boolean;
  isPaginated?: boolean;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant: 'library-manage' | 'workout-add';
  onAdd: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
  onDuplicate?: (exercise: Exercise) => void;
  hasSearch?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onAddNew?: () => void;
}

const ExerciseListView: React.FC<ExerciseListViewProps> = ({
  exercises,
  isLoading,
  isPaginated = false,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  variant,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onDuplicate,
  hasSearch = false,
  hasActiveFilters = false,
  onClearFilters,
  onAddNew
}) => {
  // Handle empty state
  if (exercises.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-800/50 rounded-lg py-10 px-6 max-w-md mx-auto">
          {hasSearch || hasActiveFilters ? (
            <>
              <h3 className="text-xl font-medium mb-2">No matching exercises</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
              {onClearFilters && (
                <Button variant="outline" onClick={onClearFilters}>Clear filters</Button>
              )}
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium mb-2">No exercises found</h3>
              <p className="text-gray-400 mb-6">Create your first exercise to get started</p>
              {onAddNew && (
                <Button variant="gradient" onClick={onAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Exercise
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Render exercise cards
  const renderExerciseCard = (exercise: Exercise) => {
    return (
      <div key={exercise.id} className="mb-4">
        <CommonExerciseCard
          exercise={exercise}
          variant={variant}
          onAdd={() => onAdd(exercise)}
          onEdit={onEdit ? () => onEdit(exercise) : undefined}
          onDelete={onDelete ? () => onDelete(exercise) : undefined}
          onViewDetails={onViewDetails ? () => onViewDetails(exercise) : undefined}
          onDuplicate={onDuplicate ? () => onDuplicate(exercise) : undefined}
        />
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {exercises.map(renderExerciseCard)}
      
      {isPaginated && totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(currentPage - 1)}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {/* First page */}
            {currentPage > 2 && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
              </PaginationItem>
            )}
            
            {/* Ellipsis */}
            {currentPage > 3 && (
              <PaginationItem>
                <span className="px-2">...</span>
              </PaginationItem>
            )}
            
            {/* Previous page */}
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(currentPage - 1)}>
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}
            
            {/* Current page */}
            <PaginationItem>
              <PaginationLink isActive>{currentPage}</PaginationLink>
            </PaginationItem>
            
            {/* Next page */}
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink onClick={() => onPageChange(currentPage + 1)}>
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}
            
            {/* Ellipsis */}
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <span className="px-2">...</span>
              </PaginationItem>
            )}
            
            {/* Last page */}
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
};

// Memoize the component to prevent unnecessary re-renders
export default memo(ExerciseListView);
