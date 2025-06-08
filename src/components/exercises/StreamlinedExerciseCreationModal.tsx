
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty,
         COMMON_MUSCLE_GROUPS, COMMON_EQUIPMENT, MOVEMENT_PATTERNS, DIFFICULTY_LEVELS } from '@/types/exercise';
import { MultiSelect } from '@/components/MultiSelect';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface StreamlinedExerciseCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (exercise: any) => void;
  loading?: boolean;
}

export const StreamlinedExerciseCreationModal: React.FC<StreamlinedExerciseCreationModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  loading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [exerciseData, setExerciseData] = useState({
    name: '',
    description: '',
    primary_muscle_groups: [] as MuscleGroup[],
    secondary_muscle_groups: [] as MuscleGroup[],
    equipment_type: [] as EquipmentType[],
    movement_pattern: 'push' as MovementPattern,
    difficulty: 'beginner' as Difficulty,
    instructions: { steps: '', form: '' },
    is_compound: false,
    tips: [] as string[],
    variations: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!exerciseData.name.trim()) newErrors.name = 'Name is required';
      if (exerciseData.primary_muscle_groups.length === 0) {
        newErrors.primary_muscle_groups = 'At least one primary muscle group is required';
      }
    }

    if (step === 2) {
      if (exerciseData.equipment_type.length === 0) {
        newErrors.equipment_type = 'At least one equipment type is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(exerciseData);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setExerciseData({
      name: '',
      description: '',
      primary_muscle_groups: [],
      secondary_muscle_groups: [],
      equipment_type: [],
      movement_pattern: 'push',
      difficulty: 'beginner',
      instructions: { steps: '', form: '' },
      is_compound: false,
      tips: [],
      variations: []
    });
    setErrors({});
  };

  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Exercise Name*</Label>
        <Input
          id="name"
          placeholder="e.g. Bench Press"
          value={exerciseData.name}
          onChange={(e) => setExerciseData({ ...exerciseData, name: e.target.value })}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the exercise..."
          value={exerciseData.description}
          onChange={(e) => setExerciseData({ ...exerciseData, description: e.target.value })}
          className="min-h-[80px]"
        />
      </div>

      <div>
        <Label>Primary Muscle Groups*</Label>
        <MultiSelect
          options={COMMON_MUSCLE_GROUPS.map(group => ({ label: group, value: group }))}
          selected={exerciseData.primary_muscle_groups}
          onChange={(selected) => setExerciseData({ ...exerciseData, primary_muscle_groups: selected as MuscleGroup[] })}
          placeholder="Select primary muscle groups"
          className={errors.primary_muscle_groups ? 'border-red-500' : ''}
        />
        {errors.primary_muscle_groups && <p className="text-red-500 text-sm mt-1">{errors.primary_muscle_groups}</p>}
      </div>

      <div>
        <Label>Secondary Muscle Groups</Label>
        <MultiSelect
          options={COMMON_MUSCLE_GROUPS.map(group => ({ label: group, value: group }))}
          selected={exerciseData.secondary_muscle_groups}
          onChange={(selected) => setExerciseData({ ...exerciseData, secondary_muscle_groups: selected as MuscleGroup[] })}
          placeholder="Select secondary muscle groups"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <Label>Equipment Type*</Label>
        <MultiSelect
          options={COMMON_EQUIPMENT.map(equip => ({ label: equip, value: equip }))}
          selected={exerciseData.equipment_type}
          onChange={(selected) => setExerciseData({ ...exerciseData, equipment_type: selected as EquipmentType[] })}
          placeholder="Select equipment types"
          className={errors.equipment_type ? 'border-red-500' : ''}
        />
        {errors.equipment_type && <p className="text-red-500 text-sm mt-1">{errors.equipment_type}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Difficulty Level</Label>
          <Select
            value={exerciseData.difficulty}
            onValueChange={(value) => setExerciseData({ ...exerciseData, difficulty: value as Difficulty })}
          >
            <SelectTrigger>
              <SelectValue />
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
          <Label>Movement Pattern</Label>
          <Select
            value={exerciseData.movement_pattern}
            onValueChange={(value) => setExerciseData({ ...exerciseData, movement_pattern: value as MovementPattern })}
          >
            <SelectTrigger>
              <SelectValue />
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
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_compound"
          checked={exerciseData.is_compound}
          onCheckedChange={(checked) => setExerciseData({ ...exerciseData, is_compound: checked as boolean })}
        />
        <Label htmlFor="is_compound">This is a compound exercise</Label>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <Label>Exercise Instructions</Label>
        <Textarea
          placeholder="Step-by-step instructions..."
          value={exerciseData.instructions.steps}
          onChange={(e) => setExerciseData({
            ...exerciseData,
            instructions: { ...exerciseData.instructions, steps: e.target.value }
          })}
          className="min-h-[100px]"
        />
      </div>

      <div>
        <Label>Form Cues</Label>
        <Textarea
          placeholder="Form cues and tips..."
          value={exerciseData.instructions.form}
          onChange={(e) => setExerciseData({
            ...exerciseData,
            instructions: { ...exerciseData.instructions, form: e.target.value }
          })}
          className="min-h-[80px]"
        />
      </div>

      <div className="bg-gray-800/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Exercise Summary</h4>
        <div className="space-y-1 text-sm text-gray-300">
          <p><span className="font-medium">Name:</span> {exerciseData.name}</p>
          <p><span className="font-medium">Primary Muscles:</span> {exerciseData.primary_muscle_groups.join(', ')}</p>
          <p><span className="font-medium">Equipment:</span> {exerciseData.equipment_type.join(', ')}</p>
          <p><span className="font-medium">Difficulty:</span> {exerciseData.difficulty}</p>
        </div>
      </div>
    </div>
  );

  const stepTitles = ['Basic Information', 'Exercise Details', 'Instructions & Review'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Add New Exercise</span>
            <span className="text-sm text-gray-400">({currentStep}/3)</span>
          </DialogTitle>
          <p className="text-sm text-gray-400">{stepTitles[currentStep - 1]}</p>
        </DialogHeader>

        <div className="flex justify-between mb-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step < currentStep ? 'bg-green-600 text-white' : 
                    step === currentStep ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'}`}
              >
                {step < currentStep ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 3 && (
                <div className={`flex-1 h-0.5 mx-2 ${step < currentStep ? 'bg-green-600' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="min-h-[300px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? () => onOpenChange(false) : handlePrevious}
            >
              {currentStep === 1 ? 'Cancel' : (
                <>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </>
              )}
            </Button>
            
            <Button
              onClick={currentStep === 3 ? handleSubmit : handleNext}
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  Saving...
                </div>
              ) : currentStep === 3 ? 'Create Exercise' : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
