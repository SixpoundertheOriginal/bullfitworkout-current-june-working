
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QuickStatsSection } from "@/components/metrics/QuickStatsSection";
import { ConfigureTrainingDialog } from "@/components/ConfigureTrainingDialog";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { useElementVisibility } from "@/hooks/useElementVisibility";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { Zap } from "lucide-react";
import { FeaturesSection } from "@/components/features/FeaturesSection";
import { WorkoutLogSection } from "@/components/workouts/WorkoutLogSection";
import { toast } from "@/hooks/use-toast";

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
        <div 
          className="rounded-xl p-6 bg-gradient-to-r from-purple-600/30 to-pink-500/30 border border-purple-500/20 
                     shadow-lg backdrop-blur-sm hover:shadow-purple-500/10 transition-all duration-300
                     transform hover:-translate-y-0.5 animate-fade-in"
        >
          <p className="text-xl font-medium bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Start your fitness journey today! 💪
          </p>
        </div>

        <QuickStatsSection />

        <section ref={sectionRef} className="mb-10 text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-2
                         animate-fade-in" style={{ animationDelay: '200ms' }}>
            Start Your Training
          </h2>
          <p className="text-gray-400 mb-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            Focus today's session and get into flow mode
          </p>
          
          <div style={{ height: "10rem" }} className="relative">
            <ExerciseFAB 
              onClick={() => setDialogOpen(true)}
              visible={stableFabVisibility}
              className="!bottom-20"
            />

            <button 
              onClick={() => setDialogOpen(true)}
              className={`
                transition-all duration-300 ease-out
                flex flex-col items-center justify-center
                bg-gradient-to-r from-purple-600 to-pink-500
                shadow-xl hover:shadow-purple-500/30
                rounded-full border border-purple-500/30
                absolute left-1/2 top-0
                transform -translate-x-1/2
                ${isSectionVisible 
                  ? 'opacity-100 pointer-events-auto scale-100' 
                  : 'opacity-0 pointer-events-none scale-75'
                }
                h-36 w-36
                hover:scale-110 active:scale-95
                animate-fade-in hover:from-purple-500 hover:to-pink-400
                group
              `}
            >
              <div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-16 h-16 rounded-full bg-purple-500/30 animate-ping"></div>
              </div>
              <Zap size={32} className="mb-1 text-white animate-pulse" />
              <span className="text-2xl font-bold text-white">Start</span>
              <span className="text-xs text-white/80 mt-1">
                {`${recommendedWorkoutType} · ${recommendedDuration} min`}
              </span>
            </button>
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
