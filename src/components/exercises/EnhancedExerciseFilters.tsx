
import React, { useCallback } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';
import { COMMON_MUSCLE_GROUPS, COMMON_EQUIPMENT, MOVEMENT_PATTERNS, DIFFICULTY_LEVELS } from '@/types/exercise';

interface EnhancedExerciseFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
  selectedMuscleGroup: MuscleGroup | "all";
  onMuscleGroupChange: (value: MuscleGroup | "all") => void;
  selectedEquipment: EquipmentType | "all";
  onEquipmentChange: (value: EquipmentType | "all") => void;
  selectedDifficulty: Difficulty | "all";
  onDifficultyChange: (value: Difficulty | "all") => void;
  selectedMovement: MovementPattern | "all";
  onMovementChange: (value: MovementPattern | "all") => void;
  onClearAll: () => void;
  resultCount: number;
  className?: string;
}

export const EnhancedExerciseFilters = React.memo<EnhancedExerciseFiltersProps>(({
  isOpen,
  onToggle,
  selectedMuscleGroup,
  onMuscleGroupChange,
  selectedEquipment,
  onEquipmentChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedMovement,
  onMovementChange,
  onClearAll,
  resultCount,
  className = ""
}) => {
  const activeFilterCount = [
    selectedMuscleGroup !== "all" ? 1 : 0,
    selectedEquipment !== "all" ? 1 : 0,
    selectedDifficulty !== "all" ? 1 : 0,
    selectedMovement !== "all" ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const hasActiveFilters = activeFilterCount > 0;

  // Type-safe handlers for Select components
  const handleMuscleGroupChange = useCallback((value: string) => {
    onMuscleGroupChange(value as MuscleGroup | "all");
  }, [onMuscleGroupChange]);

  const handleEquipmentChange = useCallback((value: string) => {
    onEquipmentChange(value as EquipmentType | "all");
  }, [onEquipmentChange]);

  const handleDifficultyChange = useCallback((value: string) => {
    onDifficultyChange(value as Difficulty | "all");
  }, [onDifficultyChange]);

  const handleMovementChange = useCallback((value: string) => {
    onMovementChange(value as MovementPattern | "all");
  }, [onMovementChange]);

  return (
    <div className={className}>
      {/* Filter toggle button */}
      <Button 
        variant="outline"
        size="sm" 
        onClick={onToggle}
        className={`flex items-center w-full justify-center ${isOpen ? 'bg-purple-900/50 border-purple-500' : ''}`}
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {hasActiveFilters && (
          <Badge variant="secondary" className="ml-2 bg-purple-600 text-xs">
            {activeFilterCount}
          </Badge>
        )}
      </Button>

      {/* Filter panel */}
      {isOpen && (
        <Card className="mt-4 p-4 bg-gray-800/50 border-gray-700 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Muscle Group Filter */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Muscle Group</label>
              <Select 
                value={selectedMuscleGroup as string} 
                onValueChange={handleMuscleGroupChange}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select muscle group" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 z-50">
                  <SelectGroup>
                    <SelectItem value="all">All Muscle Groups</SelectItem>
                    {COMMON_MUSCLE_GROUPS.map((muscle) => (
                      <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Equipment Filter */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Equipment</label>
              <Select 
                value={selectedEquipment as string} 
                onValueChange={handleEquipmentChange}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 z-50">
                  <SelectGroup>
                    <SelectItem value="all">All Equipment</SelectItem>
                    {COMMON_EQUIPMENT.map((equipment) => (
                      <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Difficulty Filter */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Difficulty</label>
              <Select 
                value={selectedDifficulty as string} 
                onValueChange={handleDifficultyChange}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 z-50">
                  <SelectGroup>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {DIFFICULTY_LEVELS.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            {/* Movement Pattern Filter */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Movement Pattern</label>
              <Select 
                value={selectedMovement as string} 
                onValueChange={handleMovementChange}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 z-50">
                  <SelectGroup>
                    <SelectItem value="all">All Patterns</SelectItem>
                    {MOVEMENT_PATTERNS.map((pattern) => (
                      <SelectItem key={pattern} value={pattern}>{pattern}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Filter summary and clear */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {resultCount} exercise{resultCount !== 1 ? 's' : ''} found
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-purple-400 hover:text-purple-300 h-8 px-2"
              >
                <X className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
});

EnhancedExerciseFilters.displayName = 'EnhancedExerciseFilters';
