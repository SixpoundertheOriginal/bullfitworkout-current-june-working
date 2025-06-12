
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

// Global toast state for standalone usage
let globalToasts: Toast[] = [];
let globalListeners: Array<(toasts: Toast[]) => void> = [];

const notifyListeners = () => {
  globalListeners.forEach(listener => listener(globalToasts));
};

const addToast = (options: ToastOptions): ToastReturn => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: Toast = {
    id,
    ...options,
    duration: options.duration || 5000,
  };

  globalToasts = [...globalToasts, newToast];
  notifyListeners();

  // Auto remove toast after duration
  setTimeout(() => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    notifyListeners();
  }, newToast.duration);

  return {
    id,
    dismiss: () => {
      globalToasts = globalToasts.filter((t) => t.id !== id);
      notifyListeners();
    },
  };
};

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts);

  const baseToast = useCallback((options: ToastOptions): ToastReturn => {
    return addToast(options);
  }, []);

  // Subscribe to global toast changes
  useCallback(() => {
    const listener = (newToasts: Toast[]) => setToasts(newToasts);
    globalListeners.push(listener);
    
    return () => {
      globalListeners = globalListeners.filter(l => l !== listener);
    };
  }, [])();

  const toast = Object.assign(baseToast, {
    success: (options: Omit<ToastOptions, 'variant'>) => baseToast({ ...options, variant: 'default' }),
    error: (options: Omit<ToastOptions, 'variant'>) => baseToast({ ...options, variant: 'destructive' }),
    info: (options: Omit<ToastOptions, 'variant'>) => baseToast({ ...options, variant: 'default' })
  });

  return {
    toast,
    toasts,
    dismiss: (toastId: string) => {
      globalToasts = globalToasts.filter((t) => t.id !== toastId);
      notifyListeners();
    },
  };
};

// Standalone toast function for direct imports
export const toast = Object.assign(addToast, {
  success: (options: Omit<ToastOptions, 'variant'>) => addToast({ ...options, variant: 'default' }),
  error: (options: Omit<ToastOptions, 'variant'>) => addToast({ ...options, variant: 'destructive' }),
  info: (options: Omit<ToastOptions, 'variant'>) => addToast({ ...options, variant: 'default' })
});
