
import React from "react";
import { AccessibleDialog } from "@/components/ui/AccessibleDialog";
import { useTrainingConfiguration } from "@/hooks/useTrainingConfiguration";
import { TrainingQuickSetup } from "@/components/training/TrainingQuickSetup";
import { TrainingConfigurationForm } from "@/components/training/TrainingConfigurationForm";
import { TrainingDialogActions } from "@/components/training/TrainingDialogActions";

interface ConfigureTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTraining: (config: any) => void;
}

export const ConfigureTrainingDialog: React.FC<ConfigureTrainingDialogProps> = ({
  open,
  onOpenChange,
  onStartTraining,
}) => {
  const {
    configuration,
    trainingType,
    tags,
    duration,
    updateTrainingType,
    toggleTag,
    updateDuration,
    handleQuickSetup
  } = useTrainingConfiguration();

  const handleStart = () => {
    onStartTraining(configuration);
    onOpenChange(false);
  };

  const handleQuickSetupSelect = (config: any) => {
    handleQuickSetup(config);
    onStartTraining(config);
    onOpenChange(false);
  };

  return (
    <AccessibleDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configure Training"
      description="Quickly set up a training session or customize it to your needs."
      contentClassName="sm:max-w-[425px]"
    >
      <TrainingQuickSetup onSelect={handleQuickSetupSelect} />

      <TrainingConfigurationForm
        trainingType={trainingType}
        tags={tags}
        duration={duration}
        onTrainingTypeChange={updateTrainingType}
        onToggleTag={toggleTag}
        onDurationChange={updateDuration}
      />

      <TrainingDialogActions onStart={handleStart} />
    </AccessibleDialog>
  );
};
