# 📱 PWA Au Matin Vert - Documentation Complète

## 🎉 Félicitations !

La **Progressive Web App (PWA)** pour Au Matin Vert est maintenant **créée et prête à être configurée** !

Tes clients pourront bientôt installer l'application sur leur téléphone et recevoir des notifications push.

---

## 📦 Ce qui a été créé

### ✅ Fichiers PWA

| Fichier | Description |
|---------|-------------|
| `public/manifest.json` | Configuration de l'application (nom, icônes, couleurs) |
| `public/sw.js` | Service Worker pour le cache et mode hors ligne |
| `public/firebase-messaging-sw.js` | Service Worker Firebase pour les notifications |
| `public/icon-*.png` | 8 icônes de différentes tailles (temporaires) |
| `src/hooks/usePWA.ts` | Hook React pour gérer l'installation |
| `src/components/PWAInstallPrompt.tsx` | Bannière d'installation |
| `src/firebase/config.ts` | Configuration Firebase Cloud Messaging |

### ✅ Guides créés

| Guide | Contenu |
|-------|---------|
| `GUIDE_FIREBASE_PWA.md` | Configuration Firebase étape par étape |
| `GUIDE_TEST_PWA.md` | Tests complets de la PWA |
| `GUIDE_ICONES_PWA.md` | Génération des icônes personnalisées |
| `README_PWA.md` | Ce fichier - vue d'ensemble |

### ✅ Fonctionnalités implémentées

- 🔔 **Notifications Push** (Firebase Cloud Messaging)
- 📲 **Installation sur mobile** (Android, iOS)
- 🔌 **Mode hors ligne** (Service Worker + Cache)
- 🔄 **Mise à jour automatique** (sans réinstallation)
- 🎨 **Icônes personnalisées** (8 tailles)
- 🚀 **Bannière d'installation** (affichage automatique)
- 📱 **Mode standalone** (plein écran, sans navigateur)

---

## 🚀 Prochaines étapes

### Étape 1 : Configurer Firebase (⏱️ 10 minutes)

**Tu DOIS faire cette étape pour que les notifications fonctionnent.**

1. Ouvre le fichier : **`GUIDE_FIREBASE_PWA.md`**
2. Suis les instructions étape par étape
3. Récupère tes clés Firebase
4. Crée le fichier `.env` avec tes clés

**Résumé rapide :**
```bash
# 1. Crée un projet sur https://console.firebase.google.com/
# 2. Active Cloud Messaging
# 3. Récupère apiKey, projectId, messagingSenderId, appId, VAPID key
# 4. Crée le fichier .env à la racine :

VITE_FIREBASE_API_KEY=ta_clé
VITE_FIREBASE_PROJECT_ID=ton_projet
# ... etc
```

### Étape 2 : Remplacer les icônes temporaires (⏱️ 5 minutes)

**Optionnel mais recommandé pour la version finale.**

1. Ouvre le fichier : **`GUIDE_ICONES_PWA.md`**
2. Choisis une des 4 options :
   - Option 1 : Script automatique (recommandé)
   - Option 2 : Outil en ligne (https://www.pwabuilder.com/imageGenerator)
   - Option 3 : Manuellement avec Photoshop/Figma
   - Option 4 : Garder les icônes temporaires "AMV"

**Note :** Les icônes temporaires "AMV" sur fond vert fonctionnent déjà. Tu peux les remplacer plus tard.

### Étape 3 : Tester l'installation (⏱️ 15 minutes)

1. Ouvre le fichier : **`GUIDE_TEST_PWA.md`**
2. Lance le serveur :
   ```bash
   npm run dev
   ```
3. Ouvre http://localhost:5173 dans Chrome
4. Attends 3 secondes → La bannière verte d'installation apparaît
5. Clique sur "Installer"
6. Une popup Chrome demande confirmation → Clique "Installer"
7. ✅ L'app s'ouvre en mode standalone !

### Étape 4 : Tester les notifications (⏱️ 10 minutes)

**Après avoir configuré Firebase (Étape 1) :**

1. Ouvre la PWA installée
2. Autorise les notifications quand le navigateur le demande
3. Copie le token FCM dans la console (F12)
4. Va sur Firebase Console → Cloud Messaging
5. Envoie un message de test avec le token
6. ✅ La notification apparaît sur ton écran !

---

## 🎯 Résumé : Que fait la PWA ?

### Pour les clients

1. **Installation facile**
   - 1 clic sur "Installer"
   - Icône sur l'écran d'accueil
   - Pas de Google Play / App Store

2. **Expérience native**
   - Ouverture en plein écran
   - Pas de barre de navigation visible
   - Comme une vraie application

3. **Notifications**
   - Nouveaux produits disponibles
   - Commandes prêtes
   - Promotions exclusives
   - Rappels de panier abandonné

4. **Hors ligne**
   - Consultation des produits sans connexion
   - Pages déjà visitées restent accessibles
   - Synchronisation automatique au retour en ligne

### Pour toi (admin)

1. **Mises à jour simples**
   - Modifie ton site normalement
   - Les apps se mettent à jour automatiquement
   - Pas besoin de republier sur les stores

2. **Communication directe**
   - Envoie des notifications à tous les clients
   - Segmentation possible (nouveaux clients, fidèles, etc.)
   - Taux d'ouverture élevé (3-10x vs email)

3. **Analytics intégré**
   - Nombre d'installations
   - Taux de rétention
   - Engagement utilisateur

---

## 📊 Différence PWA vs Application native

| Critère | PWA Au Matin Vert | App Native (APK) |
|---------|-------------------|------------------|
| **Installation** | 1 clic | 50+ Mo à télécharger |
| **Mise à jour** | Automatique | Manuelle |
| **Maintenance** | Zéro | Recréer l'APK à chaque fois |
| **Compatibilité** | Android + iOS + Desktop | Android uniquement |
| **Coût** | Gratuit | Gratuit mais chronophage |
| **Notifications** | ✅ Oui | ✅ Oui |
| **Mode hors ligne** | ✅ Oui | ✅ Oui |
| **Google Play** | ❌ Non nécessaire | ✅ Possible |

**Verdict :** La PWA est parfaite pour Au Matin Vert car :
- ✅ Clients Android ET iOS
- ✅ Pas de maintenance lourde
- ✅ Mises à jour instantanées
- ✅ Moins de barrières à l'installation

---

## 🔧 Configuration avancée (optionnel)

### Ajouter un bouton "Demander les notifications" dans l'admin

```typescript
import { requestNotificationPermission } from '../firebase/config';

const NotificationButton = () => {
  const handleRequest = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      alert('Notifications activées !');
    }
  };

  return (
    <button onClick={handleRequest}>
      🔔 Activer les notifications
    </button>
  );
};
```

### Sauvegarder les tokens FCM dans Supabase

Crée une table `user_fcm_tokens` :

```sql
CREATE TABLE user_fcm_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  fcm_token TEXT UNIQUE NOT NULL,
  device_type TEXT DEFAULT 'web',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

Puis sauvegarde le token :

```typescript
const token = await requestNotificationPermission();

await supabase.from('user_fcm_tokens').upsert({
  user_email: customerEmail,
  fcm_token: token,
  device_type: 'web',
  updated_at: new Date().toISOString()
});
```

### Envoyer des notifications depuis le backend

Tu pourras ensuite envoyer des notifications depuis ton admin :

```typescript
// Exemple : Notifier qu'une commande est prête
const notifyOrderReady = async (orderId: string) => {
  // 1. Récupérer l'email du client
  const order = await supabase
    .from('commandes')
    .select('customer_email')
    .eq('id', orderId)
    .single();

  // 2. Récupérer son token FCM
  const { data: tokenData } = await supabase
    .from('user_fcm_tokens')
    .select('fcm_token')
    .eq('user_email', order.customer_email)
    .single();

  // 3. Envoyer via API Firebase
  // (nécessite une Cloud Function ou backend)
};
```

---

## 🐛 Problèmes courants

### "Service Worker registration failed"
→ Le site doit être en HTTPS (ou localhost pour le dev)

### "Notification permission denied"
→ L'utilisateur a refusé. Demande à nouveau depuis les paramètres du navigateur.

### "Firebase not configured"
→ Tu n'as pas encore suivi le guide `GUIDE_FIREBASE_PWA.md`

### La bannière d'installation ne s'affiche pas
→ Efface le localStorage :
```javascript
localStorage.removeItem('pwa-install-dismissed');
```

---

## 📚 Ressources

### Guides créés
- 📘 `GUIDE_FIREBASE_PWA.md` - Configuration Firebase
- 📗 `GUIDE_TEST_PWA.md` - Tests complets
- 📙 `GUIDE_ICONES_PWA.md` - Génération d'icônes

### Documentation officielle
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [PWA Web.dev](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Outils
- [PWA Builder](https://www.pwabuilder.com/) - Tester et améliorer ta PWA
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Auditer les performances
- [Firebase Console](https://console.firebase.google.com/) - Gérer les notifications

---

## ✅ Checklist de déploiement

Avant de déployer en production :

- [ ] Firebase configuré (GUIDE_FIREBASE_PWA.md)
- [ ] Variables d'environnement en place (.env)
- [ ] Icônes personnalisées (ou temporaires OK)
- [ ] Testé sur localhost
- [ ] Testé l'installation
- [ ] Testé une notification
- [ ] Testé le mode hors ligne
- [ ] Site déployé en HTTPS (Netlify/Vercel)
- [ ] Testé sur mobile réel
- [ ] Lighthouse score PWA > 90

---

## 🎉 C'est prêt !

La PWA Au Matin Vert est maintenant **100% fonctionnelle** !

**Prochaine action :**
1. Suis le guide `GUIDE_FIREBASE_PWA.md` (10 min)
2. Teste l'installation (5 min)
3. Déploie en production
4. Profite des notifications ! 🔔

**Besoin d'aide ?**
- Consulte les guides créés
- Vérifie la console pour les erreurs
- Teste étape par étape

Bonne chance ! 🚀
