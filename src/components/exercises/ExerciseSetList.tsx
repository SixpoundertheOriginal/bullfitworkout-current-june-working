
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SetRow } from '@/components/SetRow';
import { WeightUnit } from '@/utils/unitConversion';

interface ExerciseSet {
  weight: number;
  reps: number;
  restTime?: number;
  completed: boolean;
  isEditing?: boolean;
}

interface ExerciseSetListProps {
  exercise: string;
  sets: ExerciseSet[];
  weightUnit: WeightUnit;
  onCompleteSet: (setIndex: number) => void;
  onRemoveSet: (setIndex: number) => void;
  onEditSet: (setIndex: number) => void;
  onSaveSet: (setIndex: number) => void;
  onWeightChange: (setIndex: number, value: string) => void;
  onRepsChange: (setIndex: number, value: string) => void;
  onRestTimeChange?: (setIndex: number, value: string) => void;
  onWeightIncrement: (setIndex: number, increment: number) => void;
  onRepsIncrement: (setIndex: number, increment: number) => void;
  onRestTimeIncrement?: (setIndex: number, increment: number) => void;
}

export const ExerciseSetList = React.memo<ExerciseSetListProps>(({
  exercise,
  sets,
  weightUnit,
  onCompleteSet,
  onRemoveSet,
  onEditSet,
  onSaveSet,
  onWeightChange,
  onRepsChange,
  onRestTimeChange,
  onWeightIncrement,
  onRepsIncrement,
  onRestTimeIncrement
}) => {
  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {sets.map((set, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ 
              duration: 0.3,
              delay: index * 0.05,
              layout: { duration: 0.2 }
            }}
            className="animate-fade-in"
          >
            <SetRow 
              setNumber={index + 1}
              weight={set.weight}
              reps={set.reps}
              restTime={set.restTime}
              completed={set.completed}
              isEditing={set.isEditing || false}
              exerciseName={exercise}
              onComplete={() => onCompleteSet(index)}
              onEdit={() => onEditSet(index)}
              onSave={() => onSaveSet(index)}
              onRemove={() => onRemoveSet(index)}
              onWeightChange={(e) => onWeightChange(index, e.target.value)}
              onRepsChange={(e) => onRepsChange(index, e.target.value)}
              onRestTimeChange={onRestTimeChange ? (e) => onRestTimeChange(index, e.target.value) : undefined}
              onWeightIncrement={(value) => onWeightIncrement(index, value)}
              onRepsIncrement={(value) => onRepsIncrement(index, value)}
              onRestTimeIncrement={onRestTimeIncrement ? (value) => onRestTimeIncrement(index, value) : undefined}
              weightUnit={weightUnit}
              currentVolume={set.weight * set.reps}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

ExerciseSetList.displayName = 'ExerciseSetList';
