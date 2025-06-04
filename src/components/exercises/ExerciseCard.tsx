
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { SetRow } from '@/components/SetRow';
import { Badge } from "@/components/ui/badge";
import { ExerciseHeader } from '@/components/ExerciseHeader';
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useExercises } from "@/hooks/useExercises";
import { convertWeight, formatWeightWithUnit, WeightUnit } from "@/utils/unitConversion";

interface ExerciseHistoryData {
  [exerciseName: string]: {
    date: string;
    weight: number;
    reps: number;
    sets: number;
    exerciseGroup?: string;
  }[];
}

interface ExerciseCardProps {
  exercise: string;
  sets: { weight: number; reps: number; restTime?: number; completed: boolean; isEditing?: boolean }[];
  onAddSet: () => void;
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
  isActive: boolean;
  onShowRestTimer: () => void;
  onResetRestTimer: () => void;
  onDeleteExercise: () => void;
}

// Sample exercise history data with exercise groups
const exerciseHistoryData: ExerciseHistoryData = {
  "Bench Press": [
    { date: "Apr 10", weight: 135, reps: 10, sets: 3, exerciseGroup: "chest" },
    { date: "Apr 3", weight: 130, reps: 10, sets: 3, exerciseGroup: "chest" },
    { date: "Mar 27", weight: 125, reps: 8, sets: 3, exerciseGroup: "chest" },
  ],
  "Squats": [
    { date: "Apr 9", weight: 185, reps: 8, sets: 3, exerciseGroup: "legs" },
    { date: "Apr 2", weight: 175, reps: 8, sets: 3, exerciseGroup: "legs" },
    { date: "Mar 26", weight: 165, reps: 8, sets: 3, exerciseGroup: "legs" },
  ],
  "Deadlift": [
    { date: "Apr 8", weight: 225, reps: 5, sets: 3, exerciseGroup: "back" },
    { date: "Apr 1", weight: 215, reps: 5, sets: 3, exerciseGroup: "back" },
    { date: "Mar 25", weight: 205, reps: 5, sets: 3, exerciseGroup: "back" },
  ],
  "Pull-ups": [
    { date: "Apr 7", weight: 0, reps: 8, sets: 3, exerciseGroup: "back" },
    { date: "Mar 31", weight: 0, reps: 7, sets: 3, exerciseGroup: "back" },
    { date: "Mar 24", weight: 0, reps: 6, sets: 3, exerciseGroup: "back" },
  ],
};

const getPreviousSessionData = (exerciseName: string) => {
  const history = exerciseHistoryData[exerciseName] || [];
  if (history.length > 0) {
    return history[0];
  }
  
  return { date: "N/A", weight: 0, reps: 0, sets: 0, exerciseGroup: "" };
};

const ExerciseCard = ({ 
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
  const { exercises: dbExercises } = useExercises();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const previousSession = getPreviousSessionData(exercise);
  const olderSession = exerciseHistoryData[exercise]?.[1] || previousSession;
  
  const previousSessionWeight = convertWeight(previousSession.weight, "lb", weightUnit);
  
  const weightDiff = previousSession.weight - olderSession.weight;
  const percentChange = olderSession.weight ? ((weightDiff / olderSession.weight) * 100).toFixed(1) : "0";
  const isImproved = weightDiff > 0;

  const calculateCurrentVolume = (sets: { weight: number; reps: number; completed: boolean }[]) => {
    return sets.reduce((total, set) => {
      if (set.completed && set.weight > 0 && set.reps > 0) {
        return total + (set.weight * set.reps);
      }
      return total;
    }, 0);
  };

  const currentVolume = calculateCurrentVolume(sets);
  const previousVolume = previousSession.weight > 0 ? 
    (convertWeight(previousSession.weight, "lb", weightUnit) * previousSession.reps * previousSession.sets) : 0;
  
  const volumeDiff = currentVolume > 0 && previousVolume > 0 ? (currentVolume - previousVolume) : 0;
  const volumePercentChange = previousVolume > 0 ? ((volumeDiff / previousVolume) * 100).toFixed(1) : "0";

  // Check if this exercise has a group and if there's previous session data with the same group
  const exerciseGroup = previousSession?.exerciseGroup || "";
  const hasSameGroupData = exerciseGroup && previousVolume > 0;

  const completedSetsCount = sets.filter(set => set.completed).length;
  const completionProgress = sets.length > 0 ? (completedSetsCount / sets.length) * 100 : 0;

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
          : "ring-1 ring-muted shadow-sm hover:shadow-md transition-shadow bg-gray-900/80 backdrop-blur-sm"
        }
        border-0 rounded-2xl
      `}>
        <CardContent className="p-4 md:p-5">
          {/* Enhanced Exercise Header */}
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-1">{exercise}</h3>
                <p className="text-sm text-muted-foreground">
                  Last: {previousSessionWeight} {weightUnit} × {previousSession.reps} ({previousSession.date})
                </p>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex gap-1 ml-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-muted/60 hover:bg-muted rounded-md text-gray-400 hover:text-white hover:scale-105 transition-all duration-200"
                  onClick={() => setIsExpanded(!isExpanded)}
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
                  className="h-8 w-8 bg-muted/60 hover:bg-muted rounded-md text-gray-400 hover:text-red-400 hover:scale-105 transition-all duration-200"
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
                  {/* Enhanced Progress Bar */}
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

                  {/* Sets List with Enhanced Animation */}
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

                  {/* Enhanced Volume Stats */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="pt-3 border-t border-gray-800 space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 font-medium">Current Volume</span>
                      <span className="font-mono text-purple-300 font-semibold">
                        {currentVolume.toFixed(1)} {weightUnit}
                      </span>
                    </div>
                    
                    {hasSameGroupData && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">vs Previous Session</span>
                          <span className={`font-mono font-semibold ${volumeDiff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {volumeDiff > 0 ? "+" : ""}{volumeDiff.toFixed(1)} {weightUnit} ({volumePercentChange}%)
                          </span>
                        </div>

                        <Progress 
                          value={currentVolume > 0 ? Math.min((currentVolume / Math.max(previousVolume, 1)) * 100, 200) : 0} 
                          className={`h-1.5 mt-2 bg-gray-800 transition-all duration-500 ${
                            currentVolume >= previousVolume 
                              ? "[&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-green-500" 
                              : "[&>div]:bg-gradient-to-r [&>div]:from-red-500 [&>div]:to-orange-500"
                          }`}
                        />
                      </>
                    )}
                  </motion.div>

                  {/* Enhanced Add Set Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Button
                      onClick={onAddSet}
                      className="
                        w-full py-3 px-5 flex items-center justify-center gap-3 mt-4
                        bg-gradient-to-r from-purple-600/80 to-pink-600/80 
                        hover:from-purple-600 hover:to-pink-600 
                        text-white font-medium rounded-xl 
                        transition-all duration-300 ease-out active:scale-95
                        shadow-lg hover:shadow-xl hover:shadow-purple-500/20
                        border border-purple-500/20 hover:border-purple-400/30
                        group backdrop-blur-sm
                      "
                    >
                      <motion.div
                        whileHover={{ rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <PlusCircle size={20} className="text-white" />
                      </motion.div>
                      <span>Add Set</span>
                      
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExerciseCard;
