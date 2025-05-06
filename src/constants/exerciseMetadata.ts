
/**
 * Exercise metadata constants - canonical source for all exercise metadata types and values
 * This file centralizes all muscle groups, equipment types, and related exercise metadata
 */

export type MuscleGroup = 
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps' 
  | 'forearms' | 'quadriceps' | 'hamstrings' | 'glutes' 
  | 'calves' | 'abs' | 'lowerBack' | 'traps' | 'core' | 'fullBody';

export type EquipmentType = 
  | 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'cable' 
  | 'smith' | 'bodyweight' | 'bands' | 'suspension' | 'cardio' | 'other';

export type MovementPattern = 
  | 'push' | 'pull' | 'hinge' | 'squat' | 'lunge' | 'rotation' 
  | 'carry' | 'isometric' | 'plyometric' | 'compound' | 'isolation';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type LoadingType = 'barbell' | 'dumbbell' | 'kettlebell' | 'machine' | 'bodyweight' | 'assisted' | 'mixed';

export type VariantCategory = 
  | 'standard' | 'regression' | 'progression' | 'variation' | 'alternative' | 'modification';

// Type guard functions for runtime type checking
export const isMuscleGroup = (value: any): value is MuscleGroup => {
  return MUSCLE_GROUPS.includes(value as MuscleGroup);
};

export const isEquipmentType = (value: any): value is EquipmentType => {
  return EQUIPMENT_TYPES.includes(value as EquipmentType);
};

export const isMovementPattern = (value: any): value is MovementPattern => {
  return MOVEMENT_PATTERNS.includes(value as MovementPattern);
};

export const isDifficulty = (value: any): value is Difficulty => {
  return DIFFICULTY_LEVELS.includes(value as Difficulty);
};

export const isLoadingType = (value: any): value is LoadingType => {
  return LOADING_TYPES.includes(value as LoadingType);
};

export const isVariantCategory = (value: any): value is VariantCategory => {
  return VARIANT_CATEGORIES.includes(value as VariantCategory);
};

// All muscle groups with display names and metadata
export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 
  'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'lowerBack', 
  'traps', 'core', 'fullBody'
];

// Common subset of muscle groups for filters and quick selections
export const COMMON_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 
  'quadriceps', 'hamstrings', 'glutes', 'abs', 'core'
];

// All equipment types
export const EQUIPMENT_TYPES: EquipmentType[] = [
  'barbell', 'dumbbell', 'kettlebell', 'machine', 'cable',
  'smith', 'bodyweight', 'bands', 'suspension', 'cardio', 'other'
];

// Common subset of equipment for filters and quick selections
export const COMMON_EQUIPMENT: EquipmentType[] = [
  'barbell', 'dumbbell', 'machine', 'bodyweight', 'cable'
];

// All movement patterns
export const MOVEMENT_PATTERNS: MovementPattern[] = [
  'push', 'pull', 'hinge', 'squat', 'lunge', 'rotation',
  'carry', 'isometric', 'plyometric', 'compound', 'isolation'
];

// All difficulty levels
export const DIFFICULTY_LEVELS: Difficulty[] = [
  'beginner', 'intermediate', 'advanced', 'expert'
];

// All loading types
export const LOADING_TYPES: LoadingType[] = [
  'barbell', 'dumbbell', 'kettlebell', 'machine', 'bodyweight', 'assisted', 'mixed'
];

// All variant categories
export const VARIANT_CATEGORIES: VariantCategory[] = [
  'standard', 'regression', 'progression', 'variation', 'alternative', 'modification'
];

// UI-friendly display names for dropdown options
export const muscleGroupOptions = MUSCLE_GROUPS.map(group => ({
  value: group,
  label: formatDisplayName(group)
}));

export const equipmentOptions = EQUIPMENT_TYPES.map(type => ({
  value: type,
  label: formatDisplayName(type)
}));

export const movementPatternOptions = MOVEMENT_PATTERNS.map(pattern => ({
  value: pattern,
  label: formatDisplayName(pattern)
}));

export const difficultyLevelOptions = DIFFICULTY_LEVELS.map(level => ({
  value: level,
  label: formatDisplayName(level)
}));

/**
 * Helper function to format values for display
 * Converts camelCase or snake_case to Title Case
 */
export function formatDisplayName(value: string): string {
  // Handle special cases
  if (value === 'abs') return 'Abs';
  if (value === 'lowerBack') return 'Lower Back';
  
  // Convert camelCase to space-separated
  const spaceSeparated = value
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to space-separated
    .replace(/_/g, ' '); // snake_case to space-separated
  
  // Capitalize first letter of each word
  return spaceSeparated
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Safe array casting functions that protect against undefined/null values
 */
export function ensureMuscleGroupArray(value: MuscleGroup[] | MuscleGroup | string[] | string | undefined | null): MuscleGroup[] {
  if (!value) return [];
  
  // If it's a string, try to parse it as JSON if it looks like an array
  if (typeof value === 'string') {
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) 
          ? parsed.filter(item => isMuscleGroup(item))
          : [];
      } catch (e) {
        return isMuscleGroup(value) ? [value] : [];
      }
    }
    return isMuscleGroup(value) ? [value] : [];
  }
  
  // If it's already an array, filter out invalid values
  if (Array.isArray(value)) {
    return value.filter(item => isMuscleGroup(item)) as MuscleGroup[];
  }
  
  // If it's a single valid value
  return isMuscleGroup(value) ? [value] : [];
}

export function ensureEquipmentTypeArray(value: EquipmentType[] | EquipmentType | string[] | string | undefined | null): EquipmentType[] {
  if (!value) return [];
  
  if (typeof value === 'string') {
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) 
          ? parsed.filter(item => isEquipmentType(item))
          : [];
      } catch (e) {
        return isEquipmentType(value) ? [value] : [];
      }
    }
    return isEquipmentType(value) ? [value] : [];
  }
  
  if (Array.isArray(value)) {
    return value.filter(item => isEquipmentType(item)) as EquipmentType[];
  }
  
  return isEquipmentType(value) ? [value] : [];
}

export function ensureMovementPatternArray(value: MovementPattern[] | MovementPattern | string[] | string | undefined | null): MovementPattern[] {
  if (!value) return [];
  
  if (typeof value === 'string') {
    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) 
          ? parsed.filter(item => isMovementPattern(item))
          : [];
      } catch (e) {
        return isMovementPattern(value) ? [value] : [];
      }
    }
    return isMovementPattern(value) ? [value] : [];
  }
  
  if (Array.isArray(value)) {
    return value.filter(item => isMovementPattern(item)) as MovementPattern[];
  }
  
  return isMovementPattern(value) ? [value] : [];
}
