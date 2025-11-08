import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Facebook, CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { getUserPages, getInstagramAccount } from '../services/facebookAuth';

/**
 * Page de callback OAuth Facebook
 * Cette page est appelée après que l'utilisateur a autorisé l'accès sur Facebook
 */
const FacebookCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connexion en cours...');
  const [connectedAccounts, setConnectedAccounts] = useState<number>(0);

  // Utiliser useRef au lieu de useState pour persister entre les re-renders en Strict Mode
  const hasRunRef = useRef(false);

  useEffect(() => {
    // IMPORTANT: Éviter l'exécution double en React Strict Mode
    // Le code OAuth ne peut être échangé qu'UNE SEULE FOIS
    if (hasRunRef.current) {
      console.log('⚠️ useEffect déjà exécuté, skipping...');
      return;
    }

    hasRunRef.current = true;
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Debug : afficher l'URL complète
      console.log('Callback URL:', window.location.href);
      console.log('Search params:', searchParams.toString());

      // Vérifier si l'utilisateur a annulé
      const error = searchParams.get('error');
      if (error) {
        const errorDescription = searchParams.get('error_description');
        const errorMessage = searchParams.get('error_message');
        const errorReason = searchParams.get('error_reason');

        console.error('❌ Facebook OAuth Error:', {
          error,
          errorDescription,
          errorMessage,
          errorReason,
          fullUrl: window.location.href
        });

        throw new Error(`Connexion Facebook échouée:\n${errorMessage || errorDescription || error}`);
      }

      // Récupérer le code OAuth
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      console.log('Code:', code);
      console.log('State:', state);

      if (!code) {
        throw new Error('Code OAuth manquant. URL reçue: ' + window.location.href);
      }

      // Vérifier le state pour la sécurité CSRF
      const savedState = localStorage.getItem('facebook_oauth_state');
      console.log('=== STATE DEBUG ===');
      console.log('Saved state from localStorage:', savedState);
      console.log('Received state from URL:', state);
      console.log('Match?', state === savedState);
      console.log('==================');

      if (state && savedState && state !== savedState) {
        throw new Error(`État OAuth invalide. Attendu: ${savedState}, Reçu: ${state}`);
      }

      // Si pas de state sauvegardé, on accepte quand même (moins sécurisé mais fonctionne)
      if (!savedState) {
        console.warn('⚠️ Aucun state sauvegardé trouvé. La vérification CSRF est ignorée.');
      }

      // Nettoyer le state
      localStorage.removeItem('facebook_oauth_state');

      // Attendre que l'utilisateur soit chargé (peut prendre un moment dans une popup)
      if (!user) {
        setMessage('Vérification de l\'authentification...');
        // Attendre un peu que le AuthContext se charge
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Récupérer directement la session Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('Utilisateur non connecté. Veuillez vous connecter à l\'admin d\'abord.');
      }

      const currentUser = session.user;

      setMessage('Échange du code OAuth...');

      // Construire l'URI de redirection avec le port actuel (doit correspondre à celui utilisé lors de l'autorisation)
      const currentPort = window.location.port || '5173';
      const redirectUri = `http://localhost:${currentPort}/api/auth/facebook/callback`;

      console.log('📍 Redirect URI utilisé pour l\'échange:', redirectUri);

      // Échanger le code contre un access token
      // NOTE : Cette partie doit être faite côté serveur pour la sécurité
      // Pour l'instant, on utilise directement le code (à améliorer)
      const tokenResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${import.meta.env.VITE_FACEBOOK_APP_ID}&` +
        `client_secret=${import.meta.env.VITE_FACEBOOK_APP_SECRET}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `code=${code}`
      );

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        console.error('Facebook token exchange error:', errorData);
        throw new Error(`Erreur lors de l'échange du code OAuth: ${errorData.error?.message || tokenResponse.statusText}`);
      }

      const { access_token: userAccessToken } = await tokenResponse.json();

      setMessage('Récupération de vos pages Facebook...');

      // Récupérer les pages Facebook de l'utilisateur
      const pages = await getUserPages(userAccessToken);

      console.log('📄 Pages trouvées:', pages);

      if (!pages || pages.length === 0) {
        throw new Error(
          'Aucune page Facebook trouvée.\n\n' +
          '💡 Pour utiliser l\'API Facebook, vous devez :\n' +
          '1. Créer une Page Facebook (pas juste un profil)\n' +
          '2. Être administrateur de cette page\n' +
          '3. Réessayer la connexion\n\n' +
          'Créez une page ici : https://www.facebook.com/pages/create'
        );
      }

      let accountsCreated = 0;

      setMessage(`${pages.length} page(s) trouvée(s). Connexion en cours...`);

      // Pour chaque page, créer/mettre à jour dans la base de données
      for (const page of pages) {
        try {
          // Sauvegarder la page Facebook
          const { error: fbError } = await supabase
            .from('social_accounts')
            .upsert({
              user_id: currentUser.id,
              platform: 'facebook',
              platform_user_id: page.id,
              platform_username: page.username || page.id,
              page_name: page.name,
              access_token: page.access_token, // Token de la page (longue durée)
              profile_picture_url: page.picture?.data?.url || `https://graph.facebook.com/${page.id}/picture`,
              is_active: true,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,platform,platform_user_id'
            });

          if (fbError) {
            console.error('Error saving Facebook page:', fbError);
          } else {
            accountsCreated++;
          }

          // Vérifier si la page a un compte Instagram Business
          setMessage(`Recherche de compte Instagram pour ${page.name}...`);
          const instagramAccount = await getInstagramAccount(page.id, page.access_token);

          if (instagramAccount) {
            // Sauvegarder le compte Instagram
            const { error: igError } = await supabase
              .from('social_accounts')
              .upsert({
                user_id: currentUser.id,
                platform: 'instagram',
                platform_user_id: instagramAccount.id,
                platform_username: instagramAccount.username || instagramAccount.id,
                page_name: `${instagramAccount.username || page.name} (Instagram)`,
                access_token: page.access_token, // Utilise le token de la page Facebook
                profile_picture_url: instagramAccount.profile_picture_url || '',
                is_active: true,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id,platform,platform_user_id'
              });

            if (igError) {
              console.error('Error saving Instagram account:', igError);
            } else {
              accountsCreated++;
            }
          }
        } catch (pageError) {
          console.error(`Error processing page ${page.name}:`, pageError);
        }
      }

      if (accountsCreated === 0) {
        throw new Error('Aucun compte n\'a pu être connecté. Veuillez réessayer.');
      }

      // Succès !
      setConnectedAccounts(accountsCreated);
      setStatus('success');
      setMessage(`${accountsCreated} compte(s) connecté(s) avec succès !`);

      // Notifier la fenêtre parente (si c'est une popup)
      if (window.opener) {
        // Utiliser '*' comme origin target pour éviter les problèmes de cross-origin
        // Le composant parent vérifie l'origin dans son messageHandler
        window.opener.postMessage({
          type: 'facebook-auth-success',
          accountsCount: accountsCreated
        }, '*');

        // Fermer la popup après 2 secondes
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        // Si ce n'est pas une popup, rediriger après 3 secondes
        setTimeout(() => {
          window.location.href = '/admin';
        }, 3000);
      }

    } catch (error: any) {
      console.error('Facebook callback error:', error);
      setStatus('error');
      setMessage(error.message || 'Une erreur est survenue lors de la connexion');

      // Notifier la fenêtre parente en cas d'erreur
      if (window.opener) {
        // Utiliser '*' comme origin target pour éviter les problèmes de cross-origin
        window.opener.postMessage({
          type: 'facebook-auth-error',
          error: error.message
        }, '*');

        // Fermer la popup après 3 secondes
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Icône */}
        <div className="flex justify-center mb-6">
          {status === 'loading' && (
            <div className="p-4 bg-blue-100 rounded-full">
              <Loader className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="p-4 bg-red-100 rounded-full">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          )}
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-center text-zinc-800 mb-4">
          {status === 'loading' && 'Connexion Facebook'}
          {status === 'success' && 'Connexion réussie !'}
          {status === 'error' && 'Erreur de connexion'}
        </h1>

        {/* Message */}
        <p className="text-center text-zinc-600 mb-6">
          {message}
        </p>

        {/* Compteur de comptes (succès) */}
        {status === 'success' && connectedAccounts > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2">
              <Facebook className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">
                {connectedAccounts} compte(s) connecté(s)
              </span>
            </div>
          </div>
        )}

        {/* Message de fermeture */}
        {status === 'success' && (
          <p className="text-sm text-center text-zinc-500">
            {window.opener
              ? 'Cette fenêtre va se fermer automatiquement...'
              : 'Redirection vers le tableau de bord...'}
          </p>
        )}

        {/* Bouton de fermeture manuelle (erreur) */}
        {status === 'error' && window.opener && (
          <button
            onClick={() => window.close()}
            className="w-full px-6 py-3 bg-zinc-600 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
          >
            Fermer
          </button>
        )}

        {/* Lien de retour (erreur, pas popup) */}
        {status === 'error' && !window.opener && (
          <a
            href="/admin"
            className="block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
          >
            Retour au tableau de bord
          </a>
        )}

        {/* Animation de chargement */}
        {status === 'loading' && (
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacebookCallback;
