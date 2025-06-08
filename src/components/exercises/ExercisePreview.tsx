
import React from 'react';
import { MuscleGroup, EquipmentType } from '@/types/exercise';
import { cn } from '@/lib/utils';
import { Check, AlertCircle } from 'lucide-react';

interface ExercisePreviewProps {
  name: string;
  description: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType[];
  isValid: boolean;
  validationErrors: string[];
  className?: string;
}

export const ExercisePreview: React.FC<ExercisePreviewProps> = ({
  name,
  description,
  primaryMuscles,
  secondaryMuscles,
  equipment,
  isValid,
  validationErrors,
  className
}) => {
  return (
    <div className={cn("bg-gray-800/50 rounded-xl p-6 border border-gray-700", className)}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-white">Exercise Preview</h3>
        {isValid ? (
          <Check className="w-5 h-5 text-green-500" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
      </div>

      <div className="space-y-4">
        {/* Exercise Name */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-1">Name</h4>
          <p className={cn(
            "text-sm",
            name ? "text-white" : "text-gray-500 italic"
          )}>
            {name || "Enter exercise name..."}
          </p>
        </div>

        {/* Description */}
        {description && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-1">Description</h4>
            <p className="text-sm text-gray-400">{description}</p>
          </div>
        )}

        {/* Primary Muscles */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Primary Muscles</h4>
          {primaryMuscles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {primaryMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-xs font-medium text-blue-300"
                >
                  {muscle}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Select primary muscles...</p>
          )}
        </div>

        {/* Secondary Muscles */}
        {secondaryMuscles.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Secondary Muscles</h4>
            <div className="flex flex-wrap gap-2">
              {secondaryMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-xs font-medium text-purple-300"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Equipment</h4>
          {equipment.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {equipment.map((eq) => (
                <span
                  key={eq}
                  className="px-3 py-1 bg-gray-600/50 border border-gray-500/30 rounded-full text-xs font-medium text-gray-300"
                >
                  {eq}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Select equipment...</p>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Required Information
            </h4>
            <ul className="text-sm text-red-300 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Success State */}
        {isValid && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <h4 className="text-sm font-medium text-green-400 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Ready to Create Exercise
            </h4>
            <p className="text-sm text-green-300 mt-1">
              All required information has been provided
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
