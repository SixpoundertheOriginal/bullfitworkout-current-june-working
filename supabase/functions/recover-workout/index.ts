
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const { workoutId } = await req.json();
    
    if (!workoutId) {
      return new Response(
        JSON.stringify({ error: "Missing workout ID" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Attempting to recover workout: ${workoutId}`);

    // Create Supabase client with service role - needed to bypass RLS for recovery
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. First, check if the workout exists
    const { data: workout, error: workoutError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('id', workoutId)
      .single();
      
    if (workoutError) {
      throw new Error("Workout not found: " + workoutError.message);
    }

    // 2. Check for exercise sets
    const { data: sets, error: setsError } = await supabase
      .from('exercise_sets')
      .select('count')
      .eq('workout_id', workoutId);
      
    if (setsError) {
      console.error("Error checking exercise sets:", setsError);
    }
    
    const setCount = sets && sets.length > 0 ? parseInt(String(sets[0].count), 10) : 0;
    console.log(`Found ${setCount} sets for workout ${workoutId}`);
    
    // 3. Trigger a workout update to ensure it's visible in history
    // This can force a refresh of materialized views and analytics
    const { data: updatedWorkout, error: updateError } = await supabase
      .from('workout_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', workoutId)
      .select();
      
    if (updateError) {
      console.error("Error updating workout during recovery:", updateError);
      throw new Error("Failed to update workout: " + updateError.message);
    }

    // 4. Manually try to refresh analytics for this workout
    try {
      await supabase.rpc('refresh_workout_analytics');
      console.log("Analytics refreshed successfully");
    } catch (refreshError) {
      console.warn("Analytics refresh error (non-critical):", refreshError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        workout: updatedWorkout?.[0] || workout,
        setCount,
        message: "Workout recovery completed successfully"
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in recover-workout function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
