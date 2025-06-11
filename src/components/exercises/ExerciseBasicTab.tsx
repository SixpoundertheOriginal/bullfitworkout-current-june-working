
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/MultiSelect";
import { COMMON_MUSCLE_GROUPS, COMMON_EQUIPMENT, MuscleGroup, EquipmentType } from "@/types/exercise";

interface ExerciseBasicTabProps {
  exercise: {
    name: string;
    description: string;
    primary_muscle_groups: MuscleGroup[];
    secondary_muscle_groups: MuscleGroup[];
    equipment_type: EquipmentType[];
  };
  onUpdate: (updates: any) => void;
}

export const ExerciseBasicTab: React.FC<ExerciseBasicTabProps> = React.memo(({
  exercise,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Exercise Name*</Label>
        <Input
          id="name"
          placeholder="e.g. Bench Press"
          value={exercise.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the exercise..."
          value={exercise.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      <div>
        <Label>Primary Muscle Groups*</Label>
        <div className="mt-1">
          <MultiSelect
            options={COMMON_MUSCLE_GROUPS.map(group => ({ label: group, value: group }))}
            selected={exercise.primary_muscle_groups}
            onChange={(selected) => onUpdate({ primary_muscle_groups: selected as MuscleGroup[] })}
            placeholder="Select primary muscle groups"
          />
        </div>
      </div>

      <div>
        <Label>Secondary Muscle Groups</Label>
        <div className="mt-1">
          <MultiSelect
            options={COMMON_MUSCLE_GROUPS.map(group => ({ label: group, value: group }))}
            selected={exercise.secondary_muscle_groups}
            onChange={(selected) => onUpdate({ secondary_muscle_groups: selected as MuscleGroup[] })}
            placeholder="Select secondary muscle groups"
          />
        </div>
      </div>

      <div>
        <Label>Equipment Type*</Label>
        <div className="mt-1">
          <MultiSelect
            options={COMMON_EQUIPMENT.map(equip => ({ label: equip, value: equip }))}
            selected={exercise.equipment_type}
            onChange={(selected) => onUpdate({ equipment_type: selected as EquipmentType[] })}
            placeholder="Select equipment types"
          />
        </div>
      </div>
    </div>
  );
});

ExerciseBasicTab.displayName = 'ExerciseBasicTab';
