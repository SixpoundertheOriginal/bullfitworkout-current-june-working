
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure Training</DialogTitle>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
};
