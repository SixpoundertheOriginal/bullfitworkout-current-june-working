
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

interface WorkoutCalendarProps {
  className?: string;
}

type WorkoutDates = {
  [date: string]: { count: number; ids: string[] };
};

export const WorkoutCalendar = ({ className = "" }: WorkoutCalendarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [workoutDates, setWorkoutDates] = React.useState<WorkoutDates>({});
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchWorkoutDates = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('workout_sessions')
          .select('id, start_time')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false });
          
        if (error) throw error;
        
        // Group workouts by date
        const dateMap: WorkoutDates = {};
        
        data?.forEach(workout => {
          const dateString = new Date(workout.start_time).toISOString().split('T')[0];
          
          if (!dateMap[dateString]) {
            dateMap[dateString] = { count: 0, ids: [] };
          }
          
          dateMap[dateString].count++;
          dateMap[dateString].ids.push(workout.id);
        });
        
        setWorkoutDates(dateMap);
      } catch (error) {
        console.error('Error fetching workout dates:', error);
        toast.error('Failed to load workout calendar');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkoutDates();
  }, [user]);
  
  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    
    const dateString = date.toISOString().split('T')[0];
    const workouts = workoutDates[dateString];
    
    if (workouts && workouts.count > 0) {
      // If there's only one workout for this date, navigate directly to it
      if (workouts.count === 1) {
        navigate(`/workout-details/${workouts.ids[0]}`);
      } else {
        // Navigate to the general workout details page with a date filter (to be implemented)
        navigate('/workout-details?date=' + dateString);
      }
    }
  };
  
  // Function to customize day rendering
  const dayClassName = (date: Date): string => {
    const dateString = date.toISOString().split('T')[0];
    const workouts = workoutDates[dateString];
    
    if (workouts) {
      if (workouts.count >= 3) {
        return 'bg-purple-600 text-white rounded-full hover:bg-purple-700';
      } else if (workouts.count === 2) {
        return 'bg-purple-500/80 text-white rounded-full hover:bg-purple-600';
      } else {
        return 'bg-purple-500/50 text-white rounded-full hover:bg-purple-500';
      }
    }
    
    return '';
  };
  
  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Workout Calendar</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Calendar
          mode="single"
          className="rounded-md border-0"
          classNames={{
            day_selected: 'bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-600',
            day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
            day_today: 'bg-gray-800 text-white'
          }}
          selected={undefined}
          onSelect={handleSelectDate}
          disabled={{ after: new Date() }}
          modifiersClassNames={{
            selected: 'selected',
          }}
          modifiers={{
            workout: Object.keys(workoutDates).map(d => new Date(d)),
          }}
          components={{
            Day: ({ date, ...props }: React.HTMLAttributes<HTMLDivElement> & { date: Date }) => {
              const extraClass = dayClassName(date);
              return (
                <div 
                  {...props}
                  className={`${props.className || ''} ${extraClass}`}
                />
              );
            }
          }}
        />
        
        <div className="flex justify-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500/50"></div>
            <span className="text-xs text-gray-400">1 workout</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500/80"></div>
            <span className="text-xs text-gray-400">2 workouts</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <span className="text-xs text-gray-400">3+ workouts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
