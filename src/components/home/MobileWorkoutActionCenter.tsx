
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { EnhancedHeroWorkoutButton } from './EnhancedHeroWorkoutButton';
import { TrainingTypeSelector } from '@/components/training/TrainingTypeSelector';
import { DurationSelector } from '@/components/training/DurationSelector';
import { WorkoutTagPicker } from '@/components/training/WorkoutTagPicker';
import { useWorkoutSetup } from '@/context/WorkoutSetupContext';
import { Button } from '@/components/ui/button';
import { Settings, Zap, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface MobileWorkoutActionCenterProps {
  onStartTraining: (config: any) => void;
  recommendedType?: string;
  recommendedDuration?: number;
}

export const MobileWorkoutActionCenter: React.FC<MobileWorkoutActionCenterProps> = ({
  onStartTraining,
  recommendedType = "Strength",
  recommendedDuration = 45
}) => {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Local state for when context is not available
  const [localState, setLocalState] = useState({
    trainingType: recommendedType,
    tags: [] as string[],
    duration: recommendedDuration,
    intensity: "Moderate"
  });

  // Try to use context, fallback to local state if not available
  let state, updateState, resetState;
  try {
    const contextValue = useWorkoutSetup();
    state = contextValue.state;
    updateState = contextValue.updateState;
    resetState = contextValue.resetState;
  } catch (error) {
    // Context not available, use local state
    state = localState;
    updateState = (updates: Partial<typeof localState>) => {
      setLocalState(prev => ({ ...prev, ...updates }));
    };
    resetState = () => {
      setLocalState({
        trainingType: recommendedType,
        tags: [],
        duration: recommendedDuration,
        intensity: "Moderate"
      });
    };
  }

  // Main start button now goes to funnel
  const handleStartWorkout = () => {
    // Update context with current selections if available
    updateState({
      trainingType: state.trainingType || recommendedType,
      duration: state.duration || recommendedDuration
    });
    
    navigate('/workout-setup/type');
  };

  const handleCustomStart = () => {
    if (!state.trainingType) {
      updateState({ trainingType: recommendedType });
    }
    
    const customConfig = {
      trainingType: state.trainingType,
      tags: state.tags,
      duration: state.duration,
      intensity: state.intensity
    };
    
    setIsBottomSheetOpen(false);
    onStartTraining(customConfig);
  };

  // Mock progress values - in real app, these would come from user stats
  const dailyProgress = 25; // Example: 25% of daily goal completed
  const weeklyProgress = 60; // Example: 60% of weekly goal completed

  return (
    <>
      {/* Hero Section */}
      <div className="space-y-6">
        {/* Enhanced Main Start Button */}
        <EnhancedHeroWorkoutButton
          onPress={handleStartWorkout}
          isLoading={isLoading}
          className="w-full"
          dailyGoalProgress={dailyProgress}
          weeklyGoalProgress={weeklyProgress}
        />

        {/* Quick Stats */}
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-sm">
            <Zap className="h-4 w-4 mr-1" />
            {recommendedType} • {recommendedDuration}min
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsBottomSheetOpen(true)}
            className="text-gray-600 dark:text-gray-400"
          >
            <Settings className="h-4 w-4 mr-2" />
            Quick Setup
          </Button>
        </div>
      </div>

      {/* Bottom Sheet for Quick Setup */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        className="pb-8"
      >
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Quick Setup
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Skip the funnel with quick options
            </p>
          </div>

          {/* Training Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-500" />
              Training Focus
            </h3>
            <TrainingTypeSelector
              selectedType={state.trainingType}
              onSelect={(type) => updateState({ trainingType: type })}
            />
          </motion.div>

          {/* Duration Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <DurationSelector
              value={state.duration}
              onChange={(duration) => updateState({ duration })}
            />
          </motion.div>

          {/* Focus Areas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Focus Areas
              {state.tags.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {state.tags.length} selected
                </Badge>
              )}
            </h3>
            <WorkoutTagPicker
              selectedTags={state.tags}
              onToggleTag={(tag) => {
                const newTags = state.tags.includes(tag)
                  ? state.tags.filter(t => t !== tag)
                  : [...state.tags, tag];
                updateState({ tags: newTags });
              }}
              trainingType={state.trainingType}
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4 pt-4"
          >
            <Button
              variant="outline"
              onClick={() => {
                setIsBottomSheetOpen(false);
                handleStartWorkout();
              }}
              className="h-12"
            >
              Use Funnel
            </Button>
            <Button
              onClick={handleCustomStart}
              disabled={!state.trainingType}
              className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Start Now
            </Button>
          </motion.div>
        </div>
      </BottomSheet>
    </>
  );
};
