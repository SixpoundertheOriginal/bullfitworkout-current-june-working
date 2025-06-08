
import React, { useState, useCallback, useMemo } from 'react';
import { MuscleGroup } from '@/types/exercise';
import { cn } from '@/lib/utils';

interface MuscleRegion {
  id: string;
  name: MuscleGroup;
  svgPath: string;
  category: 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core';
  x: number;
  y: number;
  width: number;
  height: number;
}

const MUSCLE_REGIONS: MuscleRegion[] = [
  // Chest
  { id: 'chest', name: 'chest', category: 'chest', svgPath: 'M160 120 L240 120 L240 180 L160 180 Z', x: 160, y: 120, width: 80, height: 60 },
  
  // Shoulders
  { id: 'shoulders', name: 'shoulders', category: 'shoulders', svgPath: 'M130 100 L170 100 L170 140 L130 140 Z M230 100 L270 100 L270 140 L230 140 Z', x: 130, y: 100, width: 40, height: 40 },
  
  // Arms
  { id: 'biceps', name: 'biceps', category: 'arms', svgPath: 'M100 140 L130 140 L130 200 L100 200 Z M270 140 L300 140 L300 200 L270 200 Z', x: 100, y: 140, width: 30, height: 60 },
  { id: 'triceps', name: 'triceps', category: 'arms', svgPath: 'M105 145 L125 145 L125 195 L105 195 Z M275 145 L295 145 L295 195 L275 195 Z', x: 105, y: 145, width: 20, height: 50 },
  
  // Back
  { id: 'back', name: 'back', category: 'back', svgPath: 'M160 125 L240 125 L240 200 L160 200 Z', x: 160, y: 125, width: 80, height: 75 },
  { id: 'lats', name: 'lats', category: 'back', svgPath: 'M140 140 L160 140 L160 190 L140 190 Z M240 140 L260 140 L260 190 L240 190 Z', x: 140, y: 140, width: 20, height: 50 },
  
  // Core
  { id: 'abs', name: 'abs', category: 'core', svgPath: 'M170 180 L230 180 L230 240 L170 240 Z', x: 170, y: 180, width: 60, height: 60 },
  { id: 'core', name: 'core', category: 'core', svgPath: 'M165 175 L235 175 L235 245 L165 245 Z', x: 165, y: 175, width: 70, height: 70 },
  
  // Legs
  { id: 'quads', name: 'quads', category: 'legs', svgPath: 'M150 250 L190 250 L190 340 L150 340 Z M210 250 L250 250 L250 340 L210 340 Z', x: 150, y: 250, width: 40, height: 90 },
  { id: 'hamstrings', name: 'hamstrings', category: 'legs', svgPath: 'M155 255 L185 255 L185 335 L155 335 Z M215 255 L245 255 L245 335 L215 335 Z', x: 155, y: 255, width: 30, height: 80 },
  { id: 'calves', name: 'calves', category: 'legs', svgPath: 'M160 340 L180 340 L180 380 L160 380 Z M220 340 L240 340 L240 380 L220 380 Z', x: 160, y: 340, width: 20, height: 40 },
  { id: 'glutes', name: 'glutes', category: 'legs', svgPath: 'M160 240 L240 240 L240 270 L160 270 Z', x: 160, y: 240, width: 80, height: 30 }
];

interface InteractiveBodyDiagramProps {
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  onPrimaryMuscleToggle: (muscle: MuscleGroup) => void;
  onSecondaryMuscleToggle: (muscle: MuscleGroup) => void;
  className?: string;
}

export const InteractiveBodyDiagram: React.FC<InteractiveBodyDiagramProps> = ({
  primaryMuscles,
  secondaryMuscles,
  onPrimaryMuscleToggle,
  onSecondaryMuscleToggle,
  className
}) => {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'primary' | 'secondary'>('primary');

  const handleMuscleClick = useCallback((muscle: MuscleGroup) => {
    if (selectionMode === 'primary') {
      onPrimaryMuscleToggle(muscle);
    } else {
      onSecondaryMuscleToggle(muscle);
    }
  }, [selectionMode, onPrimaryMuscleToggle, onSecondaryMuscleToggle]);

  const getMuscleState = useCallback((muscle: MuscleGroup) => {
    if (primaryMuscles.includes(muscle)) return 'primary';
    if (secondaryMuscles.includes(muscle)) return 'secondary';
    return 'unselected';
  }, [primaryMuscles, secondaryMuscles]);

  const getMuscleColor = useCallback((muscle: MuscleGroup, isHovered: boolean) => {
    const state = getMuscleState(muscle);
    
    if (state === 'primary') {
      return isHovered ? '#3b82f6' : '#2563eb'; // Blue for primary
    }
    if (state === 'secondary') {
      return isHovered ? '#a855f7' : '#8b5cf6'; // Purple for secondary
    }
    
    return isHovered ? '#6b7280' : '#374151'; // Gray for unselected
  }, [getMuscleState]);

  const selectedPrimaryCount = primaryMuscles.length;
  const selectedSecondaryCount = secondaryMuscles.length;

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      {/* Selection Mode Toggle */}
      <div className="flex mb-4 p-1 bg-gray-800 rounded-lg">
        <button
          type="button"
          onClick={() => setSelectionMode('primary')}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
            selectionMode === 'primary'
              ? "bg-blue-600 text-white shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          )}
        >
          Primary Muscles ({selectedPrimaryCount})
        </button>
        <button
          type="button"
          onClick={() => setSelectionMode('secondary')}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
            selectionMode === 'secondary'
              ? "bg-purple-600 text-white shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-700"
          )}
        >
          Secondary Muscles ({selectedSecondaryCount})
        </button>
      </div>

      {/* Body Diagram */}
      <div className="relative bg-gray-900 rounded-xl p-6 border border-gray-700">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-auto"
          style={{ maxHeight: '400px' }}
        >
          {/* Body outline */}
          <path
            d="M200 30 C220 30 240 50 240 80 L240 100 C250 100 270 110 270 140 L300 140 L300 200 C300 220 290 240 270 240 L270 250 L250 250 L250 340 L240 340 L240 380 L220 380 L220 340 L180 340 L180 380 L160 380 L160 340 L150 340 L150 250 L130 250 C110 240 100 220 100 200 L100 140 L130 140 C130 110 150 100 160 100 L160 80 C160 50 180 30 200 30 Z"
            fill="none"
            stroke="#4b5563"
            strokeWidth="2"
            className="opacity-50"
          />

          {/* Muscle regions */}
          {MUSCLE_REGIONS.map((region) => {
            const isHovered = hoveredMuscle === region.id;
            const muscleColor = getMuscleColor(region.name, isHovered);
            const state = getMuscleState(region.name);

            return (
              <g key={region.id}>
                <path
                  d={region.svgPath}
                  fill={muscleColor}
                  fillOpacity={state === 'unselected' ? 0.3 : 0.7}
                  stroke={muscleColor}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredMuscle(region.id)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => handleMuscleClick(region.name)}
                />
                
                {/* Muscle label */}
                <text
                  x={region.x + region.width / 2}
                  y={region.y + region.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-white pointer-events-none"
                  style={{ fontSize: '10px' }}
                >
                  {region.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-gray-300">Primary Muscles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded"></div>
            <span className="text-gray-300">Secondary Muscles</span>
          </div>
        </div>

        {/* Instructions */}
        <p className="text-center text-xs text-gray-400 mt-2">
          Select {selectionMode} muscles by clicking on the body diagram
        </p>
      </div>
    </div>
  );
};
