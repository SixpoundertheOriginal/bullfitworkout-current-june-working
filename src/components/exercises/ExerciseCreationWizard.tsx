
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MuscleGroup, EquipmentType } from '@/types/exercise';
import { WizardProgressBar } from './wizard/WizardProgressBar';
import { WizardStep1 } from './wizard/WizardStep1';
import { WizardStep2 } from './wizard/WizardStep2';
import { WizardStep3 } from './wizard/WizardStep3';
import { WizardStep4 } from './wizard/WizardStep4';

export interface WizardFormData {
  name: string;
  description: string;
  exerciseType: 'Strength' | 'Cardio' | 'Flexibility';
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface ExerciseCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (exerciseData: any) => void;
  loading?: boolean;
}

export const ExerciseCreationWizard: React.FC<ExerciseCreationWizardProps> = ({
  open,
  onOpenChange,
  onSubmit,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>({
    name: '',
    description: '',
    exerciseType: 'Strength',
    primaryMuscles: [],
    secondaryMuscles: [],
    equipment: [],
    difficulty: 'beginner'
  });

  const updateFormData = useCallback((updates: Partial<WizardFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(() => {
    const submitData = {
      name: formData.name,
      description: formData.description,
      primary_muscle_groups: formData.primaryMuscles,
      secondary_muscle_groups: formData.secondaryMuscles,
      equipment_type: formData.equipment,
      movement_pattern: 'push' as const,
      difficulty: formData.difficulty,
      instructions: { steps: '', form: '' },
      is_compound: formData.primaryMuscles.length > 1,
      tips: [],
      variations: [],
      user_id: 'current-user-id'
    };
    
    onSubmit(submitData);
  }, [formData, onSubmit]);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setFormData({
      name: '',
      description: '',
      exerciseType: 'Strength',
      primaryMuscles: [],
      secondaryMuscles: [],
      equipment: [],
      difficulty: 'beginner'
    });
  }, []);

  React.useEffect(() => {
    if (!open) {
      resetWizard();
    }
  }, [open, resetWizard]);

  const getStepPercentage = () => {
    return (currentStep / 4) * 100;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 bg-gray-900 border-gray-700">
        <div className="flex flex-col h-full">
          <WizardProgressBar 
            currentStep={currentStep}
            totalSteps={4}
            percentage={getStepPercentage()}
          />
          
          <div className="flex-1 overflow-y-auto">
            {currentStep === 1 && (
              <WizardStep1
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onCancel={() => onOpenChange(false)}
              />
            )}
            
            {currentStep === 2 && (
              <WizardStep2
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            
            {currentStep === 3 && (
              <WizardStep3
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            
            {currentStep === 4 && (
              <WizardStep4
                formData={formData}
                onSubmit={handleSubmit}
                onPrev={prevStep}
                onAddAnother={() => {
                  handleSubmit();
                  resetWizard();
                }}
                loading={loading}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
