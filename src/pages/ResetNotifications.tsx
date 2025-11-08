import React, { useState, useEffect } from 'react';
import { Bell, RefreshCw, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { requestNotificationPermission, saveFCMToken } from '../firebase/config';

const ResetNotifications: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'resetting' | 'registering' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [serviceWorkers, setServiceWorkers] = useState<ServiceWorkerRegistration[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    // Vérifier la permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Lister tous les service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      setServiceWorkers(registrations);
      setMessage(`${registrations.length} service worker(s) trouvé(s)`);
    }
  };

  const resetEverything = async () => {
    setStatus('resetting');
    setMessage('Désenregistrement des service workers...');

    try {
      // 1. Désenregistrer TOUS les service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();

        for (const registration of registrations) {
          await registration.unregister();
          console.log('✅ Service worker désenregistré:', registration.scope);
        }

        setMessage(`✅ ${registrations.length} service worker(s) désenregistré(s)`);
      }

      // 2. Vider le cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          console.log('✅ Cache supprimé:', cacheName);
        }
        setMessage(`✅ ${cacheNames.length} cache(s) supprimé(s)`);
      }

      // 3. Supprimer les données localStorage liées à Firebase
      localStorage.removeItem('fcm_token');
      localStorage.removeItem('device_id');
      console.log('✅ localStorage nettoyé');

      setMessage('✅ Tout a été réinitialisé! Attendez 2 secondes...');

      // Attendre un peu avant de réenregistrer
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 4. Réenregistrer et demander permission
      await registerAgain();

    } catch (error: any) {
      console.error('❌ Erreur lors de la réinitialisation:', error);
      setStatus('error');
      setMessage(`❌ Erreur: ${error.message}`);
    }
  };

  const registerAgain = async () => {
    setStatus('registering');
    setMessage('🔔 Nouvelle demande de permission...');

    try {
      const token = await requestNotificationPermission();

      if (token) {
        setStatus('success');
        setMessage('✅ Nouveau token obtenu avec succès!');
        console.log('🔑 Nouveau token FCM:', token);

        // Sauvegarder le nouveau token
        await saveFCMToken(token);

        setMessage('✅ Token sauvegardé! Les notifications sont actives.');

        // Recharger la page après 3 secondes
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        setStatus('error');
        setMessage('⚠️ Permission refusée. Réessayez en autorisant les notifications.');
      }
    } catch (error: any) {
      console.error('❌ Erreur:', error);
      setStatus('error');
      setMessage(`❌ Erreur: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Bell className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-800">
                Réinitialisation des Notifications
              </h1>
              <p className="text-zinc-600">
                Résolvez les problèmes de notifications
              </p>
            </div>
          </div>
        </div>

        {/* Status actuel */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-zinc-800 mb-4">État actuel</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <span className="font-medium text-zinc-700">Permission notifications:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                notificationPermission === 'granted'
                  ? 'bg-green-100 text-green-700'
                  : notificationPermission === 'denied'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {notificationPermission === 'granted' ? '✅ Accordée' :
                 notificationPermission === 'denied' ? '❌ Refusée' : '⏳ Non demandée'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <span className="font-medium text-zinc-700">Service Workers:</span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                {serviceWorkers.length} actif(s)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <span className="font-medium text-zinc-700">Token FCM:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                localStorage.getItem('fcm_token')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {localStorage.getItem('fcm_token') ? '✅ Présent' : '❌ Absent'}
              </span>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <h2 className="text-xl font-bold text-zinc-800 mb-4">Action</h2>

          {status === 'idle' && (
            <button
              onClick={resetEverything}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="h-6 w-6" />
              <span>Tout réinitialiser et réenregistrer</span>
            </button>
          )}

          {status === 'resetting' && (
            <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <span className="font-medium text-blue-700">Réinitialisation en cours...</span>
            </div>
          )}

          {status === 'registering' && (
            <div className="flex items-center justify-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
              <span className="font-medium text-purple-700">Enregistrement en cours...</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center justify-center gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="font-medium text-green-700">Succès! Redirection...</span>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3 p-4 bg-red-50 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <span className="font-medium text-red-700">Erreur</span>
              </div>
              <button
                onClick={resetEverything}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
              >
                <RefreshCw className="h-6 w-6" />
                <span>Réessayer</span>
              </button>
            </div>
          )}

          {message && (
            <div className="mt-4 p-4 bg-zinc-50 rounded-lg">
              <p className="text-sm text-zinc-700 text-center font-mono">
                {message}
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold text-zinc-800 mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Comment ça marche?
          </h3>
          <ol className="text-sm text-zinc-700 space-y-2 list-decimal list-inside">
            <li>Tous les service workers seront désenregistrés</li>
            <li>Le cache sera vidé complètement</li>
            <li>Les données localStorage seront nettoyées</li>
            <li>Une nouvelle demande de permission sera faite</li>
            <li>Un nouveau token FCM sera généré</li>
            <li>Vous serez redirigé vers la page d'accueil</li>
          </ol>
        </div>

        {/* Instructions si permission refusée */}
        {notificationPermission === 'denied' && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-2xl p-6">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              ⚠️ Permission bloquée - Suivez ces étapes:
            </h3>

            <div className="space-y-4 text-sm">
              <div className="bg-white/70 rounded-lg p-4">
                <h4 className="font-bold text-zinc-800 mb-2">📱 Sur Android (Chrome):</h4>
                <ol className="text-zinc-700 space-y-1 list-decimal list-inside ml-2">
                  <li>Ouvrez les <strong>Paramètres Android</strong> (⚙️)</li>
                  <li>Allez dans <strong>Applications</strong> → <strong>Chrome</strong> (ou votre navigateur)</li>
                  <li>Cliquez sur <strong>Notifications</strong></li>
                  <li>Cherchez le site <strong>"project-opal-eight-81.vercel.app"</strong></li>
                  <li>Activez les notifications pour ce site</li>
                  <li>Revenez ici et cliquez sur "Réinitialiser"</li>
                </ol>
              </div>

              <div className="bg-white/70 rounded-lg p-4">
                <h4 className="font-bold text-zinc-800 mb-2">📱 Sur iOS (Safari):</h4>
                <ol className="text-zinc-700 space-y-1 list-decimal list-inside ml-2">
                  <li>Ouvrez les <strong>Réglages iOS</strong> (⚙️)</li>
                  <li>Allez dans <strong>Safari</strong></li>
                  <li>Faites défiler jusqu'à <strong>"Sites web"</strong></li>
                  <li>Cliquez sur le site dans la liste</li>
                  <li>Activez les <strong>Notifications</strong></li>
                  <li>Revenez ici et cliquez sur "Réinitialiser"</li>
                </ol>
              </div>

              <div className="bg-white/70 rounded-lg p-4">
                <h4 className="font-bold text-zinc-800 mb-2">💻 Alternative rapide:</h4>
                <ol className="text-zinc-700 space-y-1 list-decimal list-inside ml-2">
                  <li>Désinstallez complètement la PWA</li>
                  <li>Ouvrez <strong>Chrome/Safari</strong> (navigateur normal)</li>
                  <li>Allez sur le site</li>
                  <li>Lorsque la demande de notification apparaît → <strong>Autoriser</strong></li>
                  <li>Réinstallez la PWA si besoin</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetNotifications;
