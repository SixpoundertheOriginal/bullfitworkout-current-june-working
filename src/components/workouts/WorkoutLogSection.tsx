
import React from 'react';
import { BarChart3 } from "lucide-react";
import { WorkoutHistory } from "@/components/WorkoutHistory";

interface WorkoutLogSectionProps {
  showWorkouts: boolean;
  onToggle: () => void;
}

export const WorkoutLogSection = ({ showWorkouts, onToggle }: WorkoutLogSectionProps) => {
  return (
    <section className="animate-fade-in" style={{ animationDelay: '500ms' }}>
      {showWorkouts && (
        <WorkoutHistory limit={5} className="mt-2" />
      )}
    </section>
  );
};
