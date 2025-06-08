
import React, { useState } from 'react';
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@/types/exercise";
import { ExerciseSelectionProvider } from "@/contexts/ExerciseSelectionContext";
import { ExerciseSelectionModalProvider, useExerciseSelectionModal } from "@/contexts/ExerciseSelectionModalContext";
import { UnifiedExerciseCard } from "./UnifiedExerciseCard";
import { SmartFilterChips } from "./SmartFilterChips";
import { VisualEquipmentFilter } from "./VisualEquipmentFilter";
import { BaseModal } from "@/components/ui/BaseModal";
import { ModalHeader } from "@/components/ui/ModalHeader";
import { ModalContent } from "@/components/ui/ModalContent";
import { TabNavigation } from "@/components/ui/TabNavigation";
import { SearchableList } from "@/components/ui/SearchableList";

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
  title = "Add an Exercise"
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const {
    tabs,
    activeTab,
    changeTab,
    searchQuery,
    setSearchQuery,
    hasActiveFilters,
    clearAllFilters,
    filteredExercises,
    currentExercises
  } = useExerciseSelectionModal();

  // Use existing filtering hook for advanced filters
  const { useUnifiedExerciseFiltering } = require('@/hooks/useUnifiedExerciseFiltering');
  const {
    filters,
    setSelectedMuscleGroup,
    setSelectedEquipment,
    setSelectedDifficulty
  } = useUnifiedExerciseFiltering({ exercises: [] });

  const handleAddExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    onOpenChange(false);
  };

  const renderExerciseItem = (exercise: Exercise, index: number) => (
    <UnifiedExerciseCard
      key={exercise.id}
      exercise={exercise}
      variant="compact"
      context="selection"
      onAdd={handleAddExercise}
      onSelectExercise={handleAddExercise}
    />
  );

  return (
    <BaseModal 
      open={open} 
      onOpenChange={onOpenChange}
      side="bottom"
      size="full"
    >
      <ModalHeader>
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-bold text-center">{title}</SheetTitle>
        </SheetHeader>
        
        {/* Tabs */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={changeTab}
          className="mb-4"
        />
      </ModalHeader>

      <ModalContent>
        <div className="space-y-4 mb-4">
          {/* Smart Filter Chips */}
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

        {/* Searchable Exercise List */}
        <SearchableList
          items={currentExercises}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          renderItem={renderExerciseItem}
          searchPlaceholder="Search exercises..."
          emptyMessage="Try adjusting your search or filters"
        />
      </ModalContent>
    </BaseModal>
  );
};

export const ExerciseSelectionModal: React.FC<ExerciseSelectionModalProps> = (props) => {
  return (
    <ExerciseSelectionProvider initialMode={props.selectionMode}>
      <ExerciseSelectionModalProvider trainingType={props.trainingType}>
        <ExerciseSelectionModalContent {...props} />
      </ExerciseSelectionModalProvider>
    </ExerciseSelectionProvider>
  );
};
