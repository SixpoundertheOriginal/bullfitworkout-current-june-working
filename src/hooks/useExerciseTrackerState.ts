
import { useState, useCallback, useMemo } from 'react';

export interface ExerciseTrackerState {
  isCollapsed: boolean;
  editingField: { setId: number; field: string } | null;
  editValue: string;
  showDeleteConfirm: boolean;
}

export const useExerciseTrackerState = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingField, setEditingField] = useState<{ setId: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const startEditing = useCallback((setId: number, field: string, currentValue: string | number) => {
    setEditingField({ setId, field });
    setEditValue(currentValue.toString());
  }, []);

  const stopEditing = useCallback((save: boolean = true) => {
    if (!save) {
      setEditingField(null);
      setEditValue('');
      return null;
    }

    const result = editingField ? {
      setId: editingField.setId,
      field: editingField.field,
      value: editValue
    } : null;

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
