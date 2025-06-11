
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { DIFFICULTY_LEVELS, MOVEMENT_PATTERNS, Difficulty, MovementPattern } from "@/types/exercise";

interface ExerciseAdvancedTabProps {
  exercise: {
    difficulty: Difficulty;
    movement_pattern: MovementPattern;
    is_compound: boolean;
    tips: string[];
    variations: string[];
  };
  onUpdate: (updates: any) => void;
  newTip: string;
  setNewTip: (tip: string) => void;
  newVariation: string;
  setNewVariation: (variation: string) => void;
  onAddTip: () => void;
  onRemoveTip: (index: number) => void;
  onAddVariation: () => void;
  onRemoveVariation: (index: number) => void;
}

export const ExerciseAdvancedTab: React.FC<ExerciseAdvancedTabProps> = React.memo(({
  exercise,
  onUpdate,
  newTip,
  setNewTip,
  newVariation,
  setNewVariation,
  onAddTip,
  onRemoveTip,
  onAddVariation,
  onRemoveVariation
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="difficulty">Difficulty Level</Label>
        <Select
          value={exercise.difficulty}
          onValueChange={(value) => onUpdate({ difficulty: value as Difficulty })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTY_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="movement">Movement Pattern</Label>
        <Select
          value={exercise.movement_pattern}
          onValueChange={(value) => onUpdate({ movement_pattern: value as MovementPattern })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select movement pattern" />
          </SelectTrigger>
          <SelectContent>
            {MOVEMENT_PATTERNS.map((pattern) => (
              <SelectItem key={pattern} value={pattern}>
                {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_compound"
          checked={exercise.is_compound}
          onCheckedChange={(checked) => onUpdate({ is_compound: checked as boolean })}
        />
        <Label htmlFor="is_compound">Is compound exercise</Label>
      </div>

      <Separator />
      
      <div>
        <Label>Exercise Tips</Label>
        <div className="flex items-center space-x-2 mt-1">
          <Input
            placeholder="Add a tip..."
            value={newTip}
            onChange={(e) => setNewTip(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={onAddTip}
            disabled={!newTip.trim()}
          >
            Add
          </Button>
        </div>
        {exercise.tips.length > 0 && (
          <div className="mt-2 space-y-2">
            {exercise.tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded bg-muted p-2"
              >
                <span className="text-sm">{tip}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveTip(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label>Exercise Variations</Label>
        <div className="flex items-center space-x-2 mt-1">
          <Input
            placeholder="Add a variation..."
            value={newVariation}
            onChange={(e) => setNewVariation(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={onAddVariation}
            disabled={!newVariation.trim()}
          >
            Add
          </Button>
        </div>
        {exercise.variations.length > 0 && (
          <div className="mt-2 space-y-2">
            {exercise.variations.map((variation, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded bg-muted p-2"
              >
                <span className="text-sm">{variation}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveVariation(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ExerciseAdvancedTab.displayName = 'ExerciseAdvancedTab';
