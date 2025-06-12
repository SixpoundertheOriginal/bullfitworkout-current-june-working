
import { useState, useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

interface ToastReturn {
  id: string;
  dismiss: () => void;
}

interface UseToastReturn {
  toast: ((options: ToastOptions) => ToastReturn) & {
    success: (options: Omit<ToastOptions, 'variant'>) => ToastReturn;
    error: (options: Omit<ToastOptions, 'variant'>) => ToastReturn;
    info: (options: Omit<ToastOptions, 'variant'>) => ToastReturn;
  };
  toasts: Toast[];
  dismiss: (toastId: string) => void;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const baseToast = useCallback((options: ToastOptions): ToastReturn => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      ...options,
      duration: options.duration || 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, newToast.duration);

    return {
      id,
      dismiss: () => setToasts((prev) => prev.filter((t) => t.id !== id)),
    };
  }, []);

  const toast = Object.assign(baseToast, {
    success: (options: Omit<ToastOptions, 'variant'>) => baseToast({ ...options, variant: 'default' }),
    error: (options: Omit<ToastOptions, 'variant'>) => baseToast({ ...options, variant: 'destructive' }),
    info: (options: Omit<ToastOptions, 'variant'>) => baseToast({ ...options, variant: 'default' })
  });

  return {
    toast,
    toasts,
    dismiss: (toastId: string) =>
      setToasts((prev) => prev.filter((t) => t.id !== toastId)),
  };
};
