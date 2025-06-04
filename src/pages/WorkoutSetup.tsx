
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { WorkoutTypeSelectionPage } from "./workout-setup/WorkoutTypeSelectionPage";
import { FitnessLevelSelectionPage } from "./workout-setup/FitnessLevelSelectionPage";
import { WorkoutCustomizationPage } from "./workout-setup/WorkoutCustomizationPage";
import { ExerciseSelectionPage } from "./workout-setup/ExerciseSelectionPage";
import { WorkoutSummaryPage } from "./workout-setup/WorkoutSummaryPage";
import { WorkoutSetupProvider } from "@/context/WorkoutSetupContext";

export const WorkoutSetup = () => {
  return (
    <WorkoutSetupProvider>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Navigate to="/workout-setup/type" replace />} />
          <Route path="/type" element={<WorkoutTypeSelectionPage />} />
          <Route path="/fitness-level" element={<FitnessLevelSelectionPage />} />
          <Route path="/customize" element={<WorkoutCustomizationPage />} />
          <Route path="/exercises" element={<ExerciseSelectionPage />} />
          <Route path="/summary" element={<WorkoutSummaryPage />} />
        </Routes>
      </div>
    </WorkoutSetupProvider>
  );
};
