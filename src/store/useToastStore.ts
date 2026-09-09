import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  title?: string;
  duration?: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
  // Convenience methods
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (message, type = 'info', options) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          message,
          type,
          title: options?.title,
          duration: options?.duration ?? 4000,
        },
      ],
    }));
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  success: (message, options) => get().addToast(message, 'success', options),
  error: (message, options) => get().addToast(message, 'error', options),
  info: (message, options) => get().addToast(message, 'info', options),
  warning: (message, options) => get().addToast(message, 'warning', options),
}));

// Export a singleton helper for usage outside React components (e.g. inside API interceptors)
export const toast = {
  success: (message: string, options?: ToastOptions) =>
    useToastStore.getState().success(message, options),
  error: (message: string, options?: ToastOptions) =>
    useToastStore.getState().error(message, options),
  info: (message: string, options?: ToastOptions) =>
    useToastStore.getState().info(message, options),
  warning: (message: string, options?: ToastOptions) =>
    useToastStore.getState().warning(message, options),
};
