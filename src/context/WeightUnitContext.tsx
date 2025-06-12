
import React, { createContext, useContext, useState } from 'react';

type WeightUnit = 'lbs' | 'kg';

interface WeightUnitContextType {
  unit: WeightUnit;
  weightUnit: WeightUnit; // Add alias for backward compatibility
  setUnit: (unit: WeightUnit) => void;
  setWeightUnit: (unit: WeightUnit) => void; // Add alias for backward compatibility
  isDefaultUnit: boolean;
}

const WeightUnitContext = createContext<WeightUnitContextType | undefined>(undefined);

export const WeightUnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unit, setUnit] = useState<WeightUnit>('lbs');

  const value: WeightUnitContextType = {
    unit,
    weightUnit: unit, // Alias
    setUnit,
    setWeightUnit: setUnit, // Alias
    isDefaultUnit: unit === 'lbs'
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
