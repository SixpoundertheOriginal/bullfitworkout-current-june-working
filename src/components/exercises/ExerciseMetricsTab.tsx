
import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { LOADING_TYPES, VARIANT_CATEGORIES, LoadingType, VariantCategory } from "@/types/exercise";

interface ExerciseMetricsTabProps {
  exercise: {
    is_bodyweight: boolean;
    estimated_load_percent?: number;
    loading_type?: LoadingType;
    variant_category?: VariantCategory;
    energy_cost_factor: number;
  };
  onUpdate: (updates: any) => void;
}

export const ExerciseMetricsTab: React.FC<ExerciseMetricsTabProps> = React.memo(({
  exercise,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_bodyweight"
          checked={exercise.is_bodyweight}
          onCheckedChange={(checked) => onUpdate({ is_bodyweight: checked as boolean })}
        />
        <Label htmlFor="is_bodyweight">Bodyweight exercise</Label>
      </div>
      
      {exercise.is_bodyweight && (
        <div>
          <Label htmlFor="estimated_load_percent">Estimated Body Load (%)</Label>
          <div className="flex items-center space-x-4">
            <Slider
              id="estimated_load_percent"
              defaultValue={[exercise.estimated_load_percent || 65]}
              min={10}
              max={100}
              step={5}
              onValueChange={(value) => onUpdate({ estimated_load_percent: value[0] })}
              className="flex-1"
            />
            <span className="w-16 text-center">
              {exercise.estimated_load_percent || 65}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Percentage of bodyweight used in the exercise
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="loading_type">Loading Type</Label>
        <Select
          value={exercise.loading_type || (exercise.is_bodyweight ? 'bodyweight' : '')}
          onValueChange={(value) => onUpdate({ loading_type: value as LoadingType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select loading type" />
          </SelectTrigger>
          <SelectContent>
            {LOADING_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          How resistance is applied in this exercise
        </p>
      </div>

      <div>
        <Label htmlFor="variant_category">Variant Category</Label>
        <Select
          value={exercise.variant_category || ''}
          onValueChange={(value) => onUpdate({ variant_category: value as VariantCategory })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select variant category" />
          </SelectTrigger>
          <SelectContent>
            {VARIANT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Helps with exercise progression tracking
        </p>
      </div>

      <div>
        <Label htmlFor="energy_cost_factor">Energy Cost Factor</Label>
        <div className="flex items-center space-x-4">
          <Slider
            id="energy_cost_factor"
            defaultValue={[exercise.energy_cost_factor || 1]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={(value) => onUpdate({ energy_cost_factor: value[0] })}
            className="flex-1"
          />
          <span className="w-16 text-center">
            {exercise.energy_cost_factor || 1}x
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Relative energy expenditure compared to standard exercises
        </p>
      </div>
    </div>
  );
});

ExerciseMetricsTab.displayName = 'ExerciseMetricsTab';
