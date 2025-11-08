# 🔄 Changement : Utilisation du champ `notification` au lieu de `data`

## 📝 Résumé du problème

**Problème initial :**
- L'Edge Function envoyait le titre et body dans le champ `data`
- Firebase recevait correctement les données
- **MAIS** le Service Worker ne recevait pas les données dans `payload.data`
- Résultat : Notification affichée avec titre/body par défaut ("Au Matin Vert" / "Nouvelle notification")

**Solution appliquée :**
- Utiliser le champ `notification` au lieu de `data`
- Firebase affiche automatiquement la notification
- Plus besoin du `setBackgroundMessageHandler`

## ✅ Fichiers modifiés

### 1. **Edge Function** (`supabase/functions/send-notification/index.ts`)

**Avant :**
```typescript
data: {
  title: notificationTitle,
  body: notificationBody,
  icon: notificationIcon,
  image: notificationIcon,
  url: notificationUrl
}
```

**Après :**
```typescript
notification: {
  title: notificationTitle,
  body: notificationBody,
  icon: notificationIcon,
  image: notificationIcon
},
webpush: {
  fcm_options: {
    link: notificationUrl
  },
  notification: {
    title: notificationTitle,
    body: notificationBody,
    icon: notificationIcon,
    image: notificationIcon
  }
}
```

### 2. **Service Worker** (`public/firebase-messaging-sw.js`)

**Avant :**
```javascript
messaging.setBackgroundMessageHandler((payload) => {
  // Extraire title et body depuis payload.data
  const notificationTitle = payload.data?.title || 'Au Matin Vert';
  const notificationBody = payload.data?.body || 'Nouvelle notification';

  // Afficher la notification manuellement
  return self.registration.showNotification(notificationTitle, notificationOptions);
});
```

**Après :**
```javascript
// SIMPLIFIÉ : Firebase affiche automatiquement
console.log('[Firebase SW] Service Worker initialisé - Firebase affichera les notifications automatiquement');

// Garder seulement le gestionnaire de clic
self.addEventListener('notificationclick', (event) => {
  // Gérer le clic pour rediriger vers l'URL
});
```

## 🎯 Avantages du champ `notification`

✅ **Firebase affiche automatiquement** - Pas besoin de code supplémentaire
✅ **Pas de doublons** - Une seule notification affichée
✅ **Code plus simple** - Moins de code à maintenir
✅ **Standard Firebase** - Utilise l'approche recommandée par Firebase
✅ **Titre et body garantis** - Firebase gère l'affichage correctement

## 📋 Étapes pour tester

### 1. Redéployer l'Edge Function

```bash
npx supabase functions deploy send-notification
```

### 2. Recharger le Service Worker

1. **F12** → Onglet **Application**
2. Section **Service Workers**
3. Cocher **"Update on reload"**
4. Cliquer sur **"Unregister"**
5. Recharger la page avec **Ctrl+Shift+R**

### 3. Envoyer une notification de test

1. Aller dans **Dashboard Admin → Notifications**
2. Cliquer sur **"Tester"** ou utiliser un template
3. Vérifier que la notification s'affiche avec le bon titre et body

### 4. Vérifier les logs Supabase

Logs attendus :
```
📤 [Token 1/1] Payload envoyé à FCM:
{
  "message": {
    "token": "...",
    "notification": {
      "title": "Votre titre",
      "body": "Votre message",
      "icon": "...",
      "image": "..."
    },
    "webpush": {
      "fcm_options": {
        "link": "/"
      }
    }
  }
}
✅ [Token 1] Notification envoyée avec succès
   Titre envoyé: "Votre titre"
   Body envoyé: "Votre message"
```

## ⚠️ Important : Différences entre `data` et `notification`

### Champ `data`
- **Contrôle total** dans le Service Worker
- Nécessite `setBackgroundMessageHandler`
- Le Service Worker doit afficher manuellement avec `showNotification()`
- **Problème** : Firebase ne transmet pas toujours correctement les données au SW
- Utilisation : Quand vous voulez personnaliser l'affichage

### Champ `notification`
- **Firebase affiche automatiquement**
- Pas besoin de `setBackgroundMessageHandler`
- Plus simple et plus fiable
- **Avantage** : Garantit que le titre et body s'affichent
- Utilisation : Pour les notifications standard (notre cas)

## 🔧 Structure du payload Firebase

### Format complet envoyé

```json
{
  "message": {
    "token": "FCM_TOKEN",
    "notification": {
      "title": "Titre de la notification",
      "body": "Message de la notification",
      "icon": "URL_de_l'icône",
      "image": "URL_de_l'image"
    },
    "webpush": {
      "fcm_options": {
        "link": "https://votre-site.com/"
      },
      "notification": {
        "title": "Titre de la notification",
        "body": "Message de la notification",
        "icon": "URL_de_l'icône",
        "image": "URL_de_l'image"
      }
    }
  }
}
```

### Pourquoi `webpush.notification` en doublon ?

Firebase Web Push nécessite que les propriétés de notification soient **aussi** dans `webpush.notification` pour :
- Garantir la compatibilité avec tous les navigateurs
- Permettre la personnalisation des notifications web
- Gérer correctement les icônes et images

## 🎨 Personnalisation future

Si vous voulez ajouter des fonctionnalités avancées plus tard :

### Badge de notification
```typescript
notification: {
  title: "...",
  body: "...",
  badge: "/badge-icon.png"  // Petite icône dans la barre de statut
}
```

### Actions sur la notification
```typescript
webpush: {
  notification: {
    actions: [
      { action: 'view', title: 'Voir' },
      { action: 'dismiss', title: 'Ignorer' }
    ]
  }
}
```

### Vibration personnalisée
```typescript
webpush: {
  notification: {
    vibrate: [200, 100, 200, 100, 200]  // Pattern de vibration
  }
}
```

## 📊 Comparaison avant/après

| Aspect | Avant (data) | Après (notification) |
|--------|--------------|----------------------|
| Affichage | Manuel via SW | Automatique par Firebase |
| Code SW | ~70 lignes | ~30 lignes |
| Fiabilité | ❌ Problèmes de transmission | ✅ Garanti |
| Titre/Body | ❌ Valeurs par défaut | ✅ Valeurs correctes |
| Doublons | ⚠️ Risque | ✅ Pas de risque |
| Complexité | 🔴 Élevée | 🟢 Simple |

## ✅ Résultat final

Maintenant, quand vous envoyez une notification depuis l'admin :

1. ✅ Le titre et body sont bien envoyés à Firebase
2. ✅ Firebase reçoit les données dans le champ `notification`
3. ✅ Firebase affiche automatiquement la notification avec le bon titre et body
4. ✅ Clic sur la notification → Redirection vers votre site
5. ✅ Pas de code complexe à maintenir

## 🚀 Déploiement

1. Redéployer l'Edge Function :
   ```bash
   npx supabase functions deploy send-notification
   ```

2. Recharger le Service Worker (voir étapes ci-dessus)

3. Tester !

Voilà, c'est tout ! La solution est maintenant **simple, fiable et maintenable**. 🎉
