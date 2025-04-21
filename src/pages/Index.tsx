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
  
  const sectionRef = useRef<HTMLDivElement>(null);
  const isSectionVisible = useElementVisibility(sectionRef, {
    threshold: 0.5,
    rootMargin: "-100px"
  });
  
  const [stableFabVisibility, setStableFabVisibility] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStableFabVisibility(!isSectionVisible);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isSectionVisible]);

  const handleStartTraining = ({ trainingType, tags, duration }) => {
    toast({
      title: "Training started!",
      description: `${trainingType} session for ${duration} minutes`,
    });
    
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
          <p className={cn(typography.text.primary, "text-xl")}>
            Start your fitness journey today! 💪
          </p>
        </motion.div>

        <QuickStatsSection />

        <section ref={sectionRef} className="mb-10 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={cn(typography.headings.primary, "text-2xl mb-2")}
          >
            Start Your Training
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className={cn(typography.text.secondary, "mb-6")}
          >
            Focus today's session and get into flow mode
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

        <FeaturesSection onNavigate={navigate} />
        
        <WorkoutLogSection 
          showWorkouts={showWorkouts}
          onToggle={toggleWorkoutDisplay}
        />
      </main>

      <ConfigureTrainingDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onStartTraining={handleStartTraining} 
      />
    </div>
  );
};

export default Index;
