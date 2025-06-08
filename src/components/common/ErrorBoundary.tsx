
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorTracking } from '@/services/errorTracking';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { componentName, onError } = this.props;
    
    console.error(`[ErrorBoundary] Error caught in ${componentName || 'Unknown'}:`, error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Track error with context
    errorTracking.reportCrashAnalytics({
      error,
      errorBoundary: componentName || 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
      context: {
        component: componentName,
        userAction: 'component_error',
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    });

    // Custom error handler
    onError?.(error, errorInfo);

    // Dispatch event for global error handling
    window.dispatchEvent(new CustomEvent('react-error-boundary', {
      detail: {
        error,
        errorInfo,
        component: componentName,
        errorBoundary: 'ErrorBoundary'
      }
    }));
  }

  private handleRetry = () => {
    const { retryCount } = this.state;
    
    if (retryCount < this.maxRetries) {
      console.log(`[ErrorBoundary] Retrying... (${retryCount + 1}/${this.maxRetries})`);
      
      errorTracking.trackUserFlow('error_recovery', 'retry_attempt', true, {
        retryCount: retryCount + 1,
        component: this.props.componentName
      });

      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1
      });
    }
  };

  private handleGoHome = () => {
    errorTracking.trackUserFlow('error_recovery', 'navigate_home', true, {
      component: this.props.componentName
    });
    
    window.location.href = '/';
  };

  private handleReload = () => {
    errorTracking.trackUserFlow('error_recovery', 'page_reload', true, {
      component: this.props.componentName
    });
    
    window.location.reload();
  };

  public render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback, showErrorDetails = false, componentName } = this.props;

    if (hasError && error) {
      // Custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
            <div className="mb-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-muted-foreground mb-4">
                We're sorry, but something unexpected happened. Don't worry, your data is safe.
              </p>
            </div>

            {showErrorDetails && (
              <div className="mb-4 p-3 bg-muted rounded text-left">
                <details>
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details
                  </summary>
                  <div className="text-sm font-mono text-muted-foreground">
                    <p className="mb-2">
                      <strong>Component:</strong> {componentName || 'Unknown'}
                    </p>
                    <p className="mb-2">
                      <strong>Error:</strong> {error.name}
                    </p>
                    <p className="mb-2">
                      <strong>Message:</strong> {error.message}
                    </p>
                    {errorInfo?.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 text-xs overflow-auto">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            <div className="space-y-3">
              {retryCount < this.maxRetries && (
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again ({this.maxRetries - retryCount} attempts left)
                </Button>
              )}
              
              <Button 
                onClick={this.handleGoHome}
                className="w-full"
                variant="outline"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              
              <Button 
                onClick={this.handleReload}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
            </div>

            <div className="mt-4 text-xs text-muted-foreground">
              Error ID: {Date.now().toString(36)}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

// HOC for automatic error boundary wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const componentName = Component.displayName || Component.name || 'UnknownComponent';
    
    return (
      <ErrorBoundary 
        componentName={componentName}
        {...errorBoundaryProps}
      >
        <Component {...props} ref={ref} />
      </ErrorBoundary>
    );
  });

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}
