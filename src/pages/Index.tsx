import React, { useState, useEffect, useRef } from "react";
import { QuickStatsSection } from "@/components/metrics/QuickStatsSection";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Moon, 
  Plus, 
  X, 
  Zap,
  User as UserIcon,
  Loader2,
  BarChart3
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "@/hooks/use-toast";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useElementVisibility } from "@/hooks/useElementVisibility";
import { WorkoutCard } from "@/components/WorkoutCard";
import { ConfigureTrainingDialog } from "@/components/ConfigureTrainingDialog";
import { MainMenu } from "@/components/navigation/MainMenu";
import { ExerciseFAB } from "@/components/ExerciseFAB";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workoutSessions, setWorkoutSessions] = useState<any[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSectionVisible = useElementVisibility(sectionRef, {
    threshold: 0.5,
    rootMargin: "-100px"
  });
  
  const [stableFabVisibility, setStableFabVisibility] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStableFabVisibility(!isSectionVisible);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isSectionVisible]);

  useEffect(() => {
    if (user) {
      fetchWorkoutSessions();
    }
  }, [user]);

  const fetchWorkoutSessions = async () => {
    try {
      setLoadingWorkouts(true);
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          id,
          name,
          training_type,
          start_time,
          end_time,
          duration,
          exercise_sets (
            exercise_name
          )
        `)
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error("Error fetching workout sessions:", error);
        toast({
          title: "Failed to load workout history",
          description: error.message,
          variant: "destructive"
        });
      } else {
        const workoutsWithExercises = data.map(workout => {
          const exerciseNames = workout.exercise_sets 
            ? [...new Set(workout.exercise_sets.map(set => set.exercise_name))]
            : [];
            
          return {
            ...workout,
            exerciseCount: exerciseNames.length,
            setCount: workout.exercise_sets ? workout.exercise_sets.length : 0,
            tags: [workout.training_type, ...exerciseNames.slice(0, 2)]
          };
        });
        
        setWorkoutSessions(workoutsWithExercises);
      }
    } catch (err) {
      console.error("Error in fetchWorkoutSessions:", err);
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      const { deleteWorkout } = await import("@/services/workoutService");
      await deleteWorkout(workoutId);
      
      toast({
        title: "Workout deleted",
        description: "Workout has been successfully deleted",
      });
      
      setWorkoutSessions(prev => prev.filter(workout => workout.id !== workoutId));
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete the workout",
        variant: "destructive"
      });
    }
  };

  const handleStartTraining = ({ trainingType, tags, duration }) => {
    toast({
      title: "Training started!",
      description: `${trainingType} session for ${duration} minutes`,
    });
    
    navigate('/training-session', { 
      state: { 
        trainingType, 
        tags, 
        duration 
      } 
    });
  };

  const toggleWorkoutDisplay = () => {
    setShowWorkouts(!showWorkouts);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-900/98 to-gray-900/95">
      <main className="flex-1 overflow-auto px-4 py-6 space-y-6 mt-20">
        <div 
          className="rounded-xl p-6 bg-gradient-to-r from-purple-600/30 to-pink-500/30 border border-purple-500/20 
                     shadow-lg backdrop-blur-sm hover:shadow-purple-500/10 transition-all duration-300
                     transform hover:-translate-y-0.5 animate-fade-in"
        >
          <p className="text-xl font-medium bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {workoutSessions.length > 0 
              ? `You've logged ${workoutSessions.length} workout${workoutSessions.length !== 1 ? 's' : ''}! 🔥 Keep it up!`
              : "Start your fitness journey today! 💪"
            }
          </p>
        </div>

        <QuickStatsSection />

        <section ref={sectionRef} className="mb-10 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-2
                         animate-fade-in" style={{ animationDelay: '200ms' }}>
            Start Your Training
          </h2>
          <p className="text-gray-400 mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            Focus today's session and get into flow mode
          </p>
          
          <div style={{ height: "8rem" }} className="relative">
            <ExerciseFAB 
              onClick={() => setDialogOpen(true)}
              visible={stableFabVisibility}
              className="!bottom-20"
            />
            
            <button 
              onClick={() => setDialogOpen(true)}
              className={`
                transition-all duration-300 ease-out
                flex flex-col items-center justify-center
                bg-gradient-to-r from-purple-600 to-pink-500
                shadow-lg hover:shadow-purple-500/25
                rounded-full border border-purple-500/20
                absolute left-1/2 top-0
                transform -translate-x-1/2
                ${isSectionVisible 
                  ? 'opacity-100 pointer-events-auto scale-100' 
                  : 'opacity-0 pointer-events-none scale-75'
                }
                h-32 w-32
                hover:scale-105 active:scale-95
                animate-fade-in hover:from-purple-500 hover:to-pink-400
              `}
            >
              <Zap size={28} className="mb-1 text-white animate-pulse" />
              <span className="text-xl font-semibold text-white">Start</span>
            </button>
          </div>
        </section>

        <section className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-purple-400" size={20} />
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Workout Log
              </h2>
            </div>
            <Button 
              onClick={toggleWorkoutDisplay} 
              variant="outline" 
              className="text-sm bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
            >
              {showWorkouts ? "Hide" : "Show"}
            </Button>
          </div>

          {showWorkouts ? (
            loadingWorkouts ? (
              <div className="text-center py-10">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-500" />
                <p className="text-gray-400">Loading your workout history...</p>
              </div>
            ) : workoutSessions.length > 0 ? (
              <div className="space-y-4 animate-fade-in">
                {workoutSessions.map((workout, index) => (
                  <div
                    key={workout.id}
                    className="animate-enter"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <WorkoutCard 
                      id={workout.id}
                      name={workout.name}
                      type={workout.training_type} 
                      date={workout.start_time}
                      duration={workout.duration}
                      exerciseCount={workout.exerciseCount}
                      setCount={workout.setCount}
                      onEdit={() => navigate(`/workout-details/${workout.id}`)}
                      onDelete={() => handleDeleteWorkout(workout.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 animate-fade-in">
                <p className="text-gray-400 mb-2">No workouts logged yet</p>
                <p className="text-sm text-gray-500">Complete a training session to see it here</p>
              </div>
            )
          ) : (
            <div className="text-center py-10 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 animate-fade-in">
              <p className="text-gray-400 mb-2">Workout log hidden</p>
              <p className="text-sm text-gray-500">Click 'Show' to view your workout history</p>
            </div>
          )}
        </section>
      </main>

      <ConfigureTrainingDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onStartTraining={handleStartTraining} 
      />
    </div>
  );
};

export default Index;
