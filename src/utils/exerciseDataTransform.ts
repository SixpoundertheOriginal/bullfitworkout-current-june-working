
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';

/**
 * Enterprise-grade utility for ensuring type safety in exercise data transformations
 * Bulletproof conversion between form data and database schema
 */

// Core utility function to ensure array format
const ensureArray = <T>(value: T | T[] | null | undefined): T[] => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

// Core utility function to ensure string format
const ensureString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

// Core utility function to ensure number format
const ensureNumber = (value: any): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Transform form data to database-safe format
 * Ensures all array fields are properly formatted for Supabase
 */
const toDatabase = (formData: any) => {
  // Defensive programming - handle null/undefined input
  if (!formData || typeof formData !== 'object') {
    throw new Error('Invalid form data provided');
  }

  return {
    ...formData,
    // Core required fields with type safety
    name: ensureString(formData.name),
    description: ensureString(formData.description || ''),
    
    // Array fields - the source of crashes, now bulletproof
    primary_muscle_groups: ensureArray(formData.primary_muscle_groups) as MuscleGroup[],
    secondary_muscle_groups: ensureArray(formData.secondary_muscle_groups) as MuscleGroup[],
    equipment_type: ensureArray(formData.equipment_type) as EquipmentType[],
    tips: ensureArray(formData.tips),
    variations: ensureArray(formData.variations),
    
    // Enum fields with validation
    movement_pattern: formData.movement_pattern || 'push' as MovementPattern,
    difficulty: formData.difficulty || 'beginner' as Difficulty,
    
    // Boolean fields with defaults
    is_compound: Boolean(formData.is_compound),
    is_bodyweight: Boolean(formData.is_bodyweight),
    
    // Numeric fields with validation
    estimated_load_percent: formData.estimated_load_percent ? ensureNumber(formData.estimated_load_percent) : undefined,
    energy_cost_factor: formData.energy_cost_factor ? ensureNumber(formData.energy_cost_factor) : 1,
    
    // Object fields with defaults
    instructions: formData.instructions && typeof formData.instructions === 'object' 
      ? formData.instructions 
      : { steps: '', form: '' },
    metadata: formData.metadata && typeof formData.metadata === 'object' 
      ? formData.metadata 
      : {},
    
    // Optional enum fields
    loading_type: formData.loading_type || undefined,
    variant_category: formData.variant_category || undefined,
    
    // User identification
    user_id: ensureString(formData.user_id)
  };
};

/**
 * Transform database data to application-safe format
 * Ensures consistent data structure for UI components
 */
const fromDatabase = (dbData: any) => {
  if (!dbData || typeof dbData !== 'object') {
    return null;
  }

  return {
    ...dbData,
    // Ensure arrays are always arrays, never null/undefined
    primary_muscle_groups: ensureArray(dbData.primary_muscle_groups),
    secondary_muscle_groups: ensureArray(dbData.secondary_muscle_groups),
    equipment_type: ensureArray(dbData.equipment_type),
    tips: ensureArray(dbData.tips),
    variations: ensureArray(dbData.variations),
    
    // Ensure strings are always strings
    name: ensureString(dbData.name),
    description: ensureString(dbData.description),
    
    // Ensure objects have default structure
    instructions: dbData.instructions || { steps: '', form: '' },
    metadata: dbData.metadata || {},
    
    // Ensure booleans
    is_compound: Boolean(dbData.is_compound),
    is_bodyweight: Boolean(dbData.is_bodyweight),
    
    // Ensure numeric fields
    energy_cost_factor: dbData.energy_cost_factor ? ensureNumber(dbData.energy_cost_factor) : 1
  };
};

/**
 * Validate exercise data before transformation
 * Prevents invalid data from reaching the database
 */
const validateExerciseData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data) {
    errors.push('Exercise data is required');
    return { isValid: false, errors };
  }
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Exercise name is required');
  }
  
  const primaryMuscles = ensureArray(data.primary_muscle_groups);
  if (primaryMuscles.length === 0) {
    errors.push('At least one primary muscle group is required');
  }
  
  const equipmentTypes = ensureArray(data.equipment_type);
  if (equipmentTypes.length === 0) {
    errors.push('At least one equipment type is required');
  }
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Main export - enterprise exercise data transformer
 * Usage: exerciseDataTransform.toDatabase(formData)
 */
export const exerciseDataTransform = {
  toDatabase,
  fromDatabase,
  validateExerciseData,
  // Utility functions for reuse
  ensureArray,
  ensureString,
  ensureNumber
};

export default exerciseDataTransform;
