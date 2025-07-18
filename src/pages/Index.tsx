import React, { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EnhancedWelcomeHeader } from "@/components/home/EnhancedWelcomeHeader";
import { AchievementCard } from "@/components/home/AchievementCard";
import { SmartInsightsPanel } from "@/components/home/SmartInsightsPanel";
import { MobileWorkoutActionCenter } from "@/components/home/MobileWorkoutActionCenter";
import { EnhancedWorkoutActionCenter } from "@/components/home/EnhancedWorkoutActionCenter";
import { AnimatedLevelUp } from "@/components/home/AnimatedLevelUp";
import { useIndexPageState } from "@/hooks/useIndexPageState";
import { WorkoutBanner } from "@/components/training/WorkoutBanner";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, EyeOff, Dumbbell, Target, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Lazy-load the WorkoutHistory component to speed up initial page load.
const WorkoutHistory = lazy(() => import("@/components/WorkoutHistory").then(module => ({ default: module.WorkoutHistory })));

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center mb-8">
                <Dumbbell className="h-12 w-12 text-primary mr-4" />
                <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                  BullFit
                </h1>
              </div>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                Your intelligent fitness tracking companion. Log workouts, track progress, and achieve your fitness goals with data-driven insights.
              </p>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border"
                >
                  <Target className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Smart Tracking</h3>
                  <p className="text-muted-foreground">Track sets, reps, weight, and rest times with intelligent recommendations</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="p-6 rounded-2xl bg-card border border-border"
                >
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Progress Analytics</h3>
                  <p className="text-muted-foreground">Visualize your progress with detailed charts and performance metrics</p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="p-6 rounded-2xl bg-card border border-border"
                >
                  <Dumbbell className="h-8 w-8 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Exercise Library</h3>
                  <p className="text-muted-foreground">Access hundreds of exercises with detailed instructions and variations</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 text-lg font-semibold"
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 text-lg font-semibold"
                >
                  Sign In
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Only load workout state if user is authenticated
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
    isLoadingStats,
    handleStartTraining,
    handleContinueWorkout,
    toggleWorkoutDisplay,
  } = useIndexPageState();

  // Mock data for achievements and insights (in real app, this would come from hooks)
  const mockAchievements = [
    {
      id: '1',
      title: 'Consistency Master',
      description: 'Complete 5 workouts this week',
      type: 'consistency' as const,
      progress: 3,
      maxProgress: 5,
      isCompleted: false,
      icon: 'target' as const,
      color: 'purple'
    },
    {
      id: '2',
      title: 'First Workout',
      description: 'Congratulations on starting your fitness journey!',
      type: 'milestone' as const,
      progress: 1,
      maxProgress: 1,
      isCompleted: true,
      icon: 'trophy' as const,
      color: 'gold'
    }
  ];

  const mockInsights = [
    {
      id: '1',
      type: 'recommendation' as const,
      title: 'Perfect Timing',
      description: 'Your best workout performance is between 6-8 PM. Consider scheduling today\'s session then.',
      action: 'Schedule workout',
      priority: 'high' as const,
      icon: 'clock' as const
    },
    {
      id: '2',
      type: 'pattern' as const,
      title: 'Rest Day Recommendation',
      description: 'You\'ve trained 3 days straight. Consider active recovery today.',
      priority: 'medium' as const,
      icon: 'brain' as const
    }
  ];

  // Update handleStartTraining to go to funnel instead of direct training
  const handleStartWorkoutFunnel = () => {
    navigate('/workout-setup/type');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Animated Level Up Overlay */}
      <AnimatePresence>
        {showLevelUp && <AnimatedLevelUp show={showLevelUp} />}
      </AnimatePresence>

      {/* Active Workout Banner - Only show if not already in header */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative z-20"
          >
            <WorkoutBanner />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Properly spaced for header and footer */}
      <div className="relative z-10 pb-24">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-6 pt-6"
        >
          {isLoadingStats ? (
            <div className="space-y-2">
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : (
            <EnhancedWelcomeHeader stats={stats} />
          )}
        </motion.div>

        {/* Enhanced Workout Action Center */}
        <motion.div
          ref={sectionRef as React.RefObject<HTMLDivElement>}
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
              isActive={isActive}
              fabVisible={stableFabVisibility}
              isSectionVisible={isSectionVisible}
              recommendedWorkoutType={recommendedWorkoutType}
              recommendedDuration={recommendedDuration}
              onStartWorkout={handleStartWorkoutFunnel}
              onContinueWorkout={handleContinueWorkout}
              onQuickStart={(duration, type) => {
                handleStartTraining({ 
                  trainingType: type, 
                  tags: [], 
                  duration, 
                  rankedExercises: [] 
                });
              }}
            />
          )}
        </motion.div>

        {/* New Achievement and Insights Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="px-6 mt-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AchievementCard achievements={mockAchievements} />
            <SmartInsightsPanel insights={mockInsights} />
          </div>
        </motion.div>

        {/* Workout History Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
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

          <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg bg-gray-800" />}>
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
          </Suspense>
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
            <ExerciseFAB onClick={handleStartWorkoutFunnel} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
