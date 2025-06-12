
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

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: ToastOptions) => {
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

  return {
    toast,
    toasts,
    dismiss: (toastId: string) =>
      setToasts((prev) => prev.filter((t) => t.id !== toastId)),
  };
};

// Create a singleton instance for the toast function
const { toast } = useToast();

export { toast };
