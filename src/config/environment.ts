
import { z } from 'zod'

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  VITE_SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  VITE_APP_VERSION: z.string().optional(),
});

const env = envSchema.parse(import.meta.env);

export const supabaseConfig = {
  url: env.VITE_SUPABASE_URL || 'https://oglcdlzomfuoyeqeobal.supabase.co',
  anonKey: env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nbGNkbHpvbWZ1b3llcWVvYmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NTI4MzIsImV4cCI6MjA1ODMyODgzMn0.wqi138Ap4i8p17wBcVa2hPwhlpqjXPC8nzCa8lSQEkI',
  serviceRoleKey: env.VITE_SUPABASE_SERVICE_ROLE_KEY,
};

export const appConfig = {
  environment: import.meta.env.MODE as 'development' | 'production' | 'test',
  version: env.VITE_APP_VERSION ?? '0.0.0',
};
