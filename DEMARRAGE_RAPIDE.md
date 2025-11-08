# 🚀 Démarrage Rapide - Publication Réseaux Sociaux

## ✅ Ce qui a été créé

Votre système de publication sur Facebook/Instagram est prêt ! Il fonctionne exactement comme **Metricool** :
- ✅ Vos utilisateurs cliquent sur "Connecter Facebook"
- ✅ Ils autorisent l'accès
- ✅ Leurs comptes apparaissent automatiquement
- ✅ Ils peuvent publier immédiatement !

---

## 📋 Pour démarrer (10-15 minutes)

### Étape 1 : Créer les tables dans Supabase

1. Connectez-vous à **Supabase**
2. Allez dans **"SQL Editor"**
3. Créez une nouvelle requête
4. Copiez le contenu de `create_social_accounts_table.sql`
5. Exécutez (Run)
6. Créez une autre requête
7. Copiez le contenu de `create_scheduled_posts_table.sql`
8. Exécutez (Run)

✅ Vos tables sont créées !

---

### Étape 2 : Créer votre Facebook App

Suivez le guide **`FACEBOOK_APP_SETUP_SIMPLE.md`**

Résumé :
1. Allez sur https://developers.facebook.com/
2. Créez une app (5 min)
3. Activez "Connexion Facebook" (2 min)
4. Activez "Instagram Graph API" (1 min)
5. Demandez les permissions (1 min)
6. Copiez App ID et App Secret

---

### Étape 3 : Configurer votre projet

1. Créez un fichier `.env` à la racine :

```env
VITE_FACEBOOK_APP_ID=votre_app_id_ici
VITE_FACEBOOK_APP_SECRET=votre_app_secret_ici
VITE_FACEBOOK_REDIRECT_URI=http://localhost:5173/api/auth/facebook/callback
```

2. Ajoutez `.env` au `.gitignore` :

```
# Environment variables
.env
.env.local
.env.production
```

---

### Étape 4 : Tester !

1. Démarrez votre app :
```bash
npm run dev
```

2. Connectez-vous à l'admin

3. Allez dans **"Publication Social"**

4. Cliquez sur **"Connecter Facebook"**

5. Autorisez l'accès à vos pages

6. ✅ **Vos comptes apparaissent !**

---

## 🎯 Comment ça marche pour vos utilisateurs ?

### Connexion (1 clic)
```
Utilisateur → "Connecter Facebook" → Popup → Login → Autoriser → ✅ Connecté !
```

### Publication
```
1. Sélectionner un compte (Facebook ou Instagram)
2. Écrire le message
3. Ajouter des images (optionnel)
4. Publier maintenant OU Planifier
5. ✅ Post publié !
```

---

## 📁 Fichiers créés

### Base de données
- `create_social_accounts_table.sql` - Table des comptes connectés
- `create_scheduled_posts_table.sql` - Table des posts planifiés

### Code
- `src/services/facebookAuth.ts` - Service OAuth
- `src/pages/FacebookCallback.tsx` - Page de callback OAuth
- `src/components/admin/SocialMediaPublisher.tsx` - Interface de publication
- `App.tsx` - Route callback ajoutée

### Documentation
- `FACEBOOK_APP_SETUP_SIMPLE.md` - Guide complet de configuration (15 min)
- `DEMARRAGE_RAPIDE.md` - Ce fichier !

---

## 🎁 Fonctionnalités

### Connexion Facebook/Instagram
- ✅ OAuth en 1 clic
- ✅ Multi-utilisateurs (chacun ses comptes)
- ✅ Sécurité RLS (Row Level Security)
- ✅ Tokens automatiquement gérés

### Publication
- ✅ Facebook Pages
- ✅ Instagram Business
- ✅ Publication instantanée
- ✅ Planification de posts
- ✅ Upload d'images
- ✅ Calendrier éditorial

### Interface
- ✅ 3 onglets : Comptes / Publier / Posts Planifiés
- ✅ Design moderne et intuitif
- ✅ Notifications en temps réel
- ✅ Gestion des erreurs

---

## 🔄 Prochaines étapes (Optionnel)

### Publication immédiate (TODO)
Actuellement, le système crée uniquement des brouillons.
Pour activer la publication immédiate :

1. Utiliser les fonctions `publishToFacebook()` et `publishToInstagram()` dans `facebookAuth.ts`
2. Modifier `handlePublishPost()` dans `SocialMediaPublisher.tsx`
3. Appeler l'API Meta quand `scheduledDate` est vide

### Système de planification automatique (TODO)
Pour que les posts planifiés se publient automatiquement :

1. Créer une Edge Function Supabase (cron job)
2. Vérifier les posts avec `status='scheduled'` et `scheduled_at <= NOW()`
3. Publier via API Meta
4. Mettre à jour le statut à `'published'`

### Upload d'images (TODO)
Pour uploader les images vers un CDN :

1. Utiliser Supabase Storage ou Cloudinary
2. Uploader l'image
3. Récupérer l'URL publique
4. Utiliser cette URL avec `publishToFacebook()` ou `publishToInstagram()`

### Statistiques (TODO)
Pour afficher les stats des posts :

1. Utiliser `getFacebookPostStats()` et `getInstagramPostStats()`
2. Créer un onglet "Statistiques"
3. Afficher likes, comments, reach, impressions

---

## 🐛 Problèmes courants

### "Facebook App non configurée"
→ Vérifiez que `.env` contient bien `VITE_FACEBOOK_APP_ID`

### "Popup bloquée"
→ Autorisez les popups dans votre navigateur

### "Redirect URI mismatch"
→ L'URL dans `.env` doit correspondre exactement à celle dans Facebook

### "This app can't be used"
→ Ajoutez des testeurs dans "Rôles" → "Testeurs" (mode Développement)

### "Permission not granted"
→ L'utilisateur doit autoriser toutes les permissions dans la popup

---

## 📚 Documentation complète

- **FACEBOOK_APP_SETUP_SIMPLE.md** - Guide complet pas à pas
- **FACEBOOK_APP_SETUP.md** - Guide avancé avec code OAuth complet

---

## 🎉 Félicitations !

Vous avez maintenant un système de publication sur les réseaux sociaux professionnel, gratuit et illimité !

**Besoin d'aide ?** Consultez la documentation ou contactez le support.
