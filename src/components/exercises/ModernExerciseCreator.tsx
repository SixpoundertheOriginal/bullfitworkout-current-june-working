
import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MuscleGroup, EquipmentType } from '@/types/exercise';
import { ExerciseNameInput } from './ExerciseNameInput';
import { InteractiveBodyDiagram } from './InteractiveBodyDiagram';
import { VisualEquipmentSelector } from './VisualEquipmentSelector';
import { ExercisePreview } from './ExercisePreview';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseFormData {
  name: string;
  description: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType[];
}

interface ModernExerciseCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (exerciseData: any) => void;
  loading?: boolean;
}

export const ModernExerciseCreator: React.FC<ModernExerciseCreatorProps> = ({
  open,
  onOpenChange,
  onSubmit,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [exerciseData, setExerciseData] = useState<ExerciseFormData>({
    name: '',
    description: '',
    primaryMuscles: [],
    secondaryMuscles: [],
    equipment: []
  });

  // Validation logic
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!exerciseData.name.trim()) errors.push('Exercise name is required');
    if (exerciseData.primaryMuscles.length === 0) errors.push('At least one primary muscle group is required');
    if (exerciseData.equipment.length === 0) errors.push('At least one equipment type is required');
    return errors;
  }, [exerciseData]);

  const isValid = validationErrors.length === 0;

  // Handle exercise suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: any) => {
    setExerciseData(prev => ({
      ...prev,
      primaryMuscles: suggestion.primaryMuscles,
      equipment: [suggestion.equipment]
    }));
  }, []);

  // Handle muscle selection
  const handlePrimaryMuscleToggle = useCallback((muscle: MuscleGroup) => {
    setExerciseData(prev => ({
      ...prev,
      primaryMuscles: prev.primaryMuscles.includes(muscle)
        ? prev.primaryMuscles.filter(m => m !== muscle)
        : [...prev.primaryMuscles, muscle]
    }));
  }, []);

  const handleSecondaryMuscleToggle = useCallback((muscle: MuscleGroup) => {
    setExerciseData(prev => ({
      ...prev,
      secondaryMuscles: prev.secondaryMuscles.includes(muscle)
        ? prev.secondaryMuscles.filter(m => m !== muscle)
        : [...prev.secondaryMuscles, muscle]
    }));
  }, []);

  // Handle equipment selection
  const handleEquipmentToggle = useCallback((equipment: EquipmentType) => {
    setExerciseData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [equipment] // Single select for now
    }));
  }, []);

  // Navigation
  const handleNext = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Form submission
  const handleSubmit = useCallback(() => {
    if (isValid) {
      const submitData = {
        name: exerciseData.name,
        description: exerciseData.description,
        primary_muscle_groups: exerciseData.primaryMuscles,
        secondary_muscle_groups: exerciseData.secondaryMuscles,
        equipment_type: exerciseData.equipment,
        movement_pattern: 'push' as const, // Default value
        difficulty: 'beginner' as const, // Default value
        instructions: { steps: '', form: '' },
        is_compound: exerciseData.primaryMuscles.length > 1,
        tips: [],
        variations: [],
        user_id: 'current-user-id' // This should come from auth context
      };
      
      onSubmit(submitData);
    }
  }, [isValid, exerciseData, onSubmit]);

  // Reset form
  const resetForm = useCallback(() => {
    setCurrentStep(1);
    setExerciseData({
      name: '',
      description: '',
      primaryMuscles: [],
      secondaryMuscles: [],
      equipment: []
    });
  }, []);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const steps = [
    { id: 1, title: 'Exercise Name', description: 'Start with the exercise name' },
    { id: 2, title: 'Muscles & Equipment', description: 'Select target muscles and equipment' },
    { id: 3, title: 'Review & Create', description: 'Review and finalize your exercise' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Create New Exercise
            <span className="text-sm text-gray-400 ml-2">
              ({currentStep}/3)
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                    step.id <= currentStep
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-400"
                  )}
                >
                  {step.id}
                </div>
                <div className="ml-2 hidden md:block">
                  <p className={cn(
                    "text-sm font-medium",
                    step.id <= currentStep ? "text-white" : "text-gray-400"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 h-0.5 mx-4 transition-colors duration-200",
                  step.id < currentStep ? "bg-purple-600" : "bg-gray-700"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          {currentStep === 1 && (
            <div className="space-y-6">
              <ExerciseNameInput
                value={exerciseData.name}
                onChange={(value) => setExerciseData(prev => ({ ...prev, name: value }))}
                onSuggestionSelect={handleSuggestionSelect}
                error={validationErrors.find(error => error.includes('name'))}
              />
              
              <div>
                <Label htmlFor="description" className="text-sm font-medium text-white">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the exercise..."
                  value={exerciseData.description}
                  onChange={(e) => setExerciseData(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-2 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <InteractiveBodyDiagram
                  primaryMuscles={exerciseData.primaryMuscles}
                  secondaryMuscles={exerciseData.secondaryMuscles}
                  onPrimaryMuscleToggle={handlePrimaryMuscleToggle}
                  onSecondaryMuscleToggle={handleSecondaryMuscleToggle}
                />
              </div>
              
              <div>
                <VisualEquipmentSelector
                  selectedEquipment={exerciseData.equipment}
                  onEquipmentToggle={handleEquipmentToggle}
                  multiSelect={false}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <ExercisePreview
              name={exerciseData.name}
              description={exerciseData.description}
              primaryMuscles={exerciseData.primaryMuscles}
              secondaryMuscles={exerciseData.secondaryMuscles}
              equipment={exerciseData.equipment}
              isValid={isValid}
              validationErrors={validationErrors}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? () => onOpenChange(false) : handlePrevious}
            className="flex items-center gap-2"
          >
            {currentStep === 1 ? (
              'Cancel'
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                Previous
              </>
            )}
          </Button>

          <Button
            onClick={currentStep === 3 ? handleSubmit : handleNext}
            disabled={loading || (currentStep === 3 && !isValid)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Creating...
              </>
            ) : currentStep === 3 ? (
              'Create Exercise'
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
