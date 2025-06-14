
import React, { createContext, useContext, useState, useEffect } from 'react';
import { WeightUnit } from '@/types/exercise';

interface WeightUnitContextType {
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
  isDefaultUnit: (unit: WeightUnit) => boolean;
}

const WeightUnitContext = createContext<WeightUnitContextType | undefined>(undefined);

export const WeightUnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weightUnit, setWeightUnitState] = useState<WeightUnit>('lb');

  const setWeightUnit = (unit: WeightUnit) => {
    setWeightUnitState(unit);
    localStorage.setItem('preferredWeightUnit', unit);
  };

  const isDefaultUnit = (unit: WeightUnit) => {
    return unit === 'lb'; // Default to lb
  };

  useEffect(() => {
    const stored = localStorage.getItem('preferredWeightUnit') as WeightUnit;
    if (stored && (stored === 'kg' || stored === 'lb')) {
      setWeightUnitState(stored);
    }
  }, []);

  const value = {
    weightUnit,
    setWeightUnit,
    isDefaultUnit,
  };

  return (
    <WeightUnitContext.Provider value={value}>
      {children}
    </WeightUnitContext.Provider>
  );
};

export const useWeightUnit = () => {
  const context = useContext(WeightUnitContext);
  if (!context) {
    throw new Error('useWeightUnit must be used within a WeightUnitProvider');
  }
  return context;
};
