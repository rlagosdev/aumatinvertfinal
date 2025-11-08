import { useEffect, useState } from 'react';

/**
 * Hook pour gérer la PWA (Service Worker + Installation)
 */
export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      console.log('✅ App déjà installée (mode standalone)');
    }

    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('📱 App peut être installée');
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('✅ App installée avec succès');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Enregistrer le Service Worker
   */
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      setSwRegistration(registration);
      console.log('✅ Service Worker enregistré:', registration.scope);

      // Vérifier les mises à jour toutes les heures
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      // Gérer les mises à jour du Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 Nouvelle version disponible');

              // Optionnel: Afficher une notification à l'utilisateur
              // pour qu'il recharge la page
              if (window.confirm('Une nouvelle version est disponible. Recharger ?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });

      // Recharger quand le nouveau SW prend le contrôle
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    } catch (error) {
      console.error('❌ Erreur Service Worker:', error);
    }
  };

  /**
   * Installer l'application (afficher le prompt)
   */
  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn('⚠️ Prompt d\'installation non disponible');
      return false;
    }

    // Afficher le prompt d'installation
    deferredPrompt.prompt();

    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`📱 Choix utilisateur: ${outcome}`);

    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
      return true;
    }

    return false;
  };

  /**
   * Désinstaller (vider les caches)
   */
  const uninstallApp = async () => {
    if (swRegistration) {
      await swRegistration.unregister();
      console.log('🗑️ Service Worker désenregistré');
    }

    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('🗑️ Caches supprimés');

    window.location.reload();
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
    uninstallApp,
    swRegistration
  };
};
