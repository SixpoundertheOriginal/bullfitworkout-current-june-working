
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format, startOfDay, endOfDay } from 'date-fns';

// Calendar API
const fetchWorkoutDatesForMonth = async (userId: string, year: number, month: number): Promise<Record<string, number>> => {
  try {
    console.log('[DataService] Fetching workout dates for month:', { userId, year, month });
    
    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(new Date(year, month));

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('start_time')
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString());

    if (error) {
      console.error('[DataService] Error fetching workout dates:', error);
      throw error;
    }

    const workoutDates: Record<string, number> = {};
    (data || []).forEach(session => {
      const dateStr = format(new Date(session.start_time), 'yyyy-MM-dd');
      workoutDates[dateStr] = (workoutDates[dateStr] || 0) + 1;
    });

    return workoutDates;
  } catch (error) {
    console.error('[DataService] Error fetching workout dates:', error);
    throw error;
  }
};

const fetchWorkoutsForDayWithSets = async (userId: string, date: Date): Promise<{ workouts: any[], setsByWorkout: Record<string, any[]> }> => {
  try {
    console.log('[DataService] Fetching workouts for day:', { userId, date });
    
    const startDate = startOfDay(date);
    const endDate = endOfDay(date);

    const { data: workouts, error: workoutsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: true });

    if (workoutsError) {
      console.error('[DataService] Error fetching workouts for day:', workoutsError);
      throw workoutsError;
    }

    if (!workouts || workouts.length === 0) {
      return { workouts: [], setsByWorkout: {} };
    }

    const workoutIds = workouts.map(w => w.id);
    const { data: sets, error: setsError } = await supabase
      .from('exercise_sets')
      .select('*')
      .in('workout_id', workoutIds);

    if (setsError) {
      console.error('[DataService] Error fetching sets for day:', setsError);
      throw setsError;
    }

    const setsByWorkout: Record<string, any[]> = {};
    (sets || []).forEach(set => {
      if (!setsByWorkout[set.workout_id]) {
        setsByWorkout[set.workout_id] = [];
      }
      setsByWorkout[set.workout_id].push(set);
    });

    return {
      workouts,
      setsByWorkout
    };
  } catch (error) {
    console.error('[DataService] Error fetching workouts for day:', error);
    throw error;
  }
};

export const calendarApi = {
  fetchWorkoutDatesForMonth,
  fetchWorkoutsForDayWithSets
};
