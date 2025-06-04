
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WelcomeHeader } from "@/components/home/WelcomeHeader";
import { MobileWorkoutActionCenter } from "@/components/home/MobileWorkoutActionCenter";
import { EnhancedWorkoutActionCenter } from "@/components/home/EnhancedWorkoutActionCenter";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { AnimatedLevelUp } from "@/components/home/AnimatedLevelUp";
import { useIndexPageState } from "@/hooks/useIndexPageState";
import { WorkoutBanner } from "@/components/training/WorkoutBanner";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, EyeOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const {
    showWorkouts,
    showLevelUp,
    isSectionVisible,
    stableFabVisibility,
    sectionRef,
    isActive,
    recommendedWorkoutType,
    recommendedDuration,
    stats,
    handleStartTraining,
    handleContinueWorkout,
    toggleWorkoutDisplay,
  } = useIndexPageState();

  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Animated Level Up Overlay */}
      <AnimatePresence>
        {showLevelUp && <AnimatedLevelUp />}
      </AnimatePresence>

      {/* Active Workout Banner */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <WorkoutBanner onContinue={handleContinueWorkout} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-6 pt-safe-top"
        >
          <WelcomeHeader stats={stats} />
        </motion.div>

        {/* Workout Action Center */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-6 mt-8"
        >
          {isMobile ? (
            <MobileWorkoutActionCenter
              onStartTraining={handleStartTraining}
              recommendedType={recommendedWorkoutType}
              recommendedDuration={recommendedDuration}
            />
          ) : (
            <EnhancedWorkoutActionCenter
              onStartTraining={handleStartTraining}
              recommendedType={recommendedWorkoutType}
              recommendedDuration={recommendedDuration}
            />
          )}
        </motion.div>

        {/* Workout History Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="px-6 mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleWorkoutDisplay}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              {showWorkouts ? (
                <EyeOff className="h-4 w-4 mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {showWorkouts ? "Hide" : "Show"}
            </Button>
          </div>

          <Separator className="mb-6" />

          <AnimatePresence mode="wait">
            {showWorkouts && (
              <motion.div
                key="workout-history"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <WorkoutHistory />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <AnimatePresence>
        {stableFabVisibility && !isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-safe-bottom right-6 z-40"
          >
            <ExerciseFAB />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
