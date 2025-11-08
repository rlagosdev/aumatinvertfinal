import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { Messaging } from 'firebase/messaging';

// Configuration Firebase
// IMPORTANT: Remplace ces valeurs par celles de ta console Firebase
// https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "REMPLACE_PAR_TON_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "REMPLACE_PAR_TON_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "REMPLACE_PAR_TON_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "REMPLACE_PAR_TON_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "REMPLACE_PAR_TON_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "REMPLACE_PAR_TON_APP_ID"
};

// VAPID Key pour les notifications push
// Tu trouveras cette clé dans: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "REMPLACE_PAR_TA_VAPID_KEY";

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firebase Cloud Messaging
let messaging: Messaging | null = null;

// Fonction pour initialiser Firebase Messaging avec le bon Service Worker
const initMessaging = async (): Promise<Messaging | null> => {
  if (messaging) return messaging;

  try {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('🔧 Enregistrement du service worker...');

      // Enregistrer le service worker avec un timeout de 5 secondes
      const registerPromise = navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope'
      });

      const timeoutPromise = new Promise<ServiceWorkerRegistration>((_, reject) => {
        setTimeout(() => reject(new Error('Service Worker timeout')), 5000);
      });

      const registration = await Promise.race([registerPromise, timeoutPromise]);

      console.log('✅ Service Worker enregistré:', registration.scope);

      // Initialiser messaging directement sans attendre ready
      messaging = getMessaging(app);
      console.log('✅ Firebase Messaging initialisé');
      return messaging;
    } else {
      console.warn('⚠️ Service Worker ou Push API non disponible');
    }
  } catch (error) {
    console.error('❌ Erreur initialisation Firebase Messaging:', error);
  }

  return null;
}

/**
 * Demander la permission pour les notifications
 * et obtenir le token FCM
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    console.log('🔔 1/4 - Initialisation de Firebase Messaging...');

    // Initialiser Firebase Messaging d'abord
    const msg = await initMessaging();

    if (!msg) {
      console.warn('⚠️ Firebase Messaging non disponible');
      return null;
    }

    console.log('🔔 2/4 - Demande de permission au navigateur...');

    // Demander la permission
    const permission = await Notification.requestPermission();

    console.log('🔔 3/4 - Réponse de permission:', permission);

    if (permission === 'granted') {
      console.log('✅ Permission notification accordée');

      console.log('🔔 4/4 - Récupération du token FCM avec VAPID:', VAPID_KEY.substring(0, 20) + '...');

      // Obtenir le token FCM
      const token = await getToken(msg, { vapidKey: VAPID_KEY });

      if (token) {
        console.log('🔑 FCM Token obtenu:', token.substring(0, 30) + '...');

        // Sauvegarder le token
        localStorage.setItem('fcm_token', token);

        return token;
      } else {
        console.warn('⚠️ Impossible d\'obtenir le token FCM (getToken a retourné null)');
        return null;
      }
    } else if (permission === 'denied') {
      console.warn('❌ Permission notification refusée par l\'utilisateur');
      return null;
    } else {
      console.warn('⚠️ Permission notification ignorée (default)');
      return null;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la demande de permission:', error);
    console.error('Détails de l\'erreur:', error);
    return null;
  }
};

/**
 * Écouter les messages quand l'app est au premier plan
 */
export const onMessageListener = async (callback: (payload: any) => void) => {
  const msg = await initMessaging();
  if (!msg) return;

  onMessage(msg, (payload) => {
    console.log('📬 Message reçu (premier plan):', payload);
    callback(payload);
  });
};

/**
 * Surveiller les changements de token FCM
 * Firebase peut régénérer le token pour diverses raisons :
 * - L'utilisateur a supprimé les données de l'application
 * - L'utilisateur a réinstallé l'application
 * - Le token a expiré
 * - Changements de configuration Firebase
 *
 * Cette fonction détecte automatiquement ces changements et met à jour le token dans Supabase
 */
export const setupTokenRefreshListener = async (userEmail?: string) => {
  const msg = await initMessaging();
  if (!msg) return;

  console.log('👂 [TokenRefresh] Écoute des changements de token activée');

  // Note: onTokenRefresh n'existe pas dans la version web de Firebase Messaging
  // À la place, nous devons vérifier périodiquement si le token a changé
  // Cette vérification est gérée par le hook useAutoNotifications

  // Écouter les messages pour détecter des problèmes de token
  onMessage(msg, async (payload) => {
    console.log('📬 Message reçu:', payload);

    // Si le message contient une erreur de token, régénérer
    if (payload.notification?.title?.includes('token') || payload.data?.error) {
      console.log('⚠️ [TokenRefresh] Problème de token détecté, régénération...');
      const newToken = await requestNotificationPermission();
      if (newToken) {
        await saveFCMToken(newToken, userEmail);
      }
    }
  });
};

/**
 * Générer ou récupérer un ID unique pour cet appareil
 */
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device_id');

  if (!deviceId) {
    // Générer un ID unique basé sur des infos de l'appareil
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('device_id', deviceId);
  }

  return deviceId;
};

/**
 * Sauvegarder le token FCM dans Supabase
 * Cette fonction gère également la mise à jour automatique des tokens existants
 */
export const saveFCMToken = async (token: string, userEmail?: string) => {
  try {
    const { supabase } = await import('../supabase/client');

    // Obtenir l'ID unique de l'appareil
    const deviceId = getDeviceId();

    console.log('📱 [SaveToken] Device ID:', deviceId);
    console.log('🔑 [SaveToken] Token FCM:', token.substring(0, 30) + '...');

    // Vérifier si le token existe déjà dans la base
    const { data: existingTokens, error: checkError } = await supabase
      .from('user_fcm_tokens')
      .select('*')
      .eq('fcm_token', token);

    if (checkError) {
      console.warn('⚠️ [SaveToken] Erreur vérification token:', checkError);
    } else if (existingTokens && existingTokens.length > 0) {
      console.log('✅ [SaveToken] Token déjà présent dans Supabase, mise à jour...');
    } else {
      console.log('🆕 [SaveToken] Nouveau token, insertion...');
    }

    // Supprimer tous les anciens tokens de ce même appareil (mais garder le token actuel s'il existe)
    const { error: deleteError } = await supabase
      .from('user_fcm_tokens')
      .delete()
      .eq('device_id', deviceId)
      .neq('fcm_token', token);

    if (deleteError) {
      console.warn('⚠️ [SaveToken] Erreur suppression anciens tokens:', deleteError);
    } else {
      console.log('🗑️ [SaveToken] Anciens tokens de cet appareil supprimés');
    }

    // Insérer ou mettre à jour le token actuel
    const { error } = await supabase.from('user_fcm_tokens').upsert({
      user_email: userEmail || 'anonymous',
      fcm_token: token,
      device_type: 'web',
      device_id: deviceId,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'fcm_token'
    });

    if (error) {
      console.error('❌ [SaveToken] Erreur sauvegarde token:', error);
      throw error;
    } else {
      console.log('✅ [SaveToken] Token FCM sauvegardé/mis à jour dans Supabase');

      // Mettre à jour le timestamp de la dernière sauvegarde
      localStorage.setItem('fcm_token_last_saved', new Date().toISOString());
    }
  } catch (error) {
    console.error('❌ [SaveToken] Erreur:', error);
    throw error;
  }
};

export { messaging };
