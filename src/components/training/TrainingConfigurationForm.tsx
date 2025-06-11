
import React from 'react';
import { TrainingTypeSelector } from '@/components/training/TrainingTypeSelector';
import { WorkoutTagPicker } from '@/components/training/WorkoutTagPicker';
import { DurationSelector } from '@/components/training/DurationSelector';

interface TrainingConfigurationFormProps {
  trainingType: string;
  tags: string[];
  duration: number;
  onTrainingTypeChange: (type: string) => void;
  onToggleTag: (tag: string) => void;
  onDurationChange: (duration: number) => void;
}

export const TrainingConfigurationForm: React.FC<TrainingConfigurationFormProps> = React.memo(({
  trainingType,
  tags,
  duration,
  onTrainingTypeChange,
  onToggleTag,
  onDurationChange
}) => {
  return (
    <div className="grid gap-4 py-4">
      <TrainingTypeSelector 
        selectedType={trainingType} 
        onSelect={onTrainingTypeChange} 
      />
      <WorkoutTagPicker 
        selectedTags={tags} 
        onToggleTag={onToggleTag} 
        trainingType={trainingType} 
      />
      <DurationSelector 
        value={duration} 
        onChange={onDurationChange} 
      />
    </div>
  );
});

TrainingConfigurationForm.displayName = 'TrainingConfigurationForm';
