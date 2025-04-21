
import React from 'react';
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { getSectionHeadingClasses } from '@/lib/theme';

interface WorkoutLogSectionProps {
  showWorkouts: boolean;
  onToggle: () => void;
}

export const WorkoutLogSection = ({ showWorkouts, onToggle }: WorkoutLogSectionProps) => {
  return (
    <section className="animate-fade-in" style={{ animationDelay: '500ms' }}>
      <div className="flex justify-between items-center mb-4">
        <div className={getSectionHeadingClasses(true)}>
          <BarChart3 className="text-purple-400" size={20} />
          <h2 className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Workout Log
          </h2>
        </div>
        <Button 
          onClick={onToggle} 
          variant="outline" 
          className="text-sm bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
        >
          {showWorkouts ? "Hide" : "Show"}
        </Button>
      </div>

      {showWorkouts && (
        <WorkoutHistory limit={5} className="mt-2" />
      )}
    </section>
  );
};
