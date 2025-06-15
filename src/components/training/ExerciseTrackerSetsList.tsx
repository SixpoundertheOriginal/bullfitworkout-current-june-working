
import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExerciseSet } from '@/types/exercise';

interface ExerciseTrackerSetsListProps {
  sets: ExerciseSet[];
  editingField: { setIndex: number; field: string } | null;
  editValue: string;
  onSetDoubleClick: (setIndex: number, e: React.MouseEvent) => void;
  onStartEditing: (setIndex: number, field: string, currentValue: string | number) => void;
  onStopEditing: (save?: boolean) => void;
  onEditValueChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onDeleteSet: (setIndex: number) => void;
}

export const ExerciseTrackerSetsList: React.FC<ExerciseTrackerSetsListProps> = React.memo(({
  sets,
  editingField,
  editValue,
  onSetDoubleClick,
  onStartEditing,
  onStopEditing,
  onEditValueChange,
  onKeyPress,
  onDeleteSet
}) => {
  
  const handleRowDoubleClick = (setIndex: number, e: React.MouseEvent) => {
    // Prevent double-click if clicking on input or button
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || 
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('input')) {
      e.stopPropagation();
      return;
    }
    
    onSetDoubleClick(setIndex, e);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.stopPropagation();
    callback();
  };

  return (
    <div className="px-4 pb-4">
      {/* Grid Header */}
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-400 mb-3 px-2">
        <div className="col-span-1">Set</div>
        <div className="col-span-2">Weight</div>
        <div className="col-span-2">Reps</div>
        <div className="col-span-2">Time</div>
        <div className="col-span-3">Volume</div>
        <div className="col-span-2">Actions</div>
      </div>

      {/* Sets List */}
      <div className="space-y-2">
        {sets.map((set, index) => (
          <motion.div
            key={`set-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              grid grid-cols-12 gap-2 items-center p-3 rounded-lg transition-all duration-200
              cursor-pointer group hover:bg-slate-800/30
              ${set.completed 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-slate-800/20 border border-slate-700/30'
              }
            `}
            onDoubleClick={(e) => handleRowDoubleClick(index, e)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {/* Set Number */}
            <div className="col-span-1 flex items-center justify-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                ${set.completed 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-700 text-slate-300'
                }
              `}>
                {set.completed ? <Check className="w-4 h-4" /> : index + 1}
              </div>
            </div>

            {/* Weight */}
            <div className="col-span-2">
              {editingField?.setIndex === index && editingField.field === 'weight' ? (
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => onEditValueChange(e.target.value)}
                  onBlur={() => onStopEditing(true)}
                  onKeyDown={onKeyPress}
                  onClick={handleInputClick}
                  className="h-8 text-sm bg-slate-800 border-slate-600"
                  autoFocus
                />
              ) : (
                <div
                  className="text-sm text-white hover:bg-slate-700/30 px-2 py-1 rounded cursor-text"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditing(index, 'weight', set.weight);
                  }}
                >
                  {set.weight}kg
                </div>
              )}
            </div>

            {/* Reps */}
            <div className="col-span-2">
              {editingField?.setIndex === index && editingField.field === 'reps' ? (
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => onEditValueChange(e.target.value)}
                  onBlur={() => onStopEditing(true)}
                  onKeyDown={onKeyPress}
                  onClick={handleInputClick}
                  className="h-8 text-sm bg-slate-800 border-slate-600"
                  autoFocus
                />
              ) : (
                <div
                  className="text-sm text-white hover:bg-slate-700/30 px-2 py-1 rounded cursor-text"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartEditing(index, 'reps', set.reps);
                  }}
                >
                  {set.reps}
                </div>
              )}
            </div>

            {/* Time */}
            <div className="col-span-2">
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <Clock className="w-3 h-3" />
                {set.duration}
              </div>
            </div>

            {/* Volume */}
            <div className="col-span-3">
              <div className="text-sm text-slate-300 font-medium">
                {set.volume.toFixed(1)}kg
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={(e) => handleButtonClick(e, () => onDeleteSet(index))}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

ExerciseTrackerSetsList.displayName = 'ExerciseTrackerSetsList';
