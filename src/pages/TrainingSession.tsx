import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Check, 
  Dumbbell, 
  Timer, 
  BarChart3, 
  Heart, 
  ChevronRight,
  X,
  Trash2,
  Save,
  Edit
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Exercise, ExerciseSet } from "@/types/exercise";
import { supabase } from "@/integrations/supabase/client";

const exerciseHistoryData = {
  "Bench Press": [
    { date: "Apr 10", weight: 135, reps: 10, sets: 3 },
    { date: "Apr 3", weight: 130, reps: 10, sets: 3 },
    { date: "Mar 27", weight: 125, reps: 8, sets: 3 },
  ],
  "Squats": [
    { date: "Apr 9", weight: 185, reps: 8, sets: 3 },
    { date: "Apr 2", weight: 175, reps: 8, sets: 3 },
    { date: "Mar 26", weight: 165, reps: 8, sets: 3 },
  ],
  "Deadlift": [
    { date: "Apr 8", weight: 225, reps: 5, sets: 3 },
    { date: "Apr 1", weight: 215, reps: 5, sets: 3 },
    { date: "Mar 25", weight: 205, reps: 5, sets: 3 },
  ],
  "Pull-ups": [
    { date: "Apr 7", weight: 0, reps: 8, sets: 3 },
    { date: "Mar 31", weight: 0, reps: 7, sets: 3 },
    { date: "Mar 24", weight: 0, reps: 6, sets: 3 },
  ],
};

const SetRow = ({ 
  setNumber, 
  weight, 
  reps, 
  completed, 
  onComplete, 
  onEdit, 
  onRemove, 
  isEditing, 
  onSave, 
  onWeightChange, 
  onRepsChange 
}) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800">
      <div className="w-8 text-center font-medium text-gray-400">#{setNumber}</div>
      
      {isEditing ? (
        <>
          <div className="flex-1 px-2">
            <Input 
              type="number"
              value={weight}
              onChange={onWeightChange}
              className="bg-gray-800 border-gray-700 text-white h-8 px-2"
            />
          </div>
          <div className="flex-1 px-2">
            <Input 
              type="number"
              value={reps}
              onChange={onRepsChange}
              className="bg-gray-800 border-gray-700 text-white h-8 px-2"
            />
          </div>
          <div className="flex gap-1">
            <button
              onClick={onSave}
              className="w-6 h-6 rounded-full flex items-center justify-center bg-blue-600/70 text-blue-100"
            >
              <Save size={14} />
            </button>
            <button
              onClick={onRemove}
              className="w-6 h-6 rounded-full flex items-center justify-center bg-red-600/70 text-red-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 px-2">
            <div className="flex gap-1 items-baseline">
              <span className="font-medium">{weight}</span>
              <span className="text-xs text-gray-400">lbs</span>
            </div>
          </div>
          <div className="flex-1 px-2">
            <div className="flex gap-1 items-baseline">
              <span className="font-medium">{reps}</span>
              <span className="text-xs text-gray-400">reps</span>
            </div>
          </div>
          <div className="flex gap-1">
            {completed ? (
              <button
                onClick={onEdit}
                className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-700 text-gray-300"
              >
                <Edit size={14} />
              </button>
            ) : (
              <button 
                onClick={onComplete} 
                className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-800 text-gray-400"
              >
                <Check size={14} />
              </button>
            )}
            <button
              onClick={onRemove}
              className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-700 text-gray-300"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const ExerciseCard = ({ 
  exercise, 
  sets, 
  onAddSet, 
  onCompleteSet, 
  onRemoveSet, 
  onEditSet, 
  onWeightChange, 
  onRepsChange, 
  onSaveSet,
  isActive 
}) => {
  const history = exerciseHistoryData[exercise] || [];
  const previousSession = history[0] || { weight: 0, reps: 0, sets: 0 };
  const olderSession = history[1] || previousSession;
  
  const weightDiff = previousSession.weight - olderSession.weight;
  const percentChange = olderSession.weight ? ((weightDiff / olderSession.weight) * 100).toFixed(1) : "0";
  const isImproved = weightDiff > 0;
  
  const currentVolume = sets.reduce((total, set) => {
    return total + (set.completed ? set.weight * set.reps : 0);
  }, 0);
  
  const previousVolume = previousSession.weight * previousSession.reps * previousSession.sets;
  const volumeDiff = (currentVolume - previousVolume);
  const volumePercentChange = previousVolume ? ((volumeDiff / previousVolume) * 100).toFixed(1) : "0";
  
  return (
    <Card className={`bg-gray-900 border-gray-800 mb-4 ${isActive ? "ring-1 ring-purple-500" : ""}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{exercise}</h3>
            <div className="flex items-center text-gray-400 text-sm">
              <span>Last session: {previousSession.weight} lbs × {previousSession.reps} × {previousSession.sets}</span>
            </div>
          </div>
          <Badge 
            variant="outline"
            className={`flex items-center gap-1 ${isImproved ? "text-green-400 border-green-500/30" : "text-red-400 border-red-500/30"}`}
          >
            {isImproved ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(parseFloat(percentChange))}%
          </Badge>
        </div>
        
        <div className="flex items-center justify-between py-2 border-b border-gray-700 text-sm text-gray-400">
          <div className="w-8 text-center">Set</div>
          <div className="flex-1 px-2">Weight</div>
          <div className="flex-1 px-2">Reps</div>
          <div className="w-14"></div>
        </div>
        
        <div className="my-2">
          {sets.map((set, index) => (
            <SetRow 
              key={index}
              setNumber={index + 1}
              weight={set.weight}
              reps={set.reps}
              completed={set.completed}
              isEditing={set.isEditing}
              onComplete={() => onCompleteSet(exercise, index)}
              onEdit={() => onEditSet(exercise, index)}
              onSave={() => onSaveSet(exercise, index)}
              onRemove={() => onRemoveSet(exercise, index)}
              onWeightChange={(e) => onWeightChange(exercise, index, e.target.value)}
              onRepsChange={(e) => onRepsChange(exercise, index, e.target.value)}
            />
          ))}
          
          <button 
            onClick={() => onAddSet(exercise)}
            className="w-full mt-3 py-2 flex items-center justify-center text-sm bg-gray-800 hover:bg-gray-750 rounded-md text-gray-300"
          >
            <Plus size={16} className="mr-1" />
            Add Set
          </button>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Volume vs last session</span>
            <div className={isImproved ? "text-green-400" : "text-red-400"}>
              {volumeDiff > 0 ? "+" : ""}{volumeDiff} lbs ({volumePercentChange}%)
            </div>
          </div>
          <Progress 
            value={currentVolume > 0 ? (currentVolume / previousVolume) * 100 : 0} 
            max={100}
            className={`h-1.5 bg-gray-800 ${currentVolume >= previousVolume ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const TrainingSession = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [time, setTime] = useState(0);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [heartRate, setHeartRate] = useState(75);
  const [currentExercise, setCurrentExercise] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  
  const [exercises, setExercises] = useState<Record<string, { weight: number; reps: number; completed: boolean; isEditing?: boolean }[]>>({});
  
  useEffect(() => {
    setStartTime(new Date());
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
      setHeartRate(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(70, Math.min(160, prev + change));
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAddSet = (exerciseName: string) => {
    const exerciseSets = exercises[exerciseName] || [];
    const lastSet = exerciseSets[exerciseSets.length - 1] || { weight: 0, reps: 0 };
    
    setExercises({
      ...exercises,
      [exerciseName]: [
        ...exerciseSets,
        { weight: lastSet.weight, reps: lastSet.reps, completed: false, isEditing: false }
      ]
    });
  };
  
  const handleCompleteSet = (exerciseName: string, setIndex: number) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      updatedExercises[exerciseName][setIndex].completed = true;
      setExercises(updatedExercises);
      
      toast({
        title: "Set completed",
        description: `${exerciseName}: Set ${setIndex + 1} logged successfully`,
      });
    }
  };
  
  const handleRemoveSet = (exerciseName: string, setIndex: number) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    updatedExercises[exerciseName] = updatedExercises[exerciseName].filter((_, i) => i !== setIndex);
    
    if (updatedExercises[exerciseName].length === 0) {
      delete updatedExercises[exerciseName];
      
      if (currentExercise === exerciseName) {
        const remainingExercises = Object.keys(updatedExercises);
        setCurrentExercise(remainingExercises.length > 0 ? remainingExercises[0] : "");
      }
    }
    
    setExercises(updatedExercises);
    
    toast({
      title: "Set removed",
      description: `${exerciseName}: Set ${setIndex + 1} removed`,
    });
  };
  
  const handleEditSet = (exerciseName: string, setIndex: number) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      updatedExercises[exerciseName][setIndex].isEditing = true;
      setExercises(updatedExercises);
    }
  };
  
  const handleSaveSet = (exerciseName: string, setIndex: number) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      updatedExercises[exerciseName][setIndex].isEditing = false;
      setExercises(updatedExercises);
      
      toast({
        title: "Set updated",
        description: `${exerciseName}: Set ${setIndex + 1} updated successfully`,
      });
    }
  };
  
  const handleSetWeightChange = (exerciseName: string, setIndex: number, value: string) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      updatedExercises[exerciseName][setIndex].weight = Number(value) || 0;
      setExercises(updatedExercises);
    }
  };
  
  const handleSetRepsChange = (exerciseName: string, setIndex: number, value: string) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      updatedExercises[exerciseName][setIndex].reps = Number(value) || 0;
      setExercises(updatedExercises);
    }
  };
  
  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newExerciseName.trim()) return;
    
    if (!exercises[newExerciseName]) {
      setExercises({
        ...exercises,
        [newExerciseName]: [
          { weight: 0, reps: 0, completed: false, isEditing: false },
          { weight: 0, reps: 0, completed: false, isEditing: false },
          { weight: 0, reps: 0, completed: false, isEditing: false },
        ]
      });
      setCurrentExercise(newExerciseName);
      setNewExerciseName("");
    } else {
      toast({
        title: "Exercise already added",
        description: "This exercise is already in your workout",
        variant: "destructive"
      });
    }
  };
  
  const totalSets = Object.values(exercises || {}).reduce((sum, sets) => sum + sets.length, 0);
  const completedSets = Object.values(exercises || {}).reduce((sum, sets) => 
    sum + sets.filter(set => set.completed).length, 0);
  
  const completionPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  
  const handleFinishWorkout = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your workout.",
        variant: "destructive"
      });
      return;
    }
    
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    try {
      const { data: workoutSession, error: workoutError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          name: "Training Session",
          training_type: "Strength Training",
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration: duration,
          notes: ""
        })
        .select()
        .single();
      
      if (workoutError) throw workoutError;
      
      const setsToInsert = [];
      
      Object.entries(exercises).forEach(([exerciseName, sets]) => {
        sets.forEach((set, index) => {
          if (set.completed) {
            setsToInsert.push({
              workout_id: workoutSession.id,
              exercise_name: exerciseName,
              weight: set.weight,
              reps: set.reps,
              completed: true,
              set_number: index + 1
            });
          }
        });
      });
      
      if (setsToInsert.length > 0) {
        const { error: setsError } = await supabase
          .from('exercise_sets')
          .insert(setsToInsert);
        
        if (setsError) throw setsError;
      }
      
      toast({
        title: "Workout completed",
        description: "Your workout has been saved successfully!",
      });
      
      const workoutData = {
        id: workoutSession.id,
        exercises: exercises,
        duration: duration,
        startTime: startTime,
        endTime: endTime,
        trainingType: "Strength Training",
        name: "Workout Session"
      };
      
      navigate('/workout-complete', { state: { workoutData } });
    } catch (error) {
      console.error("Error saving workout:", error);
      toast({
        title: "Error saving workout",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">Training Session</h1>
        <div className="w-9"></div>
      </header>

      <div className="grid grid-cols-4 bg-gray-900 p-4">
        <div className="flex flex-col items-center">
          <Timer className="text-purple-400 mb-1" size={18} />
          <span className="text-lg font-mono">{formatTime(time)}</span>
          <span className="text-xs text-gray-400">Time</span>
        </div>
        <div className="flex flex-col items-center">
          <Dumbbell className="text-purple-400 mb-1" size={18} />
          <span className="text-lg">{Object.keys(exercises).length}</span>
          <span className="text-xs text-gray-400">Exercises</span>
        </div>
        <div className="flex flex-col items-center">
          <BarChart3 className="text-purple-400 mb-1" size={18} />
          <span className="text-lg">{completedSets}/{totalSets}</span>
          <span className="text-xs text-gray-400">Sets</span>
        </div>
        <div className="flex flex-col items-center">
          <Heart className="text-red-400 mb-1" size={18} />
          <span className="text-lg">{heartRate}</span>
          <span className="text-xs text-gray-400">BPM</span>
        </div>
      </div>

      <div className="px-4 py-2 bg-gray-900">
        <Progress 
          value={completionPercentage} 
          max={100}
          className="h-1.5 bg-gray-800 [&>div]:bg-purple-500"
        />
      </div>
      
      <main className="flex-1 overflow-auto px-4 py-6">
        {Object.keys(exercises || {}).map((exerciseName) => (
          <ExerciseCard
            key={exerciseName}
            exercise={exerciseName}
            sets={exercises[exerciseName] || []}
            onAddSet={handleAddSet}
            onCompleteSet={handleCompleteSet}
            onRemoveSet={handleRemoveSet}
            onEditSet={handleEditSet}
            onSaveSet={handleSaveSet}
            onWeightChange={handleSetWeightChange}
            onRepsChange={handleSetRepsChange}
            isActive={exerciseName === currentExercise}
          />
        ))}
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Add Exercise</h3>
          <form onSubmit={handleAddExercise} className="flex gap-2">
            <Input
              type="text"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="Enter exercise name"
              className="bg-gray-900 border-gray-700 text-white"
            />
            <Button type="submit" variant="secondary">
              <Plus size={16} />
              Add
            </Button>
          </form>
        </div>
        
        <Button 
          onClick={handleFinishWorkout}
          className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        >
          Complete Workout
        </Button>
      </main>
    </div>
  );
};

export default TrainingSession;
