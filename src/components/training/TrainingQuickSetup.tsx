
import React from 'react';
import { QuickSetupTemplates } from '@/components/training/QuickSetupTemplates';
import { TrainingConfiguration } from '@/hooks/useTrainingConfiguration';

interface TrainingQuickSetupProps {
  onSelect: (config: TrainingConfiguration) => void;
}

export const TrainingQuickSetup: React.FC<TrainingQuickSetupProps> = React.memo(({
  onSelect
}) => {
  const handleQuickSetupSelect = (config: { trainingType: string; tags: string[]; duration: number }) => {
    onSelect({
      trainingType: config.trainingType,
      tags: config.tags,
      duration: config.duration
    });
  };

  return <QuickSetupTemplates onSelect={handleQuickSetupSelect} />;
});

TrainingQuickSetup.displayName = 'TrainingQuickSetup';
