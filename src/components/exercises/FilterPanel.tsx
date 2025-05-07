
import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  COMMON_MUSCLE_GROUPS,
  COMMON_EQUIPMENT,
  MOVEMENT_PATTERNS,
  DIFFICULTY_LEVELS,
  type MuscleGroup,
  type EquipmentType,
  type MovementPattern,
  type Difficulty
} from "@/constants/exerciseMetadata";
import { useExerciseFilters } from "@/context/ExerciseFilterContext";

interface FilterPanelProps {
  showFilters: boolean;
  onToggleFilters: () => void;
  filteredCount: number;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  showFilters, 
  onToggleFilters, 
  filteredCount
}) => {
  const {
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    selectedMovement,
    setMuscleGroup,
    setEquipment,
    setDifficulty,
    setMovement,
    resetFilters
  } = useExerciseFilters();

  // Count active filters for badge display
  const activeFilterCount = [
    selectedMuscleGroup !== "all" ? 1 : 0,
    selectedEquipment !== "all" ? 1 : 0,
    selectedDifficulty !== "all" ? 1 : 0,
    selectedMovement !== "all" ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="mb-4">
        <Button 
          variant="outline"
          size="sm" 
          onClick={onToggleFilters}
          className={`flex items-center w-full justify-center ${showFilters ? 'bg-purple-900/50 border-purple-500' : ''}`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-purple-600 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>
      
      {showFilters && (
        <Card className="p-4 mb-4 bg-gray-800/50 border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Muscle Group</label>
              <Select 
                value={selectedMuscleGroup} 
                onValueChange={(value) => setMuscleGroup(value as MuscleGroup | "all")}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select muscle group" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectGroup>
                    <SelectItem value="all">All Muscle Groups</SelectItem>
                    {COMMON_MUSCLE_GROUPS.map((muscle) => (
                      <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Equipment</label>
              <Select 
                value={selectedEquipment} 
                onValueChange={(value) => setEquipment(value as EquipmentType | "all")}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectGroup>
                    <SelectItem value="all">All Equipment</SelectItem>
                    {COMMON_EQUIPMENT.map((equipment) => (
                      <SelectItem key={equipment} value={equipment}>{equipment}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Difficulty</label>
              <Select 
                value={selectedDifficulty} 
                onValueChange={(value) => setDifficulty(value as Difficulty | "all")}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectGroup>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {DIFFICULTY_LEVELS.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm text-gray-300 mb-1 block">Movement Pattern</label>
              <Select 
                value={selectedMovement} 
                onValueChange={(value) => setMovement(value as MovementPattern | "all")}
              >
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
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
          
          <div className="flex justify-between">
            <div className="text-sm text-gray-400">
              {filteredCount} exercise{filteredCount !== 1 ? 's' : ''} found
            </div>
            
            <Button
              variant="link"
              size="sm"
              onClick={resetFilters}
              className="text-purple-400 hover:text-purple-300"
            >
              Clear all filters
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(FilterPanel);
