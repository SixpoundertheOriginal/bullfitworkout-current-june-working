
import React from 'react';
import { screen, fireEvent, render } from '@testing-library/react';
import { StartTrainingButton } from '@/components/training/StartTrainingButton';
import { renderWithProviders } from '@/test/utils';
import { useNavigate } from 'react-router-dom';
import { useWorkoutState } from '@/hooks/useWorkoutState';

// Mock the hooks
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('@/hooks/useWorkoutState', () => ({
  useWorkoutState: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  }
}));

describe('StartTrainingButton', () => {
  const mockNavigate = jest.fn();
  const mockStartWorkout = jest.fn();
  const mockUpdateLastActiveRoute = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useWorkoutState as jest.Mock).mockReturnValue({
      startWorkout: mockStartWorkout,
      updateLastActiveRoute: mockUpdateLastActiveRoute,
    });
  });
  
  test('renders with default props', () => {
    renderWithProviders(<StartTrainingButton />);
    
    // Check if the button is rendered with default label
    expect(screen.getByText('Start Training')).toBeInTheDocument();
  });
  
  test('navigates with reset parameter when forceReset is true', () => {
    renderWithProviders(<StartTrainingButton forceReset={true} />);
    
    fireEvent.click(screen.getByText('Start Training'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/training-session?type=strength&reset=true', {
      state: { trainingType: 'strength' }
    });
  });
  
  test('starts workout normally when forceReset is false', () => {
    renderWithProviders(<StartTrainingButton forceReset={false} />);
    
    fireEvent.click(screen.getByText('Start Training'));
    
    expect(mockStartWorkout).toHaveBeenCalled();
    expect(mockUpdateLastActiveRoute).toHaveBeenCalledWith('/training-session');
    expect(mockNavigate).toHaveBeenCalledWith('/training-session?type=strength', {
      state: { trainingType: 'strength' }
    });
  });
  
  test('calls custom onClick handler when provided', () => {
    const mockOnClick = jest.fn();
    renderWithProviders(<StartTrainingButton onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByText('Start Training'));
    
    expect(mockOnClick).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockStartWorkout).not.toHaveBeenCalled();
  });
  
  test('renders with custom label', () => {
    renderWithProviders(<StartTrainingButton label="Custom Label" />);
    
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });
  
  test('uses custom training type', () => {
    renderWithProviders(<StartTrainingButton trainingType="cardio" />);
    
    fireEvent.click(screen.getByText('Start Training'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/training-session?type=cardio&reset=true', {
      state: { trainingType: 'cardio' }
    });
  });
});
