import { useState, useEffect } from 'react';
import { Storage } from '@/utils/storage';

/**
 * A hook that persists state in sessionStorage
 * @param key The key to store the value under in sessionStorage
 * @param initialValue The initial value to use if no value is found in sessionStorage
 * @returns A stateful value and a function to update it, like useState
 */
export function useSessionState<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize state from sessionStorage or use initialValue
  const [state, setState] = useState<T>(() => {
    try {
      // Try to get from sessionStorage
      const item = sessionStorage.getItem(key);
      // Parse stored json or return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from sessionStorage:", error);
      return initialValue;
    }
  });

  // Update sessionStorage when the state changes
  useEffect(() => {
    try {
      // If state is undefined, remove the item from sessionStorage
      if (state === undefined) {
        sessionStorage.removeItem(key);
      } else {
        // Otherwise, save to sessionStorage
        sessionStorage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.error("Error writing to sessionStorage:", error);
    }
  }, [key, state]);

  return [state, setState];
}

/**
 * A hook that persists form state in sessionStorage
 * @param key The key to store the value under in sessionStorage
 * @param initialValues The initial values to use if no value is found in sessionStorage
 * @returns The form state and functions to update and reset it
 */
export function useSessionForm<T extends Record<string, any>>(
  key: string,
  initialValues: T
) {
  const [formState, setFormState] = useSessionState<T>(key, initialValues);

  // Update a single field
  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Reset the form to initial values and clear from sessionStorage
  const resetForm = () => {
    setFormState(initialValues);
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from sessionStorage:", error);
    }
  };

  return {
    formState,
    updateField,
    setFormState,
    resetForm
  };
}
