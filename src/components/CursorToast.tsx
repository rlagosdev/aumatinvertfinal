import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface CursorToastProps {
  message: string;
  x: number;
  y: number;
  onComplete: () => void;
}

const CursorToast: React.FC<CursorToastProps> = ({ message, x, y, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Disparaître après 2 secondes
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Attendre la fin de l'animation avant de supprimer
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed z-[10000] pointer-events-none transition-all duration-300 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{
        left: `${x + 20}px`,
        top: `${y - 10}px`,
        transform: 'translateY(-50%)'
      }}
    >
      <div className="bg-white rounded-lg shadow-2xl px-4 py-3 flex items-center space-x-3 border-2 border-green-500">
        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
          {message}
        </span>
      </div>
    </div>
  );
};

export default CursorToast;
