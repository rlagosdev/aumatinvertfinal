# 📱 Système de Notifications Push

## Vue d'ensemble

Ce système gère automatiquement les notifications push Firebase Cloud Messaging (FCM) pour votre application web.

## ✅ Fonctionnalités implémentées

### 1. **Génération automatique du token au démarrage**

Le hook `useAutoNotifications` génère automatiquement le token FCM dès que :
- L'application démarre
- L'utilisateur a déjà accordé la permission de notification
- Le navigateur supporte les notifications push

**Fichier:** `src/hooks/useAutoNotifications.ts`

**Intégration:** Le hook est appelé dans `App.tsx` au niveau racine de l'application.

```typescript
// Dans App.tsx
useAutoNotifications();
```

### 2. **Envoi sécurisé du token à Supabase**

Chaque token généré est automatiquement sauvegardé dans Supabase avec :
- **user_email** : Email de l'utilisateur (ou 'anonymous')
- **fcm_token** : Le token FCM unique
- **device_type** : Type d'appareil ('web')
- **device_id** : ID unique de l'appareil généré localement
- **updated_at** : Timestamp de la dernière mise à jour

**Fichier:** `src/firebase/config.ts:185-246` (fonction `saveFCMToken`)

**Sécurité:**
- Les anciens tokens du même appareil sont automatiquement supprimés
- Le token est stocké dans localStorage pour éviter les duplications
- Les erreurs sont loggées pour faciliter le débogage

### 3. **Détection et mise à jour automatique des tokens régénérés**

Firebase peut régénérer les tokens pour plusieurs raisons :
- Suppression des données de l'application
- Réinstallation de l'application
- Expiration du token
- Changements de configuration Firebase

**Notre système détecte ces changements via :**

#### A. Vérification périodique (toutes les 24h)
Le hook `useAutoNotifications` vérifie toutes les 24 heures si le token a changé.

```typescript
// Vérification automatique toutes les 24h
const REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 heures
```

#### B. Vérification au démarrage
À chaque démarrage de l'application, le système compare :
- Le token stocké localement (`localStorage.getItem('fcm_token')`)
- Le token actuel récupéré de Firebase

Si les tokens diffèrent, le nouveau token est automatiquement sauvegardé dans Supabase.

#### C. Écoute des erreurs de notification
Si une notification échoue à cause d'un token invalide, le système le détecte et régénère automatiquement un nouveau token.

**Fichier:** `src/firebase/config.ts:131-164` (fonction `setupTokenRefreshListener`)

## 🔄 Flux de fonctionnement

### Premier lancement (utilisateur nouveau)

```
1. App démarre
   ↓
2. useAutoNotifications vérifie la permission
   ↓
3. Permission = 'default' (non demandée)
   ↓
4. L'utilisateur voit la bannière NotificationTestButton
   ↓
5. L'utilisateur clique sur "Activer"
   ↓
6. Génération du token FCM
   ↓
7. Sauvegarde dans Supabase + localStorage
   ↓
8. Démarrage de la vérification périodique (24h)
```

### Lancement suivant (utilisateur existant)

```
1. App démarre
   ↓
2. useAutoNotifications vérifie la permission
   ↓
3. Permission = 'granted' (déjà accordée)
   ↓
4. Récupération du token actuel
   ↓
5. Comparaison avec le token stocké
   ↓
6a. Token identique → Mise à jour silencieuse dans Supabase
   ↓
6b. Token différent → Mise à jour + logs détaillés
   ↓
7. Démarrage de la vérification périodique (24h)
```

### Régénération de token par Firebase

```
1. Firebase régénère le token
   ↓
2. Prochaine vérification (au démarrage ou après 24h)
   ↓
3. Détection du changement
   ↓
4. Sauvegarde automatique du nouveau token
   ↓
5. Suppression de l'ancien token dans Supabase
```

## 📂 Architecture des fichiers

```
src/
├── hooks/
│   └── useAutoNotifications.ts       # Hook principal pour gérer les notifications
├── firebase/
│   └── config.ts                     # Configuration Firebase + fonctions utilitaires
├── components/
│   └── NotificationTestButton.tsx    # Bannière de demande de permission
└── App.tsx                           # Intégration du hook

supabase/
└── functions/
    └── send-notification/
        └── index.ts                  # Edge Function pour envoyer les notifications
```

## 🛠️ Configuration requise

### Variables d'environnement

Assurez-vous que les variables suivantes sont définies dans `.env` ou `.env.local` :

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

### Service Worker

Le service worker Firebase doit être accessible à `/firebase-messaging-sw.js`

**Fichier:** `public/firebase-messaging-sw.js`

## 📊 Logs et débogage

Le système utilise des logs préfixés pour faciliter le débogage :

- `🔔 [AutoNotifications]` : Logs du hook principal
- `📱 [SaveToken]` : Logs de sauvegarde de token
- `👂 [TokenRefresh]` : Logs de refresh de token
- `🔄 [AutoNotifications]` : Logs de vérification périodique

### Exemple de logs au démarrage

```
🔔 [AutoNotifications] Initialisation...
🔔 [AutoNotifications] Permission actuelle: granted
✅ [AutoNotifications] Permission déjà accordée, génération du token...
🔑 [AutoNotifications] Génération du token FCM...
📱 [SaveToken] Device ID: device_1234567890_abc123
🔑 [SaveToken] Token FCM: cF5xYz3...
✅ [SaveToken] Token déjà présent dans Supabase, mise à jour...
🗑️ [SaveToken] Anciens tokens de cet appareil supprimés
✅ [SaveToken] Token FCM sauvegardé/mis à jour dans Supabase
✅ [AutoNotifications] Token déjà à jour
⏰ [AutoNotifications] Vérification périodique activée (toutes les 24h)
```

## 🧪 Tests

### Tester la génération du token

1. Ouvrez la console du navigateur
2. Vérifiez les logs `[AutoNotifications]`
3. Vérifiez que le token est dans localStorage : `localStorage.getItem('fcm_token')`

### Tester la régénération

1. Supprimez le token du localStorage : `localStorage.removeItem('fcm_token')`
2. Rechargez la page
3. Le système devrait détecter le changement et régénérer le token

### Tester l'envoi de notification

1. Allez dans le Dashboard Admin → Onglet "Notifications"
2. Cliquez sur "Tester" pour envoyer une notification de test
3. Vérifiez que vous recevez la notification

## 🚨 Résolution de problèmes

### Le token n'est pas généré

**Causes possibles :**
- Permission non accordée → Vérifier `Notification.permission`
- Service Worker non enregistré → Vérifier dans DevTools > Application > Service Workers
- Variables d'environnement manquantes → Vérifier `.env.local`
- VAPID Key invalide → Vérifier dans Firebase Console

### Le token n'est pas sauvegardé dans Supabase

**Causes possibles :**
- Erreur de connexion à Supabase → Vérifier les logs de la console
- Table `user_fcm_tokens` inexistante → Vérifier la migration Supabase
- Permissions RLS trop restrictives → Vérifier les Row Level Security policies

### Les tokens sont dupliqués

**Solution :**
Le système supprime automatiquement les anciens tokens du même appareil. Si vous voyez encore des duplicatas, exécutez :

```sql
-- Dans Supabase SQL Editor
DELETE FROM user_fcm_tokens
WHERE device_id IN (
  SELECT device_id
  FROM user_fcm_tokens
  GROUP BY device_id
  HAVING COUNT(*) > 1
)
AND updated_at < (
  SELECT MAX(updated_at)
  FROM user_fcm_tokens t2
  WHERE t2.device_id = user_fcm_tokens.device_id
);
```

## 🔐 Sécurité

- Les tokens FCM sont uniques et ne peuvent pas être utilisés pour usurper l'identité d'un utilisateur
- Les tokens sont stockés côté serveur dans Supabase avec RLS activé
- L'Edge Function Supabase nettoie automatiquement les tokens invalides
- Les anciens tokens sont automatiquement supprimés lors de la régénération

## 📝 Maintenance

### Nettoyage des tokens invalides

L'Edge Function `send-notification` nettoie automatiquement les tokens invalides lors de l'envoi de notifications.

**Fichier:** `supabase/functions/send-notification/index.ts:183-206`

### Script SQL de nettoyage manuel

Si nécessaire, vous pouvez nettoyer manuellement les tokens invalides :

```sql
-- Fichier fourni
-- cleanup-tokens.sql
```

## 📈 Métriques

Le Dashboard Admin affiche :
- Nombre total d'utilisateurs inscrits
- Nombre de tokens actifs
- Historique des envois (à implémenter)

## 🔮 Améliorations futures

- [ ] Groupes d'utilisateurs pour ciblage avancé
- [ ] Planification d'envoi de notifications
- [ ] Analytics sur les taux d'ouverture
- [ ] Support des notifications riches (images, actions)
- [ ] Gestion des préférences utilisateur (types de notifications)
