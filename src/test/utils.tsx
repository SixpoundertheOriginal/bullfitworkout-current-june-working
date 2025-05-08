
import { render } from '@testing-library/react';
import { ReactNode } from 'react';
import { ExerciseFiltersProvider } from '@/context/ExerciseFilterContext';
import { WorkoutNavigationContextProvider } from '@/context/WorkoutNavigationContext';
import { BrowserRouter } from 'react-router-dom';

// Export a helper function that wraps components with all necessary providers
export function renderWithProviders(ui: ReactNode) {
  return render(
    <BrowserRouter>
      <WorkoutNavigationContextProvider>
        <ExerciseFiltersProvider>{ui}</ExerciseFiltersProvider>
        {/* include other providers similarly */}
      </WorkoutNavigationContextProvider>
    </BrowserRouter>
  );
}
