
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VisualEquipmentSelector } from '../VisualEquipmentSelector';
import { ArrowLeft, ArrowRight, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WizardFormData } from '../ExerciseCreationWizard';
import { EquipmentType } from '@/types/exercise';

interface WizardStep3Props {
  formData: WizardFormData;
  updateFormData: (updates: Partial<WizardFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const difficultyLevels = [
  { id: 'beginner', name: 'Beginner', description: 'Easy to learn', color: 'bg-green-600' },
  { id: 'intermediate', name: 'Intermediate', description: 'Moderate challenge', color: 'bg-yellow-600' },
  { id: 'advanced', name: 'Advanced', description: 'Requires skill', color: 'bg-red-600' }
];

export const WizardStep3: React.FC<WizardStep3Props> = ({
  formData,
  updateFormData,
  onNext,
  onPrev
}) => {
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);

  const handleEquipmentToggle = (equipment: EquipmentType) => {
    updateFormData({ equipment: [equipment] }); // Single select for now
  };

  const canProceed = formData.equipment.length > 0;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Settings className="w-8 h-8 text-green-500 mr-2" />
          <h3 className="text-2xl font-bold text-white">Equipment & Details</h3>
        </div>
        <p className="text-gray-400">
          Almost there! Select the equipment needed and set the difficulty level.
        </p>
        <div className="mt-2 text-sm text-purple-400 font-medium">
          80% Complete ⚡
        </div>
      </div>

      {/* Equipment Selection */}
      <div>
        <VisualEquipmentSelector
          selectedEquipment={formData.equipment}
          onEquipmentToggle={handleEquipmentToggle}
          multiSelect={false}
        />
      </div>

      {/* Difficulty Selection */}
      <div className="max-w-2xl mx-auto">
        <Label className="text-sm font-medium text-white mb-4 block">
          Difficulty Level*
        </Label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {difficultyLevels.map((level) => {
            const isSelected = formData.difficulty === level.id;
            
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => updateFormData({ difficulty: level.id as any })}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all duration-200 text-left",
                  "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500",
                  isSelected
                    ? "border-green-500 bg-green-600/20 shadow-lg shadow-green-500/20"
                    : "border-gray-700 bg-gray-800/50 hover:border-green-400"
                )}
              >
                <div className="flex items-center mb-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full mr-3",
                    isSelected ? level.color : "bg-gray-600"
                  )} />
                  <h4 className={cn(
                    "font-semibold",
                    isSelected ? "text-white" : "text-gray-300"
                  )}>
                    {level.name}
                  </h4>
                </div>
                <p className={cn(
                  "text-sm",
                  isSelected ? "text-green-200" : "text-gray-500"
                )}>
                  {level.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Details (Collapsible) */}
      <div className="max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => setShowOptionalDetails(!showOptionalDetails)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <span className="text-sm font-medium">Optional Details</span>
          {showOptionalDetails ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showOptionalDetails && (
          <div className="space-y-4 border border-gray-700 rounded-lg p-4 bg-gray-800/30">
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-white">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of the exercise (optional)..."
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                className="mt-2 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>

      {/* Validation Message */}
      {!canProceed && (
        <div className="text-center">
          <p className="text-amber-400 text-sm">
            ⚡ Select equipment type to continue
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
              ? "bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              : "bg-gray-700 text-gray-400"
          )}
        >
          Review & Create
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
