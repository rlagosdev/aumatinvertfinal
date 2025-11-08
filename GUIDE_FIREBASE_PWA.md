# 🔥 Guide : Configurer Firebase Cloud Messaging pour les notifications

## Étape 1 : Créer un projet Firebase

### 1.1 Accéder à la console Firebase
1. Va sur https://console.firebase.google.com/
2. Clique sur **"Ajouter un projet"** ou **"Add project"**
3. Nom du projet : **Au Matin Vert**
4. Accepte les conditions
5. Désactive Google Analytics (pas nécessaire pour l'instant)
6. Clique sur **"Créer le projet"**

### 1.2 Ajouter une application Web
1. Dans la page d'accueil de ton projet, clique sur l'icône **Web** (`</>`)
2. Nom de l'app : **Au Matin Vert PWA**
3. ✅ Coche **"Configurer aussi Firebase Hosting"** (optionnel)
4. Clique sur **"Enregistrer l'application"**

### 1.3 Récupérer la configuration Firebase
Tu vas voir un code comme ceci :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "au-matin-vert.firebaseapp.com",
  projectId: "au-matin-vert",
  storageBucket: "au-matin-vert.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**📋 COPIE TOUTES CES VALEURS !**

---

## Étape 2 : Activer Cloud Messaging

### 2.1 Activer le service
1. Dans le menu de gauche, clique sur **"Build"** → **"Cloud Messaging"**
2. Clique sur l'onglet **"Cloud Messaging API (Legacy)"**
3. Clique sur **"Enable"** pour activer l'API

### 2.2 Obtenir la clé VAPID
1. Toujours dans **Cloud Messaging**
2. Scroll jusqu'à **"Web Push certificates"**
3. Clique sur **"Generate key pair"**
4. **📋 COPIE LA CLEF VAPID** (elle ressemble à : `BNjX...`)

---

## Étape 3 : Configurer les variables d'environnement

### 3.1 Créer le fichier .env
Crée un fichier `.env` à la racine du projet :

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=au-matin-vert.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=au-matin-vert
VITE_FIREBASE_STORAGE_BUCKET=au-matin-vert.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_VAPID_KEY=BNjXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ Remplace toutes les valeurs par celles de TON projet Firebase !**

### 3.2 Mettre à jour firebase-messaging-sw.js
Ouvre `public/firebase-messaging-sw.js` et remplace la configuration :

```javascript
const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "TON_AUTH_DOMAIN",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_STORAGE_BUCKET",
  messagingSenderId: "TON_MESSAGING_SENDER_ID",
  appId: "TON_APP_ID"
};
```

---

## Étape 4 : Tester l'installation

### 4.1 Redémarrer le serveur
```bash
# Arrête le serveur (Ctrl+C)
# Redémarre
npm run dev
```

### 4.2 Ouvrir dans le navigateur
```
http://localhost:5173
```

### 4.3 Vérifier dans la console
Ouvre la console du navigateur (F12) et cherche :

```
✅ Service Worker enregistré
```

---

## Étape 5 : Envoyer une notification de test

### 5.1 Via la console Firebase
1. Va dans **Cloud Messaging** dans Firebase Console
2. Clique sur **"Send your first message"**
3. Titre : **Test Au Matin Vert**
4. Texte : **Votre panier vous attend !**
5. Clique sur **"Send test message"**
6. Colle le **FCM Token** de ton navigateur (tu le trouveras dans la console)
7. Clique sur **"Test"**

### 5.2 Via le code (optionnel)
Tu peux créer un bouton de test dans ton interface admin :

```typescript
import { requestNotificationPermission } from '../firebase/config';

const handleTestNotification = async () => {
  const token = await requestNotificationPermission();

  if (token) {
    alert(`Token FCM: ${token}`);
    // Copie ce token pour l'envoyer depuis Firebase Console
  }
};
```

---

## 🎯 Checklist finale

Avant de déployer en production :

- [ ] Firebase projet créé
- [ ] Cloud Messaging activé
- [ ] VAPID key générée
- [ ] Variables d'environnement configurées
- [ ] firebase-messaging-sw.js mis à jour
- [ ] Service Worker enregistré (vérifié dans la console)
- [ ] Notification de test reçue
- [ ] PWA installable sur mobile

---

## 🐛 Problèmes courants

### "Permission denied"
→ L'utilisateur a refusé les notifications. Demande à nouveau depuis les paramètres du navigateur.

### "No matching service worker"
→ Le Service Worker n'est pas enregistré. Vérifie la console pour les erreurs.

### "Invalid VAPID key"
→ La clé VAPID est incorrecte. Régénère-la dans Firebase Console.

### "Failed to register service worker"
→ Le site doit être en HTTPS (ou localhost pour le dev).

---

## 📚 Ressources

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging/js/client)
- [PWA Notification Guide](https://web.dev/push-notifications-overview/)
