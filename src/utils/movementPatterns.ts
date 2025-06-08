
import { MovementPattern } from '@/components/exercises/MovementPatternBadge';

/**
 * Analyzes exercise name to determine default movement pattern
 * Uses keyword-based matching for common exercise patterns
 */
export function getDefaultMovementPattern(exerciseName: string): MovementPattern | undefined {
  if (!exerciseName) return undefined;
  
  const name = exerciseName.toLowerCase().trim();
  
  // Push patterns
  if (
    name.includes('press') || 
    name.includes('push') || 
    name.includes('dip') ||
    name.includes('tricep') ||
    name.includes('overhead') ||
    name.includes('shoulder press') ||
    name.includes('bench') ||
    name.includes('incline') ||
    name.includes('decline')
  ) {
    return 'push';
  }
  
  // Pull patterns
  if (
    name.includes('pull') || 
    name.includes('row') || 
    name.includes('chin') ||
    name.includes('lat') ||
    name.includes('curl') ||
    name.includes('pulldown') ||
    name.includes('reverse fly') ||
    name.includes('face pull') ||
    name.includes('upright row')
  ) {
    return 'pull';
  }
  
  // Squat patterns
  if (
    name.includes('squat') || 
    name.includes('lunge') ||
    name.includes('step up') ||
    name.includes('bulgarian') ||
    name.includes('pistol') ||
    name.includes('goblet') ||
    name.includes('front squat') ||
    name.includes('back squat')
  ) {
    return 'squat';
  }
  
  // Hinge patterns
  if (
    name.includes('deadlift') || 
    name.includes('hinge') || 
    name.includes('rdl') ||
    name.includes('romanian') ||
    name.includes('good morning') ||
    name.includes('hip hinge') ||
    name.includes('kettlebell swing') ||
    name.includes('hip thrust') ||
    name.includes('glute bridge')
  ) {
    return 'hinge';
  }
  
  // Core patterns
  if (
    name.includes('plank') || 
    name.includes('crunch') || 
    name.includes('core') ||
    name.includes('ab') ||
    name.includes('sit up') ||
    name.includes('russian twist') ||
    name.includes('mountain climber') ||
    name.includes('leg raise') ||
    name.includes('bicycle') ||
    name.includes('dead bug') ||
    name.includes('bird dog')
  ) {
    return 'core';
  }
  
  // Carry patterns
  if (
    name.includes('carry') || 
    name.includes('walk') ||
    name.includes('farmer') ||
    name.includes('suitcase') ||
    name.includes('overhead carry') ||
    name.includes('waiter walk')
  ) {
    return 'carry';
  }
  
  return undefined; // No pattern detected
}

/**
 * Gets display movement pattern for an exercise
 * Uses exercise's assigned pattern or falls back to name-based detection
 */
export function getExerciseMovementPattern(exercise: {
  name: string;
  movement_pattern?: string;
}): MovementPattern | undefined {
  // First try the assigned pattern (if it's a valid movement pattern)
  const assignedPattern = exercise.movement_pattern?.toLowerCase();
  if (assignedPattern && isValidMovementPattern(assignedPattern)) {
    return assignedPattern as MovementPattern;
  }
  
  // Fall back to name-based detection
  return getDefaultMovementPattern(exercise.name);
}

function isValidMovementPattern(pattern: string): boolean {
  return ['push', 'pull', 'squat', 'hinge', 'core', 'carry'].includes(pattern);
}
