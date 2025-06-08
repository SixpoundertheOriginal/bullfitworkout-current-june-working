
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface PerformanceState {
  renderMetrics: {
    renderCount: number;
    renderTimes: number[];
    averageRenderTime: number;
  };
  memoryMetrics: {
    usedJSHeapSize?: number;
    memoryPressure?: string;
  };
  interactionMetrics: {
    interactionCount: number;
    slowInteractions: number;
  };
  isMonitoring: boolean;
}

interface PerformanceContextType {
  state: PerformanceState;
  dispatch: React.Dispatch<PerformanceAction>;
}

type PerformanceAction =
  | { type: 'UPDATE_RENDER_METRICS'; payload: { renderTime: number } }
  | { type: 'UPDATE_MEMORY_METRICS'; payload: { usedJSHeapSize: number; memoryPressure: string } }
  | { type: 'UPDATE_INTERACTION_METRICS'; payload: { duration: number; wasSuccessful: boolean } }
  | { type: 'TOGGLE_MONITORING'; payload: boolean }
  | { type: 'RESET_METRICS' };

const initialState: PerformanceState = {
  renderMetrics: {
    renderCount: 0,
    renderTimes: [],
    averageRenderTime: 0,
  },
  memoryMetrics: {},
  interactionMetrics: {
    interactionCount: 0,
    slowInteractions: 0,
  },
  isMonitoring: false,
};

function performanceReducer(state: PerformanceState, action: PerformanceAction): PerformanceState {
  switch (action.type) {
    case 'UPDATE_RENDER_METRICS': {
      const newRenderTimes = [...state.renderMetrics.renderTimes, action.payload.renderTime];
      if (newRenderTimes.length > 20) {
        newRenderTimes.splice(0, newRenderTimes.length - 20);
      }
      const averageRenderTime = newRenderTimes.reduce((a, b) => a + b, 0) / newRenderTimes.length;
      
      return {
        ...state,
        renderMetrics: {
          renderCount: state.renderMetrics.renderCount + 1,
          renderTimes: newRenderTimes,
          averageRenderTime,
        },
      };
    }
    case 'UPDATE_MEMORY_METRICS':
      return {
        ...state,
        memoryMetrics: action.payload,
      };
    case 'UPDATE_INTERACTION_METRICS':
      return {
        ...state,
        interactionMetrics: {
          interactionCount: state.interactionMetrics.interactionCount + 1,
          slowInteractions: action.payload.duration > 100 ? 
            state.interactionMetrics.slowInteractions + 1 : 
            state.interactionMetrics.slowInteractions,
        },
      };
    case 'TOGGLE_MONITORING':
      return {
        ...state,
        isMonitoring: action.payload,
      };
    case 'RESET_METRICS':
      return initialState;
    default:
      return state;
  }
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(performanceReducer, initialState);

  return (
    <PerformanceContext.Provider value={{ state, dispatch }}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformanceContext() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext must be used within PerformanceProvider');
  }
  return context;
}
