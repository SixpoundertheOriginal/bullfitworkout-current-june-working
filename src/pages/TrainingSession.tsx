
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
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Mock data for exercise history
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

// Exercise library with recommended weights based on history
const exerciseLibrary = [
  { 
    name: "Bench Press", 
    lastWeight: 135, 
    lastReps: 10,
    personal_record: 145,
    muscle_group: "Chest"
  },
  { 
    name: "Squats", 
    lastWeight: 185, 
    lastReps: 8,
    personal_record: 195,
    muscle_group: "Legs"
  },
  { 
    name: "Deadlift", 
    lastWeight: 225, 
    lastReps: 5,
    personal_record: 235,
    muscle_group: "Back"
  },
  { 
    name: "Pull-ups", 
    lastWeight: 0, 
    lastReps: 8,
    personal_record: 12,
    muscle_group: "Back"
  },
  { 
    name: "Shoulder Press", 
    lastWeight: 95, 
    lastReps: 8,
    personal_record: 105,
    muscle_group: "Shoulders"
  },
];

// Component for each set in an exercise
const SetRow = ({ setNumber, weight, reps, completed, onComplete, onEdit }) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800">
      <div className="w-8 text-center font-medium text-gray-400">#{setNumber}</div>
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
      <div className="w-8">
        <button 
          onClick={completed ? onEdit : onComplete} 
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            completed ? "bg-green-500/20 text-green-400" : "bg-gray-800 text-gray-400"
          }`}
        >
          {completed ? <Check size={14} /> : <span className="text-xs">+</span>}
        </button>
      </div>
    </div>
  );
};

// Component for each exercise card
const ExerciseCard = ({ exercise, sets, onAddSet, onComplete, isActive }) => {
  const history = exerciseHistoryData[exercise] || [];
  const previousSession = history[0] || { weight: 0, reps: 0, sets: 0 };
  const olderSession = history[1] || previousSession;
  
  // Calculate progress compared to previous session
  const weightDiff = previousSession.weight - olderSession.weight;
  const percentChange = olderSession.weight ? ((weightDiff / olderSession.weight) * 100).toFixed(1) : "0";
  const isImproved = weightDiff > 0;
  
  // Calculate total volume (weight × reps × sets)
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
        
        {/* Sets header */}
        <div className="flex items-center justify-between py-2 border-b border-gray-700 text-sm text-gray-400">
          <div className="w-8 text-center">Set</div>
          <div className="flex-1 px-2">Weight</div>
          <div className="flex-1 px-2">Reps</div>
          <div className="w-8"></div>
        </div>
        
        {/* Sets list */}
        <div className="my-2">
          {sets.map((set, index) => (
            <SetRow 
              key={index}
              setNumber={index + 1}
              weight={set.weight}
              reps={set.reps}
              completed={set.completed}
              onComplete={() => onComplete(exercise, index)}
              onEdit={() => {/* Edit functionality would go here */}}
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
        
        {/* Performance comparison */}
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

// Exercise Picker Component
const ExercisePicker = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Add Exercise</h2>
        <button onClick={onClose} className="p-2">
          <X size={24} />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        {exerciseLibrary.map((exercise) => (
          <div 
            key={exercise.name}
            onClick={() => {
              onSelect(exercise.name);
              onClose();
            }}
            className="flex justify-between items-center p-4 bg-gray-900 rounded-lg mb-3 border border-gray-800 hover:border-gray-700"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{exercise.name}</h3>
                {exercise.name === "Bench Press" && (
                  <Badge className="bg-purple-500/20 text-purple-300 text-xs">PR</Badge>
                )}
              </div>
              <div className="text-sm text-gray-400">{exercise.muscle_group}</div>
              <div className="text-xs text-gray-500 mt-1">
                Last: {exercise.lastWeight} lbs × {exercise.lastReps} reps
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-500" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Training Session component
const TrainingSession = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [time, setTime] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [heartRate, setHeartRate] = useState(75);
  const [currentExercise, setCurrentExercise] = useState("Bench Press");
  const [startTime, setStartTime] = useState(new Date());
  
  // State for exercise sets
  const [exercises, setExercises] = useState({
    "Bench Press": [
      { weight: 135, reps: 10, completed: false },
      { weight: 135, reps: 10, completed: false },
      { weight: 135, reps: 10, completed: false },
    ]
  });
  
  // Set start time when component mounts
  useEffect(() => {
    setStartTime(new Date());
  }, []);
  
  // Update timer and simulate heart rate changes
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
  
  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Add a set to an exercise
  const handleAddSet = (exerciseName) => {
    const exerciseSets = exercises[exerciseName] || [];
    const lastSet = exerciseSets[exerciseSets.length - 1] || { weight: 0, reps: 0 };
    
    setExercises({
      ...exercises,
      [exerciseName]: [
        ...exerciseSets,
        { weight: lastSet.weight, reps: lastSet.reps, completed: false }
      ]
    });
  };
  
  // Mark a set as completed
  const handleCompleteSet = (exerciseName, setIndex) => {
    const updatedExercises = { ...exercises };
    updatedExercises[exerciseName][setIndex].completed = true;
    setExercises(updatedExercises);
    
    toast({
      title: "Set completed",
      description: `${exerciseName}: Set ${setIndex + 1} logged successfully`,
    });
  };
  
  // Add a new exercise to the workout
  const handleAddExercise = (exerciseName) => {
    if (!exercises[exerciseName]) {
      const exerciseData = exerciseLibrary.find(e => e.name === exerciseName);
      setExercises({
        ...exercises,
        [exerciseName]: [
          { weight: exerciseData?.lastWeight || 0, reps: exerciseData?.lastReps || 0, completed: false },
          { weight: exerciseData?.lastWeight || 0, reps: exerciseData?.lastReps || 0, completed: false },
          { weight: exerciseData?.lastWeight || 0, reps: exerciseData?.lastReps || 0, completed: false },
        ]
      });
      setCurrentExercise(exerciseName);
    }
  };
  
  // Calculate overall workout statistics
  const totalSets = Object.values(exercises).reduce((sum, sets) => sum + sets.length, 0);
  const completedSets = Object.values(exercises).reduce((sum, sets) => 
    sum + sets.filter(set => set.completed).length, 0);
  
  const completionPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  
  // End the workout and return to home screen
  const handleFinishWorkout = () => {
    // Get the end time
    const endTime = new Date();
    
    // Create workout data object to pass to the completion page
    const workoutData = {
      exercises: exercises,
      duration: time,
      startTime: startTime,
      endTime: endTime,
      trainingType: "Strength Training", // This could be dynamic based on selected exercises
      name: "Workout Session"
    };
    
    // Navigate to the workout complete page with the workout data
    navigate('/workout-complete', { state: { workoutData } });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Session Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">Training Session</h1>
        <div className="w-9"></div> {/* Spacer to balance header */}
      </header>

      {/* Session Stats */}
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

      {/* Progress bar */}
      <div className="px-4 py-2 bg-gray-900">
        <Progress 
          value={completionPercentage} 
          max={100}
          className="h-1.5 bg-gray-800 [&>div]:bg-purple-500"
        />
      </div>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto px-4 py-6">
        {/* Exercise Cards */}
        {Object.keys(exercises).map((exerciseName) => (
          <ExerciseCard
            key={exerciseName}
            exercise={exerciseName}
            sets={exercises[exerciseName]}
            onAddSet={handleAddSet}
            onComplete={handleCompleteSet}
            isActive={exerciseName === currentExercise}
          />
        ))}
        
        {/* Add Exercise Button */}
        <button 
          onClick={() => setShowPicker(true)}
          className="w-full py-4 flex items-center justify-center bg-gray-900 border border-gray-800 rounded-lg text-lg font-medium hover:bg-gray-800 mb-6"
        >
          <Plus size={20} className="mr-2" />
          Add Exercise
        </button>
        
        {/* Complete Workout Button */}
        <Button 
          onClick={handleFinishWorkout}
          className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
        >
          Complete Workout
        </Button>
      </main>
      
      {/* Exercise Picker Modal */}
      {showPicker && (
        <ExercisePicker 
          onSelect={handleAddExercise}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
};

export default TrainingSession;
