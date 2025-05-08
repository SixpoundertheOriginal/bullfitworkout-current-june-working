
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TabsContent } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/MultiSelect";
import { MuscleGroup, EquipmentType } from "@/constants/exerciseMetadata";

// Define the Option type used in MultiSelect
interface Option {
  value: string;
  label: string;
}

// Define the exercise type using a generic type that matches the structure in ExerciseDialog
interface ExerciseForm {
  name: string;
  description: string;
  primary_muscle_groups: MuscleGroup[];
  secondary_muscle_groups: MuscleGroup[];
  equipment_type: EquipmentType[];
  [key: string]: any; // For other properties
}

// Props interface as specified
export interface BasicTabProps {
  exercise: ExerciseForm;
  setExercise: React.Dispatch<React.SetStateAction<ExerciseForm>>;
  muscleGroupOptions: Option[];
  equipmentOptions: Option[];
}

// The component itself
const ExerciseDialogBasicTabComponent: React.FC<BasicTabProps> = ({
  exercise,
  setExercise,
  muscleGroupOptions,
  equipmentOptions
}) => {
  return (
    <TabsContent value="basic" className="space-y-4 mt-0">
      <div className="space-y-2">
        <Label htmlFor="name">Exercise Name*</Label>
        <Input 
          id="name" 
          value={exercise.name}
          onChange={(e) => setExercise({...exercise, name: e.target.value})}
          placeholder="E.g., Bench Press" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          value={exercise.description}
          onChange={(e) => setExercise({...exercise, description: e.target.value})}
          placeholder="Brief description of the exercise"
          className="min-h-[80px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Primary Muscle Groups*</Label>
        <MultiSelect
          options={muscleGroupOptions}
          selected={exercise.primary_muscle_groups.map(m => ({
            value: m,
            label: m.charAt(0).toUpperCase() + m.slice(1).replace(/_/g, ' ')
          }))}
          onChange={(selected) => setExercise({
            ...exercise, 
            primary_muscle_groups: selected.map(s => s.value as MuscleGroup)
          })}
          placeholder="Select primary muscles"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Secondary Muscle Groups</Label>
        <MultiSelect
          options={muscleGroupOptions}
          selected={exercise.secondary_muscle_groups.map(m => ({
            value: m,
            label: m.charAt(0).toUpperCase() + m.slice(1).replace(/_/g, ' ')
          }))}
          onChange={(selected) => setExercise({
            ...exercise, 
            secondary_muscle_groups: selected.map(s => s.value as MuscleGroup)
          })}
          placeholder="Select secondary muscles"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Equipment Type*</Label>
        <MultiSelect
          options={equipmentOptions}
          selected={exercise.equipment_type.map(e => ({
            value: e,
            label: e.charAt(0).toUpperCase() + e.slice(1).replace(/_/g, ' ')
          }))}
          onChange={(selected) => setExercise({
            ...exercise, 
            equipment_type: selected.map(s => s.value as EquipmentType)
          })}
          placeholder="Select equipment types"
        />
      </div>
    </TabsContent>
  );
};

// Wrap the component with React.memo as specified
export const ExerciseDialogBasicTab = React.memo(ExerciseDialogBasicTabComponent);
