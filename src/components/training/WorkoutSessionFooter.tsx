
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle, Loader2 } from "lucide-react";

interface WorkoutSessionFooterProps {
  onAddExercise: () => void;
  onFinishWorkout: () => void;
  hasExercises: boolean;
  isSaving: boolean;
}

export const WorkoutSessionFooter: React.FC<WorkoutSessionFooterProps> = ({
  onAddExercise,
  onFinishWorkout,
  hasExercises,
  isSaving
}) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-gray-800/50">
      <div className="px-4 py-4 pb-6 safe-bottom">
        <div className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
          <Button
            onClick={onAddExercise}
            className="
              group relative w-full py-4 flex items-center justify-center gap-3
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-700 hover:to-purple-700
              text-white font-semibold rounded-xl
              shadow-lg hover:shadow-xl 
              transition-all duration-300 ease-out
              transform hover:scale-[1.02] active:scale-[0.98]
              border border-indigo-500/20 hover:border-indigo-400/30
            "
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Plus size={20} className="text-white" />
            </motion.div>
            <span className="font-medium">Add Exercise</span>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>

          {hasExercises && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.4,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="w-full"
            >
              <Button
                onClick={onFinishWorkout}
                disabled={isSaving}
                className="
                  group relative w-full py-4 flex items-center justify-center gap-3
                  bg-gradient-to-r from-emerald-600 to-green-600
                  hover:from-emerald-700 hover:to-green-700
                  disabled:from-emerald-600/60 disabled:to-green-600/60
                  text-white font-semibold rounded-xl
                  shadow-lg hover:shadow-xl 
                  transition-all duration-300 ease-out
                  transform hover:scale-[1.02] active:scale-[0.98]
                  border border-emerald-500/20 hover:border-emerald-400/30
                  disabled:cursor-not-allowed disabled:transform-none
                "
              >
                {isSaving ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-white" />
                    <span className="font-medium">Saving Workout...</span>
                  </>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle size={20} className="text-white" />
                    </motion.div>
                    <span className="font-medium">Finish Workout</span>
                  </>
                )}
                
                {/* Success glow effect */}
                {!isSaving && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </Button>
            </motion.div>
          )}
        </div>
        
        {/* Progress indicator for finish button */}
        {hasExercises && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-3 mx-auto max-w-4xl"
          >
            <div className="h-0.5 bg-gradient-to-r from-emerald-600/30 to-green-600/30 rounded-full" />
          </motion.div>
        )}
      </div>
    </div>
  );
};
