
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { subscriptionManager } from '@/services/SubscriptionManager';

interface RealtimeSubscriptionContextType {
  isConnected: boolean;
}

const RealtimeSubscriptionContext = createContext<RealtimeSubscriptionContextType | undefined>(undefined);

export function RealtimeSubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const subscriptionsRef = useRef<(() => void)[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || isInitializedRef.current) return;

    console.log('[RealtimeSubscriptionProvider] Initializing global subscriptions for user:', user.id);

    // Global workout change handler - no dependencies on component state
    const handleWorkoutChange = (payload: any) => {
      console.log('[RealtimeSubscriptionProvider] Global workout change detected:', payload);
      
      // Debounced cache invalidation
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['workout-history'] });
        queryClient.invalidateQueries({ queryKey: ['workouts'] });
        queryClient.invalidateQueries({ queryKey: ['workout-dates'] });
        queryClient.invalidateQueries({ queryKey: ['workout-stats-unified'] });
        queryClient.invalidateQueries({ queryKey: ['workout-stats'] });
      }, 1000);
    };

    // Set up all necessary subscriptions once
    const workoutSubscription = subscriptionManager.subscribe({
      channelName: `global-workout-${user.id}`,
      table: 'workout_sessions',
      events: ['INSERT', 'UPDATE', 'DELETE'],
      callback: handleWorkoutChange,
      filter: `user_id=eq.${user.id}`
    });

    const setsSubscription = subscriptionManager.subscribe({
      channelName: `global-sets-${user.id}`,
      table: 'exercise_sets',
      events: ['INSERT', 'UPDATE', 'DELETE'],
      callback: handleWorkoutChange
    });

    // Store unsubscribe functions
    subscriptionsRef.current = [workoutSubscription, setsSubscription];
    isInitializedRef.current = true;

    console.log('[RealtimeSubscriptionProvider] Global subscriptions established');

    // Cleanup only on provider unmount or user change
    return () => {
      console.log('[RealtimeSubscriptionProvider] Cleaning up global subscriptions');
      subscriptionsRef.current.forEach(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
      subscriptionsRef.current = [];
      isInitializedRef.current = false;
    };
  }, [user?.id, queryClient]);

  const contextValue: RealtimeSubscriptionContextType = {
    isConnected: isInitializedRef.current
  };

  return (
    <RealtimeSubscriptionContext.Provider value={contextValue}>
      {children}
    </RealtimeSubscriptionContext.Provider>
  );
}

export function useRealtimeSubscription(): RealtimeSubscriptionContextType {
  const context = useContext(RealtimeSubscriptionContext);
  if (!context) {
    throw new Error('useRealtimeSubscription must be used within a RealtimeSubscriptionProvider');
  }
  return context;
}
