import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { requestNotificationPermission, saveFCMToken } from '../firebase/config';

// Variable globale pour persister l'état pendant la navigation (pas le rechargement)
let notificationBannerDismissedInMemory = false;

/**
 * Bannière de demande de permission pour les notifications
 * S'affiche uniquement sur la page d'accueil
 */
const NotificationTestButton: React.FC = () => {
  const location = useLocation();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [bannerDismissed, setBannerDismissed] = useState(notificationBannerDismissedInMemory);
  const [debugMessage, setDebugMessage] = useState<string>('');

  const handleRequestPermission = async () => {
    setStatus('loading');
    setDebugMessage('🔔 Démarrage...');

    try {
      console.log('🔔 Début de la demande de permission...');

      // Créer une fonction wrapper pour capturer les logs
      const requestWithLogging = async () => {
        setDebugMessage('🔔 1/4 Initialisation...');
        await new Promise(resolve => setTimeout(resolve, 100)); // Petit délai pour afficher le message

        const token = await requestNotificationPermission();

        return token;
      };

      // Ajouter un timeout de 15 secondes
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => {
          setDebugMessage('❌ Timeout (15s)');
          reject(new Error('Timeout: La demande a pris trop de temps'));
        }, 15000);
      });

      const fcmToken = await Promise.race([
        requestWithLogging(),
        timeoutPromise
      ]);

      if (fcmToken) {
        setStatus('success');
        setDebugMessage('✅ Succès!');
        console.log('🔑 FCM Token:', fcmToken);

        // Sauvegarder le token dans Supabase
        await saveFCMToken(fcmToken);

        // Masquer le bandeau après 3 secondes
        setTimeout(() => {
          setBannerDismissed(true);
          notificationBannerDismissedInMemory = true;
          setDebugMessage('');
        }, 3000);
      } else {
        console.warn('⚠️ Aucun token reçu');
        setDebugMessage('⚠️ Permission refusée. Rendez-vous sur /reset-notifications pour réinitialiser');
        setStatus('idle');

        // Rediriger automatiquement vers la page de reset après 3 secondes
        setTimeout(() => {
          window.location.href = '/reset-notifications';
        }, 3000);
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'activation des notifications:', error);
      setDebugMessage(`❌ Erreur: ${error.message || 'Inconnue'}`);
      setStatus('idle');
      setTimeout(() => setDebugMessage(''), 5000);
    }
  };

  const handleDismiss = () => {
    setBannerDismissed(true);
    // Sauvegarder l'état en mémoire pour persister pendant la navigation uniquement
    notificationBannerDismissedInMemory = true;
  };

  // N'afficher que sur la page d'accueil
  if (location.pathname !== '/') {
    return null;
  }

  // Ne pas afficher si le bandeau a été fermé
  if (bannerDismissed) {
    return null;
  }

  return (
    <>
      {/* Bannière */}
      <div
        className="fixed top-0 left-1/2 z-[9999] w-full max-w-2xl px-4 transition-transform duration-300 ease-in-out pointer-events-auto"
        style={{
          transform: 'translateX(-50%) translateY(1rem)',
        }}
      >
        <div
          className="text-white shadow-2xl rounded-b-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
          }}
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between gap-4">
              {/* Icône */}
              <div className="flex-shrink-0 bg-white/10 p-3 rounded-full backdrop-blur-sm">
                {status === 'success' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Bell className="w-6 h-6" />
                )}
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base md:text-lg leading-tight">
                  {status === 'success'
                    ? 'Notifications activées !'
                    : 'Restez informé des promotions'}
                </p>
                <p className="text-sm text-white/90 mt-1 leading-tight">
                  {debugMessage ? (
                    <span className="font-mono">{debugMessage}</span>
                  ) : status === 'success' ? (
                    'Vous recevrez nos dernières offres en temps réel'
                  ) : (
                    'Activez les notifications pour ne rien manquer'
                  )}
                </p>
              </div>

              {/* Boutons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {status !== 'success' && (
                  <button
                    onClick={handleRequestPermission}
                    disabled={status === 'loading'}
                    className="flex items-center gap-2 bg-white text-green-600 px-4 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap text-sm md:text-base disabled:opacity-50 disabled:cursor-wait"
                  >
                    {status === 'loading' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-green-600 border-t-transparent"></div>
                        <span className="hidden sm:inline">Activation...</span>
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden sm:inline">Activer</span>
                      </>
                    )}
                  </button>
                )}

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
};

export default NotificationTestButton;
