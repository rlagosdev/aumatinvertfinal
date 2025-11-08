import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import CursorToast from '../components/CursorToast';

interface ToastData {
  id: string;
  message: string;
  x: number;
  y: number;
}

interface CursorToastContextType {
  showToast: (message: string, x: number, y: number) => void;
}

const CursorToastContext = createContext<CursorToastContextType | undefined>(undefined);

export const useCursorToast = () => {
  const context = useContext(CursorToastContext);
  if (!context) {
    throw new Error('useCursorToast must be used within a CursorToastProvider');
  }
  return context;
};

interface CursorToastProviderProps {
  children: ReactNode;
}

export const CursorToastProvider: React.FC<CursorToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, x: number, y: number) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, x, y }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <CursorToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <CursorToast
          key={toast.id}
          message={toast.message}
          x={toast.x}
          y={toast.y}
          onComplete={() => removeToast(toast.id)}
        />
      ))}
    </CursorToastContext.Provider>
  );
};
