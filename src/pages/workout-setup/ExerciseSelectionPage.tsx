
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CardContainer } from "@/components/workout-setup/CardContainer";
import { useWorkoutSetup } from "@/context/WorkoutSetupContext";
import { useExercises } from "@/hooks/useExercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, Plus, Minus, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export const ExerciseSelectionPage = () => {
  const navigate = useNavigate();
  const { state, updateState } = useWorkoutSetup();
  const { exercises } = useExercises();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

  // Filter exercises based on training type, search term, and muscle group
  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMuscleGroup = !selectedMuscleGroup || 
        exercise.primary_muscle_groups.some(mg => mg.toLowerCase().includes(selectedMuscleGroup.toLowerCase()));
      
      // Basic filtering by training type
      const matchesTrainingType = 
        state.trainingType === "Strength" || 
        state.trainingType === "Calisthenics" ||
        state.trainingType === "Yoga" ||
        state.trainingType === "Cardio";
      
      return matchesSearch && matchesMuscleGroup && matchesTrainingType;
    }).slice(0, 20); // Limit to 20 exercises for performance
  }, [exercises, searchTerm, selectedMuscleGroup, state.trainingType]);

  const muscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core"];

  const toggleExercise = (exercise: any) => {
    const isSelected = state.selectedExercises.some(e => e.id === exercise.id);
    
    if (isSelected) {
      updateState({
        selectedExercises: state.selectedExercises.filter(e => e.id !== exercise.id)
      });
    } else {
      updateState({
        selectedExercises: [
          ...state.selectedExercises,
          {
            id: exercise.id,
            name: exercise.name,
            sets: 3,
            reps: 12
          }
        ]
      });
    }
  };

  const handleContinue = () => {
    navigate("/workout-setup/summary");
  };

  return (
    <CardContainer
      title="Select Exercises"
      subtitle="Choose your workout movements"
      progress={{ current: 4, total: 5 }}
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {muscleGroups.map(group => (
              <Button
                key={group}
                variant={selectedMuscleGroup === group ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedMuscleGroup(
                  selectedMuscleGroup === group ? null : group
                )}
                className="text-xs"
              >
                {group}
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Exercises Count */}
        {state.selectedExercises.length > 0 && (
          <Badge variant="secondary" className="w-fit">
            {state.selectedExercises.length} exercise{state.selectedExercises.length !== 1 ? 's' : ''} selected
          </Badge>
        )}

        {/* Exercise List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredExercises.map((exercise) => {
            const isSelected = state.selectedExercises.some(e => e.id === exercise.id);
            
            return (
              <motion.div
                key={exercise.id}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-200 cursor-pointer",
                  "bg-white/5 backdrop-blur-sm hover:bg-white/10",
                  isSelected 
                    ? "border-purple-500 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                    : "border-white/10 hover:border-white/20"
                )}
                onClick={() => toggleExercise(exercise)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Dumbbell className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{exercise.name}</h4>
                      <p className="text-sm text-white/60">
                        {exercise.primary_muscle_groups.join(", ")}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-8 h-8 p-0",
                      isSelected ? "text-purple-400" : "text-white/60"
                    )}
                  >
                    {isSelected ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <Button
            onClick={handleContinue}
            disabled={state.selectedExercises.length === 0}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Continue ({state.selectedExercises.length} exercises)
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </CardContainer>
  );
};
