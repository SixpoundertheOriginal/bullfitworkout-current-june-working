
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/profile/SectionHeader";
import { Separator } from "@/components/ui/separator";

interface Workout {
  id: string;
  name: string;
  start_time: string;
  duration: number;
  training_type: string;
  exerciseSets?: Array<{
    exercise_name: string;
    id: string;
  }>;
}

interface RecentWorkoutsSectionProps {
  workouts: Workout[];
}

export function RecentWorkoutsSection({ workouts }: RecentWorkoutsSectionProps) {
  // Format time (seconds) to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get unique exercise count for a workout
  const getExerciseCount = (workout: Workout) => {
    if (!workout.exerciseSets) return 0;
    const uniqueExercises = new Set(workout.exerciseSets.map(set => set.exercise_name));
    return uniqueExercises.size;
  };

  // Show only the 5 most recent workouts
  const recentWorkouts = workouts.slice(0, 5);

  return (
    <Card className="bg-gray-900 border-gray-800 p-6">
      <SectionHeader title="Recent Workouts" navigateTo="/workouts" />
      
      {recentWorkouts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No workouts yet</p>
          <Link 
            to="/training" 
            className="text-purple-400 hover:text-purple-300 mt-2 inline-block"
          >
            Start your first workout
          </Link>
        </div>
      ) : (
        <div className="space-y-1 mt-4">
          {recentWorkouts.map((workout, index) => (
            <React.Fragment key={workout.id}>
              <Link 
                to={`/workout/${workout.id}`}
                className="flex items-center justify-between p-3 rounded hover:bg-gray-800 transition-colors group"
                aria-label={`View workout details for ${workout.name}`}
              >
                <div>
                  <div className="font-medium text-white group-hover:text-purple-300 transition-colors">
                    {workout.name || 'Unnamed Workout'}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{new Date(workout.start_time).toLocaleDateString()}</span>
                    {workout.training_type && (
                      <span className="px-2 py-0.5 bg-gray-800 rounded-full text-xs">
                        {workout.training_type}
                      </span>
                    )}
                    {getExerciseCount(workout) > 0 && (
                      <span className="text-gray-500">
                        {getExerciseCount(workout)} exercise{getExerciseCount(workout) !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-300">
                    {formatTime(workout.duration)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-300 transition-colors" />
                </div>
              </Link>
              {index < recentWorkouts.length - 1 && <Separator className="bg-gray-800" />}
            </React.Fragment>
          ))}
        </div>
      )}
    </Card>
  );
}
