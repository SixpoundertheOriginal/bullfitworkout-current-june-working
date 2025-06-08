
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExercisePreview } from '../ExercisePreview';
import { ArrowLeft, Plus, Dumbbell, BookOpen, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';
import { WizardFormData } from '../ExerciseCreationWizard';

interface WizardStep4Props {
  formData: WizardFormData;
  onSubmit: () => void;
  onPrev: () => void;
  onAddAnother: () => void;
  loading: boolean;
}

export const WizardStep4: React.FC<WizardStep4Props> = ({
  formData,
  onSubmit,
  onPrev,
  onAddAnother,
  loading
}) => {
  const isValid = formData.name.trim() && formData.primaryMuscles.length > 0 && formData.equipment.length > 0;
  const validationErrors: string[] = [];

  if (!formData.name.trim()) validationErrors.push('Exercise name is required');
  if (formData.primaryMuscles.length === 0) validationErrors.push('At least one primary muscle group is required');
  if (formData.equipment.length === 0) validationErrors.push('Equipment type is required');

  return (
    <div className="flex flex-col min-h-full">
      {/* Scrollable Content */}
      <div className="flex-1 p-6 space-y-6 pb-24">
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center mb-4"
          >
            <PartyPopper className="w-8 h-8 text-green-500 mr-2" />
            <h3 className="text-2xl font-bold text-white">Review Your Exercise</h3>
          </motion.div>
          <p className="text-gray-400">
            Perfect! Here's your complete exercise. Ready to add it to your library?
          </p>
          <div className="mt-2 text-sm text-green-400 font-medium">
            🎉 100% Complete!
          </div>
        </div>

        {/* Exercise Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <ExercisePreview
            name={formData.name}
            description={formData.description}
            primaryMuscles={formData.primaryMuscles}
            secondaryMuscles={formData.secondaryMuscles}
            equipment={formData.equipment}
            isValid={isValid}
            validationErrors={validationErrors}
          />
        </motion.div>

        {/* Action Buttons */}
        {isValid && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto"
          >
            <Button
              onClick={onAddAnother}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2 text-purple-400 border-purple-500 hover:bg-purple-600/20 hover:text-white touch-target"
            >
              <Plus className="w-4 h-4" />
              Add Another Exercise
            </Button>
            
            <Button
              onClick={onSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 touch-target"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  Add to Library
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Fixed Navigation Footer */}
      <div className="flex-shrink-0 p-6 border-t border-gray-700 bg-gray-900/95 backdrop-blur-sm">
        <div className="flex justify-between items-center max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={loading}
            className="flex items-center gap-2 text-gray-400 border-gray-600 hover:text-white hover:border-gray-500 touch-target"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="text-xs text-gray-500 self-center">
            Ready to start your workout with this exercise?
          </div>
        </div>
      </div>
    </div>
  );
};
