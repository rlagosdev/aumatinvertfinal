import { useEffect, useRef } from 'react';
import { requestNotificationPermission, saveFCMToken } from '../firebase/config';
import { getMessaging, onMessage } from 'firebase/messaging';

/**
 * Hook pour gérer automatiquement les notifications push
 *
 * Ce hook s'occupe de :
 * 1. Générer le token FCM au démarrage de l'application
 * 2. Détecter et mettre à jour le token si Firebase le régénère
 * 3. Sauvegarder le token dans Supabase
 * 4. Écouter les messages en temps réel
 */
export const useAutoNotifications = () => {
  const hasInitialized = useRef(false);
  const tokenCheckInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Ne s'exécuter qu'une seule fois au démarrage
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    console.log('🔔 [AutoNotifications] Initialisation...');

    // Fonction pour initialiser les notifications
    const initializeNotifications = async () => {
      try {
        // Vérifier si le navigateur supporte les notifications
        if (!('Notification' in window)) {
          console.warn('⚠️ [AutoNotifications] Ce navigateur ne supporte pas les notifications');
          return;
        }

        // Vérifier la permission actuelle
        const currentPermission = Notification.permission;
        console.log('🔔 [AutoNotifications] Permission actuelle:', currentPermission);

        // Si la permission a déjà été accordée, générer/récupérer le token automatiquement
        if (currentPermission === 'granted') {
          console.log('✅ [AutoNotifications] Permission déjà accordée, génération du token...');
          await generateAndSaveToken();

          // Démarrer la vérification périodique du token (toutes les 24h)
          startTokenRefreshCheck();
        } else if (currentPermission === 'default') {
          console.log('⏳ [AutoNotifications] Permission non demandée, en attente de l\'action utilisateur');
          // L'utilisateur devra cliquer sur la bannière NotificationTestButton
        } else {
          console.warn('❌ [AutoNotifications] Permission refusée par l\'utilisateur');
        }
      } catch (error) {
        console.error('❌ [AutoNotifications] Erreur lors de l\'initialisation:', error);
      }
    };

    // Fonction pour générer et sauvegarder le token
    const generateAndSaveToken = async () => {
      try {
        console.log('🔑 [AutoNotifications] Génération du token FCM...');

        // Récupérer le token stocké localement
        const storedToken = localStorage.getItem('fcm_token');

        // Demander un nouveau token (ou récupérer l'existant)
        const newToken = await requestNotificationPermission();

        if (newToken) {
          // Vérifier si le token a changé
          if (storedToken !== newToken) {
            console.log('🔄 [AutoNotifications] Token différent détecté, mise à jour...');
            console.log('  Ancien:', storedToken?.substring(0, 30) + '...');
            console.log('  Nouveau:', newToken.substring(0, 30) + '...');

            // Sauvegarder le nouveau token dans Supabase
            await saveFCMToken(newToken);
            console.log('✅ [AutoNotifications] Token mis à jour avec succès');
          } else {
            console.log('✅ [AutoNotifications] Token déjà à jour');

            // Vérifier quand même dans Supabase (au cas où il aurait été supprimé)
            await saveFCMToken(newToken);
          }
        } else {
          console.warn('⚠️ [AutoNotifications] Impossible de générer le token');
        }
      } catch (error) {
        console.error('❌ [AutoNotifications] Erreur génération token:', error);
      }
    };

    // Fonction pour vérifier périodiquement le token
    const startTokenRefreshCheck = () => {
      // Vérifier toutes les 24 heures si le token est toujours valide
      const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 heures

      tokenCheckInterval.current = setInterval(async () => {
        console.log('🔄 [AutoNotifications] Vérification périodique du token...');
        await generateAndSaveToken();
      }, REFRESH_INTERVAL);

      console.log('⏰ [AutoNotifications] Vérification périodique activée (toutes les 24h)');
    };

    // Lancer l'initialisation
    initializeNotifications();

    // Cleanup
    return () => {
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
        console.log('🛑 [AutoNotifications] Vérification périodique arrêtée');
      }
    };
  }, []);

  // Retourner une fonction pour forcer la régénération du token (utile pour les tests)
  const refreshToken = async () => {
    console.log('🔄 [AutoNotifications] Régénération manuelle du token...');

    if (Notification.permission !== 'granted') {
      console.warn('⚠️ [AutoNotifications] Permission non accordée, impossible de régénérer le token');
      return null;
    }

    const newToken = await requestNotificationPermission();

    if (newToken) {
      await saveFCMToken(newToken);
      console.log('✅ [AutoNotifications] Token régénéré avec succès');
    }

    return newToken;
  };

  return { refreshToken };
};
