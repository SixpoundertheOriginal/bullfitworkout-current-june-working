
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/sonner';

interface AsyncOperationOptions {
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export function useAsyncOperation<T extends (...args: any[]) => Promise<any>>(
  operation: T,
  options: AsyncOperationOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred',
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await operation(...args);
        if (showSuccessToast) {
          toast(successMessage);
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        if (showErrorToast) {
          toast(errorMessage, {
            description: error.message,
            variant: "destructive"
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [operation, successMessage, errorMessage, showSuccessToast, showErrorToast]
  );

  return {
    execute,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
