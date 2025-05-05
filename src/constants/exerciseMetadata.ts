
/**
 * Canonical source for exercise metadata including muscle groups, equipment types,
 * and other standardized exercise data.
 * 
 * This file is the single source of truth for these constants throughout the application.
 */

// Type definitions
export type MuscleGroup = 
  | 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio' | 'full body'
  | 'biceps' | 'triceps' | 'forearms' | 'traps' | 'lats' | 'glutes' | 'hamstrings'
  | 'quads' | 'calves' | 'abs' | 'obliques' | 'lower back';

export type EquipmentType = 
  | 'barbell' | 'dumbbell' | 'kettlebell' | 'cable' | 'machine' | 'bodyweight'
  | 'resistance band' | 'smith machine' | 'box' | 'bench' | 'other';

export type MovementPattern = 
  | 'push' | 'pull' | 'squat' | 'hinge' | 'lunge' | 'rotation' | 'carry' | 'isometric';

export type Difficulty = 
  | 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type LoadingType = 
  | 'bodyweight' | 'barbell' | 'dumbbell' | 'kettlebell' | 'cable'
  | 'machine' | 'resistance band' | 'smithMachine' | 'external';

export type VariantCategory = 
  | 'standard' | 'incline' | 'decline' | 'narrow' | 'wide' 
  | 'assisted' | 'weighted' | 'unilateral' | 'explosive';

// Muscle Groups - Canonical list with proper typing
export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full body',
  'biceps', 'triceps', 'forearms', 'traps', 'lats', 'glutes', 'hamstrings',
  'quads', 'calves', 'abs', 'obliques', 'lower back'
];

// Common subset for UI dropdowns
export const COMMON_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'biceps', 
  'triceps', 'glutes', 'hamstrings', 'quads', 'abs'
];

// Equipment Types - Canonical list with proper typing
export const EQUIPMENT_TYPES: EquipmentType[] = [
  'barbell', 'dumbbell', 'kettlebell', 'cable', 'machine', 'bodyweight',
  'resistance band', 'smith machine', 'box', 'bench', 'other'
];

// Common subset for UI dropdowns
export const COMMON_EQUIPMENT: EquipmentType[] = [
  'barbell', 'dumbbell', 'kettlebell', 'cable', 'machine', 'bodyweight',
  'resistance band'
];

// Movement Patterns - Canonical list with proper typing
export const MOVEMENT_PATTERNS: MovementPattern[] = [
  'push', 'pull', 'squat', 'hinge', 'lunge', 'rotation', 'carry', 'isometric'
];

// Difficulty Levels - Canonical list with proper typing
export const DIFFICULTY_LEVELS: Difficulty[] = [
  'beginner', 'intermediate', 'advanced', 'expert'
];

// Loading Types - Canonical list with proper typing
export const LOADING_TYPES: LoadingType[] = [
  'bodyweight', 'barbell', 'dumbbell', 'kettlebell', 'cable',
  'machine', 'resistance band', 'smithMachine', 'external'
];

// Variant Categories - Canonical list with proper typing
export const VARIANT_CATEGORIES: VariantCategory[] = [
  'standard', 'incline', 'decline', 'narrow', 'wide', 
  'assisted', 'weighted', 'unilateral', 'explosive'
];

/**
 * Helper for MultiSelect components - converts array to options format
 */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Converts muscle groups to MultiSelect options format
 */
export const getMuscleGroupOptions = (): SelectOption[] => {
  return MUSCLE_GROUPS.map(group => ({
    label: formatDisplayName(group),
    value: group
  }));
};

/**
 * Converts equipment types to MultiSelect options format
 */
export const getEquipmentOptions = (): SelectOption[] => {
  return EQUIPMENT_TYPES.map(equipment => ({
    label: formatDisplayName(equipment),
    value: equipment
  }));
};

/**
 * Converts movement patterns to MultiSelect options format
 */
export const getMovementPatternOptions = (): SelectOption[] => {
  return MOVEMENT_PATTERNS.map(pattern => ({
    label: formatDisplayName(pattern),
    value: pattern
  }));
};

/**
 * Converts difficulty levels to MultiSelect options format
 */
export const getDifficultyOptions = (): SelectOption[] => {
  return DIFFICULTY_LEVELS.map(level => ({
    label: formatDisplayName(level),
    value: level
  }));
};

/**
 * Formats a value for display by capitalizing the first letter of each word
 */
export const formatDisplayName = (value: string): string => {
  return value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Type guards for validating data
 */
export const isMuscleGroup = (value: string): value is MuscleGroup => {
  return MUSCLE_GROUPS.includes(value as MuscleGroup);
};

export const isEquipmentType = (value: string): value is EquipmentType => {
  return EQUIPMENT_TYPES.includes(value as EquipmentType);
};

export const isMovementPattern = (value: string): value is MovementPattern => {
  return MOVEMENT_PATTERNS.includes(value as MovementPattern);
};

export const isDifficulty = (value: string): value is Difficulty => {
  return DIFFICULTY_LEVELS.includes(value as Difficulty);
};

/**
 * Ensures an array of values conforms to a canonical type
 * Removes any invalid values
 */
export const sanitizeMuscleGroups = (values: string[]): MuscleGroup[] => {
  return values.filter(isMuscleGroup);
};

export const sanitizeEquipmentTypes = (values: string[]): EquipmentType[] => {
  return values.filter(isEquipmentType);
};
