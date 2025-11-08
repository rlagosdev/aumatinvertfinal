# Configuration Facebook App pour OAuth Multi-Utilisateurs

Ce guide vous explique comment configurer une Facebook App pour permettre à **n'importe quel utilisateur** de connecter son propre compte Facebook/Instagram à votre application.

---

## 🎯 Objectif

Permettre à chaque utilisateur de :
1. Cliquer sur "Connecter Facebook" dans votre interface
2. Se connecter avec SON compte Facebook
3. Autoriser l'accès à ses pages Facebook et comptes Instagram
4. Publier sur SES réseaux sociaux directement depuis votre app

---

## 📋 Prérequis

- Un compte Facebook (personnel)
- Un compte Meta for Developers
- Votre site doit être en HTTPS (obligatoire pour OAuth)

---

## Étape 1 : Créer une Facebook App

### 1.1 Accéder à Meta for Developers

1. Allez sur : https://developers.facebook.com/
2. Connectez-vous avec votre compte Facebook
3. Cliquez sur **"Mes apps"** (en haut à droite)
4. Cliquez sur **"Créer une app"**

### 1.2 Choisir le type d'app

1. Sélectionnez **"Consommateur"** (Consumer)
2. Cliquez sur **"Suivant"**

### 1.3 Informations de base

Remplissez les champs :
- **Nom de l'app** : `Au Matin Vert - Social Publisher` (ou votre nom)
- **Email de contact** : Votre email professionnel
- **Compte Meta Business** : Créez-en un si vous n'en avez pas
- Cliquez sur **"Créer une app"**

### 1.4 Notez vos identifiants

Une fois l'app créée, allez dans **"Paramètres" → "Paramètres de base"** :

```
App ID : 123456789012345
Clé secrète de l'app : abc123def456ghi789jkl
```

⚠️ **IMPORTANT** : Ne partagez JAMAIS votre clé secrète publiquement !

---

## Étape 2 : Configurer les Produits Facebook

### 2.1 Ajouter "Connexion Facebook" (Facebook Login)

1. Dans le tableau de bord de votre app
2. Allez dans **"Produits"** (menu de gauche)
3. Trouvez **"Connexion Facebook"** (Facebook Login)
4. Cliquez sur **"Configurer"**

### 2.2 Configurer les URLs OAuth

1. Allez dans **"Connexion Facebook" → "Paramètres"**
2. Remplissez les champs suivants :

#### URI de redirection OAuth valides :
```
https://aumatinvert.fr/api/auth/facebook/callback
http://localhost:5173/api/auth/facebook/callback
```

#### URI de déconnexion valides :
```
https://aumatinvert.fr/
http://localhost:5173/
```

#### Domaines de l'application :
```
aumatinvert.fr
localhost
```

3. **Activez** :
   - ✅ "Connexion avec l'API JavaScript SDK"
   - ✅ "Connexion du navigateur Web OAuth"
   - ✅ "Connexion via iframe"

4. Cliquez sur **"Enregistrer les modifications"**

### 2.3 Ajouter Instagram Graph API

1. Retournez dans **"Produits"**
2. Trouvez **"Instagram Graph API"**
3. Cliquez sur **"Configurer"**
4. Acceptez les conditions

---

## Étape 3 : Demander les Permissions (Autorisations)

### 3.1 Permissions pour Facebook

Dans **"Révision de l'app" → "Autorisations et fonctionnalités"**, demandez :

**Permissions de base** (approval automatique pour développement) :
- `public_profile` - Informations publiques du profil
- `email` - Adresse email de l'utilisateur

**Permissions avancées** (nécessitent révision Meta) :
- `pages_show_list` - Lister les pages que l'utilisateur gère
- `pages_read_engagement` - Lire les stats d'engagement
- `pages_manage_posts` - **IMPORTANT** : Publier sur les pages
- `pages_read_user_content` - Lire le contenu des pages

### 3.2 Permissions pour Instagram

- `instagram_basic` - Accès de base au compte Instagram
- `instagram_content_publish` - **IMPORTANT** : Publier du contenu
- `instagram_manage_comments` - Gérer les commentaires
- `instagram_manage_insights` - Voir les statistiques

### 3.3 Mode Développement vs Production

**Mode Développement** (par défaut) :
- ✅ Gratuit
- ✅ Fonctionne immédiatement
- ❌ Limité aux admins/développeurs/testeurs de l'app
- ❌ Maximum 50 utilisateurs

**Mode Production** (après révision) :
- ✅ Accessible à TOUS les utilisateurs
- ✅ Illimité
- ⏱️ Nécessite révision par Meta (1-3 jours)

---

## Étape 4 : Ajouter des Testeurs (Mode Développement)

Pour tester AVANT la révision Meta :

### 4.1 Ajouter des utilisateurs testeurs

1. Allez dans **"Rôles" → "Testeurs"**
2. Cliquez sur **"Ajouter des testeurs"**
3. Entrez le nom ou email Facebook des personnes
4. Elles recevront une invitation à accepter

### 4.2 Ajouter des pages de test

1. Allez dans **"Rôles" → "Pages de test"**
2. Créez ou ajoutez des pages Facebook pour tester

---

## Étape 5 : Configuration dans votre Code

### 5.1 Variables d'environnement

Créez/éditez le fichier `.env` à la racine de votre projet :

```env
# Facebook OAuth Configuration
VITE_FACEBOOK_APP_ID=123456789012345
VITE_FACEBOOK_APP_SECRET=abc123def456ghi789jkl
VITE_FACEBOOK_REDIRECT_URI=https://aumatinvert.fr/api/auth/facebook/callback

# Pour développement local
# VITE_FACEBOOK_REDIRECT_URI=http://localhost:5173/api/auth/facebook/callback
```

⚠️ **SÉCURITÉ** : Ajoutez `.env` dans votre `.gitignore` !

### 5.2 Configuration Supabase

Dans Supabase, allez dans **"Authentication" → "Providers"** :

1. Activez **"Facebook"**
2. Entrez votre **App ID**
3. Entrez votre **App Secret**
4. Ajoutez l'URL de redirection : `https://[your-project].supabase.co/auth/v1/callback`

---

## Étape 6 : Implémenter le Code OAuth

### 6.1 Installer Facebook SDK

```bash
npm install react-facebook-login
```

### 6.2 Créer le service OAuth

Créez `src/services/facebookAuth.ts` :

```typescript
// Configuration
export const FB_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID;
export const FB_REDIRECT_URI = import.meta.env.VITE_FACEBOOK_REDIRECT_URI;

// Permissions demandées
const PERMISSIONS = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish'
].join(',');

// Générer l'URL de connexion OAuth
export const getFacebookLoginUrl = (): string => {
  const params = new URLSearchParams({
    client_id: FB_APP_ID,
    redirect_uri: FB_REDIRECT_URI,
    scope: PERMISSIONS,
    response_type: 'code',
    state: Math.random().toString(36) // Protection CSRF
  });

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
};

// Échanger le code contre un access token
export const exchangeCodeForToken = async (code: string) => {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `client_id=${FB_APP_ID}&` +
    `client_secret=${import.meta.env.VITE_FACEBOOK_APP_SECRET}&` +
    `redirect_uri=${FB_REDIRECT_URI}&` +
    `code=${code}`
  );

  return response.json();
};

// Récupérer les pages Facebook de l'utilisateur
export const getUserPages = async (accessToken: string) => {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );

  return response.json();
};

// Récupérer les comptes Instagram Business liés
export const getInstagramAccounts = async (pageId: string, pageAccessToken: string) => {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}?` +
    `fields=instagram_business_account&` +
    `access_token=${pageAccessToken}`
  );

  return response.json();
};

// Publier sur Facebook
export const publishToFacebook = async (
  pageId: string,
  pageAccessToken: string,
  message: string,
  imageUrl?: string
) => {
  const params = new URLSearchParams({
    message,
    access_token: pageAccessToken
  });

  if (imageUrl) {
    params.append('url', imageUrl);
  }

  const endpoint = imageUrl ? 'photos' : 'feed';
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${pageId}/${endpoint}`,
    {
      method: 'POST',
      body: params
    }
  );

  return response.json();
};

// Publier sur Instagram
export const publishToInstagram = async (
  instagramAccountId: string,
  accessToken: string,
  imageUrl: string,
  caption: string
) => {
  // Étape 1 : Créer le conteneur média
  const containerResponse = await fetch(
    `https://graph.facebook.com/v18.0/${instagramAccountId}/media`,
    {
      method: 'POST',
      body: new URLSearchParams({
        image_url: imageUrl,
        caption,
        access_token: accessToken
      })
    }
  );

  const { id: creationId } = await containerResponse.json();

  // Étape 2 : Publier le conteneur
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`,
    {
      method: 'POST',
      body: new URLSearchParams({
        creation_id: creationId,
        access_token: accessToken
      })
    }
  );

  return publishResponse.json();
};
```

### 6.3 Mettre à jour le composant SocialMediaPublisher

Modifiez `handleConnectFacebook` dans `SocialMediaPublisher.tsx` :

```typescript
const handleConnectFacebook = () => {
  const loginUrl = getFacebookLoginUrl();

  // Ouvrir popup OAuth
  const width = 600;
  const height = 700;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  window.open(
    loginUrl,
    'Facebook Login',
    `width=${width},height=${height},left=${left},top=${top}`
  );
};
```

### 6.4 Créer la route de callback

Créez `src/pages/FacebookCallback.tsx` :

```typescript
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { exchangeCodeForToken, getUserPages, getInstagramAccounts } from '../services/facebookAuth';
import { toast } from 'react-toastify';

const FacebookCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Connexion annulée');
        window.close(); // Fermer la popup
        return;
      }

      if (!code || !user) return;

      try {
        // Échanger le code contre un token
        const { access_token } = await exchangeCodeForToken(code);

        // Récupérer les pages Facebook
        const { data: pages } = await getUserPages(access_token);

        // Sauvegarder chaque page dans la base de données
        for (const page of pages) {
          await supabase.from('social_accounts').upsert({
            user_id: user.id,
            platform: 'facebook',
            platform_user_id: page.id,
            platform_username: page.username || page.id,
            page_name: page.name,
            access_token: page.access_token, // Token de la page, pas de l'utilisateur
            profile_picture_url: `https://graph.facebook.com/${page.id}/picture`,
            is_active: true
          });

          // Vérifier si la page a un compte Instagram
          try {
            const igData = await getInstagramAccounts(page.id, page.access_token);

            if (igData.instagram_business_account) {
              const igId = igData.instagram_business_account.id;

              await supabase.from('social_accounts').upsert({
                user_id: user.id,
                platform: 'instagram',
                platform_user_id: igId,
                platform_username: page.name, // À améliorer avec l'username IG réel
                page_name: `Instagram de ${page.name}`,
                access_token: page.access_token,
                is_active: true
              });
            }
          } catch (err) {
            console.log('Pas de compte Instagram pour cette page');
          }
        }

        toast.success(`${pages.length} compte(s) connecté(s) !`);

        // Fermer la popup et recharger la page parente
        if (window.opener) {
          window.opener.postMessage({ type: 'facebook-auth-success' }, '*');
          window.close();
        } else {
          navigate('/admin');
        }
      } catch (error: any) {
        console.error('Error:', error);
        toast.error('Erreur lors de la connexion : ' + error.message);
      }
    };

    handleCallback();
  }, [searchParams, user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-zinc-600">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default FacebookCallback;
```

### 6.5 Ajouter la route dans App.tsx

```typescript
import FacebookCallback from './pages/FacebookCallback';

// Dans vos routes :
<Route path="/api/auth/facebook/callback" element={<FacebookCallback />} />
```

---

## Étape 7 : Passer en Production

### 7.1 Préparer la révision Meta

1. Dans votre app Facebook, allez dans **"Révision de l'app"**
2. Pour chaque permission avancée, cliquez sur **"Demander"**
3. Remplissez le formulaire :
   - **Comment utilisez-vous cette permission ?** : "Permettre aux utilisateurs de publier du contenu sur leurs pages Facebook et comptes Instagram depuis notre plateforme de gestion"
   - **Captures d'écran** : Montrez votre interface avec le bouton "Connecter Facebook" et l'écran de publication
   - **Vidéo de démo** : Enregistrez une vidéo montrant le flux complet (optionnel mais recommandé)

### 7.2 Checklist avant soumission

- ✅ Politique de confidentialité accessible publiquement
- ✅ Conditions d'utilisation accessibles publiquement
- ✅ Instructions claires pour les testeurs Meta
- ✅ App testée en mode développement sans bugs
- ✅ Interface utilisateur intuitive

### 7.3 Passer l'app en Live

Une fois les permissions approuvées :

1. Allez dans **"Paramètres de base"**
2. En haut, changez **"Statut de l'app"** de "Développement" à **"En ligne"**
3. Confirmez

🎉 **Votre app est maintenant accessible à TOUS les utilisateurs !**

---

## 🔒 Sécurité et Bonnes Pratiques

### Tokens d'accès

- **User Access Token** : Expire après 1-2 heures (utilisé pour OAuth initial)
- **Page Access Token** : Expire après 60 jours (utilisé pour publier)
- **Long-lived Page Access Token** : Jamais d'expiration (recommandé)

### Rafraîchir les tokens

Créez une tâche cron qui rafraîchit les tokens avant expiration :

```typescript
// Échanger un token court contre un token long
export const exchangeForLongLivedToken = async (shortToken: string) => {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${FB_APP_ID}&` +
    `client_secret=${import.meta.env.VITE_FACEBOOK_APP_SECRET}&` +
    `fb_exchange_token=${shortToken}`
  );

  return response.json();
};
```

### Permissions minimales

Ne demandez QUE les permissions dont vous avez réellement besoin. Meta rejette les apps qui demandent trop de permissions.

### Logs et monitoring

Logguez tous les appels API et surveillez les erreurs pour détecter les tokens expirés.

---

## 🐛 Dépannage

### "L'application n'est pas configurée pour les connexions web OAuth"

→ Vérifiez que vous avez bien ajouté votre URL de redirection dans "Connexion Facebook → Paramètres"

### "Invalid OAuth redirect URI"

→ L'URL doit correspondre EXACTEMENT (https vs http, avec ou sans slash final)

### "This app can't be used by general public"

→ Votre app est en mode Développement, passez-la en Live ou ajoutez des testeurs

### "The user hasn't authorized this app for this permission"

→ L'utilisateur doit accepter les permissions dans la popup OAuth

### Tokens expirés

→ Implémentez le rafraîchissement automatique des tokens

---

## 📚 Ressources

- **Documentation OAuth** : https://developers.facebook.com/docs/facebook-login
- **Graph API Explorer** : https://developers.facebook.com/tools/explorer/
- **Instagram Graph API** : https://developers.facebook.com/docs/instagram-api
- **Permissions de Page** : https://developers.facebook.com/docs/permissions/reference/pages_manage_posts
- **Support Meta** : https://developers.facebook.com/support/

---

## ✅ Checklist Finale

- [ ] Facebook App créée
- [ ] Connexion Facebook activée
- [ ] Instagram Graph API ajoutée
- [ ] URLs OAuth configurées
- [ ] Variables d'environnement définies
- [ ] Code OAuth implémenté
- [ ] Route callback créée
- [ ] Testé en mode développement
- [ ] Politique de confidentialité publiée
- [ ] Permissions demandées à Meta
- [ ] App passée en Live (après révision)

---

🎉 **Félicitations !** Vos utilisateurs peuvent maintenant connecter leurs comptes Facebook et Instagram en toute simplicité !
