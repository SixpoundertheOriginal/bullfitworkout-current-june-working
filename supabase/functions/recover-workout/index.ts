
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
        JSON.stringify({ error: "Missing workoutId" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Attempt to trigger the analytics refresh
    try {
      // Call the refresh_workout_analytics function
      const { error } = await supabase.rpc('refresh_workout_analytics');
      
      if (error) {
        console.error("Failed to refresh analytics:", error);
      }
    } catch (refreshError) {
      console.error("Error refreshing analytics:", refreshError);
    }

    // Update the workout to ensure it's visible in history
    // This is a hack that forces a refresh of the workout in the database
    const { data: updatedWorkout, error: updateError } = await supabase
      .from('workout_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', workoutId)
      .select();

    if (updateError) {
      console.error("Error updating workout during recovery:", updateError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to update workout",
          details: updateError.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        workout: updatedWorkout?.[0] || null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in recover-workout function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
