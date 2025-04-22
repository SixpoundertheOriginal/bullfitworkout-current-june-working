
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QuickStatsSection } from "@/components/metrics/QuickStatsSection";
import { ConfigureTrainingDialog } from "@/components/ConfigureTrainingDialog";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { useElementVisibility } from "@/hooks/useElementVisibility";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { FeaturesSection } from "@/components/features/FeaturesSection";
import { WorkoutLogSection } from "@/components/workouts/WorkoutLogSection";
import { toast } from "@/hooks/use-toast";
import { StartTrainingButton } from "@/components/training/StartTrainingButton";
import { motion } from "framer-motion";
import { typography } from "@/lib/typography";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { stats } = useWorkoutStats(7);
  
  const { ref: sectionRef, isVisible: isSectionVisible } = useElementVisibility({
    threshold: 0.5,
    rootMargin: "-100px"
  });
  
  const [stableFabVisibility, setStableFabVisibility] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStableFabVisibility(!isSectionVisible);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isSectionVisible]);

  const handleStartTraining = ({ trainingType, tags, duration }) => {
    toast({
      title: "Quest Started!",
      description: 
        <div className="flex flex-col">
          <span>{`${trainingType} adventure for ${duration} minutes`}</span>
          <div className="flex items-center mt-1 text-xs">
            <div className="h-1.5 w-1.5 bg-yellow-400 rounded-full mr-1.5"></div>
            <span className="text-yellow-400">+{Math.round(duration * 2)} XP will be awarded on completion</span>
          </div>
        </div>,
    });
    
    const isFirstWorkoutToday = !stats?.lastWorkoutDate || 
      new Date(stats.lastWorkoutDate).toDateString() !== new Date().toDateString();
      
    if (isFirstWorkoutToday) {
      setShowLevelUp(true);
      
      setTimeout(() => {
        setShowLevelUp(false);
        navigateToTraining({ trainingType, tags, duration });
      }, 2500);
    } else {
      navigateToTraining({ trainingType, tags, duration });
    }
  };

  const navigateToTraining = ({ trainingType, tags, duration }) => {
    navigate('/training-session', { 
      state: { 
        trainingType, 
        tags, 
        duration 
      } 
    });
  };

  const toggleWorkoutDisplay = () => {
    setShowWorkouts(!showWorkouts);
  };

  const recommendedWorkoutType = stats?.recommendedType || "Strength";
  const recommendedDuration = stats?.recommendedDuration || 45;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-900/98 to-gray-900/95">
      <main className="flex-1 overflow-auto px-4 py-6 space-y-6 mt-20 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-xl p-6 bg-gradient-to-r from-purple-600/30 to-pink-500/30 border border-purple-500/20 
                   shadow-lg backdrop-blur-sm hover:shadow-purple-500/10 transition-all duration-300
                   transform hover:-translate-y-0.5"
        >
          <div className="flex items-center">
            <div className="flex-1">
              <p className={cn(typography.text.primary, "text-xl")}>
                Begin your fitness adventure! 💪
              </p>
              <p className={cn(typography.text.secondary, "text-sm mt-1")}>
                Complete quests, gain XP, and level up your fitness journey
              </p>
            </div>
            
            {stats?.totalWorkouts && stats.totalWorkouts > 0 && (
              <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full">
                <div className="flex items-center">
                  <motion.div 
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-white font-bold text-sm">
                      {Math.min(99, Math.floor(stats.totalWorkouts / 5) + 1)}
                    </span>
                  </motion.div>
                  <div className="ml-2">
                    <p className="text-xs text-white/80">Fitness Level</p>
                    <div className="w-16 h-1.5 bg-gray-800/70 rounded-full mt-1">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${(stats.totalWorkouts % 5) * 20}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <QuickStatsSection />

        <section ref={sectionRef} className="mb-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={cn(typography.headings.primary, "text-2xl mb-2")}
          >
            Begin Your Quest
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={cn(typography.text.secondary, "mb-6")}
          >
            Embark on a new fitness adventure
          </motion.p>
          
          <div style={{ height: "10rem" }} className="relative">
            <ExerciseFAB 
              onClick={() => setDialogOpen(true)}
              visible={stableFabVisibility}
              className="!bottom-20"
            />

            <div className="absolute left-1/2 top-0 transform -translate-x-1/2">
              <StartTrainingButton
                onClick={() => setDialogOpen(true)}
                isVisible={isSectionVisible}
                workoutType={recommendedWorkoutType}
                duration={recommendedDuration}
              />
            </div>
          </div>
        </section>

        <WorkoutLogSection 
          showWorkouts={showWorkouts}
          onToggle={toggleWorkoutDisplay}
        />

        <FeaturesSection onNavigate={navigate} />
      </main>

      <ConfigureTrainingDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onStartTraining={handleStartTraining} 
      />
      
      <AnimatedLevelUp show={showLevelUp} />
    </div>
  );
};

const AnimatedLevelUp = ({ show }: { show: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm ${!show && 'pointer-events-none'}`}
    >
      {show && (
        <motion.div
          className="flex flex-col items-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4"
            animate={{ 
              scale: [1, 1.2, 1],
              boxShadow: [
                "0 0 20px 0px rgba(168, 85, 247, 0.5)",
                "0 0 30px 5px rgba(168, 85, 247, 0.8)",
                "0 0 20px 0px rgba(168, 85, 247, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: 1 }}
          >
            <span className="text-white font-bold text-4xl">
              +1
            </span>
          </motion.div>
          
          <motion.h2
            className="text-white text-3xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Level Up!
          </motion.h2>
          
          <motion.p
            className="text-white/80 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            First workout of the day
          </motion.p>
          
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm text-white">
              +50 XP Bonus
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Index;
