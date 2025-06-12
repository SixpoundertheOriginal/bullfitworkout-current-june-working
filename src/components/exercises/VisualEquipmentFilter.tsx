
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dumbbell, 
  Zap, 
  Target, 
  Circle,
  Square,
  Triangle,
  Minus,
  Activity
} from 'lucide-react';
import { EquipmentType } from '@/types/exercise';
import { cn } from '@/lib/utils';

interface VisualEquipmentFilterProps {
  selectedEquipment: EquipmentType | 'all';
  onEquipmentChange: (equipment: EquipmentType | 'all') => void;
  className?: string;
}

const equipmentData: Array<{
  type: EquipmentType | 'all';
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}> = [
  {
    type: 'all',
    label: 'All Equipment',
    icon: <Circle className="w-5 h-5" />,
    color: 'text-gray-400 bg-gray-400/10 border-gray-600',
    description: 'Show all exercises'
  },
  {
    type: 'bodyweight',
    label: 'Bodyweight',
    icon: <Activity className="w-5 h-5" />,
    color: 'text-green-400 bg-green-400/10 border-green-500/30',
    description: 'No equipment needed'
  },
  {
    type: 'dumbbell',
    label: 'Dumbbells',
    icon: <Dumbbell className="w-5 h-5" />,
    color: 'text-blue-400 bg-blue-400/10 border-blue-500/30',
    description: 'Free weight training'
  },
  {
    type: 'barbell',
    label: 'Barbell',
    icon: <Minus className="w-5 h-5" />,
    color: 'text-purple-400 bg-purple-400/10 border-purple-500/30',
    description: 'Heavy compound movements'
  },
  {
    type: 'cable',
    label: 'Cable',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/30',
    description: 'Constant tension'
  },
  {
    type: 'machine',
    label: 'Machine',
    icon: <Square className="w-5 h-5" />,
    color: 'text-red-400 bg-red-400/10 border-red-500/30',
    description: 'Guided movement'
  },
  {
    type: 'resistance_band',
    label: 'Bands',
    icon: <Target className="w-5 h-5" />,
    color: 'text-orange-400 bg-orange-400/10 border-orange-500/30',
    description: 'Variable resistance'
  },
  {
    type: 'kettlebell',
    label: 'Kettlebell',
    icon: <Triangle className="w-5 h-5" />,
    color: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/30',
    description: 'Dynamic movements'
  }
];

export const VisualEquipmentFilter: React.FC<VisualEquipmentFilterProps> = ({
  selectedEquipment,
  onEquipmentChange,
  className
}) => {
  return (
    <Card className={cn("bg-gray-900/50 border-gray-800", className)}>
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-300 mb-1">Equipment Type</h3>
          <p className="text-xs text-gray-500">Filter by available equipment</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {equipmentData.map((equipment) => {
            const isSelected = selectedEquipment === equipment.type;
            
            return (
              <Button
                key={equipment.type}
                variant="ghost"
                className={cn(
                  "h-auto p-3 flex flex-col items-center gap-2 transition-all duration-200",
                  "border border-transparent hover:scale-105",
                  isSelected 
                    ? `${equipment.color} border-current` 
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
                )}
                onClick={() => onEquipmentChange(equipment.type)}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                  isSelected ? "scale-110" : "scale-100"
                )}>
                  {equipment.icon}
                </div>
                
                <div className="text-center">
                  <div className="text-xs font-medium leading-none mb-1">
                    {equipment.label}
                  </div>
                  <div className="text-xs opacity-75 leading-none">
                    {equipment.description}
                  </div>
                </div>
                
                {isSelected && (
                  <div className="w-4 h-0.5 bg-current rounded-full mt-1" />
                )}
              </Button>
            );
          })}
        </div>
        
        {/* Active Filter Badge */}
        {selectedEquipment !== 'all' && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs bg-purple-600/20 border-purple-500/30 text-purple-300">
                Active: {equipmentData.find(e => e.type === selectedEquipment)?.label}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-gray-400 hover:text-gray-300"
                onClick={() => onEquipmentChange('all')}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
