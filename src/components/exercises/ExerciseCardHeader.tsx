
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, Trash2 } from 'lucide-react';
import { WeightUnit } from '@/utils/unitConversion';
import { SessionData } from '@/services/exerciseHistoryService';

interface ExerciseCardHeaderProps {
  exercise: string;
  isExpanded: boolean;
  isActive: boolean;
  previousSession: SessionData;
  previousSessionWeight: number;
  weightUnit: WeightUnit;
  onToggleExpand: () => void;
  onDeleteExercise: () => void;
}

export const ExerciseCardHeader = React.memo<ExerciseCardHeaderProps>(({
  exercise,
  isExpanded,
  isActive,
  previousSession,
  previousSessionWeight,
  weightUnit,
  onToggleExpand,
  onDeleteExercise
}) => {
  return (
    <div className="relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">{exercise}</h3>
          <p className="text-sm text-muted-foreground">
            Last: {previousSessionWeight} {weightUnit} × {previousSession.reps} ({previousSession.date})
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1 ml-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-base rounded-md bg-muted/60 hover:bg-muted transition text-gray-400 hover:text-white hover:scale-105 transition-all duration-200"
            onClick={onToggleExpand}
            aria-label={isExpanded ? "Collapse exercise" : "Expand exercise"}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 text-base rounded-md bg-muted/60 hover:bg-muted transition text-gray-400 hover:text-red-400 hover:scale-105 transition-all duration-200"
            onClick={onDeleteExercise}
            aria-label="Delete exercise"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Active Exercise Indicator */}
      {isActive && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
        />
      )}
    </div>
  );
});

ExerciseCardHeader.displayName = 'ExerciseCardHeader';
