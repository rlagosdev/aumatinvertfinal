// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDDhIDfXxIUuyR_CY2Pi9nH9FsP5dW7-fc",
  authDomain: "au-matin-vert.firebaseapp.com",
  projectId: "au-matin-vert",
  storageBucket: "au-matin-vert.firebasestorage.app",
  messagingSenderId: "697849274497",
  appId: "1:697849274497:web:94061215628a011e052d80"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);

// Récupérer l'instance de messaging
const messaging = firebase.messaging();

console.log('[Firebase SW] Service Worker initialisé - Gestion des messages en arrière-plan');

// Handler pour les messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('[Firebase SW] Message reçu en arrière-plan:', payload);

  // Extraire les données depuis payload.data
  const notificationTitle = payload.data?.title || 'Au Matin Vert';
  const notificationBody = payload.data?.body || 'Nouvelle notification';
  const notificationIcon = payload.data?.icon || '/icon-192x192.png';
  const notificationUrl = payload.data?.url || '/';

  console.log('[Firebase SW] Données extraites:');
  console.log('  - Title:', notificationTitle);
  console.log('  - Body:', notificationBody);
  console.log('  - Icon:', notificationIcon);
  console.log('  - URL:', notificationUrl);

  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    badge: notificationIcon,
    tag: 'au-matin-vert-notification',
    requireInteraction: false,
    data: {
      url: notificationUrl
    }
  };

  console.log('[Firebase SW] Affichage de la notification...');

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('[Firebase SW] Clic sur notification');

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  console.log('[Firebase SW] URL de redirection:', urlToOpen);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Chercher si une fenêtre existe déjà
        for (let client of windowClients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            console.log('[Firebase SW] Fenêtre existante trouvée, focus');
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          console.log('[Firebase SW] Ouverture nouvelle fenêtre:', urlToOpen);
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
