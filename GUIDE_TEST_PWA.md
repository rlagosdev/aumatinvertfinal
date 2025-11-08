# 🧪 Guide : Tester la PWA Au Matin Vert

## 🎯 Ce que tu vas tester

1. ✅ Installation de la PWA
2. ✅ Fonctionnement hors ligne
3. ✅ Notifications push
4. ✅ Mise à jour automatique
5. ✅ Expérience utilisateur

---

## 📱 Test 1 : Installation de la PWA

### Sur ordinateur (Chrome/Edge)

1. **Lancer le site**
   ```bash
   npm run dev
   ```

2. **Ouvrir dans le navigateur**
   - URL : `http://localhost:5173`
   - Attends 3 secondes

3. **Vérifier la bannière d'installation**
   - Une bannière verte devrait apparaître en bas
   - Titre : "Installer Au Matin Vert"
   - Bouton "Installer"

4. **Installer l'application**
   - Clique sur le bouton **"Installer"**
   - Une popup Chrome devrait apparaître
   - Clique sur **"Installer"**

5. **Vérifier l'installation**
   - Une nouvelle fenêtre s'ouvre en mode standalone
   - L'icône Au Matin Vert (AMV) apparaît
   - Pas de barre d'adresse visible

### Sur Android

1. **Accéder au site depuis Chrome**
   - Va sur ton URL de production (après déploiement)
   - Ou utilise ngrok pour tester en local

2. **Afficher le menu**
   - Clique sur les 3 points ⋮ en haut à droite
   - Cherche **"Installer l'application"** ou **"Add to Home screen"**

3. **Installer**
   - Clique sur "Installer"
   - L'icône apparaît sur ton écran d'accueil

4. **Ouvrir l'app**
   - Clique sur l'icône Au Matin Vert
   - L'app s'ouvre en plein écran (sans Chrome visible)

### Sur iOS (Safari)

1. **Accéder au site**
   - Ouvre Safari
   - Va sur ton site

2. **Partager**
   - Clique sur l'icône Partager (carré avec flèche)
   - Scroll et trouve **"Sur l'écran d'accueil"**

3. **Ajouter**
   - Modifie le nom si besoin : **Au Matin Vert**
   - Clique sur **"Ajouter"**

4. **Ouvrir**
   - L'icône apparaît sur l'écran d'accueil
   - Ouvre l'app → Plein écran

---

## 🔌 Test 2 : Fonctionnement hors ligne

### Préparation
1. Installe la PWA (voir Test 1)
2. Navigue sur plusieurs pages :
   - Accueil
   - Produits
   - Panier
   - À propos

### Test hors ligne
1. **Couper la connexion**
   - Sur PC : Ouvre DevTools (F12)
   - Onglet **Network** → Sélectionne **Offline**
   - OU désactive ton Wi-Fi

2. **Recharger la page**
   - Appuie sur F5 (ou tire vers le bas sur mobile)
   - ✅ La page devrait se charger normalement

3. **Naviguer**
   - Essaye d'aller sur d'autres pages
   - Les pages déjà visitées devraient fonctionner
   - Les nouvelles pages montrent la page d'accueil en cache

4. **Reconnecter**
   - Réactive la connexion
   - Recharge → Tout fonctionne à nouveau

---

## 🔔 Test 3 : Notifications Push

### Étape 1 : Autoriser les notifications

1. **Première visite**
   - Ouvre la PWA
   - Le navigateur demande : **"Autoriser les notifications ?"**
   - Clique sur **"Autoriser"**

2. **Vérifier dans la console**
   - Ouvre DevTools (F12)
   - Onglet **Console**
   - Tu devrais voir :
     ```
     ✅ Permission notification accordée
     🔑 FCM Token: eMjXXXXXXXXXXXXXXXXXXXX
     ```

3. **Copier le token FCM**
   - Copie la chaîne qui commence par `e`, `c`, ou `d`
   - Garde-la pour l'étape suivante

### Étape 2 : Envoyer une notification de test

#### Option A : Via Firebase Console (Recommandé)

1. **Aller sur Firebase Console**
   - https://console.firebase.google.com/
   - Sélectionne ton projet **Au Matin Vert**

2. **Cloud Messaging**
   - Menu gauche → **Engagement** → **Cloud Messaging**
   - Clique sur **"Send your first message"**

3. **Composer le message**
   - **Titre** : "Nouvelle commande disponible !"
   - **Texte** : "Votre panier de fruits frais est prêt 🍎"
   - **Image** (optionnel) : URL d'une image

4. **Envoyer en test**
   - Clique sur **"Send test message"**
   - Colle le **token FCM** que tu as copié
   - Clique sur **"Test"**

5. **Vérifier**
   - ✅ La notification apparaît (même si l'app est fermée !)
   - Clique dessus → L'app s'ouvre

#### Option B : Via cURL (Avancé)

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "TON_FCM_TOKEN",
    "notification": {
      "title": "Test Au Matin Vert",
      "body": "Votre panier vous attend !",
      "icon": "/icon-192x192.png",
      "click_action": "https://aumatinvert.fr/"
    }
  }' \
  https://fcm.googleapis.com/fcm/send
```

---

## 🔄 Test 4 : Mise à jour automatique

### Simuler une mise à jour

1. **Modifier le code**
   - Ouvre `src/pages/Home.tsx`
   - Change un texte, par exemple : "Bienvenue chez Au Matin Vert V2"
   - Sauvegarde

2. **Recharger l'app**
   - Ferme et rouvre la PWA
   - OU recharge la page

3. **Vérifier la mise à jour**
   - Une popup devrait apparaître :
     **"Une nouvelle version est disponible. Recharger ?"**
   - Clique sur **OK**
   - La page se recharge avec la nouvelle version

4. **Confirmer**
   - ✅ Le nouveau texte apparaît
   - ✅ Aucune réinstallation nécessaire

---

## ✨ Test 5 : Expérience utilisateur

### Checklist UX

#### Sur mobile
- [ ] L'icône AMV apparaît sur l'écran d'accueil
- [ ] L'app s'ouvre en plein écran (sans barre de navigation)
- [ ] La barre d'état est verte (#22c55e)
- [ ] Le splash screen s'affiche au lancement (icône AMV)
- [ ] Pas de clignotement blanc au démarrage

#### Navigation
- [ ] Les pages se chargent rapidement (cache)
- [ ] Les transitions sont fluides
- [ ] Le bouton retour fonctionne
- [ ] Les liens externes s'ouvrent dans le navigateur

#### Hors ligne
- [ ] Message clair si connexion perdue
- [ ] Les pages visitées restent accessibles
- [ ] Les images en cache s'affichent

#### Notifications
- [ ] Icône Au Matin Vert visible
- [ ] Son de notification (si activé)
- [ ] Badge sur l'icône de l'app (Android)
- [ ] Clic sur notif → Ouvre l'app

---

## 🐛 Troubleshooting

### La bannière d'installation n'apparaît pas

**Causes possibles :**
- Tu as déjà fermé la bannière (localStorage)
- L'app est déjà installée
- Le navigateur ne supporte pas les PWA
- Le manifest.json n'est pas valide

**Solutions :**
```javascript
// Ouvre la console et tape :
localStorage.removeItem('pwa-install-dismissed');
// Recharge la page
```

### Notifications non reçues

**Causes possibles :**
- Permission refusée
- Token FCM invalide
- Firebase mal configuré
- Service Worker non enregistré

**Solutions :**
1. Vérifie la console pour les erreurs
2. Réinitialise les permissions du site
3. Vérifie les variables d'environnement
4. Regénère le token FCM

### L'app ne fonctionne pas hors ligne

**Causes possibles :**
- Service Worker non enregistré
- Stratégie de cache incorrecte
- Page jamais visitée en ligne

**Solutions :**
1. Vérifie dans DevTools → Application → Service Workers
2. Visite toutes les pages au moins une fois
3. Vide le cache et recommence

### Mode standalone ne fonctionne pas

**Causes possibles :**
- `display: "standalone"` mal configuré
- iOS nécessite Safari (pas Chrome)

**Solutions :**
1. Vérifie `manifest.json`
2. Sur iOS, utilise obligatoirement Safari

---

## 📊 Métriques à surveiller

### Performance
- [ ] Temps de chargement < 2s
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

### Installation
- [ ] Taux d'installation > 5%
- [ ] Taux de rétention > 30%

### Notifications
- [ ] Taux d'autorisation > 40%
- [ ] Taux de clic > 10%

---

## 🚀 Prochaines étapes

Une fois tous les tests validés :

1. [ ] Configure Firebase en production
2. [ ] Remplace les icônes temporaires par le vrai logo
3. [ ] Déploie sur Netlify/Vercel avec HTTPS
4. [ ] Teste sur différents appareils réels
5. [ ] Surveille les métriques Firebase Analytics

---

## 📚 Outils de debug

### Chrome DevTools
- **Application** → Service Workers
- **Application** → Manifest
- **Application** → Cache Storage
- **Network** → Offline mode

### Firefox DevTools
- **Storage** → Service Workers
- **Network** → Throttling

### Lighthouse
```bash
# Tester la PWA
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

Score à viser :
- ✅ PWA : 100/100
- ✅ Performance : > 90
- ✅ Accessibility : > 90
