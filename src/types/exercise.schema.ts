
import { z } from 'zod';

// Schema for the 'instructions' JSON object, ensuring it has the correct shape.
const InstructionsSchema = z.object({
  steps: z.string().default(''),
  form: z.string().default(''),
});

// Zod schema for the Exercise, aligning with the Supabase table and application needs.
// This schema is now stricter. Fields are required, matching a complete DB record.
// Nullable/default values are handled by preprocess or at the point of creation.
export const ExerciseSchema = z.object({
  id: z.string().min(1, "ID cannot be empty."), // Allow any non-empty string ID for broader compatibility
  name: z.string().min(1, "Exercise name cannot be empty."),
  description: z.string(),
  primary_muscle_groups: z.array(z.string()),
  secondary_muscle_groups: z.array(z.string()),
  equipment_type: z.array(z.string()),
  difficulty: z.string(),
  movement_pattern: z.string(),
  is_compound: z.boolean(),
  is_bodyweight: z.boolean(),
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
  created_at: z.string().datetime().nullable(),
  tips: z.array(z.string()),
  variations: z.array(z.string()),
  metadata: z.record(z.any()),
  load_factor: z.number().nullable(),
});

// This schema defines the shape of data required to create a new exercise.
// It is derived from the base schema, omitting auto-generated fields and making
// essential fields required, while providing safe defaults for optional ones.
export const ExerciseInputSchema = ExerciseSchema.pick({
    name: true,
    primary_muscle_groups: true,
    difficulty: true,
    movement_pattern: true,
    is_compound: true,
    is_bodyweight: true,
}).extend({
    description: z.string().optional().default(''),
    secondary_muscle_groups: z.array(z.string()).optional().default([]),
    equipment_type: z.array(z.string()).optional().default([]),
    instructions: InstructionsSchema.optional().default({ steps: '', form: '' }),
    tips: z.array(z.string()).optional().default([]),
    variations: z.array(z.string()).optional().default([]),
    metadata: z.record(z.any()).optional().default({}),
    load_factor: z.number().nullable().optional().default(1.0),
});
