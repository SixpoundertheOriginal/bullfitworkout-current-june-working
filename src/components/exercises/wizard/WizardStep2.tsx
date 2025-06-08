
import React from 'react';
import { Button } from '@/components/ui/button';
import { InteractiveBodyDiagram } from '../InteractiveBodyDiagram';
import { ArrowLeft, ArrowRight, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WizardFormData } from '../ExerciseCreationWizard';
import { MuscleGroup } from '@/types/exercise';

interface WizardStep2Props {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const WizardStep2: React.FC<WizardStep2Props> = ({
  formData,
  updateFormData,
  onNext,
  onPrev
}) => {
  const handlePrimaryMuscleToggle = (muscle: MuscleGroup) => {
    const updated = formData.primaryMuscles.includes(muscle)
      ? formData.primaryMuscles.filter(m => m !== muscle)
      : [...formData.primaryMuscles, muscle];
    
    updateFormData({ primaryMuscles: updated });
  };

  const handleSecondaryMuscleToggle = (muscle: MuscleGroup) => {
    const updated = formData.secondaryMuscles.includes(muscle)
      ? formData.secondaryMuscles.filter(m => m !== muscle)
      : [...formData.secondaryMuscles, muscle];
    
    updateFormData({ secondaryMuscles: updated });
  };

  const canProceed = formData.primaryMuscles.length > 0;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-blue-500 mr-2" />
          <h3 className="text-2xl font-bold text-white">Target Muscle Groups</h3>
        </div>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Select the muscles that "{formData.name}" primarily targets, then optionally add secondary muscles.
          Visual selection makes it fast and intuitive!
        </p>
      </div>

      {/* Muscle Selection Stats */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <span className="text-gray-300">
            Primary Muscles ({formData.primaryMuscles.length})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
          <span className="text-gray-300">
            Secondary Muscles ({formData.secondaryMuscles.length})
          </span>
        </div>
      </div>

      {/* Interactive Body Diagram */}
      <div className="flex justify-center">
        <InteractiveBodyDiagram
          primaryMuscles={formData.primaryMuscles}
          secondaryMuscles={formData.secondaryMuscles}
          onPrimaryMuscleToggle={handlePrimaryMuscleToggle}
          onSecondaryMuscleToggle={handleSecondaryMuscleToggle}
        />
      </div>

      {/* Validation Message */}
      {!canProceed && (
        <div className="text-center">
          <p className="text-amber-400 text-sm">
            ⚡ Select at least one primary muscle group to continue
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t border-gray-700">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex items-center gap-2 text-gray-400 border-gray-600 hover:text-white hover:border-gray-500"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          onClick={onNext}
          disabled={!canProceed}
          className={cn(
            "flex items-center gap-2 px-6",
            canProceed
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
