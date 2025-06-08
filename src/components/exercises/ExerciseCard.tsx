
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { ExerciseCardHeader } from './ExerciseCardHeader';
import { ExerciseSetList } from './ExerciseSetList';
import { ExerciseCardFooter } from './ExerciseCardFooter';
import { useExerciseCardState } from './hooks/useExerciseCardState';
import { ExerciseCardProps } from './types';

const ExerciseCard = React.memo<ExerciseCardProps>(({ 
  exercise, 
  sets,
  onAddSet,
  onCompleteSet,
  onRemoveSet,
  onEditSet,
  onSaveSet,
  onWeightChange,
  onRepsChange,
  onRestTimeChange,
  onWeightIncrement,
  onRepsIncrement,
  onRestTimeIncrement,
  isActive,
  onShowRestTimer,
  onResetRestTimer,
  onDeleteExercise
}) => {
  const { weightUnit } = useWeightUnit();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const {
    previousSession,
    previousSessionWeight,
    currentVolume,
    previousVolume,
    volumeProgress,
    completedSetsCount,
    completionProgress,
    hasSameGroupData
  } = useExerciseCardState(exercise, sets, weightUnit);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{ 
        layout: { duration: 0.3 },
        hover: { duration: 0.2 }
      }}
    >
      <Card className={`
        relative overflow-hidden transition-all duration-300 transform-gpu
        ${isActive 
          ? "ring-2 ring-purple-500/50 shadow-xl shadow-purple-500/10 bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20" 
          : "border border-muted/40 bg-background/90 shadow-md hover:shadow-lg transition-shadow"
        }
        rounded-2xl
      `}>
        <CardContent className="p-4 md:p-5">
          {/* Header - This is the legacy header, different from the new ExerciseCardHeader */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white leading-tight truncate text-lg mb-1">
                {exercise.name}
              </h3>
              {exercise.description && (
                <p className="text-gray-400 leading-relaxed text-sm line-clamp-2">
                  {exercise.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleToggleExpand}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                {isExpanded ? '−' : '+'}
              </button>
              {onDeleteExercise && (
                <button
                  onClick={onDeleteExercise}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          {/* Collapsible Content */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span>{completedSetsCount}/{sets.length} sets</span>
                    </div>
                    <Progress 
                      value={completionProgress}
                      className="h-2 bg-gray-800/50 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500 [&>div]:transition-all [&>div]:duration-500"
                    />
                  </div>

                  {/* Sets List */}
                  <ExerciseSetList
                    exercise={exercise}
                    sets={sets}
                    weightUnit={weightUnit}
                    onCompleteSet={onCompleteSet}
                    onRemoveSet={onRemoveSet}
                    onEditSet={onEditSet}
                    onSaveSet={onSaveSet}
                    onWeightChange={onWeightChange}
                    onRepsChange={onRepsChange}
                    onRestTimeChange={onRestTimeChange}
                    onWeightIncrement={onWeightIncrement}
                    onRepsIncrement={onRepsIncrement}
                    onRestTimeIncrement={onRestTimeIncrement}
                  />

                  {/* Footer */}
                  <ExerciseCardFooter
                    currentVolume={currentVolume}
                    previousVolume={previousVolume}
                    volumeProgress={volumeProgress}
                    hasSameGroupData={hasSameGroupData}
                    weightUnit={weightUnit}
                    onAddSet={onAddSet}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ExerciseCard.displayName = 'ExerciseCard';

export default ExerciseCard;
