
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Zap, Target, Activity, Flame } from 'lucide-react';
import { MuscleGroup, EquipmentType, Difficulty } from '@/types/exercise';
import { cn } from '@/lib/utils';

interface FilterChip {
  id: string;
  label: string;
  icon: React.ReactNode;
  muscleGroup?: MuscleGroup;
  equipment?: EquipmentType;
  difficulty?: Difficulty;
  color: string;
}

interface SmartFilterChipsProps {
  selectedMuscleGroup: MuscleGroup | 'all';
  selectedEquipment: EquipmentType | 'all';
  selectedDifficulty: Difficulty | 'all';
  onMuscleGroupChange: (muscleGroup: MuscleGroup | 'all') => void;
  onEquipmentChange: (equipment: EquipmentType | 'all') => void;
  onDifficultyChange: (difficulty: Difficulty | 'all') => void;
  onClearAll: () => void;
  className?: string;
}

const quickFilterChips: FilterChip[] = [
  {
    id: 'push-day',
    label: 'Push Day',
    icon: <Zap className="w-3 h-3" />,
    muscleGroup: 'Chest',
    color: 'bg-red-500/20 text-red-400 border-red-500/30'
  },
  {
    id: 'pull-day',
    label: 'Pull Day',
    icon: <Target className="w-3 h-3" />,
    muscleGroup: 'Back',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  {
    id: 'leg-day',
    label: 'Leg Day',
    icon: <Activity className="w-3 h-3" />,
    muscleGroup: 'Quadriceps',
    color: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  {
    id: 'bodyweight',
    label: 'No Equipment',
    icon: <Activity className="w-3 h-3" />,
    equipment: 'Bodyweight',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  },
  {
    id: 'beginner',
    label: 'Beginner Friendly',
    icon: <Target className="w-3 h-3" />,
    difficulty: 'beginner',
    color: 'bg-green-500/20 text-green-400 border-green-500/30'
  },
  {
    id: 'advanced',
    label: 'Challenge Me',
    icon: <Flame className="w-3 h-3" />,
    difficulty: 'advanced',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  }
];

export const SmartFilterChips: React.FC<SmartFilterChipsProps> = ({
  selectedMuscleGroup,
  selectedEquipment,
  selectedDifficulty,
  onMuscleGroupChange,
  onEquipmentChange,
  onDifficultyChange,
  onClearAll,
  className
}) => {
  const hasActiveFilters = 
    selectedMuscleGroup !== 'all' || 
    selectedEquipment !== 'all' || 
    selectedDifficulty !== 'all';

  const isChipActive = (chip: FilterChip) => {
    if (chip.muscleGroup) return selectedMuscleGroup === chip.muscleGroup;
    if (chip.equipment) return selectedEquipment === chip.equipment;
    if (chip.difficulty) return selectedDifficulty === chip.difficulty;
    return false;
  };

  const handleChipClick = (chip: FilterChip) => {
    const isActive = isChipActive(chip);
    
    if (chip.muscleGroup) {
      onMuscleGroupChange(isActive ? 'all' : chip.muscleGroup);
    } else if (chip.equipment) {
      onEquipmentChange(isActive ? 'all' : chip.equipment);
    } else if (chip.difficulty) {
      onDifficultyChange(isActive ? 'all' : chip.difficulty);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Quick Filter Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-300">Quick Filters</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-gray-400 hover:text-gray-300"
              onClick={onClearAll}
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {quickFilterChips.map((chip) => {
            const isActive = isChipActive(chip);
            
            return (
              <Button
                key={chip.id}
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs font-medium transition-all duration-200",
                  "border-gray-600 text-gray-400 hover:text-gray-300",
                  "hover:scale-105 hover:border-gray-500",
                  isActive && `${chip.color} border-current scale-105`
                )}
                onClick={() => handleChipClick(chip)}
              >
                <span className="mr-1.5">{chip.icon}</span>
                {chip.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-400">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {selectedMuscleGroup !== 'all' && (
              <Badge
                variant="outline"
                className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs"
              >
                Muscle: {selectedMuscleGroup}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 ml-1 text-blue-400 hover:text-blue-300"
                  onClick={() => onMuscleGroupChange('all')}
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            )}
            
            {selectedEquipment !== 'all' && (
              <Badge
                variant="outline"
                className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs"
              >
                Equipment: {selectedEquipment}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 ml-1 text-purple-400 hover:text-purple-300"
                  onClick={() => onEquipmentChange('all')}
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            )}
            
            {selectedDifficulty !== 'all' && (
              <Badge
                variant="outline"
                className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs"
              >
                Difficulty: {selectedDifficulty}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 ml-1 text-orange-400 hover:text-orange-300"
                  onClick={() => onDifficultyChange('all')}
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
