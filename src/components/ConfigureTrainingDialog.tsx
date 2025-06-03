
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrainingTypeSelector } from "@/components/training/TrainingTypeSelector";
import { WorkoutTagPicker } from "@/components/training/WorkoutTagPicker";
import { DurationSelector } from "@/components/training/DurationSelector";
import { useWorkoutStatsContext } from "@/context/WorkoutStatsProvider";
import { QuickSetupTemplates } from "@/components/training/QuickSetupTemplates";
import { motion } from "framer-motion";

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
  const [trainingType, setTrainingType] = useState<string>("Strength");
  const [tags, setTags] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(30);
  const { stats } = useWorkoutStatsContext();

  const handleStart = () => {
    onStartTraining({ trainingType, tags, duration });
    onOpenChange(false);
  };

  const handleQuickSetupSelect = (config: { trainingType: string; tags: string[]; duration: number }) => {
    setTrainingType(config.trainingType);
    setTags(config.tags);
    setDuration(config.duration);
    onStartTraining(config);
    onOpenChange(false);
  };

  const handleToggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure Training</DialogTitle>
        </DialogHeader>

        <QuickSetupTemplates onSelect={handleQuickSetupSelect} />

        <div className="grid gap-4 py-4">
          <TrainingTypeSelector selectedType={trainingType} onSelect={setTrainingType} />
          <WorkoutTagPicker selectedTags={tags} onToggleTag={handleToggleTag} trainingType={trainingType} />
          <DurationSelector value={duration} onChange={setDuration} />
        </div>

        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button onClick={handleStart}>Start Training</Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
