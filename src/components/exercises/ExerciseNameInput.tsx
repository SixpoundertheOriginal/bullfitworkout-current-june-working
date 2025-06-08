
import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MuscleGroup, EquipmentType } from '@/types/exercise';

interface ExerciseSuggestion {
  name: string;
  primaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  popularity: number;
}

const EXERCISE_SUGGESTIONS: ExerciseSuggestion[] = [
  { name: 'Bench Press', primaryMuscles: ['chest', 'shoulders', 'triceps'], equipment: 'barbell', popularity: 10 },
  { name: 'Deadlift', primaryMuscles: ['back', 'hamstrings', 'glutes'], equipment: 'barbell', popularity: 10 },
  { name: 'Squat', primaryMuscles: ['quads', 'glutes'], equipment: 'barbell', popularity: 10 },
  { name: 'Pull-ups', primaryMuscles: ['back', 'biceps'], equipment: 'bodyweight', popularity: 9 },
  { name: 'Push-ups', primaryMuscles: ['chest', 'shoulders', 'triceps'], equipment: 'bodyweight', popularity: 9 },
  { name: 'Overhead Press', primaryMuscles: ['shoulders', 'triceps'], equipment: 'barbell', popularity: 8 },
  { name: 'Dumbbell Row', primaryMuscles: ['back', 'biceps'], equipment: 'dumbbell', popularity: 8 },
  { name: 'Dumbbell Curl', primaryMuscles: ['biceps'], equipment: 'dumbbell', popularity: 7 },
  { name: 'Tricep Dips', primaryMuscles: ['triceps'], equipment: 'bodyweight', popularity: 7 },
  { name: 'Leg Press', primaryMuscles: ['quads', 'glutes'], equipment: 'machine', popularity: 6 },
  { name: 'Lat Pulldown', primaryMuscles: ['lats', 'biceps'], equipment: 'cable', popularity: 6 },
  { name: 'Plank', primaryMuscles: ['core', 'abs'], equipment: 'bodyweight', popularity: 8 },
  { name: 'Lunges', primaryMuscles: ['quads', 'glutes'], equipment: 'bodyweight', popularity: 7 },
  { name: 'Hip Thrust', primaryMuscles: ['glutes'], equipment: 'barbell', popularity: 6 },
  { name: 'Face Pull', primaryMuscles: ['shoulders', 'back'], equipment: 'cable', popularity: 5 }
];

interface ExerciseNameInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect: (suggestion: ExerciseSuggestion) => void;
  className?: string;
  error?: string;
}

export const ExerciseNameInput: React.FC<ExerciseNameInputProps> = ({
  value,
  onChange,
  onSuggestionSelect,
  className,
  error
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!value.trim()) return EXERCISE_SUGGESTIONS.slice(0, 6).sort((a, b) => b.popularity - a.popularity);
    
    const searchTerm = value.toLowerCase();
    return EXERCISE_SUGGESTIONS
      .filter(suggestion => 
        suggestion.name.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.name.toLowerCase().startsWith(searchTerm) ? 1 : 0;
        const bExact = b.name.toLowerCase().startsWith(searchTerm) ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        
        // Then by popularity
        return b.popularity - a.popularity;
      })
      .slice(0, 8);
  }, [value]);

  const handleSuggestionClick = useCallback((suggestion: ExerciseSuggestion) => {
    onChange(suggestion.name);
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
  }, [onChange, onSuggestionSelect]);

  const handleInputFocus = useCallback(() => {
    setShowSuggestions(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    // Delay hiding to allow for suggestion clicks
    setTimeout(() => setShowSuggestions(false), 200);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="space-y-2">
        <Label htmlFor="exercise-name" className="text-sm font-medium text-white">
          Exercise Name*
        </Label>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="exercise-name"
            type="text"
            placeholder="Search or enter exercise name..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={cn(
              "pl-10 pr-4 py-3 bg-gray-800 border-gray-700 text-white placeholder-gray-400",
              "focus:border-purple-500 focus:ring-purple-500 transition-all duration-200",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
          />
          
          {value && (
            <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          <div className="p-2 border-b border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              {value ? 'Matching Exercises' : 'Popular Exercises'}
            </p>
          </div>
          
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.name}-${index}`}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full p-3 text-left hover:bg-gray-700 transition-colors duration-150 border-b border-gray-700/50 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white text-sm">
                    {suggestion.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">
                      {suggestion.primaryMuscles.slice(0, 2).join(', ')}
                      {suggestion.primaryMuscles.length > 2 && ` +${suggestion.primaryMuscles.length - 2}`}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-600 rounded text-gray-300">
                      {suggestion.equipment}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1 h-1 rounded-full mx-0.5",
                        i < Math.floor(suggestion.popularity / 2)
                          ? "bg-purple-400"
                          : "bg-gray-600"
                      )}
                    />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
