import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import { useWorkoutStatsContext } from "@/context/WorkoutStatsProvider";
import { useWorkoutStore } from "@/store/workoutStore";
import { useStableIntersectionObserver } from './useStableIntersectionObserver';
import { toast } from "@/hooks/use-toast";

export function useIndexPageState() {
  const navigate = useNavigate();
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [funnelOpen, setFunnelOpen] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [hasShownActiveToast, setHasShownActiveToast] = useState(false);
  
  const { stats, loading: isLoadingStats } = useWorkoutStatsContext();
  const { isActive, lastActiveRoute } = useWorkoutStore();
  
  // Stable intersection observer
  const { isIntersecting: isSectionVisible, targetRef: sectionRef } = useStableIntersectionObserver({
    threshold: 0.5,
    rootMargin: "-100px"
  });

  // Stable FAB visibility with debouncing
  const [stableFabVisibility, setStableFabVisibility] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setStableFabVisibility(!isSectionVisible);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isSectionVisible]);

  // Show active workout toast only once per session
  useEffect(() => {
    if (isActive && !hasShownActiveToast) {
      toast({
        title: "Workout in progress",
        description: "You have an active workout. Click the banner to return.",
      });
      setHasShownActiveToast(true);
    } else if (!isActive) {
      setHasShownActiveToast(false);
    }
  }, [isActive, hasShownActiveToast]);

  // Stable callback functions
  const handleStartTraining = useCallback(({ trainingType, tags, duration, rankedExercises }) => {
    const xpReward = Math.round(duration * 2);
    toast({
      title: "Quest Started!",
      description: `${trainingType} adventure for ${duration} minutes. +${xpReward} XP will be awarded on completion`,
    });
    
    const isFirstWorkoutToday = !stats?.lastWorkoutDate || 
      new Date(stats.lastWorkoutDate).toDateString() !== new Date().toDateString();
      
    if (isFirstWorkoutToday) {
      setShowLevelUp(true);
      
      setTimeout(() => {
        setShowLevelUp(false);
        navigateToTraining({ trainingType, tags, duration, rankedExercises });
      }, 2500);
    } else {
      navigateToTraining({ trainingType, tags, duration, rankedExercises });
    }
  }, [stats?.lastWorkoutDate]);

  const navigateToTraining = useCallback(({ trainingType, tags, duration, rankedExercises }) => {
    navigate('/training-session', { 
      state: { 
        trainingConfig: {
          trainingType, 
          tags, 
          duration,
          rankedExercises
        }
      } 
    });
  }, [navigate]);

  const handleContinueWorkout = useCallback(() => {
    if (isActive && lastActiveRoute) {
      navigate(lastActiveRoute);
    }
  }, [isActive, lastActiveRoute, navigate]);

  const toggleWorkoutDisplay = useCallback(() => {
    setShowWorkouts(prev => !prev);
  }, []);

  const handleOpenFunnel = useCallback(() => {
    // Navigate to the new card-based setup flow
    navigate('/workout-setup');
  }, [navigate]);

  const handleCloseFunnel = useCallback((open: boolean) => {
    setFunnelOpen(open);
  }, []);

  // Memoized derived values
  const recommendedWorkoutType = useMemo(() => 
    stats?.recommendedType || "Strength", [stats?.recommendedType]
  );

  const recommendedDuration = useMemo(() => 
    stats?.recommendedDuration || 45, [stats?.recommendedDuration]
  );

  return {
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
    recommendedDuration,
    stats,
    isLoadingStats,
    
    // Actions
    handleStartTraining,
    handleContinueWorkout,
    toggleWorkoutDisplay,
    handleOpenFunnel,
    handleCloseFunnel
  };
}
