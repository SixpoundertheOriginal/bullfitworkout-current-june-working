
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WeightUnit } from "@/utils/unitConversion";
import { toast } from "@/hooks/use-toast";
import { createContext } from "@/utils/createContext";
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

// Cache constants
const CACHE_KEY = 'bullfit_weight_unit_preference';
const CACHE_EXPIRY_KEY = 'bullfit_weight_unit_expiry';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const WeightUnitContextProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const { user } = useAuth();
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [defaultWeightUnit, setDefaultWeightUnit] = useState<WeightUnit>("kg");
  const [isLoading, setIsLoading] = useState(true);

  // Check cache first before making API calls
  const getCachedWeightUnit = useCallback((): WeightUnit | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const expiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      
      if (cached && expiry && Date.now() < parseInt(expiry)) {
        return cached as WeightUnit;
      }
    } catch (error) {
      // Ignore cache errors
    }
    return null;
  }, []);

  // Cache weight unit preference
  const setCachedWeightUnit = useCallback((unit: WeightUnit) => {
    try {
      localStorage.setItem(CACHE_KEY, unit);
      localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (error) {
      // Ignore cache errors
    }
  }, []);

  // Fetch user's preferred weight unit from profile with caching
  useEffect(() => {
    const fetchWeightUnitPreference = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Check cache first
      const cachedUnit = getCachedWeightUnit();
      if (cachedUnit) {
        setWeightUnit(cachedUnit);
        setDefaultWeightUnit(cachedUnit);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("weight_unit")
          .eq("id", user.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching weight unit preference:", error);
          setIsLoading(false);
          return;
        }

        const userWeightUnit = data?.weight_unit as WeightUnit || "kg";
        setWeightUnit(userWeightUnit);
        setDefaultWeightUnit(userWeightUnit);
        
        // Cache the result
        setCachedWeightUnit(userWeightUnit);
        
      } catch (error) {
        console.error("Error fetching weight unit preference:", error);
        setWeightUnit("kg");
        setDefaultWeightUnit("kg");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeightUnitPreference();
  }, [user, getCachedWeightUnit, setCachedWeightUnit]);

  const saveWeightUnitPreference = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert({ 
          id: user.id, 
          weight_unit: weightUnit 
        });

      if (error) throw error;
      
      setDefaultWeightUnit(weightUnit);
      setCachedWeightUnit(weightUnit);
      
      toast({ 
        title: "Success",
        description: "Weight unit preference saved" 
      });
      
    } catch (error) {
      console.error("Error saving weight unit preference:", error);
      toast({
        title: "Failed to save weight unit preference",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [user, weightUnit, setCachedWeightUnit]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    weightUnit, 
    setWeightUnit, 
    saveWeightUnitPreference,
    isDefaultUnit: weightUnit === defaultWeightUnit,
    isLoading
  }), [weightUnit, setWeightUnit, saveWeightUnitPreference, defaultWeightUnit, isLoading]);

  return (
    <WeightUnitProvider value={contextValue}>
      {!isLoading && children}
    </WeightUnitProvider>
  );
};
