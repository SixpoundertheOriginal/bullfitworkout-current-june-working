
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WorkoutErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in workout section:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-6 rounded-lg text-center my-4 container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-400" />
            <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
            <p className="text-red-200/80 mb-4">
              We couldn't load your workouts right now. This might be a temporary issue.
            </p>
            {this.state.error && (
              <details className="text-xs text-red-300/60 mb-4">
                <summary className="cursor-pointer">Error details</summary>
                <pre className="mt-2 text-left">{this.state.error.message}</pre>
              </details>
            )}
            <div className="flex gap-3">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="border-red-500/50 text-red-200 hover:bg-red-500/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-red-500/50 text-red-200 hover:bg-red-500/20"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WorkoutErrorBoundary;
