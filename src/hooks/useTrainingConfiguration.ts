
import { useState, useCallback } from 'react';
import { useWorkoutStatsContext } from '@/context/WorkoutStatsProvider';

export interface TrainingConfiguration {
  trainingType: string;
  tags: string[];
  duration: number;
}

export const useTrainingConfiguration = () => {
  const [trainingType, setTrainingType] = useState<string>("Strength");
  const [tags, setTags] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(30);
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
    setTrainingType("Strength");
    setTags([]);
    setDuration(30);
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
