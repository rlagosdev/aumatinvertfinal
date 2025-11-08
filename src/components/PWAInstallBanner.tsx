import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Variable globale pour persister l'état pendant la navigation (pas le rechargement)
let pwaBannerDismissedInMemory = false;

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(pwaBannerDismissedInMemory);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Vérifier si l'app a été installée
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Afficher la boîte de dialogue d'installation
    await deferredPrompt.prompt();

    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installée');
      setIsInstalled(true);
    }

    // Réinitialiser le prompt
    setDeferredPrompt(null);
    setBannerDismissed(false);
  };

  const handleDismiss = () => {
    setBannerDismissed(true);
    // Sauvegarder l'état en mémoire pour persister pendant la navigation uniquement
    pwaBannerDismissedInMemory = true;
  };

  // Ne pas afficher si l'app est installée ou pas de prompt disponible
  if (isInstalled || !deferredPrompt) {
    return null;
  }

  // Ne pas afficher si le bandeau a été fermé
  if (bannerDismissed) {
    return null;
  }

  return (
    <>
      {/* Bandeau PWA */}
      <div
        className="fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out pointer-events-auto"
        style={{
          zIndex: 9999,
          transform: 'translateY(0)',
        }}
      >

      {/* Contenu du bandeau */}
      <div
        className="text-white shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Icône */}
            <div className="flex-shrink-0 bg-white/10 p-3 rounded-full backdrop-blur-sm">
              <Smartphone className="w-6 h-6" />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base md:text-lg leading-tight">
                Télécharger l'application de l'épicerie Au Matin Vert
              </p>
              <p className="text-sm text-white/90 mt-1 leading-tight">
                Recevez en premier les promos et informations du magasin
              </p>
            </div>

            {/* Boutons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 bg-white text-site-primary px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap text-sm md:text-base"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5" />
                <span className="hidden sm:inline">Installer</span>
              </button>

              <button
                onClick={handleDismiss}
                className="p-2 md:p-2.5 hover:bg-white/10 rounded-full transition-colors duration-200"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
