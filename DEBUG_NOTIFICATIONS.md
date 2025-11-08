# 🔍 Guide de Débogage des Notifications

## Problème : Le titre et le body ne s'affichent pas

### Étapes de débogage

#### 1. Vérifier que le Service Worker est actif

Ouvrir les DevTools du navigateur :
1. **F12** ou **Clic droit → Inspecter**
2. Onglet **Application**
3. Section **Service Workers** (dans le menu de gauche)
4. Vérifier que `firebase-messaging-sw.js` est **activé** et **en cours d'exécution**

**États possibles :**
- ✅ **activated and is running** → Bon
- ⚠️ **waiting to activate** → Cliquer sur "skipWaiting"
- ❌ **redundant** → Recharger la page avec **Ctrl+Shift+R**

#### 2. Vérifier les logs du Service Worker

1. Dans l'onglet **Application → Service Workers**
2. Cliquer sur le lien **firebase-messaging-sw.js**
3. Cela ouvre une console dédiée au Service Worker
4. Envoyer une notification de test depuis l'admin
5. Vérifier les logs :

**Logs attendus :**
```
[Firebase SW] ========================================
[Firebase SW] Message reçu (payload complet): {
  "data": {
    "title": "🧪 Test de notification",
    "body": "Si vous recevez ceci, les notifications fonctionnent parfaitement !",
    "icon": "...",
    "url": "/"
  },
  "fcmOptions": {
    "link": "/"
  }
}
[Firebase SW] ========================================
[Firebase SW] payload.data: {...}
[Firebase SW] Titre extrait: 🧪 Test de notification
[Firebase SW] Body extrait: Si vous recevez ceci, les notifications fonctionnent parfaitement !
[Firebase SW] Affichage de la notification avec titre: 🧪 Test de notification
```

**Si les logs ne s'affichent pas :**
- Le Service Worker n'est pas actif → Retour à l'étape 1
- La notification n'arrive pas au Service Worker → Vérifier l'Edge Function

#### 3. Vérifier les logs de l'Edge Function Supabase

1. Aller sur https://supabase.com
2. Sélectionner votre projet **au-matin-vert**
3. Onglet **Edge Functions** (dans le menu de gauche)
4. Cliquer sur **send-notification**
5. Onglet **Logs**
6. Envoyer une notification de test
7. Vérifier les logs :

**Logs attendus :**
```
📧 Envoi de notification à 1 destinataire(s)
📤 Payload envoyé à FCM: {
  "message": {
    "token": "...",
    "data": {
      "title": "🧪 Test de notification",
      "body": "Si vous recevez ceci, les notifications fonctionnent parfaitement !",
      "icon": "...",
      "url": "/"
    }
  }
}
✅ Notification envoyée: [token...]
📊 Résultat: 1 succès, 0 échecs
```

**Si vous voyez des erreurs :**
- `NOT_FOUND` ou `UNREGISTERED` → Le token est invalide, il sera nettoyé automatiquement
- `401 Unauthorized` → Problème avec la clé Firebase
- `400 Bad Request` → Payload mal formé

#### 4. Vérifier le payload reçu par FCM

Dans les logs de l'Edge Function, regardez le payload envoyé :

```json
{
  "message": {
    "token": "...",
    "data": {
      "title": "VOTRE_TITRE_ICI",
      "body": "VOTRE_MESSAGE_ICI",
      "icon": "...",
      "url": "/"
    }
  }
}
```

**Vérifications :**
- ✅ Le champ `data.title` contient bien votre titre ?
- ✅ Le champ `data.body` contient bien votre message ?
- ✅ Les valeurs ne sont pas `undefined` ou `null` ?

#### 5. Forcer le rechargement du Service Worker

Parfois, le Service Worker utilise une ancienne version en cache.

**Solution :**
1. Onglet **Application → Service Workers**
2. Cocher **Update on reload**
3. Cliquer sur **Unregister** (désinscrire le Service Worker)
4. Recharger la page avec **Ctrl+Shift+R** (hard reload)
5. Le Service Worker va se réinscrire automatiquement

#### 6. Vérifier les permissions du navigateur

1. Cliquer sur le **cadenas** 🔒 dans la barre d'adresse
2. Vérifier que **Notifications** est sur **Autoriser**
3. Si c'est sur **Bloquer**, changer en **Autoriser** et recharger

#### 7. Tester dans la console du Service Worker

Ouvrir la console du Service Worker (Application → Service Workers → Cliquer sur le lien du SW) et exécuter :

```javascript
// Afficher une notification de test manuellement
self.registration.showNotification('Test manuel', {
  body: 'Ceci est un test',
  icon: '/icon-192x192.png'
});
```

**Si ça fonctionne :**
- Le problème vient du payload reçu de Firebase

**Si ça ne fonctionne pas :**
- Problème de permissions ou de configuration du navigateur

## Solutions communes

### Solution 1 : Redéployer l'Edge Function

Les nouvelles modifications avec les logs doivent être déployées :

```bash
npx supabase functions deploy send-notification
```

### Solution 2 : Vérifier la structure du payload

Le service worker lit maintenant depuis **plusieurs sources** :

```javascript
const notificationTitle = payload.data?.title
  || payload.notification?.title
  || 'Au Matin Vert';
```

Cela garantit que le titre sera trouvé peu importe où Firebase le place.

### Solution 3 : Vérifier le format des données envoyées

Dans `NotificationManager.tsx`, vérifiez que vous envoyez bien :

```typescript
const { data, error } = await supabase.functions.invoke('send-notification', {
  body: {
    tokens: [...],
    title: "Mon titre",      // ← Doit être une string non vide
    body: "Mon message",     // ← Doit être une string non vide
    url: '/',
    icon: '...'
  }
});
```

### Solution 4 : Tester avec une notification simple

Créez un test minimal dans la console :

```javascript
// Dans la console principale (pas le SW)
const testNotification = async () => {
  const { data, error } = await supabase.functions.invoke('send-notification', {
    body: {
      tokens: ['VOTRE_TOKEN_ICI'],
      title: 'TEST SIMPLE',
      body: 'Message de test simple',
      url: '/',
      icon: '/icon-192x192.png'
    }
  });
  console.log('Résultat:', data, error);
};

testNotification();
```

## Checklist de diagnostic

- [ ] Le Service Worker est actif et en cours d'exécution
- [ ] Les logs du Service Worker s'affichent dans la console dédiée
- [ ] L'Edge Function envoie bien le payload avec `data.title` et `data.body`
- [ ] Le payload reçu dans le Service Worker contient les bonnes valeurs
- [ ] Les permissions de notification sont accordées
- [ ] Le Service Worker a été rechargé (pas de cache)
- [ ] La notification de test manuel fonctionne
- [ ] L'Edge Function a été redéployée avec les nouveaux logs

## Informations supplémentaires

### Comment voir les logs du Service Worker en temps réel

1. **Méthode 1 - Console dédiée :**
   - Application → Service Workers → Cliquer sur le lien du SW
   - Garde cette console ouverte à côté

2. **Méthode 2 - Via chrome://serviceworker-internals :**
   - Aller sur `chrome://serviceworker-internals/` dans Chrome
   - Chercher votre domaine
   - Cliquer sur "Inspect" à côté du Service Worker

### Différence entre payload.data et payload.notification

**Firebase peut envoyer 2 types de messages :**

1. **Messages de notification** (avec `notification`) :
   ```json
   {
     "notification": {
       "title": "...",
       "body": "..."
     }
   }
   ```
   → Firebase affiche automatiquement la notification

2. **Messages de données** (avec `data`) :
   ```json
   {
     "data": {
       "title": "...",
       "body": "..."
     }
   }
   ```
   → Le Service Worker doit afficher manuellement

**Notre configuration utilise `data` pour avoir le contrôle total et éviter les doublons.**

### Si rien ne fonctionne

1. Vérifier dans les logs Supabase Edge Function si l'envoi réussit
2. Vérifier dans la console du navigateur s'il y a des erreurs JavaScript
3. Tester sur un autre navigateur (Chrome, Firefox, Edge)
4. Tester sur un autre appareil
5. Vérifier que le token FCM est valide et pas expiré

### Contact et support

Si le problème persiste après avoir suivi tous ces steps :
1. Copier les logs du Service Worker
2. Copier les logs de l'Edge Function
3. Partager les captures d'écran des DevTools
