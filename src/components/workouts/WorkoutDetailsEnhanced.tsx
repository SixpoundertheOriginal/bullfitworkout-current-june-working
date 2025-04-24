import React, { useMemo } from 'react';
import { ExerciseSet } from '@/types/exercise';
import { 
  calculateMuscleFocus, 
  analyzeWorkoutComposition 
} from '@/utils/exerciseUtils';
import { MuscleFocusChart } from '../metrics/MuscleFocusChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dumbbell, 
  BarChart3, 
  Percent, 
  Activity,
  Clock,
  Calendar,
  Tag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatRelative } from 'date-fns';
import { WorkoutDensityChart } from '../metrics/WorkoutDensityChart';
import { WeightUnit } from '@/utils/unitConversion';
import { useWeightUnit } from '@/context/WeightUnitContext';

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
  const { weightUnit } = useWeightUnit();
  
  // Calculate efficiency metrics
  const exerciseCount = Object.keys(exercises).length;
  const setCount = Object.values(exercises).reduce(
    (total, sets) => total + sets.length, 0
  );
  const completedSets = Object.values(exercises).reduce(
    (total, sets) => total + sets.filter(set => set.completed).length, 0
  );
  
  // Calculate efficiency (completed sets / total sets)
  const efficiency = setCount > 0 ? (completedSets / setCount) * 100 : 0;
  
  // Calculate workout volume and intensity metrics
  let totalVolume = 0;
  let weightedSetCount = 0;
  let maxWeight = 0;
  let totalRestTime = 0;
  
  Object.values(exercises).flat().forEach(set => {
    if (set.completed && set.weight > 0) {
      totalVolume += set.weight * set.reps;
      weightedSetCount++;
      if (set.weight > maxWeight) maxWeight = set.weight;
    }
    
    // Add rest time calculation
    if (set.restTime) {
      totalRestTime += set.restTime;
    } else {
      totalRestTime += 60; // Default rest time
    }
  });
  
  const avgWeight = weightedSetCount > 0 ? totalVolume / weightedSetCount : 0;
  
  // Calculate intensity (average weight / max weight)
  const intensity = maxWeight > 0 ? (avgWeight / maxWeight) * 100 : 0;
  
  // Calculate workout density (volume per minute)
  const activeWorkoutTime = workout.duration - (totalRestTime / 60);
  const workoutDensity = workout.duration > 0 ? totalVolume / workout.duration : 0;
  const activeWorkoutDensity = activeWorkoutTime > 0 ? totalVolume / activeWorkoutTime : 0;
  
  // Calculate muscle focus
  const muscleFocus = useMemo(() => calculateMuscleFocus(exercises), [exercises]);
  
  // Analyze workout composition
  const composition = useMemo(() => analyzeWorkoutComposition(exercises), [exercises]);
  
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
              <div className="text-xs text-gray-500">
                Active: {formatTime(activeWorkoutTime)}
              </div>
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
        
        {/* Workout density metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Activity className="h-4 w-4 mr-2 text-purple-400" />
                Workout Density
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Volume per minute:</span>
                  <span className="font-mono font-medium">
                    {workoutDensity.toFixed(1)} {weightUnit}/min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Active time density:</span>
                  <span className="font-mono font-medium">
                    {activeWorkoutDensity.toFixed(1)} {weightUnit}/min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total volume:</span>
                  <span className="font-mono font-medium">
                    {totalVolume} {weightUnit}
                  </span>
                </div>
              </div>
              
              {/* Workout density chart */}
              <div className="mt-4 h-32">
                <WorkoutDensityChart 
                  totalTime={workout.duration}
                  activeTime={activeWorkoutTime}
                  restTime={totalRestTime / 60}
                  totalVolume={totalVolume}
                  weightUnit={weightUnit}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Show tags if available */}
          <Card className="bg-gray-900/80 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Tag className="h-4 w-4 mr-2 text-purple-400" />
                Muscle Group Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(muscleFocus).map(([muscle, percentage]) => (
                  <div key={muscle} className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-xs capitalize">{muscle}</span>
                      <span className="text-xs font-mono">{Math.round(percentage)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full rounded-full bg-purple-600/50"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
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
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <MuscleFocusChart muscleGroups={muscleFocus} />
        </div>
        
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-gray-900/90 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Dumbbell className="h-4 w-4 mr-2 text-purple-400" />
                Workout Composition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Compound</span>
                  <span className="text-gray-400">{composition.compound.count} ({Math.round(composition.compound.percentage)}%)</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-500/30 to-amber-700/30"
                    style={{ width: `${composition.compound.percentage}%` }}
                  />
                </div>
              </div>
              
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">Isolation</span>
                  <span className="text-gray-400">{composition.isolation.count} ({Math.round(composition.isolation.percentage)}%)</span>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500/30 to-blue-700/30"
                    style={{ width: `${composition.isolation.percentage}%` }}
                  />
                </div>
              </div>
              
              {composition.bodyweight.count > 0 && (
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Bodyweight</span>
                    <span className="text-gray-400">{composition.bodyweight.count} ({Math.round(composition.bodyweight.percentage)}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-green-500/30 to-green-700/30"
                      style={{ width: `${composition.bodyweight.percentage}%` }}
                    />
                  </div>
                </div>
              )}
              
              {composition.isometric.count > 0 && (
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Isometric</span>
                    <span className="text-gray-400">{composition.isometric.count} ({Math.round(composition.isometric.percentage)}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-purple-500/30 to-purple-700/30"
                      style={{ width: `${composition.isometric.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/90 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-purple-400" />
                Workout Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Activity className="h-3 w-3 text-purple-400 mr-1" />
                    <span className="text-xs text-gray-400">Intensity</span>
                  </div>
                  <div className="text-xl font-semibold">{Math.round(intensity)}%</div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center mb-1">
                    <Percent className="h-3 w-3 text-purple-400 mr-1" />
                    <span className="text-xs text-gray-400">Efficiency</span>
                  </div>
                  <div className="text-xl font-semibold">{Math.round(efficiency)}%</div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3 mt-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-gray-400">Exercises</span>
                    <div className="text-lg font-semibold">{exerciseCount}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Sets</span>
                    <div className="text-lg font-semibold">{setCount}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
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
                        <th className="text-left pb-2 text-gray-400">Rest</th>
                        <th className="text-right pb-2 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sets.map((set, index) => (
                        <tr key={index} className={`border-b border-gray-800/50 ${!set.completed ? 'text-gray-500' : ''}`}>
                          <td className="py-2">Set {set.set_number}</td>
                          <td className="py-2">{set.weight}</td>
                          <td className="py-2">{set.reps}</td>
                          <td className="py-2">{set.restTime || '60'}s</td>
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
