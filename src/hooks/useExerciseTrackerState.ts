
import { useState, useCallback, useMemo } from 'react';

export interface ExerciseTrackerState {
  isCollapsed: boolean;
  editingField: { setIndex: number; field: string } | null;
  editValue: string;
  showDeleteConfirm: boolean;
}

export const useExerciseTrackerState = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingField, setEditingField] = useState<{ setIndex: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const startEditing = useCallback((setIndex: number, field: string, currentValue: string | number) => {
    console.log(`Starting edit for set ${setIndex}, field ${field}, value ${currentValue}`);
    setEditingField({ setIndex, field });
    setEditValue(currentValue.toString());
  }, []);

  const stopEditing = useCallback((save: boolean = true) => {
    console.log(`Stopping edit, save: ${save}, current value: ${editValue}`);
    
    if (!save || !editingField) {
      setEditingField(null);
      setEditValue('');
      return null;
    }

    const result = {
      setIndex: editingField.setIndex,
      field: editingField.field,
      value: editValue
    };

    setEditingField(null);
    setEditValue('');
    return result;
  }, [editingField, editValue]);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const toggleDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(prev => !prev);
  }, []);

  return {
    state: {
      isCollapsed,
      editingField,
      editValue,
      showDeleteConfirm
    },
    actions: {
      setEditValue,
      startEditing,
      stopEditing,
      toggleCollapsed,
      toggleDeleteConfirm,
      setShowDeleteConfirm
    }
  };
};
