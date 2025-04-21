
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
  UserIcon,
  Loader2,
  BarChart3,
  TrendingUp,
  Calendar,
  Dumbbell,
  ActivitySquare,
  FlaskConical,
  Brain,
  Notebook,
  ArrowRight
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
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";

// Feature card component for the knowledge section
const FeatureCard = ({ icon, title, description, onClick }) => (
  <Card 
    className="relative overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-gray-800/80 to-gray-900/90 border border-gray-700/50 hover:border-purple-500/30"
    onClick={onClick}
  >
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-600/5 rounded-bl-full transform translate-x-5 -translate-y-5 group-hover:translate-x-0 group-hover:-translate-y-0 transition-all duration-300"></div>
    <CardContent className="p-5">
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-3 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <div className="flex justify-end mt-3">
        <span className="text-purple-400 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          Explore <ArrowRight size={14} />
        </span>
      </div>
    </CardContent>
  </Card>
);

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workoutSessions, setWorkoutSessions] = useState<any[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const { stats } = useWorkoutStats(7);
  
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

  const navigateTo = (path: string) => {
    navigate(path);
  };

  // Get today's recommended workout type if available
  const recommendedWorkoutType = stats?.recommendedType || "Strength";
  const recommendedDuration = stats?.recommendedDuration || 45;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-900/98 to-gray-900/95">
      <main className="flex-1 overflow-auto px-4 py-6 space-y-6 mt-20 pb-20">
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
          
          <div style={{ height: "10rem" }} className="relative">
            <ExerciseFAB 
              onClick={() => setDialogOpen(true)}
              visible={stableFabVisibility}
              className="!bottom-20"
            />

            {/* Enhanced Start Button */}
            <button 
              onClick={() => setDialogOpen(true)}
              className={`
                transition-all duration-300 ease-out
                flex flex-col items-center justify-center
                bg-gradient-to-r from-purple-600 to-pink-500
                shadow-xl hover:shadow-purple-500/30
                rounded-full border border-purple-500/30
                absolute left-1/2 top-0
                transform -translate-x-1/2
                ${isSectionVisible 
                  ? 'opacity-100 pointer-events-auto scale-100' 
                  : 'opacity-0 pointer-events-none scale-75'
                }
                h-36 w-36
                hover:scale-110 active:scale-95
                animate-fade-in hover:from-purple-500 hover:to-pink-400
                group
              `}
            >
              <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-16 h-16 rounded-full bg-purple-500/30 animate-ping"></div>
              </div>
              <Zap size={32} className="mb-1 text-white animate-pulse" />
              <span className="text-2xl font-bold text-white">Start</span>
              <span className="text-xs text-white/80 mt-1">
                {`${recommendedWorkoutType} · ${recommendedDuration} min`}
              </span>
            </button>
          </div>
        </section>

        {/* Knowledge Hub Section */}
        <section className="animate-fade-in mb-8" style={{ animationDelay: '400ms' }}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Brain className="text-purple-400" size={20} />
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Fitness Knowledge Hub
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard
              icon={<Dumbbell size={24} className="text-purple-400" />}
              title="Exercise Library"
              description="Browse detailed guides for 500+ exercises with proper form and technique"
              onClick={() => navigateTo('/exercises')}
            />
            <FeatureCard
              icon={<Notebook size={24} className="text-blue-400" />}
              title="Workout Templates"
              description="Pre-built routines for every fitness goal and experience level"
              onClick={() => navigateTo('/templates')}
            />
            <FeatureCard
              icon={<ActivitySquare size={24} className="text-green-400" />}
              title="Progress Insights"
              description="Visualize your gains and identify opportunities for improvement"
              onClick={() => navigateTo('/insights')}
            />
            <FeatureCard
              icon={<FlaskConical size={24} className="text-orange-400" />}
              title="Nutrition Science"
              description="Learn how to fuel your workouts and maximize recovery"
              onClick={() => navigateTo('/nutrition')}
            />
          </div>
        </section>

        <section className="animate-fade-in" style={{ animationDelay: '500ms' }}>
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

          {showWorkouts && (
            <WorkoutHistory limit={5} className="mt-2" />
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
