
import { z } from 'zod';

// Schema for the 'instructions' JSON object, ensuring it has the correct shape.
const InstructionsSchema = z.object({
  steps: z.string().default(''),
  form: z.string().default(''),
});

// Zod schema for the Exercise, aligning with the Supabase table and application needs.
// This schema is now stricter, using defaults and nullables to ensure a consistent object shape.
export const ExerciseSchema = z.object({
  id: z.string(), // Can be UUID from Supabase or string from local data
  name: z.string().min(1, "Exercise name cannot be empty."),
  description: z.string().default(''),
  primary_muscle_groups: z.preprocess((val) => val ?? [], z.array(z.string())),
  secondary_muscle_groups: z.preprocess((val) => val ?? [], z.array(z.string())),
  equipment_type: z.preprocess((val) => val ?? [], z.array(z.string())),
  difficulty: z.string(),
  movement_pattern: z.string(),
  is_compound: z.boolean(),
  is_bodyweight: z.boolean().default(false),
  // This `preprocess` step safely parses the 'instructions' field from Supabase,
  // which might be a JSON string or an object, into the structure our app expects.
  instructions: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        try {
          // Attempt to parse if it's a string, providing a default on failure or null.
          const parsed = JSON.parse(val);
          return parsed ?? { steps: '', form: '' };
        } catch (e) {
          console.error("Failed to parse instructions JSON:", e);
          return { steps: '', form: '' }; // On failure, return default to maintain shape
        }
      }
      return val ?? { steps: '', form: '' }; // If not a string, return val or default
    },
    InstructionsSchema
  ),
  user_id: z.string().uuid().nullable(),
  created_at: z.string().nullable(),
  tips: z.preprocess((val) => val ?? [], z.array(z.string())),
  variations: z.preprocess((val) => val ?? [], z.array(z.string())),
  metadata: z.preprocess((val) => val ?? {}, z.record(z.any())),
  load_factor: z.number().nullable().default(1.0),
});

// This schema defines the shape of data required to create a new exercise.
// It is derived from the base schema, omitting auto-generated fields and making
// essential fields required.
export const ExerciseInputSchema = ExerciseSchema.pick({
    name: true,
    description: true,
    primary_muscle_groups: true,
    secondary_muscle_groups: true,
    equipment_type: true,
    difficulty: true,
    movement_pattern: true,
    is_compound: true,
    is_bodyweight: true,
    instructions: true,
    tips: true,
    variations: true,
    metadata: true,
    load_factor: true,
}).extend({
    // Add more specific validations for creation
    name: z.string().min(1, "Exercise name cannot be empty."),
    primary_muscle_groups: z.array(z.string()).min(1, "At least one primary muscle group is required."),
    instructions: InstructionsSchema,
});
