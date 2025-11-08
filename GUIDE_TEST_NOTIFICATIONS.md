# 🧪 Guide de Test des Notifications

## ✅ Code mis à jour

J'ai ajouté des **logs détaillés** dans 3 fichiers :

### 1. **NotificationManager.tsx** (Admin)
- Logs du payload envoyé à l'Edge Function
- Affiche le titre, le body, l'URL et l'icône
- Affiche le payload complet en JSON

### 2. **Edge Function** (send-notification/index.ts)
- Logs de la requête reçue
- Validation des paramètres
- Logs du payload envoyé à Firebase
- Confirmation de l'envoi avec titre et body

### 3. **Service Worker** (firebase-messaging-sw.js)
- Logs du payload reçu de Firebase
- Affiche toutes les propriétés disponibles
- Logs des valeurs extraites

## 📋 Comment tester étape par étape

### Étape 1 : Redéployer l'Edge Function

```bash
npx supabase functions deploy send-notification
```

### Étape 2 : Ouvrir les consoles de débogage

#### Console 1 : Console principale du navigateur
1. Ouvrir votre site (Dashboard Admin)
2. **F12** pour ouvrir les DevTools
3. Onglet **Console**
4. Laisser cette console ouverte

#### Console 2 : Console du Service Worker
1. Dans les DevTools, onglet **Application**
2. Menu de gauche → **Service Workers**
3. Cliquer sur le lien **firebase-messaging-sw.js**
4. Une nouvelle console s'ouvre → Laisser ouverte

#### Console 3 : Logs Supabase (dans le navigateur)
1. Ouvrir un nouvel onglet
2. Aller sur https://supabase.com
3. Sélectionner le projet **au-matin-vert**
4. Menu de gauche → **Edge Functions**
5. Cliquer sur **send-notification**
6. Onglet **Logs**
7. Laisser cette page ouverte

### Étape 3 : Envoyer une notification de test

1. Dans le Dashboard Admin, aller à **Notifications**
2. Cliquer sur le bouton **"Tester"** (notification de test rapide)

### Étape 4 : Vérifier les logs dans l'ordre

#### ✅ Console 1 (Console principale du navigateur)

Vous devriez voir :

```
🧪 ========================================
🧪 Payload TEST envoyé à l'Edge Function:
  - tokens: 1 token(s)
  - title: "🧪 Test de notification"
  - body: "Si vous recevez ceci, les notifications fonctionnent parfaitement !"
  - url: /
  - icon: /icon-192x192.png
🧪 Payload complet: {
  "tokens": ["..."],
  "title": "🧪 Test de notification",
  "body": "Si vous recevez ceci, les notifications fonctionnent parfaitement !",
  "url": "/",
  "icon": "/icon-192x192.png"
}
🧪 ========================================
```

**❌ Si vous ne voyez PAS ces logs :**
- Le composant NotificationManager ne s'exécute pas correctement
- Vérifiez qu'il n'y a pas d'erreur JavaScript avant

**✅ Si vous voyez ces logs :**
- Le titre et body sont bien définis côté admin
- Passez à l'étape suivante

#### ✅ Console 3 (Logs Supabase Edge Function)

Vous devriez voir :

```
📥 ========================================
📥 Requête reçue (body complet): {
  "tokens": ["..."],
  "title": "🧪 Test de notification",
  "body": "Si vous recevez ceci, les notifications fonctionnent parfaitement !",
  "url": "/",
  "icon": "/icon-192x192.png"
}
📥 ========================================
🔍 Paramètres extraits:
  - tokens: 1 token(s)
  - title: 🧪 Test de notification (type: string)
  - body: Si vous recevez ceci, les notifications fonctionnent parfaitement ! (type: string)
  - url: / (type: string)
  - icon: /icon-192x192.png (type: string)
📧 Envoi de notification à 1 destinataire(s)
✅ Access token Firebase obtenu
📤 [Token 1/1] Payload envoyé à FCM:
{
  "message": {
    "token": "...",
    "data": {
      "title": "🧪 Test de notification",
      "body": "Si vous recevez ceci, les notifications fonctionnent parfaitement !",
      "icon": "/icon-192x192.png",
      "image": "/icon-192x192.png",
      "url": "/"
    },
    "webpush": {
      "fcm_options": {
        "link": "/"
      }
    }
  }
}
✅ [Token 1] Notification envoyée avec succès: ...
   Titre envoyé: "🧪 Test de notification"
   Body envoyé: "Si vous recevez ceci, les notifications fonctionnent parfaitement !"
📊 ========================================
📊 Résultat final: 1 succès, 0 échecs
📊 ========================================
```

**❌ Si le titre ou body est vide dans les logs :**
```
  - title:  (type: undefined)
  - body:  (type: undefined)
```
→ Le problème vient de l'envoi depuis l'admin (retour à Console 1)

**❌ Si vous voyez une erreur Firebase :**
```
❌ [Token 1] Erreur lors de l'envoi: { error: { ... } }
```
→ Problème avec le token ou la configuration Firebase

**✅ Si vous voyez "Notification envoyée avec succès" :**
- Le titre et body ont été envoyés à Firebase
- Passez à l'étape suivante

#### ✅ Console 2 (Console du Service Worker)

Vous devriez voir :

```
[Firebase SW] ========================================
[Firebase SW] Message reçu (payload complet): {
  "data": {
    "title": "🧪 Test de notification",
    "body": "Si vous recevez ceci, les notifications fonctionnent parfaitement !",
    "icon": "/icon-192x192.png",
    "image": "/icon-192x192.png",
    "url": "/"
  },
  "fcmOptions": {
    "link": "/"
  }
}
[Firebase SW] ========================================
[Firebase SW] payload.data: {title: '🧪 Test de notification', body: 'Si vous recevez ceci...', ...}
[Firebase SW] payload.notification: undefined
[Firebase SW] payload.fcmOptions: {link: '/'}
[Firebase SW] Titre extrait: 🧪 Test de notification
[Firebase SW] Body extrait: Si vous recevez ceci, les notifications fonctionnent parfaitement !
[Firebase SW] Icon extrait: /icon-192x192.png
[Firebase SW] URL extrait: /
[Firebase SW] Options de notification: {
  "body": "Si vous recevez ceci, les notifications fonctionnent parfaitement !",
  "icon": "/icon-192x192.png",
  "badge": "/icon-72x72.png",
  "vibrate": [200, 100, 200],
  ...
}
[Firebase SW] Affichage de la notification avec titre: 🧪 Test de notification
```

**❌ Si vous ne voyez AUCUN log :**
- Le Service Worker n'est pas actif
- La notification n'arrive pas au Service Worker
- Vérifiez que le Service Worker est bien activé dans Application → Service Workers

**❌ Si `payload.data` est vide ou undefined :**
```
[Firebase SW] payload.data: undefined
```
→ Firebase n'a pas reçu le payload correctement (retour à Console 3)

**❌ Si le titre extrait est vide :**
```
[Firebase SW] Titre extrait: Au Matin Vert
[Firebase SW] Body extrait: Nouvelle notification
```
→ Les valeurs par défaut sont utilisées, le payload.data ne contient pas title et body

**✅ Si vous voyez "Affichage de la notification avec titre" :**
- Le Service Worker a bien reçu et extrait le titre et body
- La notification devrait s'afficher

### Étape 5 : Vérifier la notification affichée

La notification devrait apparaître sur votre appareil avec :
- **Titre** : 🧪 Test de notification
- **Message** : Si vous recevez ceci, les notifications fonctionnent parfaitement !
- **Icône** : Le logo de votre site ou l'icône par défaut

## 🔧 Diagnostics selon les résultats

### Cas 1 : Titre et body vides dans Console 1 (Admin)
**Symptôme :**
```
  - title: "" ou undefined
  - body: "" ou undefined
```

**Cause :** Les champs de formulaire sont vides

**Solution :**
1. Vérifier que vous avez bien rempli les champs "Titre" et "Message" dans le formulaire
2. Ou utiliser un template en cliquant dessus

### Cas 2 : Titre et body OK dans Console 1, mais vides dans Console 3 (Supabase)
**Symptôme :**
```
Console 1: title: "Mon titre" ✅
Console 3: title: undefined ❌
```

**Cause :** Le payload n'est pas envoyé correctement à Supabase

**Solution :**
1. Vérifier la connexion à Supabase
2. Vérifier les logs d'erreur dans Console 1
3. Vérifier que `supabase.functions.invoke` n'a pas d'erreur

### Cas 3 : Titre et body OK dans Console 3, mais vides dans Console 2 (Service Worker)
**Symptôme :**
```
Console 3: title: "Mon titre" ✅ (envoyé à Firebase)
Console 2: payload.data: undefined ❌
```

**Cause :** Firebase ne transmet pas les données correctement

**Solution :**
1. Vérifier que Firebase est bien configuré
2. Vérifier que le token FCM est valide
3. Redémarrer le Service Worker (Application → Service Workers → Unregister → Recharger)

### Cas 4 : Tout est OK dans les logs mais pas de notification
**Symptôme :**
```
Console 2: "Affichage de la notification avec titre: Mon titre" ✅
Mais pas de notification visible ❌
```

**Cause :** Permissions ou configuration du navigateur

**Solution :**
1. Vérifier `Notification.permission === 'granted'`
2. Vérifier les paramètres de notification du système d'exploitation
3. Tester dans un autre navigateur
4. Vérifier que le navigateur n'est pas en mode "Ne pas déranger"

## 🎯 Test avec un template

Au lieu du bouton "Tester", vous pouvez aussi :

1. Cliquer sur un **template** (ex: "Nouveaux produits disponibles")
2. Le titre et message se remplissent automatiquement
3. Vérifier que les champs sont bien remplis
4. Cliquer sur **"Envoyer la notification"**
5. Suivre les mêmes étapes de vérification dans les 3 consoles

## 📝 Checklist complète

- [ ] Edge Function redéployée
- [ ] Console 1 (principale) ouverte
- [ ] Console 2 (Service Worker) ouverte
- [ ] Console 3 (Supabase) ouverte
- [ ] Notification de test envoyée
- [ ] Logs Console 1 : titre et body présents
- [ ] Logs Console 3 : titre et body reçus par l'Edge Function
- [ ] Logs Console 3 : titre et body envoyés à Firebase
- [ ] Logs Console 2 : payload.data contient titre et body
- [ ] Logs Console 2 : titre et body extraits correctement
- [ ] Notification affichée sur l'appareil

## 🆘 Si rien ne fonctionne

1. **Copier tous les logs** des 3 consoles
2. **Faire une capture d'écran** du formulaire de notification
3. **Vérifier** que vous avez bien redéployé l'Edge Function
4. **Recharger** la page avec Ctrl+Shift+R
5. **Réessayer** le test

Les logs vous diront **exactement** où se situe le problème dans la chaîne :
- Admin → Edge Function → Firebase → Service Worker → Notification
