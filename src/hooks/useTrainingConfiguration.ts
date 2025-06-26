
import { useState, useCallback } from 'react';
import { useWorkoutStatsContext } from '@/context/WorkoutStatsProvider';

export interface TrainingConfiguration {
  trainingType: string;
  tags: string[];
  duration: number;
}

export const useTrainingConfiguration = () => {
  const [trainingType, setTrainingType] = useState<string>("Strength Training");
  const [tags, setTags] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(45); // Increased default for strength training
  const { stats } = useWorkoutStatsContext();

  const configuration: TrainingConfiguration = {
    trainingType,
    tags,
    duration
  };

  const updateTrainingType = useCallback((type: string) => {
    setTrainingType(type);
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const updateDuration = useCallback((newDuration: number) => {
    setDuration(newDuration);
  }, []);

  const handleQuickSetup = useCallback((config: TrainingConfiguration) => {
    setTrainingType(config.trainingType);
    setTags(config.tags);
    setDuration(config.duration);
  }, []);

  const resetConfiguration = useCallback(() => {
    setTrainingType("Strength Training");
    setTags([]);
    setDuration(45);
  }, []);

  return {
    configuration,
    trainingType,
    tags,
    duration,
    stats,
    updateTrainingType,
    toggleTag,
    updateDuration,
    handleQuickSetup,
    resetConfiguration
  };
};
