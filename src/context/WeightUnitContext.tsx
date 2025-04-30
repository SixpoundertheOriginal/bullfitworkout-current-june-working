
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WeightUnit } from "@/utils/unitConversion";
import { toast } from "@/hooks/use-toast";
import { createContext } from "@/utils/createContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { useAuth } from "./AuthContext";

interface WeightUnitContextType {
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
  saveWeightUnitPreference: () => Promise<void>;
  isDefaultUnit: boolean;
  isLoading: boolean;
}

const [WeightUnitProvider, useWeightUnit] = createContext<WeightUnitContextType>();

export { useWeightUnit, WeightUnitProvider };

export const WeightUnitContextProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { user } = useAuth();
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [defaultWeightUnit, setDefaultWeightUnit] = useState<WeightUnit>("kg");
  const { isLoading, withLoading } = useLoadingState(true);

  // Fetch user's preferred weight unit from profile
  useEffect(() => {
    const fetchWeightUnitPreference = async () => {
      if (!user) {
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
      }
    };

    withLoading(fetchWeightUnitPreference());
  }, [user, withLoading]);

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
      toast({
        title: "Failed to save weight unit preference",
        description: "Please try again"
      });
    }
  };

  return (
    <WeightUnitProvider 
      value={{ 
        weightUnit, 
        setWeightUnit, 
        saveWeightUnitPreference,
        isDefaultUnit: weightUnit === defaultWeightUnit,
        isLoading
      }}
    >
      {!isLoading && children}
    </WeightUnitProvider>
  );
};
