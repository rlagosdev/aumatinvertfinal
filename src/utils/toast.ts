import { toast as toastify, ToastOptions } from 'react-toastify';

// Configuration par défaut pour TOUS les toasts de l'application
const defaultOptions: ToastOptions = {
  autoClose: 3000, // 3 secondes exactement
  closeOnClick: false,
  pauseOnHover: false,
  pauseOnFocusLoss: false,
  draggable: false,
};

// Wrapper personnalisé qui force les options par défaut
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return toastify.success(message, { ...defaultOptions, ...options });
  },
  error: (message: string, options?: ToastOptions) => {
    return toastify.error(message, { ...defaultOptions, ...options });
  },
  info: (message: string, options?: ToastOptions) => {
    return toastify.info(message, { ...defaultOptions, ...options });
  },
  warning: (message: string, options?: ToastOptions) => {
    return toastify.warning(message, { ...defaultOptions, ...options });
  },
};
