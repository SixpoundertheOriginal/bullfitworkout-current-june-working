
import { useState, useEffect } from "react";
import { trainingTypes } from "@/constants/trainingTypes";
import { TrainingType } from "@/types/training";

export const useCustomTrainingTypes = () => {
  const [customTrainingTypes, setCustomTrainingTypes] = useState<TrainingType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load custom training types from local storage on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      const savedTypes = localStorage.getItem("customTrainingTypes");
      if (savedTypes) {
        setCustomTrainingTypes(JSON.parse(savedTypes));
      } else {
        // Initialize with default training types if none are saved
        setCustomTrainingTypes(trainingTypes);
      }
    } catch (error) {
      console.error("Error loading custom training types:", error);
      setCustomTrainingTypes(trainingTypes);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Save custom training types to local storage when updated
  useEffect(() => {
    if (customTrainingTypes.length > 0) {
      localStorage.setItem("customTrainingTypes", JSON.stringify(customTrainingTypes));
    }
  }, [customTrainingTypes]);
  
  const addCustomTrainingType = (newType: Omit<TrainingType, "id">) => {
    const newTypeWithId: TrainingType = {
      ...newType,
      id: `custom-${Date.now()}`,
      isCustom: true
    };
    
    setCustomTrainingTypes(prev => [...prev, newTypeWithId]);
    return newTypeWithId;
  };
  
  const updateCustomTrainingType = (id: string, updates: Partial<TrainingType>) => {
    setCustomTrainingTypes(prev => 
      prev.map(type => type.id === id ? { ...type, ...updates } : type)
    );
  };
  
  const removeCustomTrainingType = (id: string) => {
    setCustomTrainingTypes(prev => 
      prev.filter(type => type.id !== id)
    );
  };
  
  return {
    customTrainingTypes,
    isLoading,
    addCustomTrainingType,
    updateCustomTrainingType,
    removeCustomTrainingType
  };
};
