
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ExerciseNameInput } from '../ExerciseNameInput';
import { ArrowRight, Sparkles, Dumbbell, Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WizardFormData } from '../ExerciseCreationWizard';

interface WizardStep1Props {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  onNext: () => void;
  onCancel: () => void;
}

const exerciseTypes = [
  {
    id: 'Strength' as const,
    name: 'Strength',
    description: 'Build muscle and power',
    icon: Dumbbell,
    gradient: 'from-blue-600 to-purple-600'
  },
  {
    id: 'Cardio' as const,
    name: 'Cardio', 
    description: 'Improve endurance',
    icon: Heart,
    gradient: 'from-red-600 to-pink-600'
  },
  {
    id: 'Flexibility' as const,
    name: 'Flexibility',
    description: 'Enhance mobility',
    icon: Zap,
    gradient: 'from-green-600 to-emerald-600'
  }
];

export const WizardStep1: React.FC<WizardStep1Props> = ({
  formData,
  updateFormData,
  onNext,
  onCancel
}) => {
  const [validationError, setValidationError] = useState<string>('');

  const handleSuggestionSelect = useCallback((suggestion: any) => {
    updateFormData({
      primaryMuscles: suggestion.primaryMuscles || [],
      equipment: suggestion.equipment ? [suggestion.equipment] : []
    });
  }, [updateFormData]);

  const handleNext = useCallback(() => {
    if (!formData.name.trim()) {
      setValidationError('Exercise name is required');
      return;
    }
    setValidationError('');
    onNext();
  }, [formData.name, onNext]);

  const canProceed = formData.name.trim().length > 0;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-purple-500 mr-2" />
          <h3 className="text-2xl font-bold text-white">Let's Create Your Exercise</h3>
        </div>
        <p className="text-gray-400">
          Start with the exercise name and type. We'll suggest details as you go!
        </p>
      </div>

      {/* Exercise Name Input */}
      <div className="max-w-2xl mx-auto">
        <ExerciseNameInput
          value={formData.name}
          onChange={(value) => updateFormData({ name: value })}
          onSuggestionSelect={handleSuggestionSelect}
          error={validationError}
        />
      </div>

      {/* Exercise Type Selection */}
      <div className="max-w-2xl mx-auto">
        <Label className="text-sm font-medium text-white mb-4 block">
          Exercise Type*
        </Label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exerciseTypes.map((type) => {
            const isSelected = formData.exerciseType === type.id;
            const IconComponent = type.icon;
            
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => updateFormData({ exerciseType: type.id })}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                  "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500",
                  isSelected
                    ? "border-purple-500 bg-purple-600/20 shadow-lg shadow-purple-500/20"
                    : "border-gray-700 bg-gray-800/50 hover:border-purple-400"
                )}
              >
                <div className="flex items-center mb-3">
                  <div className={cn(
                    "p-2 rounded-lg mr-3",
                    isSelected
                      ? `bg-gradient-to-r ${type.gradient}`
                      : "bg-gray-700"
                  )}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <h4 className={cn(
                    "font-semibold",
                    isSelected ? "text-white" : "text-gray-300"
                  )}>
                    {type.name}
                  </h4>
                </div>
                <p className={cn(
                  "text-sm",
                  isSelected ? "text-purple-200" : "text-gray-500"
                )}>
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-700">
        <Button
          variant="outline"
          onClick={onCancel}
          className="text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
        >
          Cancel
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className={cn(
            "flex items-center gap-2 px-6",
            canProceed
              ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              : "bg-gray-700 text-gray-400"
          )}
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
