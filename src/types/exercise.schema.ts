import { z } from 'zod';

// Consistent schema for the 'instructions' JSON object.
const InstructionsSchema = z.object({
  steps: z.string().default(''),
  form: z.string().default(''),
});

// A schema to safely parse the 'instructions' field from Supabase, which could be
// a JSON string or already an object.
const SupabaseInstructionsSchema = z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        try {
          const parsed = JSON.parse(val);
          return parsed ?? { steps: '', form: '' };
        } catch (e) {
          console.error("Failed to parse instructions JSON:", e);
          return { steps: '', form: '' };
        }
      }
      return val ?? { steps: '', form: '' };
    },
    InstructionsSchema
);

// Schema representing the raw data structure directly from the 'exercises' table in Supabase.
// This schema is forgiving and mirrors the database's actual structure, including legacy field names.
export const SupabaseExerciseSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    primary_muscle_groups: z.array(z.string()).nullable(),
    secondary_muscle_groups: z.array(z.string()).nullable(),
    equipment_type: z.array(z.string()).nullable(),
    difficulty: z.string().nullable(),
    movement_pattern: z.string().nullable(),
    is_compound: z.boolean().nullable(),
    instructions: SupabaseInstructionsSchema,
    created_by: z.string().uuid().nullable(), // This is the user_id from the 'users' table.
    created_at: z.string(), // The raw timestamp string from the DB.
    tips: z.array(z.string()).nullable(),
    variations: z.array(z.string()).nullable(),
    metadata: z.record(z.any()).nullable(),
    // --- New Additive Fields ---
    family_id: z.string().uuid().nullable().optional(),
    parent_exercise_id: z.string().uuid().nullable().optional(),
    variation_parameters: z.any().nullable().optional(), // JSONB from DB
}).passthrough(); // Use passthrough to allow other fields from DB without failing validation.

export type SupabaseExercise = z.infer<typeof SupabaseExerciseSchema>;

// The canonical, strict Exercise schema used throughout the BullFit application.
// Updated to make new fields nullable to support existing exercises without these values.
export const ExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  primary_muscle_groups: z.array(z.string()),
  secondary_muscle_groups: z.array(z.string()),
  equipment_type: z.array(z.string()),
  difficulty: z.string(),
  movement_pattern: z.string(),
  is_compound: z.boolean(),
  is_bodyweight: z.boolean(),
  instructions: InstructionsSchema,
  user_id: z.string().uuid().nullable(),
  created_at: z.string().datetime().nullable(),
  tips: z.array(z.string()),
  variations: z.array(z.string()),
  metadata: z.record(z.any()),
  load_factor: z.number().nullable(),
  // --- New Additive Fields (Made Nullable for Compatibility) ---
  family_id: z.string().uuid().nullable(),
  parent_exercise_id: z.string().uuid().nullable(),
  variation_parameters: z.record(z.any()).nullable(),
});

// Transformation function to map raw Supabase data to our clean application model.
// This is the core of the Anti-Corruption Layer.
export function transformSupabaseExerciseToAppExercise(supabaseExercise: SupabaseExercise): z.input<typeof ExerciseSchema> {
    const isBodyweight = supabaseExercise.equipment_type?.includes('bodyweight') ?? false;
    
    // Safely attempt to parse created_at, defaulting to null if format is invalid.
    const createdAtResult = z.string().datetime().nullable().safeParse(supabaseExercise.created_at);

    return {
        id: supabaseExercise.id,
        name: supabaseExercise.name,
        description: supabaseExercise.description ?? '',
        primary_muscle_groups: supabaseExercise.primary_muscle_groups ?? [],
        secondary_muscle_groups: supabaseExercise.secondary_muscle_groups ?? [],
        equipment_type: supabaseExercise.equipment_type ?? [],
        difficulty: supabaseExercise.difficulty ?? 'beginner',
        movement_pattern: supabaseExercise.movement_pattern ?? 'custom',
        is_compound: supabaseExercise.is_compound ?? false,
        is_bodyweight: isBodyweight,
        instructions: supabaseExercise.instructions ?? { steps: '', form: '' },
        user_id: supabaseExercise.created_by, // Directly maps created_by to user_id
        created_at: createdAtResult.success ? createdAtResult.data : null,
        tips: supabaseExercise.tips ?? [],
        variations: supabaseExercise.variations ?? [],
        metadata: supabaseExercise.metadata ?? {},
        // Extract load_factor from metadata if it exists, otherwise default.
        load_factor: (supabaseExercise.metadata as any)?.load_factor ?? 1.0,
        // --- New Additive Fields (Handle null values gracefully) ---
        family_id: supabaseExercise.family_id ?? null,
        parent_exercise_id: supabaseExercise.parent_exercise_id ?? null,
        variation_parameters: supabaseExercise.variation_parameters ?? null,
    };
}

// This schema defines the shape for creating a new exercise. It's derived from the
// strict ExerciseSchema, ensuring new exercises conform to our application model.
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
    // --- New Additive Fields (Made Optional for Input) ---
    family_id: z.string().uuid().nullable().optional(),
    parent_exercise_id: z.string().uuid().nullable().optional(),
    variation_parameters: z.record(z.any()).nullable().optional(),
});
