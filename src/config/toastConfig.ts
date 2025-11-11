import { toast } from 'react-toastify';

// Configuration globale forcée pour TOUS les toasts
export const configureToast = () => {
  // Surcharger la méthode toast pour forcer autoClose à 3000ms
  const originalSuccess = toast.success;
  const originalError = toast.error;
  const originalInfo = toast.info;
  const originalWarning = toast.warning;

  toast.success = (message: any, options?: any) => {
    return originalSuccess(message, {
      autoClose: 3000,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      draggable: false,
      ...options
    });
  };

  toast.error = (message: any, options?: any) => {
    return originalError(message, {
      autoClose: 3000,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      draggable: false,
      ...options
    });
  };

  toast.info = (message: any, options?: any) => {
    return originalInfo(message, {
      autoClose: 3000,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      draggable: false,
      ...options
    });
  };

  toast.warning = (message: any, options?: any) => {
    return originalWarning(message, {
      autoClose: 3000,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      draggable: false,
      ...options
    });
  };

  console.log('✅ Toast configuration globale appliquée: 3 secondes pour TOUS les toasts');
};
