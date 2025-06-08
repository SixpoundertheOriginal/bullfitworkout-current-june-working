
import React from 'react';
import { ExerciseFilters } from './ExerciseFilters';
import { SmartFilterPresets } from './SmartFilterPresets';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MovementPattern, TrainingFocus, ComplexityLevel } from '@/types/enhanced-exercise';
import { MuscleGroup, EquipmentType, Difficulty } from '@/types/exercise';
import { Zap, Target, BarChart3, TrendingUp } from 'lucide-react';

interface EnhancedExerciseFiltersProps {
  // Base filter props (extending existing ExerciseFilters)
  isOpen: boolean;
  onToggle: () => void;
  selectedMuscleGroup: MuscleGroup | "all";
  onMuscleGroupChange: (value: MuscleGroup | "all") => void;
  selectedEquipment: EquipmentType | "all";
  onEquipmentChange: (value: EquipmentType | "all") => void;
  selectedDifficulty: Difficulty | "all";
  onDifficultyChange: (value: Difficulty | "all") => void;
  selectedMovement: string | "all";
  onMovementChange: (value: string | "all") => void;
  onClearAll: () => void;
  resultCount: number;
  
  // Enhanced filter props
  selectedMovementPattern: MovementPattern | "all";
  onMovementPatternChange: (value: MovementPattern | "all") => void;
  selectedTrainingFocus: TrainingFocus | "all";
  onTrainingFocusChange: (value: TrainingFocus | "all") => void;
  selectedComplexityLevel: ComplexityLevel | "all";
  onComplexityLevelChange: (value: ComplexityLevel | "all") => void;
  hasPersonalStats: boolean | "all";
  onHasPersonalStatsChange: (value: boolean | "all") => void;
  isReadyToProgress: boolean | "all";
  onIsReadyToProgressChange: (value: boolean | "all") => void;
  onApplyPreset: (filters: any) => void;
  
  className?: string;
}

const MOVEMENT_PATTERNS: MovementPattern[] = ['push', 'pull', 'squat', 'hinge', 'carry', 'core', 'rotation'];
const TRAINING_FOCUS: TrainingFocus[] = ['strength', 'hypertrophy', 'endurance', 'power', 'mobility', 'stability'];
const COMPLEXITY_LEVELS: ComplexityLevel[] = ['fundamental', 'intermediate', 'advanced', 'expert'];

export const EnhancedExerciseFilters: React.FC<EnhancedExerciseFiltersProps> = ({
  // Base props
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
  selectedMovementPattern,
  onMovementPatternChange,
  selectedTrainingFocus,
  onTrainingFocusChange,
  selectedComplexityLevel,
  onComplexityLevelChange,
  hasPersonalStats,
  onHasPersonalStatsChange,
  isReadyToProgress,
  onIsReadyToProgressChange,
  onApplyPreset,
  className = ""
}) => {
  // Count active enhanced filters
  const enhancedFilterCount = [
    selectedMovementPattern !== "all" ? 1 : 0,
    selectedTrainingFocus !== "all" ? 1 : 0,
    selectedComplexityLevel !== "all" ? 1 : 0,
    hasPersonalStats !== "all" ? 1 : 0,
    isReadyToProgress !== "all" ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  // Handle movement pattern change with proper typing
  const handleMovementPatternChange = (value: string) => {
    if (value === "all") {
      onMovementPatternChange("all");
    } else {
      onMovementPatternChange(value as MovementPattern);
    }
  };

  // Handle training focus change with proper typing
  const handleTrainingFocusChange = (value: string) => {
    if (value === "all") {
      onTrainingFocusChange("all");
    } else {
      onTrainingFocusChange(value as TrainingFocus);
    }
  };

  // Handle complexity level change with proper typing
  const handleComplexityLevelChange = (value: string) => {
    if (value === "all") {
      onComplexityLevelChange("all");
    } else {
      onComplexityLevelChange(value as ComplexityLevel);
    }
  };

  return (
    <div className={className}>
      {/* Smart Filter Presets - Always visible for quick access */}
      <SmartFilterPresets onApplyPreset={onApplyPreset} className="mb-4" />

      {/* Base Filters (reuse existing component) */}
      <ExerciseFilters
        isOpen={isOpen}
        onToggle={onToggle}
        selectedMuscleGroup={selectedMuscleGroup}
        onMuscleGroupChange={onMuscleGroupChange}
        selectedEquipment={selectedEquipment}
        onEquipmentChange={onEquipmentChange}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={onDifficultyChange}
        selectedMovement={selectedMovement}
        onMovementChange={onMovementChange}
        onClearAll={onClearAll}
        resultCount={resultCount}
      />

      {/* Enhanced Filters Section */}
      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Enhanced Filters Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-gray-700/50">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Smart Filters</span>
            {enhancedFilterCount > 0 && (
              <Badge variant="secondary" className="bg-purple-600 text-xs">
                {enhancedFilterCount}
              </Badge>
            )}
          </div>

          {/* Enhanced Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Movement Pattern Filter */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block flex items-center gap-2">
                <Target className="w-3 h-3" />
                Movement Pattern
              </label>
              <Select value={selectedMovementPattern} onValueChange={handleMovementPatternChange}>
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select pattern" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 z-50">
                  <SelectItem value="all">All Patterns</SelectItem>
                  {MOVEMENT_PATTERNS.map((pattern) => (
                    <SelectItem key={pattern} value={pattern}>
                      {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Training Focus Filter */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block flex items-center gap-2">
                <BarChart3 className="w-3 h-3" />
                Training Focus
              </label>
              <Select value={selectedTrainingFocus} onValueChange={handleTrainingFocusChange}>
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select focus" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 z-50">
                  <SelectItem value="all">All Focus Areas</SelectItem>
                  {TRAINING_FOCUS.map((focus) => (
                    <SelectItem key={focus} value={focus}>
                      {focus.charAt(0).toUpperCase() + focus.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Complexity Level Filter */}
            <div>
              <label className="text-sm text-gray-300 mb-1 block flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                Complexity Level
              </label>
              <Select value={selectedComplexityLevel} onValueChange={handleComplexityLevelChange}>
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder="Select complexity" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700 z-50">
                  <SelectItem value="all">All Levels</SelectItem>
                  {COMPLEXITY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Personal Stats Filters */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300 block">Personal Analytics</label>
              
              <div className="space-y-2">
                <Select 
                  value={hasPersonalStats === 'all' ? 'all' : hasPersonalStats ? 'true' : 'false'} 
                  onValueChange={(value) => 
                    onHasPersonalStatsChange(value === 'all' ? 'all' : value === 'true')
                  }
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-xs">
                    <SelectValue placeholder="Has personal stats" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 z-50">
                    <SelectItem value="all">All Exercises</SelectItem>
                    <SelectItem value="true">With Personal Stats</SelectItem>
                    <SelectItem value="false">No Personal Stats</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={isReadyToProgress === 'all' ? 'all' : isReadyToProgress ? 'true' : 'false'} 
                  onValueChange={(value) => 
                    onIsReadyToProgressChange(value === 'all' ? 'all' : value === 'true')
                  }
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700 text-xs">
                    <SelectValue placeholder="Ready to progress" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 z-50">
                    <SelectItem value="all">All Exercises</SelectItem>
                    <SelectItem value="true">Ready to Progress</SelectItem>
                    <SelectItem value="false">Not Ready</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
