import React, { useState } from "react";
import { WorkoutCalendar } from "./WorkoutCalendar";
import { DailyWorkoutSummary } from "../workouts/DailyWorkoutSummary";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, BarChart3 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntelligentMetricsDisplay } from "../metrics/IntelligentMetricsDisplay";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const WorkoutCalendarTab = () => {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const [selectedDate, setSelectedDate] = useState<string | null>(dateParam);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("summary");
  
  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
    
    // Update URL with the selected date but don't navigate away
    if (date) {
      navigate(`/training?tab=calendar&date=${date}`, { replace: true });
    } else {
      navigate('/training?tab=calendar', { replace: true });
    }
  };

  // Fetch workout sets for the selected date
  const { data: exerciseSets, isLoading: setsLoading } = useQuery({
    queryKey: ['workout-exercise-sets', selectedDate],
    queryFn: async () => {
      if (!selectedDate || !user) return { sets: [], workoutId: null };
      
      // First, get the workout session for the selected date
      const startOfDay = `${selectedDate}T00:00:00`;
      const endOfDay = `${selectedDate}T23:59:59`;
      
      const { data: workouts, error: workoutError } = await supabase
        .from('workout_sessions')
        .select('id, name')
        .eq('user_id', user.id)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: false });
        
      if (workoutError) {
        console.error("Error fetching workouts:", workoutError);
        return { sets: [], workoutId: null };
      }

      if (!workouts || workouts.length === 0) {
        return { sets: [], workoutId: null };
      }
      
      // Get the exercise sets for the first workout
      const workoutId = workouts[0].id;
      
      const { data: sets, error: setsError } = await supabase
        .from('exercise_sets')
        .select('*')
        .eq('workout_id', workoutId)
        .order('exercise_name', { ascending: true })
        .order('set_number', { ascending: true });
        
      if (setsError) {
        console.error("Error fetching exercise sets:", setsError);
        return { sets: [], workoutId };
      }
      
      // Group sets by exercise
      const exerciseMap: Record<string, any[]> = {};
      sets?.forEach(set => {
        if (!exerciseMap[set.exercise_name]) {
          exerciseMap[set.exercise_name] = [];
        }
        exerciseMap[set.exercise_name].push(set);
      });
      
      return { sets: sets || [], exerciseMap, workoutId };
    },
    enabled: !!selectedDate && !!user
  });

  // Calculate metrics for workout
  const workoutMetrics = React.useMemo(() => {
    if (!exerciseSets?.sets?.length) return { intensity: 0, efficiency: 0 };
    
    // Calculate intensity (percent of max weight used)
    const totalWeight = exerciseSets.sets.reduce((sum, set) => {
      // Convert the weight to a number if it's not already
      const weight = typeof set.weight === 'string' ? parseFloat(set.weight) : set.weight;
      return sum + (isNaN(weight) ? 0 : weight);
    }, 0);
    
    const avgWeight = totalWeight / exerciseSets.sets.length;
    
    // Find the max weight among all sets
    const maxWeight = Math.max(...exerciseSets.sets.map(set => {
      const weight = typeof set.weight === 'string' ? parseFloat(set.weight) : set.weight;
      return isNaN(weight) ? 0 : weight;
    }));
    
    const intensity = maxWeight > 0 ? (avgWeight / maxWeight) * 100 : 0;
    
    // Calculate efficiency (completed sets / total sets)
    const completedSets = exerciseSets.sets.filter(set => set.completed).length;
    const efficiency = (completedSets / exerciseSets.sets.length) * 100;
    
    return { intensity, efficiency };
  }, [exerciseSets?.sets]);

  return (
    <div className="mt-4">
      {selectedDate ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <Button 
              variant="ghost" 
              className="flex items-center gap-1 text-gray-400 hover:text-white p-0"
              onClick={() => handleDateSelect(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Calendar
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-900 mb-4">
              <TabsTrigger value="summary" className="data-[state=active]:bg-purple-600">
                <Info className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="metrics" className="data-[state=active]:bg-purple-600">
                <BarChart3 className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <DailyWorkoutSummary 
                date={selectedDate}
                onClose={() => handleDateSelect(null)}
              />
            </TabsContent>
            
            <TabsContent value="metrics">
              {exerciseSets?.sets?.length > 0 ? (
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-purple-400" />
                      Workout Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <IntelligentMetricsDisplay 
                      exercises={exerciseSets.exerciseMap || {}}
                      intensity={workoutMetrics.intensity}
                      efficiency={workoutMetrics.efficiency}
                    />
                    
                    {exerciseSets.workoutId && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/workout-details/${exerciseSets.workoutId}`)}
                        className="w-full mt-4 border-purple-500/20 text-purple-400"
                      >
                        View Full Workout Details
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-md font-medium text-white mb-2">No Performance Data</h3>
                    <p className="text-gray-400 text-sm">
                      There is no detailed exercise data available for this date.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkoutCalendar onDatePreview={handleDateSelect} />
          {/* Preview panel for medium and larger screens */}
          {selectedDate && (
            <div className="hidden md:block">
              <DailyWorkoutSummary 
                date={selectedDate}
                onClose={() => handleDateSelect(null)}
                preview
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
