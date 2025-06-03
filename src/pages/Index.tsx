
import React from "react";
import { QuickStatsSection } from "@/components/metrics/QuickStatsSection";
import { WorkoutFunnelModal } from "@/components/training/WorkoutFunnelModal";
import { FeaturesSection } from "@/components/features/FeaturesSection";
import { WorkoutLogSection } from "@/components/workouts/WorkoutLogSection";
import { DateRangeProvider } from "@/context/DateRangeContext";
import { WelcomeHeader } from "@/components/home/WelcomeHeader";
import { WorkoutActionCenter } from "@/components/home/WorkoutActionCenter";
import { AnimatedLevelUp } from "@/components/home/AnimatedLevelUp";
import { useIndexPageState } from "@/hooks/useIndexPageState";
import { useNavigate } from "react-router-dom";

// Memoized heavy components for better performance
const MemoizedQuickStatsSection = React.memo(QuickStatsSection);
const MemoizedWorkoutLogSection = React.memo(WorkoutLogSection);
const MemoizedFeaturesSection = React.memo(FeaturesSection);

const Index = () => {
  const navigate = useNavigate();
  const {
    // State
    showWorkouts,
    funnelOpen,
    showLevelUp,
    isSectionVisible,
    stableFabVisibility,
    sectionRef,
    
    // Derived values
    isActive,
    recommendedWorkoutType,
    stats,
    
    // Actions
    handleStartTraining,
    handleContinueWorkout,
    toggleWorkoutDisplay,
    handleOpenFunnel,
    handleCloseFunnel
  } = useIndexPageState();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-900/98 to-gray-900/95">
      <main className="flex-1 overflow-auto px-4 py-6 space-y-6 mt-20 pb-20">
        <WelcomeHeader stats={stats} />

        <DateRangeProvider>
          <MemoizedQuickStatsSection />
        </DateRangeProvider>

        <section ref={sectionRef} className="mb-10 text-center">
          <WorkoutActionCenter
            isActive={isActive}
            fabVisible={stableFabVisibility}
            isSectionVisible={isSectionVisible}
            recommendedWorkoutType={recommendedWorkoutType}
            onStartWorkout={handleOpenFunnel}
            onContinueWorkout={handleContinueWorkout}
          />
        </section>

        <MemoizedWorkoutLogSection 
          showWorkouts={showWorkouts}
          onToggle={toggleWorkoutDisplay}
        />

        <MemoizedFeaturesSection onNavigate={navigate} />
      </main>

      <WorkoutFunnelModal 
        open={funnelOpen} 
        onOpenChange={handleCloseFunnel} 
        onStartTraining={handleStartTraining} 
      />
      
      <AnimatedLevelUp show={showLevelUp} />
    </div>
  );
};

export default Index;
