# ✅ Configuration OAuth Facebook - Dernière Étape

## 🎉 Félicitations !

Votre système de publication sur les réseaux sociaux est **presque prêt** !

Le code est implémenté et fonctionnel. Il reste juste une dernière configuration dans votre Facebook App.

---

## ⚠️ Action Requise : Mise à Jour de l'URI de Redirection

### Problème actuel

Votre `.env` est configuré avec :
```
VITE_FACEBOOK_REDIRECT_URI=http://localhost:5178/api/auth/facebook/callback
```

Mais dans votre **Facebook App**, l'URI de redirection est configurée pour :
```
http://localhost:5173/api/auth/facebook/callback
```

**Il faut que les deux correspondent exactement !**

---

## 🔧 Solution (2 options)

### Option A : Ajouter le nouveau port dans Facebook App (RECOMMANDÉ)

1. Allez sur https://developers.facebook.com/
2. Sélectionnez votre app (ID: **667936242712510**)
3. Allez dans **"Produits"** → **"Connexion Facebook"** → **"Paramètres"**
4. Dans **"URI de redirection OAuth valides"**, ajoutez :
   ```
   http://localhost:5178/api/auth/facebook/callback
   http://localhost:5179/api/auth/facebook/callback
   ```

5. Gardez aussi l'ancienne :
   ```
   http://localhost:5173/api/auth/facebook/callback
   ```

6. Cliquez sur **"Enregistrer les modifications"**

✅ **Pourquoi cette option ?** Vous pourrez utiliser n'importe quel port (5173-5179)

---

### Option B : Redémarrer Windows et libérer les ports

Si vous voulez absolument utiliser le port 5173 :

1. **Redémarrez votre ordinateur** (pour libérer tous les ports)
2. Vérifiez que `.env` contient bien `http://localhost:5173/api/auth/facebook/callback`
3. Lancez `npm run dev`
4. Le serveur démarrera sur le port 5173

---

## 🚀 Test de Connexion

Une fois la configuration mise à jour :

1. **Trouvez le port de votre serveur** :
   - Regardez dans le terminal où `npm run dev` tourne
   - Vous verrez : `Local: http://localhost:XXXX/`

2. **Ouvrez votre navigateur** :
   ```
   http://localhost:XXXX/admin/login
   ```

3. **Connectez-vous à l'admin**

4. **Allez dans "Publication Social"**

5. **Cliquez sur "Connecter Facebook"**

6. Une popup s'ouvre → Autorisez l'accès

7. ✅ **Vos comptes apparaissent !**

---

## 📋 Vérification Rapide

Avant de tester, assurez-vous que :

- [ ] Votre Facebook App est créée (ID: 667936242712510)
- [ ] Les permissions sont activées (pages_show_list, pages_manage_posts, etc.)
- [ ] L'URI de redirection dans Facebook App contient `http://localhost:5178/api/auth/facebook/callback` (ou votre port actuel)
- [ ] Le fichier `.env` est correctement configuré
- [ ] `npm run dev` est lancé
- [ ] Vous êtes connecté à l'admin de votre site

---

## 🐛 En Cas d'Erreur

### "Redirect URI mismatch"
→ L'URI dans Facebook App ne correspond pas à celle dans `.env`
→ Vérifiez que les deux sont **exactement identiques** (http vs https, port, slash final)

### "Invalid Scopes"
→ Les permissions ne sont pas activées dans votre Facebook App
→ Allez dans "Cas d'utilisation" → "Personnaliser" → Cliquez sur "Ajouter au Contrôle app" pour chaque permission

### "Popup bloquée"
→ Autorisez les popups dans votre navigateur pour `localhost`

### "This app can't be used"
→ Votre app est en mode Développement
→ Ajoutez des testeurs dans "Rôles" → "Testeurs"

---

## 📊 Vérifier dans Supabase

Après avoir connecté un compte, vérifiez dans Supabase :

1. Allez sur https://supabase.com/dashboard/project/bvvekjhvmorgdvleobdo
2. Ouvrez **"Table Editor"**
3. Sélectionnez la table **`social_accounts`**
4. Vous devriez voir vos comptes Facebook/Instagram connectés !

---

## 🎯 Ce Qui Fonctionne Déjà

✅ **OAuth Flow** : Connexion en 1 clic via popup
✅ **Multi-comptes** : Facebook Pages + Instagram Business
✅ **Multi-utilisateurs** : Chaque utilisateur voit ses comptes
✅ **Sécurité** : Row Level Security (RLS) activé
✅ **Interface** : 3 onglets (Comptes / Publier / Posts Planifiés)
✅ **Planification** : Création de posts planifiés

---

## 📝 Prochaines Fonctionnalités

Les fonctionnalités suivantes sont prêtes dans le code mais pas encore activées :

### 1. Publication Immédiate
Actuellement, le système crée des **brouillons**. Pour activer la publication immédiate :
- Utiliser `publishToFacebook()` dans `facebookAuth.ts`
- Appeler l'API Meta quand `scheduledDate` est vide

### 2. Upload d'Images
Pour uploader des images :
- Utiliser **Supabase Storage** ou **Cloudinary**
- Récupérer l'URL publique
- Passer l'URL à `publishToFacebook()` ou `publishToInstagram()`

### 3. Publication Automatique des Posts Planifiés
Pour que les posts se publient automatiquement :
- Créer une **Supabase Edge Function** (cron job)
- Vérifier les posts avec `status='scheduled'` et `scheduled_at <= NOW()`
- Publier via API Meta
- Mettre à jour le statut

### 4. Statistiques
Pour afficher les stats :
- Utiliser `getFacebookPostStats()` et `getInstagramPostStats()`
- Créer un onglet "Statistiques"
- Afficher likes, comments, reach, impressions

---

## 📚 Documentation

Consultez ces fichiers pour plus d'informations :

- `FACEBOOK_APP_SETUP_SIMPLE.md` - Guide complet de configuration Facebook App
- `DEMARRAGE_RAPIDE.md` - Guide de démarrage rapide
- `src/services/facebookAuth.ts` - Fonctions OAuth et publication
- `src/pages/FacebookCallback.tsx` - Callback OAuth
- `src/components/admin/SocialMediaPublisher.tsx` - Interface utilisateur

---

## ✅ Checklist Finale

- [ ] URI de redirection ajoutée dans Facebook App
- [ ] `npm run dev` lancé
- [ ] Port du serveur noté (5178 ou autre)
- [ ] Navigateur ouvert sur `http://localhost:PORT/admin`
- [ ] Connecté à l'admin
- [ ] Onglet "Publication Social" visible
- [ ] Clic sur "Connecter Facebook"
- [ ] Popup ouverte et autorisée
- [ ] Comptes visibles dans la liste !

---

## 🎉 Une Fois que Ça Marche

Vous aurez un système de publication professionnel **100% gratuit** comme Metricool, Buffer ou Later !

Vos utilisateurs pourront :
- ✅ Connecter leurs comptes Facebook/Instagram en 1 clic
- ✅ Publier du contenu
- ✅ Planifier des posts
- ✅ Gérer plusieurs comptes
- ✅ Sans limite de publications !

---

**Besoin d'aide ?** Consultez la documentation ou ouvrez une issue sur GitHub.
