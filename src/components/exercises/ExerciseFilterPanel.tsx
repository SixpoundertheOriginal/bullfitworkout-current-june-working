
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, X } from 'lucide-react';
import { ExerciseFilters } from './ExerciseFilters';
import { cn } from '@/lib/utils';
import { MuscleGroup, EquipmentType, Difficulty, MovementPattern } from '@/types/exercise';

interface ExerciseFilterPanelProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  selectedMuscleGroup: MuscleGroup | 'all';
  onMuscleGroupChange: (value: MuscleGroup | 'all') => void;
  selectedEquipment: EquipmentType | 'all';
  onEquipmentChange: (value: EquipmentType | 'all') => void;
  selectedDifficulty: Difficulty | 'all';
  onDifficultyChange: (value: Difficulty | 'all') => void;
  selectedMovement: MovementPattern | 'all';
  onMovementChange: (value: MovementPattern | 'all') => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}

export const ExerciseFilterPanel: React.FC<ExerciseFilterPanelProps> = React.memo(({
  showFilters,
  onToggleFilters,
  selectedMuscleGroup,
  onMuscleGroupChange,
  selectedEquipment,
  onEquipmentChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedMovement,
  onMovementChange,
  onClearFilters,
  hasActiveFilters,
  resultCount
}) => {
  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 px-3 transition-all duration-200",
            showFilters
              ? "bg-purple-900/50 border-purple-500/50 text-purple-300"
              : "border-gray-700 text-gray-400 hover:text-gray-300"
          )}
          onClick={onToggleFilters}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Advanced Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 bg-purple-600 text-xs">
              Active
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-purple-400 hover:text-purple-300 h-9 px-3"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="bg-gray-900/50 border-gray-800 animate-in fade-in slide-in-from-top-2 duration-300">
          <CardContent className="p-6">
            <ExerciseFilters
              isOpen={true}
              onToggle={() => {}}
              selectedMuscleGroup={selectedMuscleGroup}
              onMuscleGroupChange={onMuscleGroupChange}
              selectedEquipment={selectedEquipment}
              onEquipmentChange={onEquipmentChange}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={onDifficultyChange}
              selectedMovement={selectedMovement}
              onMovementChange={onMovementChange}
              onClearAll={onClearFilters}
              resultCount={resultCount}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
});

ExerciseFilterPanel.displayName = 'ExerciseFilterPanel';
