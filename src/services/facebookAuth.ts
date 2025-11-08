// Service OAuth Facebook - Version simplifiée (comme Metricool)
// L'administrateur crée UNE SEULE Facebook App et tous les utilisateurs l'utilisent

// Configuration OAuth (à définir dans Supabase Edge Functions ou backend)
const FB_CONFIG = {
  appId: import.meta.env.VITE_FACEBOOK_APP_ID || '',
  redirectUri: import.meta.env.VITE_FACEBOOK_REDIRECT_URI || `${window.location.origin}/api/auth/facebook/callback`,
  version: 'v18.0'
};

// Permissions demandées pour publier sur Facebook et Instagram
// Documentation: https://developers.facebook.com/docs/permissions/reference
const PERMISSIONS = [
  // Facebook Pages
  'pages_show_list',                    // Lister les pages gérées par l'utilisateur
  'pages_read_engagement',              // Lire les stats d'engagement
  'pages_manage_posts',                 // Publier sur les pages Facebook
  'pages_manage_metadata',              // Accéder aux métadonnées des pages
  'business_management',                // Accéder aux pages via Business Manager

  // Instagram (Standard Access - pas besoin d'App Review pour les testeurs)
  'instagram_basic',                    // Lire le profil Instagram
  'instagram_content_publish',          // Publier sur Instagram
  'instagram_manage_insights'           // Lire les statistiques Instagram
].join(',');

/**
 * Génère l'URL de connexion OAuth Facebook
 * L'utilisateur clique sur un bouton qui ouvre cette URL
 */
export const getFacebookLoginUrl = (): string => {
  // Générer un state aléatoire pour la sécurité CSRF
  const state = Math.random().toString(36).substring(7);

  // Stocker le state dans sessionStorage pour vérification au retour
  sessionStorage.setItem('facebook_oauth_state', state);

  const params = new URLSearchParams({
    client_id: FB_CONFIG.appId,
    redirect_uri: FB_CONFIG.redirectUri,
    scope: PERMISSIONS,
    response_type: 'code',
    state: state,
    display: 'popup' // Ouvre dans une popup
  });

  return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
};

/**
 * Ouvre la popup OAuth Facebook
 * Retourne une promesse qui se résout quand l'utilisateur a autorisé
 */
export const openFacebookLoginPopup = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const loginUrl = getFacebookLoginUrl();

    // Dimensions de la popup
    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    // Ouvrir la popup
    const popup = window.open(
      loginUrl,
      'Facebook Login',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      reject(new Error('Popup bloquée par le navigateur. Veuillez autoriser les popups.'));
      return;
    }

    // Écouter le message de la popup (quand l'OAuth est terminé)
    const messageHandler = (event: MessageEvent) => {
      // Vérifier l'origine pour la sécurité
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'facebook-auth-success') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        resolve(event.data.code);
      } else if (event.data.type === 'facebook-auth-error') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        reject(new Error(event.data.error || 'Authentification annulée'));
      }
    };

    window.addEventListener('message', messageHandler);

    // Vérifier si la popup a été fermée manuellement
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        reject(new Error('Authentification annulée'));
      }
    }, 1000);
  });
};

/**
 * Récupère les pages Facebook de l'utilisateur
 * Essaie d'abord l'API classique /me/accounts, puis l'API Business si nécessaire
 */
export const getUserPages = async (accessToken: string) => {
  try {
    // Méthode 1: API classique /me/accounts (pour les pages non-Business Manager)
    console.log('📡 Essai de récupération via /me/accounts...');
    const classicResponse = await fetch(
      `https://graph.facebook.com/${FB_CONFIG.version}/me/accounts?` +
      `fields=id,name,username,access_token,picture&` +
      `access_token=${accessToken}`
    );

    if (classicResponse.ok) {
      const classicData = await classicResponse.json();
      if (classicData.data && classicData.data.length > 0) {
        console.log('✅ Pages trouvées via /me/accounts:', classicData.data.length);
        return classicData.data;
      }
    }

    // Méthode 2: API Business (pour les pages dans Business Manager)
    console.log('📡 Essai de récupération via API Business...');

    // Récupérer les Business Managers de l'utilisateur
    const businessesResponse = await fetch(
      `https://graph.facebook.com/${FB_CONFIG.version}/me/businesses?` +
      `access_token=${accessToken}`
    );

    if (!businessesResponse.ok) {
      console.warn('⚠️ Impossible de récupérer les Business Managers');
      return [];
    }

    const businessesData = await businessesResponse.json();
    const businesses = businessesData.data || [];

    console.log(`📊 ${businesses.length} Business Manager(s) trouvé(s)`);

    // Pour chaque Business Manager, récupérer les pages
    const allPages: any[] = [];

    for (const business of businesses) {
      console.log(`📡 Récupération des pages de "${business.name}" (ID: ${business.id})...`);

      try {
        const pagesResponse = await fetch(
          `https://graph.facebook.com/${FB_CONFIG.version}/${business.id}/owned_pages?` +
          `fields=id,name,username,access_token,picture&` +
          `access_token=${accessToken}`
        );

        if (pagesResponse.ok) {
          const pagesData = await pagesResponse.json();
          if (pagesData.data && pagesData.data.length > 0) {
            console.log(`✅ ${pagesData.data.length} page(s) trouvée(s) dans "${business.name}"`);
            allPages.push(...pagesData.data);
          }
        }
      } catch (err) {
        console.error(`❌ Erreur lors de la récupération des pages de ${business.name}:`, err);
      }
    }

    console.log(`📋 Total: ${allPages.length} page(s) Facebook accessible(s)`);
    return allPages;

  } catch (error) {
    console.error('Error fetching Facebook pages:', error);
    throw error;
  }
};

/**
 * Récupère le compte Instagram Business lié à une page Facebook
 */
export const getInstagramAccount = async (pageId: string, pageAccessToken: string) => {
  try {
    console.log(`🔍 Recherche Instagram pour page ${pageId}...`);

    const response = await fetch(
      `https://graph.facebook.com/${FB_CONFIG.version}/${pageId}?` +
      `fields=instagram_business_account{id,username,profile_picture_url}&` +
      `access_token=${pageAccessToken}`
    );

    if (!response.ok) {
      console.log(`❌ Pas de compte Instagram lié à la page ${pageId} (${response.status})`);
      return null; // Pas de compte Instagram lié
    }

    const data = await response.json();
    console.log(`📷 Réponse API Instagram pour page ${pageId}:`, data);

    if (data.instagram_business_account) {
      console.log(`✅ Compte Instagram trouvé: @${data.instagram_business_account.username} (ID: ${data.instagram_business_account.id})`);
    } else {
      console.log(`⚠️ Aucun compte Instagram Business lié à cette page`);
    }

    return data.instagram_business_account || null;
  } catch (error) {
    console.error('❌ Error fetching Instagram account:', error);
    return null;
  }
};

/**
 * Échange le code OAuth contre un access token de longue durée
 * NOTE : Cette fonction doit être appelée côté serveur (Edge Function Supabase)
 * pour ne pas exposer le App Secret
 */
export const exchangeCodeForToken = async (code: string): Promise<any> => {
  try {
    // TODO: Appeler une Edge Function Supabase qui fait l'échange
    // Pour l'instant, on simule (à remplacer par un vrai appel serveur)

    const response = await fetch('/api/auth/facebook/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de l\'échange du code OAuth');
    }

    return await response.json();
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

/**
 * Publie un post sur une page Facebook avec support multi-médias
 */
export const publishToFacebook = async (
  pageId: string,
  pageAccessToken: string,
  message: string,
  mediaUrls?: string[]
): Promise<any> => {
  try {
    // Cas 1 : Post texte uniquement
    if (!mediaUrls || mediaUrls.length === 0) {
      const response = await fetch(
        `https://graph.facebook.com/${FB_CONFIG.version}/${pageId}/feed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            access_token: pageAccessToken
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur lors de la publication');
      }

      return await response.json();
    }

    // Cas 2 : Une seule image
    if (mediaUrls.length === 1 && !mediaUrls[0].match(/\.(mp4|mov|avi|webm)$/i)) {
      const response = await fetch(
        `https://graph.facebook.com/${FB_CONFIG.version}/${pageId}/photos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: mediaUrls[0],
            message,
            access_token: pageAccessToken
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur lors de la publication');
      }

      return await response.json();
    }

    // Cas 3 : Une vidéo
    if (mediaUrls.length === 1 && mediaUrls[0].match(/\.(mp4|mov|avi|webm)$/i)) {
      const response = await fetch(
        `https://graph.facebook.com/${FB_CONFIG.version}/${pageId}/videos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_url: mediaUrls[0],
            description: message,
            access_token: pageAccessToken
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur lors de la publication');
      }

      return await response.json();
    }

    // Cas 4 : Plusieurs images (album)
    // Étape 1 : Uploader toutes les images
    const photoIds: string[] = [];
    for (const url of mediaUrls) {
      if (url.match(/\.(mp4|mov|avi|webm)$/i)) {
        continue; // Ignorer les vidéos dans les albums
      }

      const photoResponse = await fetch(
        `https://graph.facebook.com/${FB_CONFIG.version}/${pageId}/photos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: url,
            published: false, // Ne pas publier tout de suite
            access_token: pageAccessToken
          })
        }
      );

      if (photoResponse.ok) {
        const photoData = await photoResponse.json();
        photoIds.push(photoData.id);
      }
    }

    // Étape 2 : Créer l'album avec toutes les photos
    const response = await fetch(
      `https://graph.facebook.com/${FB_CONFIG.version}/${pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          attached_media: photoIds.map(id => ({ media_fbid: id })),
          access_token: pageAccessToken
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur lors de la publication');
    }

    return await response.json();
  } catch (error) {
    console.error('Error publishing to Facebook:', error);
    throw error;
  }
};

/**
 * Publie un post sur Instagram
 * Instagram nécessite 2 étapes : créer le conteneur média, puis le publier
 */
export const publishToInstagram = async (
  instagramAccountId: string,
  accessToken: string,
  imageUrl: string,
  caption: string
): Promise<any> => {
  try {
    // Étape 1 : Créer le conteneur média
    const containerResponse = await fetch(
      `https://graph.facebook.com/${FB_CONFIG.version}/${instagramAccountId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: accessToken
        })
      }
    );

    if (!containerResponse.ok) {
      const error = await containerResponse.json();
      throw new Error(error.error?.message || 'Erreur lors de la création du conteneur Instagram');
    }

    const { id: creationId } = await containerResponse.json();

    // Attendre 5 secondes (Instagram a besoin de temps pour traiter l'image)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Étape 2 : Publier le conteneur
    const publishResponse = await fetch(
      `https://graph.facebook.com/${FB_CONFIG.version}/${instagramAccountId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: accessToken
        })
      }
    );

    if (!publishResponse.ok) {
      const error = await publishResponse.json();
      throw new Error(error.error?.message || 'Erreur lors de la publication sur Instagram');
    }

    return await publishResponse.json();
  } catch (error) {
    console.error('Error publishing to Instagram:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques d'un post Facebook
 */
export const getFacebookPostStats = async (
  postId: string,
  accessToken: string
): Promise<any> => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${FB_CONFIG.version}/${postId}?` +
      `fields=insights.metric(post_impressions,post_engaged_users),likes.summary(true),comments.summary(true),shares&` +
      `access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching post stats:', error);
    throw error;
  }
};

/**
 * Récupère les statistiques d'un post Instagram
 */
export const getInstagramPostStats = async (
  postId: string,
  accessToken: string
): Promise<any> => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${FB_CONFIG.version}/${postId}?` +
      `fields=insights.metric(impressions,reach,engagement),like_count,comments_count&` +
      `access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des statistiques');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Instagram stats:', error);
    throw error;
  }
};

/**
 * Vérifie si un token est toujours valide
 */
export const checkTokenValidity = async (accessToken: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${FB_CONFIG.version}/me?access_token=${accessToken}`
    );

    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Obtient des informations de debug sur un token
 */
export const debugToken = async (accessToken: string): Promise<any> => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${FB_CONFIG.version}/debug_token?` +
      `input_token=${accessToken}&` +
      `access_token=${FB_CONFIG.appId}|${import.meta.env.VITE_FACEBOOK_APP_SECRET}`
    );

    if (!response.ok) {
      throw new Error('Erreur lors du debug du token');
    }

    return await response.json();
  } catch (error) {
    console.error('Error debugging token:', error);
    throw error;
  }
};

export default {
  getFacebookLoginUrl,
  openFacebookLoginPopup,
  getUserPages,
  getInstagramAccount,
  exchangeCodeForToken,
  publishToFacebook,
  publishToInstagram,
  getFacebookPostStats,
  getInstagramPostStats,
  checkTokenValidity,
  debugToken
};
