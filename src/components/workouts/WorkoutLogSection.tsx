
import React, { useState } from 'react';
import { BarChart3, CheckSquare, X } from "lucide-react";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { Button } from "@/components/ui/button";
import { QuickActionBar } from './QuickActionBar';

interface WorkoutLogSectionProps {
  showWorkouts: boolean;
  onToggle: () => void;
}

export const WorkoutLogSection = ({ showWorkouts, onToggle }: WorkoutLogSectionProps) => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedWorkouts([]);
  };

  const handleWorkoutSelected = (workoutId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedWorkouts(prev => [...prev, workoutId]);
    } else {
      setSelectedWorkouts(prev => prev.filter(id => id !== workoutId));
    }
  };

  const handleActionComplete = () => {
    setIsSelectionMode(false);
    setSelectedWorkouts([]);
  };

  return (
    <section className="animate-fade-in" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary" />
          <h2 className="text-lg font-semibold">Recent Workouts</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {!isSelectionMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleSelectionMode}
              className="text-sm"
            >
              <CheckSquare className="mr-1 h-4 w-4" />
              Select
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggle}
            className="text-sm"
          >
            {showWorkouts ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>
      
      {isSelectionMode && selectedWorkouts.length > 0 && (
        <div className="mb-4">
          <QuickActionBar 
            selectedWorkoutIds={selectedWorkouts}
            onClearSelection={() => setSelectedWorkouts([])}
            onActionComplete={handleActionComplete}
          />
        </div>
      )}
      
      {showWorkouts && (
        <WorkoutHistory 
          limit={5} 
          className="mt-2"
          selectionMode={isSelectionMode}
          selectedWorkouts={selectedWorkouts}
          onWorkoutSelected={handleWorkoutSelected} 
        />
      )}
      
      {isSelectionMode && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleSelectionMode}
            className="text-sm"
          >
            <X className="mr-1 h-4 w-4" />
            Exit Selection Mode
          </Button>
        </div>
      )}
    </section>
  );
};
