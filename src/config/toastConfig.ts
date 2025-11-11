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
      ...options,
      autoClose: 3000,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      draggable: false
    });
  };

  toast.error = (message: any, options?: any) => {
    return originalError(message, {
      ...options,
      autoClose: 3000,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      draggable: false
    });
  };

  toast.info = (message: any, options?: any) => {
    return originalInfo(message, {
      ...options,
      autoClose: 3000,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      draggable: false
    });
  };

  toast.warning = (message: any, options?: any) => {
    return originalWarning(message, {
      ...options,
      autoClose: 3000,
      closeOnClick: false,
      pauseOnHover: false,
      pauseOnFocusLoss: false,
      draggable: false
    });
  };

  console.log('✅ Toast configuration globale appliquée: 3 secondes pour TOUS les toasts');
};
