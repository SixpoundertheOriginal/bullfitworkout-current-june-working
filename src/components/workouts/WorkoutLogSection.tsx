
import React from 'react';
import { BarChart3 } from "lucide-react";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { Button } from "@/components/ui/button";

interface WorkoutLogSectionProps {
  showWorkouts: boolean;
  onToggle: () => void;
}

export const WorkoutLogSection = ({ showWorkouts, onToggle }: WorkoutLogSectionProps) => {
  return (
    <section className="animate-fade-in" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary" />
          <h2 className="text-lg font-semibold">Recent Workouts</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggle}
          className="text-sm"
        >
          {showWorkouts ? 'Hide' : 'Show'}
        </Button>
      </div>
      
      {showWorkouts && (
        <WorkoutHistory limit={5} className="mt-2" />
      )}
    </section>
  );
};
