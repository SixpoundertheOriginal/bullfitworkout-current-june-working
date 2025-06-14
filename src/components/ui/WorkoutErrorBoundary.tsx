
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class WorkoutErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in workout section:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-lg text-center my-4 container mx-auto px-4">
          <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
          <p>We couldn’t load your workouts right now. Please try again later.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WorkoutErrorBoundary;
