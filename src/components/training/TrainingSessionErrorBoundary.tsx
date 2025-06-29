
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class TrainingSessionErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('[TrainingSessionErrorBoundary] Error caught:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[TrainingSessionErrorBoundary] Error details:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleRetry = () => {
    console.log('[TrainingSessionErrorBoundary] Retrying...');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    console.log('[TrainingSessionErrorBoundary] Going home...');
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <Card className="p-6 bg-gray-800 border-gray-700 max-w-md w-full">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
              <h2 className="text-xl font-semibold text-white">Training Session Error</h2>
              <p className="text-gray-400 text-center">
                Something went wrong while loading your training session.
              </p>
              
              {this.state.error && (
                <div className="bg-gray-900 p-3 rounded text-sm text-gray-300 w-full">
                  <strong>Error:</strong> {this.state.error.message}
                </div>
              )}
              
              <div className="flex gap-3 w-full">
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
