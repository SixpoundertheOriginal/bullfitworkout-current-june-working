import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  VITE_APP_VERSION: z.string().optional(),
});

const env = envSchema.parse(import.meta.env);

export const supabaseConfig = {
  url: env.VITE_SUPABASE_URL,
  anonKey: env.VITE_SUPABASE_ANON_KEY,
  serviceRoleKey: env.VITE_SUPABASE_SERVICE_ROLE_KEY,
};

export const appConfig = {
  environment: import.meta.env.MODE as 'development' | 'production' | 'test',
  version: env.VITE_APP_VERSION ?? '0.0.0',
};
