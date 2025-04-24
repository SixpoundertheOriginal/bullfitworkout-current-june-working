import React, { useMemo } from 'react';
import { ExerciseSet } from '@/types/exercise';
import { 
  calculateMuscleFocus, 
  analyzeWorkoutComposition 
} from '@/utils/exerciseUtils';
import { MuscleFocusChart } from '../metrics/MuscleFocusChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dumbbell, 
  BarChart3, 
  Percent, 
  Activity,
  Clock,
  Calendar,
  Tag,
  Edit,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatRelative } from 'date-fns';
import { WorkoutDensityChart } from '../metrics/WorkoutDensityChart';
import { WeightUnit } from '@/utils/unitConversion';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { cn } from '@/utils/cn';

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
  onEditClick: () => void;
  tags?: string[];
  className?: string;
}

export const WorkoutDetailsEnhanced = ({
  workout,
  exercises,
  onEditClick,
  tags = [],
  className = ''
}: WorkoutDetailsEnhancedProps) => {
  const { weightUnit } = useWeightUnit();
  
  const exerciseCount = Object.keys(exercises).length;
  const setCount = Object.values(exercises).reduce(
    (total, sets) => total + sets.length, 0
  );
  const completedSets = Object.values(exercises).reduce(
    (total, sets) => total + sets.filter(set => set.completed).length, 0
  );
  
  const efficiency = setCount > 0 ? (completedSets / setCount) * 100 : 0;
  
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
    
    if (set.restTime) {
      totalRestTime += set.restTime;
    } else {
      totalRestTime += 60;
    }
  });
  
  const avgWeight = weightedSetCount > 0 ? totalVolume / weightedSetCount : 0;
  
  const intensity = maxWeight > 0 ? (avgWeight / maxWeight) * 100 : 0;
  
  const activeWorkoutTime = workout.duration - (totalRestTime / 60);
  const workoutDensity = workout.duration > 0 ? totalVolume / workout.duration : 0;
  const activeWorkoutDensity = activeWorkoutTime > 0 ? totalVolume / activeWorkoutTime : 0;
  
  const muscleFocus = useMemo(() => calculateMuscleFocus(exercises), [exercises]);
  
  const composition = useMemo(() => analyzeWorkoutComposition(exercises), [exercises]);
  
  const workoutDate = new Date(workout.start_time);
  const relativeDate = formatRelative(workoutDate, new Date());
  const formattedDate = workoutDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{workout.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEditClick}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Edit size={18} />
            </Button>
          </div>
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
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Exercise Details</h2>
        <div className="space-y-4">
          {Object.entries(exercises).map(([exerciseName, sets]) => (
            <Card key={exerciseName} className="bg-gray-900/80 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{exerciseName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-2 px-4 text-gray-400 font-medium">Set</th>
                        <th className="text-left py-2 px-4 text-gray-400 font-medium">Weight ({weightUnit})</th>
                        <th className="text-left py-2 px-4 text-gray-400 font-medium">Reps</th>
                        <th className="text-left py-2 px-4 text-gray-400 font-medium">Rest</th>
                        <th className="text-right py-2 px-4 text-gray-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sets.map((set) => (
                        <tr 
                          key={set.id}
                          className={cn(
                            "border-b border-gray-800/50",
                            !set.completed && "opacity-50"
                          )}
                        >
                          <td className="py-3 px-4">Set {set.set_number}</td>
                          <td className="py-3 px-4 font-mono">{set.weight}</td>
                          <td className="py-3 px-4 font-mono">{set.reps}</td>
                          <td className="py-3 px-4 font-mono">{set.restTime || 60}s</td>
                          <td className="py-3 px-4 text-right">
                            <Badge 
                              className={cn(
                                set.completed 
                                  ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                                  : "bg-gray-800/50 text-gray-400"
                              )}
                            >
                              {set.completed ? "Completed" : "Skipped"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onEditClick}
                      className="bg-gray-800 text-white hover:bg-gray-700"
                    >
                      Edit Sets
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
