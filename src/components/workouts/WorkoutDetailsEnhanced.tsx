
import React from 'react';
import { ExerciseSet } from '@/types/exercise';
import { EnhancedMetricsDisplay } from '../metrics/EnhancedMetricsDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, 
  Calendar, 
  Dumbbell, 
  Tag,
  BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatRelative } from 'date-fns';

interface WorkoutDetailsEnhancedProps {
  workout: {
    id: string;
    name: string;
    training_type: string;
    start_time: string;
    duration: number;
    notes?: string | null;
  };
  exercises: Record<string, ExerciseSet[]>;
  tags?: string[];
  className?: string;
}

export const WorkoutDetailsEnhanced = ({
  workout,
  exercises,
  tags = [],
  className = ''
}: WorkoutDetailsEnhancedProps) => {
  const exerciseCount = Object.keys(exercises).length;
  const setCount = Object.values(exercises).reduce(
    (total, sets) => total + sets.length, 0
  );
  const completedSets = Object.values(exercises).reduce(
    (total, sets) => total + sets.filter(set => set.completed).length, 0
  );
  
  // Calculate efficiency (completed sets / total sets)
  const efficiency = setCount > 0 ? (completedSets / setCount) * 100 : 0;
  
  // Calculate average weight across all sets
  let totalWeight = 0;
  let weightedSetCount = 0;
  let maxWeight = 0;
  
  Object.values(exercises).flat().forEach(set => {
    if (set.completed && set.weight > 0) {
      totalWeight += set.weight;
      weightedSetCount++;
      if (set.weight > maxWeight) maxWeight = set.weight;
    }
  });
  
  const avgWeight = weightedSetCount > 0 ? totalWeight / weightedSetCount : 0;
  
  // Calculate intensity (average weight / max weight)
  const intensity = maxWeight > 0 ? (avgWeight / maxWeight) * 100 : 0;
  
  // Format the workout date
  const workoutDate = new Date(workout.start_time);
  const relativeDate = formatRelative(workoutDate, new Date());
  const formattedDate = workoutDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-2xl font-bold">{workout.name}</h1>
          <div className="flex items-center mt-2 sm:mt-0">
            <Badge variant="outline" className="bg-purple-500/10 border-purple-500/20 text-purple-300">
              {workout.training_type}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/80 border-gray-800 hover:border-purple-500/50 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center mb-1">
                <Calendar className="h-4 w-4 text-purple-400 mr-2" />
                <span className="text-sm text-gray-400">Date</span>
              </div>
              <div className="text-lg font-semibold">{workoutDate.toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">{relativeDate}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/80 border-gray-800 hover:border-purple-500/50 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 text-purple-400 mr-2" />
                <span className="text-sm text-gray-400">Duration</span>
              </div>
              <div className="text-lg font-semibold">{formatTime(workout.duration)}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/80 border-gray-800 hover:border-purple-500/50 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center mb-1">
                <Dumbbell className="h-4 w-4 text-purple-400 mr-2" />
                <span className="text-sm text-gray-400">Exercises</span>
              </div>
              <div className="text-lg font-semibold">{exerciseCount}</div>
              <div className="text-xs text-gray-500">{setCount} sets total</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/80 border-gray-800 hover:border-purple-500/50 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center mb-1">
                <BarChart3 className="h-4 w-4 text-purple-400 mr-2" />
                <span className="text-sm text-gray-400">Efficiency</span>
              </div>
              <div className="text-lg font-semibold">{Math.round(efficiency)}%</div>
              <div className="text-xs text-gray-500">{completedSets} of {setCount} sets</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Show workout tags if available */}
        {tags.length > 0 && (
          <div>
            <div className="flex items-center mb-2">
              <Tag className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-sm text-gray-400">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge 
                  key={tag}
                  variant="outline" 
                  className="bg-gray-800/50 border-gray-700 text-gray-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Show notes if available */}
        {workout.notes && (
          <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-line">{workout.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Enhanced Metrics Display */}
      <EnhancedMetricsDisplay 
        exercises={exercises}
        intensity={intensity}
        efficiency={efficiency}
      />
      
      {/* Exercise Details Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Exercise Details</h2>
        <div className="space-y-4">
          {Object.entries(exercises).map(([exerciseName, sets]) => (
            <Card key={exerciseName} className="bg-gray-900/80 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle>{exerciseName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left pb-2 text-gray-400">Set</th>
                        <th className="text-left pb-2 text-gray-400">Weight</th>
                        <th className="text-left pb-2 text-gray-400">Reps</th>
                        <th className="text-right pb-2 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sets.map((set, index) => (
                        <tr key={index} className={`border-b border-gray-800/50 ${!set.completed ? 'text-gray-500' : ''}`}>
                          <td className="py-2">Set {set.set_number}</td>
                          <td className="py-2">{set.weight}</td>
                          <td className="py-2">{set.reps}</td>
                          <td className="py-2 text-right">
                            {set.completed ? (
                              <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30">
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-800/50 text-gray-400">
                                Skipped
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
