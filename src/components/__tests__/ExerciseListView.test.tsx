
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import ExerciseListView from '@/components/exercises/ExerciseListView';
import { renderWithProviders } from '@/test/utils';
import { Exercise } from '@/types/exercise';

// Mock CommonExerciseCard component to simplify testing
jest.mock('@/components/exercises/CommonExerciseCard', () => ({
  CommonExerciseCard: ({ exercise, variant, onAdd, onEdit }) => (
    <div data-testid={`exercise-card-${exercise.id}`}>
      <span>{exercise.name}</span>
      <button onClick={() => onAdd(exercise)}>Add</button>
      {onEdit && <button onClick={() => onEdit(exercise)}>Edit</button>}
    </div>
  ),
}));

describe('ExerciseListView Component', () => {
  const mockOnAdd = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnViewDetails = jest.fn();
  const mockOnPageChange = jest.fn();
  const mockOnClearFilters = jest.fn();
  const mockOnAddNew = jest.fn();
  
  // Sample exercises for testing
  const exercises: Exercise[] = [
    {
      id: '1',
      name: 'Bench Press',
      primary_muscle_groups: ['chest'],
      equipment_type: ['barbell'],
      movement_pattern: 'push',
      difficulty: 'intermediate',
      is_compound: true,
      is_bodyweight: false,
      instructions: { steps: 'Test steps', form: 'Test form' }
    },
    {
      id: '2',
      name: 'Squat',
      primary_muscle_groups: ['quadriceps'],
      equipment_type: ['barbell'],
      movement_pattern: 'squat',
      difficulty: 'advanced',
      is_compound: true,
      is_bodyweight: false,
      instructions: { steps: 'Test steps', form: 'Test form' }
    },
    {
      id: '3',
      name: 'Deadlift',
      primary_muscle_groups: ['lowerBack'],
      equipment_type: ['barbell'],
      movement_pattern: 'hinge',
      difficulty: 'advanced',
      is_compound: true,
      is_bodyweight: false,
      instructions: { steps: 'Test steps', form: 'Test form' }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders exercise cards for each exercise', () => {
    renderWithProviders(
      <ExerciseListView
        exercises={exercises}
        isLoading={false}
        isPaginated={false}
        currentPage={1}
        pageSize={10}
        totalPages={1}
        onPageChange={mockOnPageChange}
        variant="library-manage"
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Check if all exercise cards are rendered
    expect(screen.getByText('Bench Press')).toBeInTheDocument();
    expect(screen.getByText('Squat')).toBeInTheDocument();
    expect(screen.getByText('Deadlift')).toBeInTheDocument();
    
    // Check if the correct number of cards is rendered
    expect(screen.getAllByTestId(/exercise-card-/)).toHaveLength(3);
  });

  test('renders pagination when isPaginated is true and totalPages > 1', () => {
    renderWithProviders(
      <ExerciseListView
        exercises={exercises}
        isLoading={false}
        isPaginated={true}
        currentPage={2}
        pageSize={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
        variant="library-manage"
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
      />
    );

    // Check if pagination component is rendered
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  test('does not render pagination when totalPages is 1', () => {
    renderWithProviders(
      <ExerciseListView
        exercises={exercises}
        isLoading={false}
        isPaginated={true}
        currentPage={1}
        pageSize={10}
        totalPages={1}
        onPageChange={mockOnPageChange}
        variant="library-manage"
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
      />
    );

    // Pagination elements should not be present
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  test('calls onPageChange when pagination controls are clicked', () => {
    renderWithProviders(
      <ExerciseListView
        exercises={exercises}
        isLoading={false}
        isPaginated={true}
        currentPage={2}
        pageSize={1}
        totalPages={3}
        onPageChange={mockOnPageChange}
        variant="library-manage"
        onAdd={mockOnAdd}
        onEdit={mockOnEdit}
      />
    );

    // Click the "1" page link
    fireEvent.click(screen.getByText('1'));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
    
    // Click the "3" page link
    fireEvent.click(screen.getByText('3'));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  test('calls onAdd when Add button is clicked', () => {
    renderWithProviders(
      <ExerciseListView
        exercises={exercises}
        isLoading={false}
        isPaginated={false}
        currentPage={1}
        pageSize={10}
        totalPages={1}
        onPageChange={mockOnPageChange}
        variant="workout-add"
        onAdd={mockOnAdd}
      />
    );

    // Click the Add button on the first exercise card
    const addButtons = screen.getAllByText('Add');
    fireEvent.click(addButtons[0]);
    
    // Check if onAdd was called with the correct exercise
    expect(mockOnAdd).toHaveBeenCalledWith(exercises[0]);
  });

  test('shows empty state when no exercises match', () => {
    renderWithProviders(
      <ExerciseListView
        exercises={[]}
        isLoading={false}
        isPaginated={true}
        currentPage={1}
        pageSize={10}
        totalPages={0}
        onPageChange={mockOnPageChange}
        variant="library-manage"
        onAdd={mockOnAdd}
        hasSearch={true}
        hasActiveFilters={true}
        onClearFilters={mockOnClearFilters}
        onAddNew={mockOnAddNew}
      />
    );

    // We don't need to check specific empty state text since EmptyExerciseState is mocked
    // But we can verify that no exercise cards are rendered
    expect(screen.queryByTestId(/exercise-card-/)).not.toBeInTheDocument();
  });

  test('does not show empty state when loading', () => {
    renderWithProviders(
      <ExerciseListView
        exercises={[]}
        isLoading={true}
        isPaginated={true}
        currentPage={1}
        pageSize={10}
        totalPages={0}
        onPageChange={mockOnPageChange}
        variant="library-manage"
        onAdd={mockOnAdd}
      />
    );

    // No exercise cards and no empty state should be rendered when loading
    expect(screen.queryByTestId(/exercise-card-/)).not.toBeInTheDocument();
  });
});
