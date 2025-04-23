
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    // Parse request body
    const { workoutId } = await req.json();

    if (!workoutId) {
      return new Response(
        JSON.stringify({ error: 'Workout ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Attempting recovery for workout: ${workoutId}`);

    // Check if the workout exists and belongs to the user
    const { data: workout, error: workoutError } = await supabaseClient
      .from('workout_sessions')
      .select('*')
      .eq('id', workoutId)
      .eq('user_id', user.id)
      .single();

    if (workoutError) {
      console.error("Workout fetch error:", workoutError);
      return new Response(
        JSON.stringify({ error: 'Workout not found or not accessible' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check if there are exercise sets associated with this workout
    const { data: sets, error: setsError } = await supabaseClient
      .from('exercise_sets')
      .select('id')
      .eq('workout_id', workoutId);

    if (setsError) {
      console.error("Exercise sets error:", setsError);
      return new Response(
        JSON.stringify({ error: 'Failed to check exercise sets' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const hasSets = sets && sets.length > 0;

    // If there are no exercise sets, we couldn't recover
    if (!hasSets) {
      console.warn(`No exercise sets found for workout ${workoutId}`);
    }

    // Force a refresh of the workout record
    const { data: updatedWorkout, error: updateError } = await supabaseClient
      .from('workout_sessions')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', workoutId)
      .select();

    if (updateError) {
      console.error("Error updating workout during recovery:", updateError);
      
      if (hasSets) {
        // If we have sets but couldn't update the workout, still consider it recovered
        return new Response(
          JSON.stringify({ 
            success: true, 
            workout: workout,
            message: "Workout recovered with possible metadata issues",
            setCount: sets?.length || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Failed to update workout' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    // Try to manually refresh materialized views
    try {
      // Execute refresh function if it exists
      await supabaseClient.rpc('refresh_workout_analytics', {
        p_workout_id: workoutId
      });
      
      console.log("Successfully refreshed analytics views");
    } catch (refreshError) {
      console.warn("No manual refresh function available or error refreshing:", refreshError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        workout: updatedWorkout?.[0] || workout,
        setCount: sets?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error) {
    console.error("Error in recovery function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
