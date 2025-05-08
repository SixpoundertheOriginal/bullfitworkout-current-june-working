
import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { ExerciseDialog } from '@/components/exercises/ExerciseDialog';
import { renderWithProviders } from '@/test/utils';
import { Exercise } from '@/types/exercise';

// Mock for useSessionForm hook
jest.mock('@/hooks/useSessionState', () => ({
  useSessionForm: jest.fn((id, defaultState) => {
    const [state, setState] = React.useState(defaultState);
    return {
      formState: state,
      setFormState: setState,
      resetForm: () => setState(defaultState)
    };
  })
}));

describe('ExerciseDialog Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnOpenChange = jest.fn();

  const testExercise: Exercise = {
    id: 'test-id',
    name: 'Test Exercise',
    description: 'Test description',
    primary_muscle_groups: ['chest', 'shoulders'],
    secondary_muscle_groups: ['triceps'],
    equipment_type: ['barbell'],
    movement_pattern: 'push',
    difficulty: 'intermediate',
    is_compound: true,
    instructions: {
      steps: 'Test steps',
      form: 'Test form'
    }
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnOpenChange.mockClear();
  });

  test('renders in add mode with empty form', () => {
    renderWithProviders(
      <ExerciseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        mode="add"
        loading={false}
      />
    );

    expect(screen.getByText('Add Exercise')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  test('renders in edit mode with populated form', () => {
    renderWithProviders(
      <ExerciseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        initialExercise={testExercise}
        mode="edit"
        loading={false}
      />
    );

    expect(screen.getByText('Edit Exercise')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Exercise')).toBeInTheDocument();
  });

  test('shows validation error when form is submitted without required fields', async () => {
    renderWithProviders(
      <ExerciseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        mode="add"
        loading={false}
      />
    );

    // Try to submit the form without filling required fields
    fireEvent.click(screen.getByText('Add'));

    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText('Exercise name is required')).toBeInTheDocument();
    });

    // Verify onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('calls onSubmit when form is valid and submitted', async () => {
    renderWithProviders(
      <ExerciseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        initialExercise={{
          name: 'Test Exercise',
          primary_muscle_groups: ['chest'],
          equipment_type: ['barbell']
        }}
        mode="edit"
        loading={false}
      />
    );

    // Submit the form
    fireEvent.click(screen.getByText('Save'));

    // Verify onSubmit was called
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  test('shows loading state when submitting', () => {
    renderWithProviders(
      <ExerciseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        mode="add"
        loading={true}
      />
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('Saving...')).toBeDisabled();
  });

  test('changes tabs when tab triggers are clicked', async () => {
    renderWithProviders(
      <ExerciseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        mode="add"
        loading={false}
      />
    );

    // Initially on Basic tab
    expect(screen.getByLabelText('Exercise Name*')).toBeInTheDocument();

    // Click on Advanced tab
    fireEvent.click(screen.getByRole('tab', { name: 'Advanced' }));
    await waitFor(() => {
      expect(screen.getByText('Compound Exercise')).toBeInTheDocument();
    });

    // Click on Instructions tab
    fireEvent.click(screen.getByRole('tab', { name: 'Instructions' }));
    await waitFor(() => {
      expect(screen.getByLabelText('Execution Steps')).toBeInTheDocument();
      expect(screen.getByLabelText('Form Cues')).toBeInTheDocument();
    });
  });

  test('closes the dialog when Cancel is clicked', () => {
    renderWithProviders(
      <ExerciseDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onSubmit={mockOnSubmit}
        mode="add"
        loading={false}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
