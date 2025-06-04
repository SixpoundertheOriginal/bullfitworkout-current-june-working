
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
    weightProgress,
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
          {/* Header */}
          <ExerciseCardHeader
            exercise={exercise}
            isExpanded={isExpanded}
            isActive={isActive}
            previousSession={previousSession}
            previousSessionWeight={previousSessionWeight}
            weightUnit={weightUnit}
            onToggleExpand={handleToggleExpand}
            onDeleteExercise={onDeleteExercise}
          />
          
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
