# Configuration Facebook OAuth - Version Simplifiée (comme Metricool)

## 🎯 Principe

**Vous créez UNE SEULE Facebook App** et tous vos utilisateurs se connectent via cette app.
Les utilisateurs n'ont rien à configurer, juste cliquer sur "Connecter Facebook" !

---

## ⏱️ Temps nécessaire : 10-15 minutes

---

## 📝 Étape 1 : Créer une Facebook App (5 min)

###1.1 Accéder à Meta for Developers

1. Allez sur : **https://developers.facebook.com/**
2. Connectez-vous avec votre compte Facebook
3. Cliquez sur **"Mes apps"** → **"Créer une app"**

### 1.2 Choisir le type d'app

1. Sélectionnez **"Autre"** ou **"Consommateur"**
2. Cliquez sur **"Suivant"**

### 1.3 Informations de base

- **Nom de l'app** : `Au Matin Vert Publisher` (ou votre nom)
- **Email de contact** : Votre email professionnel
- Cliquez sur **"Créer une app"**

### 1.4 Notez vos identifiants

Dans **"Paramètres" → "Paramètres de base"** :

```
App ID : 123456789012345          ← COPIEZ CECI
Clé secrète : abc123def456...     ← COPIEZ CECI
```

⚠️ **NE PARTAGEZ JAMAIS votre clé secrète** !

---

## ⚙️ Étape 2 : Activer Connexion Facebook (3 min)

### 2.1 Ajouter le produit

1. Dans le menu de gauche, allez dans **"Produits"**
2. Trouvez **"Connexion Facebook"** (Facebook Login)
3. Cliquez sur **"Configurer"**

### 2.2 Configurer les URLs

Allez dans **"Connexion Facebook" → "Paramètres"**

#### **URI de redirection OAuth valides** :
```
https://votredomaine.com/api/auth/facebook/callback
http://localhost:5173/api/auth/facebook/callback
```

⚠️ Remplacez `votredomaine.com` par votre vrai domaine !

#### **Domaines de l'application** :
```
votredomaine.com
localhost
```

#### **Activez ces options** :
- ✅ Connexion avec l'API JavaScript SDK
- ✅ Connexion du navigateur Web OAuth
- ✅ Connexion via iframe

Cliquez sur **"Enregistrer les modifications"**

---

## 📱 Étape 3 : Activer Instagram (2 min)

1. Retournez dans **"Produits"**
2. Trouvez **"Instagram Graph API"**
3. Cliquez sur **"Configurer"**
4. Acceptez les conditions

---

## 🔐 Étape 4 : Demander les Permissions (1 min)

### Permissions nécessaires

Allez dans **"Utilisation de l'app" → "Autorisations"**

Demandez ces permissions (cliquez sur "Demander accès avancé") :

**Pour Facebook** :
- `pages_show_list` - Lister les pages
- `pages_read_engagement` - Lire les stats
- `pages_manage_posts` - **IMPORTANT** : Publier sur les pages

**Pour Instagram** :
- `instagram_basic` - Accès de base
- `instagram_content_publish` - **IMPORTANT** : Publier du contenu

---

## 💻 Étape 5 : Configuration dans votre Code (3 min)

### 5.1 Créer le fichier .env

À la racine de votre projet, créez `.env` :

```env
# Facebook OAuth Configuration
VITE_FACEBOOK_APP_ID=123456789012345
VITE_FACEBOOK_APP_SECRET=abc123def456ghi789jkl
VITE_FACEBOOK_REDIRECT_URI=https://votredomaine.com/api/auth/facebook/callback

# Pour développement local, utilisez :
# VITE_FACEBOOK_REDIRECT_URI=http://localhost:5173/api/auth/facebook/callback
```

⚠️ **Remplacez** par vos vrais identifiants !

### 5.2 Ajouter .env au .gitignore

Dans votre fichier `.gitignore`, ajoutez :

```
# Environment variables
.env
.env.local
.env.production
```

---

## ✅ Étape 6 : Tester (Mode Développement)

### 6.1 Ajouter des testeurs

Votre app est en **mode Développement**. Seuls les testeurs peuvent se connecter.

1. Allez dans **"Rôles" → "Testeurs"**
2. Cliquez sur **"Ajouter des testeurs"**
3. Entrez le nom/email Facebook des personnes
4. Elles recevront une invitation à accepter

### 6.2 Tester la connexion

1. Démarrez votre app : `npm run dev`
2. Allez dans Admin → "Publication Social"
3. Cliquez sur **"Connecter Facebook"**
4. Autorisez l'accès à vos pages
5. ✅ Vos comptes apparaissent dans la liste !

---

## 🚀 Étape 7 : Passer en Production (Optionnel)

### Quand passer en production ?

**Mode Développement** (actuel) :
- ✅ Gratuit
- ✅ Fonctionne immédiatement
- ❌ Maximum ~50 testeurs
- ❌ Seulement les personnes invitées

**Mode Production** (après révision Meta) :
- ✅ Accessible à TOUS les utilisateurs
- ✅ Illimité
- ⏱️ Révision Meta (1-3 jours)

### Comment passer en production ?

#### 1. Préparer la révision

Allez dans **"Révision de l'app"** :

Pour chaque permission avancée :
- Cliquez sur **"Demander accès avancé"**
- Expliquez votre utilisation :
  ```
  "Permettre aux utilisateurs de publier du contenu sur leurs pages Facebook
  et comptes Instagram depuis notre plateforme de gestion de réseaux sociaux."
  ```
- Ajoutez des captures d'écran de votre interface
- (Optionnel) Vidéo de démonstration

#### 2. Vérifier la configuration

Assurez-vous d'avoir :
- ✅ Politique de confidentialité publique
- ✅ Conditions d'utilisation publiques
- ✅ Instructions claires pour les testeurs Meta
- ✅ App testée sans bugs

#### 3. Passer l'app en Live

Une fois les permissions approuvées (1-3 jours) :

1. Allez dans **"Paramètres de base"**
2. En haut, changez **"Statut : Développement"** → **"En ligne"**
3. Confirmez

🎉 **Votre app est accessible à tous !**

---

## 🔄 Comment ça fonctionne pour vos utilisateurs ?

### Flux utilisateur (simple comme Metricool) :

```
┌─────────────────────────────────────────┐
│ 1. Utilisateur clique                   │
│    "Connecter Facebook"                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Popup Facebook s'ouvre               │
│    → Login avec Facebook                │
│    → Sélectionner les pages à connecter │
│    → Autoriser l'accès                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. Popup se ferme automatiquement       │
│    → Comptes apparaissent dans la liste │
│    → Prêt à publier !                   │
└─────────────────────────────────────────┘
```

**L'utilisateur n'a RIEN à configurer** ! Pas d'API key, pas de token, rien.
Juste cliquer et autoriser, comme sur Metricool ou Buffer.

---

## 🐛 Dépannage

### "L'application n'est pas configurée pour OAuth"
→ Vérifiez que vous avez bien activé "Connexion Facebook" et ajouté les URLs de redirection

### "Popup bloquée"
→ Autorisez les popups pour votre site dans les paramètres du navigateur

### "Redirect URI mismatch"
→ L'URL dans `.env` doit correspondre EXACTEMENT à celle dans Facebook (https vs http, slash final, etc.)

### "This app can't be used by general public"
→ Votre app est en mode Développement. Ajoutez des testeurs OU passez en Production

### "Permission not granted"
→ L'utilisateur n'a pas autorisé toutes les permissions dans la popup OAuth

---

## 🎁 Avantages de cette méthode

✅ **Simple pour les utilisateurs** - 1 clic = Connecté
✅ **Pas de configuration technique** - Rien à copier/coller
✅ **100% gratuit** - Pas d'abonnement
✅ **Illimité** - Pas de limite de posts
✅ **Multi-utilisateurs** - Chaque utilisateur ses comptes
✅ **Sécurisé** - Tokens stockés en base de données cryptée
✅ **Professionnel** - Comme Metricool, Buffer, Later

---

## 📚 Ressources

- **Documentation OAuth** : https://developers.facebook.com/docs/facebook-login/web
- **Graph API Explorer** : https://developers.facebook.com/tools/explorer/
- **Test de permissions** : https://developers.facebook.com/tools/debug/accesstoken/
- **Support Meta** : https://developers.facebook.com/support/

---

## ✅ Checklist Finale

- [ ] Facebook App créée
- [ ] App ID et App Secret copiés
- [ ] Connexion Facebook activée
- [ ] Instagram Graph API ajoutée
- [ ] URLs de redirection configurées
- [ ] Permissions demandées
- [ ] Fichier `.env` créé avec les identifiants
- [ ] `.env` ajouté au `.gitignore`
- [ ] Testeurs ajoutés (mode Développement)
- [ ] Test de connexion réussi
- [ ] (Optionnel) App passée en Production

---

## 🎉 C'est terminé !

Vos utilisateurs peuvent maintenant se connecter en 1 clic, exactement comme sur Metricool !

**Besoin d'aide ?** Consultez la documentation Meta ou ouvrez une issue sur GitHub.
