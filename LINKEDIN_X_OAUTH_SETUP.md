# Configuration OAuth pour LinkedIn et X (Twitter)

Ce guide vous explique comment configurer l'authentification OAuth pour LinkedIn et X afin de permettre la publication automatique sur ces plateformes.

---

## 🔵 Configuration LinkedIn OAuth

### Étape 1 : Créer une application LinkedIn

1. **Accéder au portail développeur**
   - Allez sur https://www.linkedin.com/developers/
   - Connectez-vous avec votre compte LinkedIn

2. **Créer une nouvelle app**
   - Cliquez sur "Create app"
   - Remplissez les informations :
     - **App name** : Au Matin Vert Social Publisher
     - **LinkedIn Page** : Sélectionnez votre page d'entreprise (obligatoire)
     - **App logo** : Uploadez votre logo
     - **Legal agreement** : Acceptez les conditions

3. **Configurer l'app**
   - Dans l'onglet **"Auth"**, notez :
     - `Client ID`
     - `Client Secret`

4. **Configurer les Redirect URLs**
   - Ajoutez : `http://localhost:5173/api/auth/linkedin/callback`
   - Pour la production : `https://votre-domaine.com/api/auth/linkedin/callback`

### Étape 2 : Demander les permissions (Products)

Dans l'onglet **"Products"**, demandez l'accès aux produits suivants :

1. **Sign In with LinkedIn** (approval immédiat)
2. **Share on LinkedIn** (nécessite une review)
3. **Marketing Developer Platform** (optionnel, pour les entreprises)

**Note** : Pour "Share on LinkedIn", vous devrez soumettre votre app pour review. Cela peut prendre quelques jours.

### Étape 3 : Scopes (Permissions) nécessaires

Une fois approuvé, vous aurez accès à ces scopes :

```
r_liteprofile          # Lire le profil de base
r_emailaddress         # Lire l'email (optionnel)
w_member_social        # Publier en tant que membre
r_organization_social  # Lire les pages de l'organisation
w_organization_social  # Publier sur les pages de l'organisation
```

### Étape 4 : Ajouter les variables d'environnement

Dans votre fichier `.env`, ajoutez :

```env
# LinkedIn OAuth
VITE_LINKEDIN_CLIENT_ID=votre_client_id
VITE_LINKEDIN_CLIENT_SECRET=votre_client_secret
VITE_LINKEDIN_REDIRECT_URI=http://localhost:5173/api/auth/linkedin/callback
```

### Étape 5 : Implémenter le flux OAuth

Le flux OAuth LinkedIn suit ces étapes :

1. **Redirection vers LinkedIn**
```javascript
const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=r_liteprofile%20r_emailaddress%20w_member_social%20r_organization_social%20w_organization_social`;
```

2. **Récupérer le code d'autorisation**
   - LinkedIn redirige vers votre callback URL avec un `code`

3. **Échanger le code contre un access token**
```javascript
POST https://www.linkedin.com/oauth/v2/accessToken
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTHORIZATION_CODE
&redirect_uri=YOUR_REDIRECT_URI
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
```

4. **Utiliser l'access token pour publier**
```javascript
POST https://api.linkedin.com/v2/ugcPosts
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "author": "urn:li:person:PERSON_ID",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
        "text": "Votre message ici"
      },
      "shareMediaCategory": "NONE"
    }
  },
  "visibility": {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
  }
}
```

### Documentation officielle LinkedIn
- API Overview : https://learn.microsoft.com/en-us/linkedin/
- Share on LinkedIn : https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
- OAuth 2.0 : https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication

---

## 🐦 Configuration X (Twitter) OAuth 2.0

### Étape 1 : Créer une application X

1. **Accéder au portail développeur**
   - Allez sur https://developer.twitter.com/
   - Connectez-vous avec votre compte X
   - Cliquez sur "Developer Portal"

2. **Créer un projet et une app**
   - Projects & Apps → "+ Create Project"
   - Nommez votre projet : "Au Matin Vert Social"
   - Sélectionnez l'usage : "Making a bot"
   - Nommez votre app : "au-matin-vert-publisher"

3. **Noter les credentials**
   Une fois l'app créée, notez :
   - `API Key` (Client ID)
   - `API Key Secret` (Client Secret)
   - `Bearer Token`

### Étape 2 : Configurer OAuth 2.0

1. **Dans les paramètres de l'app**
   - Allez dans "User authentication settings"
   - Cliquez sur "Set up"

2. **Sélectionner OAuth 2.0**
   - Type of App : "Web App, Automated App or Bot"
   - App permissions :
     - ✅ Read
     - ✅ Write

3. **Configurer les URLs**
   - Callback URL : `http://localhost:5173/api/auth/twitter/callback`
   - Website URL : `http://localhost:5173`

   Pour la production :
   - Callback URL : `https://votre-domaine.com/api/auth/twitter/callback`
   - Website URL : `https://votre-domaine.com`

### Étape 3 : Scopes nécessaires

Pour OAuth 2.0, les scopes suivants sont requis :

```
tweet.read     # Lire les tweets
tweet.write    # Créer des tweets
users.read     # Lire les informations utilisateur
offline.access # Obtenir un refresh token
```

### Étape 4 : Ajouter les variables d'environnement

Dans votre fichier `.env`, ajoutez :

```env
# X (Twitter) OAuth 2.0
VITE_TWITTER_CLIENT_ID=votre_client_id
VITE_TWITTER_CLIENT_SECRET=votre_client_secret
VITE_TWITTER_REDIRECT_URI=http://localhost:5173/api/auth/twitter/callback
```

### Étape 5 : Implémenter le flux OAuth 2.0

Le flux OAuth 2.0 pour X utilise PKCE (Proof Key for Code Exchange) :

1. **Générer le code verifier et challenge**
```javascript
// Générer un code_verifier aléatoire
const codeVerifier = generateRandomString(128);

// Créer le code_challenge (hash SHA-256 en base64url)
const codeChallenge = base64UrlEncode(sha256(codeVerifier));
```

2. **Redirection vers X**
```javascript
const twitterAuthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20tweet.write%20users.read%20offline.access&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
```

3. **Récupérer le code et échanger contre un token**
```javascript
POST https://api.twitter.com/2/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTHORIZATION_CODE
&redirect_uri=YOUR_REDIRECT_URI
&client_id=YOUR_CLIENT_ID
&code_verifier=CODE_VERIFIER
```

4. **Publier un tweet**
```javascript
POST https://api.twitter.com/2/tweets
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "text": "Votre message ici (max 280 caractères)"
}
```

5. **Publier un tweet avec média**
```javascript
// 1. Upload le média
POST https://upload.twitter.com/1.1/media/upload.json
Authorization: Bearer ACCESS_TOKEN
Content-Type: multipart/form-data

// 2. Créer le tweet avec le media_id
POST https://api.twitter.com/2/tweets
{
  "text": "Votre message",
  "media": {
    "media_ids": ["MEDIA_ID"]
  }
}
```

### Étape 6 : Gérer le refresh token

Les access tokens X expirent après 2 heures. Utilisez le refresh token :

```javascript
POST https://api.twitter.com/2/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=REFRESH_TOKEN
&client_id=YOUR_CLIENT_ID
```

### Documentation officielle X
- API v2 Overview : https://developer.twitter.com/en/docs/twitter-api
- OAuth 2.0 : https://developer.twitter.com/en/docs/authentication/oauth-2-0
- Tweet endpoints : https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/introduction

---

## 🔧 Niveau d'accès API

### LinkedIn
- **Free** : Accès limité aux API
- **Partner Program** : Accès complet nécessite une candidature et approbation

### X (Twitter)
- **Free** : 1,500 tweets/mois (lecture + écriture)
- **Basic ($100/mois)** : 3,000 tweets/mois + 10,000 lectures
- **Pro ($5,000/mois)** : Accès illimité

**Note** : Depuis 2023, X nécessite au minimum le plan Free (avec limites) pour accéder aux API.

---

## 📝 Prochaines étapes

### Pour LinkedIn :
1. Créer l'app sur le portail développeur LinkedIn
2. Demander l'approbation pour "Share on LinkedIn"
3. Implémenter le service OAuth dans `src/services/linkedinAuth.ts`
4. Créer une Supabase Edge Function `linkedin-oauth`
5. Tester la connexion et la publication

### Pour X :
1. Créer l'app sur le portail développeur X
2. Vérifier que vous avez accès au plan gratuit (Free) minimum
3. Implémenter le service OAuth avec PKCE dans `src/services/twitterAuth.ts`
4. Créer une Supabase Edge Function `twitter-oauth`
5. Implémenter la gestion du refresh token
6. Tester la connexion et la publication

---

## 💡 Conseils

1. **Testez en local d'abord** avec les URL localhost
2. **Stockez les secrets côté serveur** : Ne jamais exposer les client secrets dans le frontend
3. **Utilisez Supabase Edge Functions** : Pour sécuriser les échanges de tokens
4. **Gérez les erreurs** : Token expiré, permissions refusées, limites de taux
5. **Respectez les limites** : Ne pas spammer, respecter les rate limits
6. **Lisez les ToS** : Conditions d'utilisation de chaque plateforme

---

## 🚀 État actuel

### ✅ Implémenté
- Interface UI pour tous les réseaux (Facebook, Instagram, LinkedIn, YouTube, X)
- Handlers de connexion avec messages informatifs
- Structure de la base de données pour supporter tous les réseaux

### 🔨 À implémenter
- Services OAuth pour LinkedIn (`src/services/linkedinAuth.ts`)
- Services OAuth pour X (`src/services/twitterAuth.ts`)
- Edge Functions Supabase pour les callbacks OAuth
- Logique de publication pour LinkedIn
- Logique de publication pour X
- Gestion des refresh tokens
- Gestion des erreurs et retry logic

---

## 📞 Support

Si vous avez des questions lors de l'implémentation, consultez :
- Documentation LinkedIn : https://learn.microsoft.com/en-us/linkedin/
- Documentation X : https://developer.twitter.com/en/docs
- Supabase Edge Functions : https://supabase.com/docs/guides/functions

Bonne configuration ! 🎉
