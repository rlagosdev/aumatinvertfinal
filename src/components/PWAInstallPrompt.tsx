import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

/**
 * Bannière d'installation PWA
 * S'affiche automatiquement quand l'app peut être installée
 */
const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fermé la bannière
    const dismissed = localStorage.getItem('pwa-install-dismissed');

    if (!dismissed && isInstallable && !isInstalled) {
      // Afficher après un délai de 3 secondes
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleInstall = async () => {
    const success = await installApp();

    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Ne rien afficher si déjà installé ou pas visible
  if (!isVisible || isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Bannière fixe en bas */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-2xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Icône */}
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-8 h-8" />
                </div>
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-1">
                  Installer Au Matin Vert
                </h3>
                <p className="text-sm text-white/90">
                  Accédez rapidement à nos produits depuis votre écran d'accueil
                </p>
              </div>

              {/* Boutons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-all shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  <span className="hidden sm:inline">Installer</span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Style pour l'animation */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

/**
 * Indicateur de statut PWA (pour debug / admin)
 */
export const PWAStatus: React.FC = () => {
  const { isInstalled, isInstallable } = usePWA();

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">App installée</span>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
        <Download className="w-4 h-4" />
        <span className="font-medium">Installation disponible</span>
      </div>
    );
  }

  return null;
};

export default PWAInstallPrompt;
