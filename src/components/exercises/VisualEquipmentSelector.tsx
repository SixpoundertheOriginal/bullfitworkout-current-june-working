
import React from 'react';
import { EquipmentType } from '@/types/exercise';
import { cn } from '@/lib/utils';
import { 
  Dumbbell, 
  Weight, 
  Zap, 
  User, 
  Cable,
  Box,
  Bench,
  MoreHorizontal 
} from 'lucide-react';

interface EquipmentCard {
  id: EquipmentType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'strength' | 'cardio' | 'flexibility';
  description: string;
}

const EQUIPMENT_CARDS: EquipmentCard[] = [
  {
    id: 'dumbbell',
    name: 'Dumbbell',
    icon: Dumbbell,
    category: 'strength',
    description: 'Free weight training'
  },
  {
    id: 'barbell',
    name: 'Barbell',
    icon: Weight,
    category: 'strength',
    description: 'Heavy compound movements'
  },
  {
    id: 'machine',
    name: 'Machine',
    icon: Zap,
    category: 'strength',
    description: 'Guided resistance training'
  },
  {
    id: 'bodyweight',
    name: 'Bodyweight',
    icon: User,
    category: 'strength',
    description: 'No equipment needed'
  },
  {
    id: 'cable',
    name: 'Cable',
    icon: Cable,
    category: 'strength',
    description: 'Constant tension training'
  },
  {
    id: 'kettlebell',
    name: 'Kettlebell',
    icon: Weight,
    category: 'strength',
    description: 'Functional strength'
  },
  {
    id: 'resistance band',
    name: 'Resistance Band',
    icon: Cable,
    category: 'strength',
    description: 'Portable resistance'
  },
  {
    id: 'smith machine',
    name: 'Smith Machine',
    icon: Zap,
    category: 'strength',
    description: 'Guided barbell training'
  },
  {
    id: 'box',
    name: 'Box',
    icon: Box,
    category: 'cardio',
    description: 'Plyometric training'
  },
  {
    id: 'bench',
    name: 'Bench',
    icon: Bench,
    category: 'strength',
    description: 'Support for exercises'
  },
  {
    id: 'other',
    name: 'Other',
    icon: MoreHorizontal,
    category: 'strength',
    description: 'Custom equipment'
  }
];

interface VisualEquipmentSelectorProps {
  selectedEquipment: EquipmentType[];
  onEquipmentToggle: (equipment: EquipmentType) => void;
  multiSelect?: boolean;
  className?: string;
}

export const VisualEquipmentSelector: React.FC<VisualEquipmentSelectorProps> = ({
  selectedEquipment,
  onEquipmentToggle,
  multiSelect = false,
  className
}) => {
  const strengthEquipment = EQUIPMENT_CARDS.filter(card => card.category === 'strength');
  const cardioEquipment = EQUIPMENT_CARDS.filter(card => card.category === 'cardio');
  const flexibilityEquipment = EQUIPMENT_CARDS.filter(card => card.category === 'flexibility');

  const renderEquipmentGrid = (equipmentList: EquipmentCard[], title: string) => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
        {title}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {equipmentList.map((equipment) => {
          const isSelected = selectedEquipment.includes(equipment.id);
          const IconComponent = equipment.icon;

          return (
            <button
              key={equipment.id}
              type="button"
              onClick={() => onEquipmentToggle(equipment.id)}
              className={cn(
                "group relative p-4 rounded-xl border-2 transition-all duration-200",
                "min-h-[120px] flex flex-col items-center justify-center text-center",
                "touch-manipulation focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900",
                isSelected
                  ? "border-purple-500 bg-purple-600/20 shadow-lg shadow-purple-500/20 scale-105"
                  : "border-gray-700 bg-gray-800/50 hover:border-purple-400 hover:bg-purple-600/10 hover:scale-102"
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                "mb-2 p-2 rounded-lg transition-colors duration-200",
                isSelected
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 group-hover:bg-purple-600 group-hover:text-white"
              )}>
                <IconComponent className="w-6 h-6" />
              </div>

              {/* Name */}
              <h4 className={cn(
                "font-medium text-sm mb-1 transition-colors duration-200",
                isSelected
                  ? "text-white"
                  : "text-gray-300 group-hover:text-white"
              )}>
                {equipment.name}
              </h4>

              {/* Description */}
              <p className={cn(
                "text-xs transition-colors duration-200",
                isSelected
                  ? "text-purple-200"
                  : "text-gray-500 group-hover:text-purple-300"
              )}>
                {equipment.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Selection info */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Equipment Type</h2>
        {selectedEquipment.length > 0 && (
          <span className="text-sm text-purple-400">
            {selectedEquipment.length} selected
          </span>
        )}
      </div>

      {/* Equipment grids */}
      {renderEquipmentGrid(strengthEquipment, 'Strength Equipment')}
      
      {cardioEquipment.length > 0 && 
        renderEquipmentGrid(cardioEquipment, 'Cardio Equipment')
      }
      
      {flexibilityEquipment.length > 0 && 
        renderEquipmentGrid(flexibilityEquipment, 'Flexibility Equipment')
      }

      {/* Instructions */}
      <p className="text-center text-xs text-gray-400">
        {multiSelect 
          ? "Select one or more equipment types for this exercise"
          : "Select the primary equipment type for this exercise"
        }
      </p>
    </div>
  );
};
