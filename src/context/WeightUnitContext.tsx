
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WeightUnit } from "@/utils/unitConversion";
import { toast } from "@/components/ui/sonner";

interface WeightUnitContextType {
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
  saveWeightUnitPreference: () => Promise<void>;
  isDefaultUnit: boolean;
}

const WeightUnitContext = createContext<WeightUnitContextType | undefined>(undefined);

export const WeightUnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [defaultWeightUnit, setDefaultWeightUnit] = useState<WeightUnit>("kg");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's preferred weight unit from profile
  useEffect(() => {
    const fetchWeightUnitPreference = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("weight_unit")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        const userWeightUnit = data?.weight_unit as WeightUnit || "kg";
        setWeightUnit(userWeightUnit);
        setDefaultWeightUnit(userWeightUnit);
      } catch (error) {
        console.error("Error fetching weight unit preference:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeightUnitPreference();
  }, [user]);

  // Save weight unit preference to user profile
  const saveWeightUnitPreference = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ weight_unit: weightUnit })
        .eq("id", user.id);

      if (error) throw error;
      
      setDefaultWeightUnit(weightUnit);
      toast("Weight unit preference saved");
    } catch (error) {
      console.error("Error saving weight unit preference:", error);
      toast("Failed to save weight unit preference", {
        description: "Please try again",
      });
    }
  };

  return (
    <WeightUnitContext.Provider 
      value={{ 
        weightUnit, 
        setWeightUnit, 
        saveWeightUnitPreference,
        isDefaultUnit: weightUnit === defaultWeightUnit
      }}
    >
      {!isLoading && children}
    </WeightUnitContext.Provider>
  );
};

export const useWeightUnit = () => {
  const context = useContext(WeightUnitContext);
  if (context === undefined) {
    throw new Error("useWeightUnit must be used within a WeightUnitProvider");
  }
  return context;
};
