
import { z } from 'zod';

// Schema for the 'instructions' JSON object, ensuring it has the correct shape.
const InstructionsSchema = z.object({
  steps: z.string(),
  form: z.string(),
});

// Zod schema for the Exercise, aligning with the Supabase table and application needs.
// This schema will validate data at runtime, preventing type-related errors.
export const ExerciseSchema = z.object({
  id: z.string(), // Can be UUID from Supabase or string from local data
  name: z.string().min(1, "Exercise name cannot be empty."),
  description: z.string(),
  primary_muscle_groups: z.array(z.string()),
  secondary_muscle_groups: z.array(z.string()),
  equipment_type: z.array(z.string()),
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
          // Attempt to parse if it's a string
          return JSON.parse(val);
        } catch (e) {
          console.error("Failed to parse instructions JSON:", e);
          return null; // On failure, return null to trigger validation error
        }
      }
      return val; // If already an object, pass it through
    },
    InstructionsSchema.nullable()
  ),
  user_id: z.string().uuid().optional().nullable(),
  created_at: z.string().optional().nullable(),
  tips: z.array(z.string()).optional().nullable(),
  variations: z.array(z.string()).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  load_factor: z.number().optional().nullable(),
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
    metadata: true
}).extend({
    // Add more specific validations for creation
    name: z.string().min(1, "Exercise name cannot be empty."),
    primary_muscle_groups: z.array(z.string()).min(1, "At least one primary muscle group is required."),
    instructions: InstructionsSchema,
});
