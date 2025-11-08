import React, { useState, useEffect, useRef } from 'react';
import {
  Facebook, Instagram, Plus, Calendar, Send, Image as ImageIcon,
  Trash2, Edit, CheckCircle, Clock, XCircle, RefreshCw, LogOut,
  AlertCircle, Eye, X, Upload, Video, Sparkles, Linkedin, Youtube, Twitter
} from 'lucide-react';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { openFacebookLoginPopup, publishToFacebook, publishToInstagram } from '../../services/facebookAuth';
import SupabaseVideoUploader from './SupabaseVideoUploader';
import SocialMediaCalendar from './SocialMediaCalendar';
import AIContentGenerator from './AIContentGenerator';

interface SocialAccount {
  id: string;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'twitter';
  platform_user_id: string;
  platform_username: string;
  page_name: string;
  profile_picture_url?: string;
  is_active: boolean;
  token_expires_at?: string;
  access_token?: string;
}

interface ScheduledPost {
  id: string;
  social_account_id: string;
  platform: string;
  content: string;
  media_urls: string[];
  status: 'scheduled' | 'published' | 'failed' | 'draft';
  scheduled_at?: string;
  published_at?: string;
  platform_post_url?: string;
  error_message?: string;
}

const SocialMediaPublisher: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'accounts' | 'publish' | 'scheduled'>('accounts');

  // État pour la création de post
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [postContent, setPostContent] = useState('');
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSupabaseUploader, setShowSupabaseUploader] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ImgBB API Key pour les images
  const IMGBB_API_KEY = '940a158f4a9430a42afa4ed069957804';

  useEffect(() => {
    if (user) {
      loadAccounts();
      loadScheduledPosts();
    }
  }, [user]);

  const loadAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      console.error('Error loading accounts:', error);
      toast.error('Erreur lors du chargement des comptes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadScheduledPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScheduledPosts(data || []);
    } catch (error: any) {
      console.error('Error loading posts:', error);
    }
  };

  const handleConnectFacebook = async () => {
    try {
      // Vérifier si l'App ID est configuré
      if (!import.meta.env.VITE_FACEBOOK_APP_ID) {
        toast.error('Facebook App non configurée. Consultez FACEBOOK_APP_SETUP_SIMPLE.md');
        return;
      }

      toast.info('Ouverture de la fenêtre de connexion Facebook...');

      // Ouvrir la popup OAuth et attendre le résultat
      const result = await new Promise<{ success: boolean; accountsCount?: number; error?: string }>((resolve, reject) => {
        // Construire l'URI de redirection avec le port actuel
        const currentPort = window.location.port || '5173';
        const redirectUri = `http://localhost:${currentPort}/api/auth/facebook/callback`;

        // Générer un state pour la sécurité CSRF
        const state = Math.random().toString(36).substring(7);
        localStorage.setItem('facebook_oauth_state', state);
        console.log('🔐 State généré et sauvegardé:', state);

        // Générer un nonce unique pour forcer Facebook à générer un nouveau code
        const authNonce = Date.now().toString() + Math.random().toString(36).substring(7);
        console.log('🔑 Auth nonce généré:', authNonce);

        // Permissions de base pour publier sur Facebook
        // Documentation: https://developers.facebook.com/docs/permissions/reference
        // Instagram nécessite App Review - désactivé pour l'instant
        const scope = [
          'pages_show_list',           // Lister les pages
          'pages_read_engagement',     // Lire les stats
          'pages_manage_posts',        // Publier sur Facebook
          'pages_manage_metadata',     // Accéder aux métadonnées des pages
          'business_management'        // Accéder aux pages via Business Manager (IMPORTANT!)
        ].join(',');

        const loginUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${import.meta.env.VITE_FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}&auth_nonce=${authNonce}&auth_type=rerequest`;

        const width = 600;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const popup = window.open(
          loginUrl,
          'Facebook Login',
          `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
        );

        if (!popup) {
          reject(new Error('Popup bloquée. Veuillez autoriser les popups.'));
          return;
        }

        // Écouter le message de la popup
        const messageHandler = (event: MessageEvent) => {
          // Accepter les messages de localhost (n'importe quel port pour le dev)
          if (!event.origin.startsWith('http://localhost:') && !event.origin.startsWith('https://localhost:')) {
            return;
          }

          if (event.data.type === 'facebook-auth-success') {
            window.removeEventListener('message', messageHandler);
            resolve({ success: true, accountsCount: event.data.accountsCount });
          } else if (event.data.type === 'facebook-auth-error') {
            window.removeEventListener('message', messageHandler);
            reject(new Error(event.data.error || 'Erreur de connexion'));
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

      // Succès !
      toast.success(`${result.accountsCount} compte(s) connecté(s) !`);
      await loadAccounts();

    } catch (error: any) {
      if (error.message === 'Authentification annulée') {
        toast.info('Connexion annulée');
      } else {
        console.error('Facebook connection error:', error);
        toast.error('Erreur : ' + error.message);
      }
    }
  };

  const handleConnectInstagram = () => {
    // Instagram se connecte via Facebook
    // Si une page Facebook a un compte Instagram Business lié, il sera automatiquement ajouté
    toast.info('Pour connecter Instagram, utilisez "Connecter Facebook"');
    toast.info('📝 Instagram nécessite un compte Business lié à une page Facebook');
  };

  const handleConnectLinkedIn = () => {
    toast.info('LinkedIn OAuth en cours de développement');
    toast.info('📝 Configuration requise: LinkedIn Developer App avec permissions r_liteprofile, r_organization_social, w_member_social, w_organization_social');
  };

  const handleConnectYouTube = () => {
    toast.info('YouTube OAuth en cours de développement');
    toast.info('📝 Configuration requise: Google Cloud Project avec YouTube Data API v3 activée');
  };

  const handleConnectTwitter = () => {
    toast.info('X (Twitter) OAuth en cours de développement');
    toast.info('📝 Configuration requise: X Developer Account avec OAuth 2.0 (tweet.read, tweet.write, users.read)');
  };

  const handleDisconnectAccount = async (accountId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter ce compte ?')) return;

    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_active: false })
        .eq('id', accountId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Compte déconnecté');
      loadAccounts();
    } catch (error: any) {
      toast.error('Erreur lors de la déconnexion : ' + error.message);
    }
  };

  // Upload d'une image vers ImgBB
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return data.data.url;
  };

  // Upload d'une vidéo vers ImgBB (supporte aussi les vidéos)
  const uploadVideoToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file); // ImgBB utilise 'image' même pour les vidéos
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload vidéo failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error?.message || 'Upload vidéo failed');
    }

    return data.data.url;
  };

  // Gestion de la sélection de fichiers (images uniquement)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Vérifier le nombre total de médias (max 10)
    if (uploadedImageUrls.length + files.length > 10) {
      toast.error('Maximum 10 médias par post');
      return;
    }

    // Vérifier que ce sont des images uniquement
    const invalidFiles = Array.from(files).filter(f => !f.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      toast.error('Seules les images sont acceptées. Pour les vidéos, utilisez le bouton "Upload Vidéo"');
      return;
    }

    // Vérifier la taille (32 MB max)
    const oversizedFiles = Array.from(files).filter(f => f.size > 32 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Images max 32MB');
      return;
    }

    setIsUploadingImages(true);

    try {
      // Upload toutes les images vers ImgBB
      const uploadPromises = Array.from(files).map(file => uploadImageToImgBB(file));

      const urls = await Promise.all(uploadPromises);

      setUploadedImageUrls(prev => [...prev, ...urls]);
      toast.success(`${files.length} image(s) uploadée(s) !`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload : ' + error.message);
    } finally {
      setIsUploadingImages(false);
      // Réinitialiser l'input pour permettre de re-sélectionner les mêmes fichiers
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Supprimer une image uploadée
  const removeImage = (index: number) => {
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Gérer l'upload de vidéo via Supabase
  const handleSupabaseUploadSuccess = (url: string) => {
    // Vérifier le nombre total de médias (max 10)
    if (uploadedImageUrls.length >= 10) {
      toast.error('Maximum 10 médias par post');
      return;
    }

    setUploadedImageUrls(prev => [...prev, url]);
    toast.success('Vidéo ajoutée avec succès');
    setShowSupabaseUploader(false);
  };

  const handlePublishPost = async () => {
    if (!selectedAccountId || !postContent) {
      toast.error('Veuillez sélectionner un compte et saisir du contenu');
      return;
    }

    setIsPublishing(true);

    try {
      const account = accounts.find(a => a.id === selectedAccountId);
      if (!account) throw new Error('Compte non trouvé');

      let postStatus: 'scheduled' | 'published' | 'failed' | 'draft' = 'draft';
      let platformPostId: string | null = null;
      let platformPostUrl: string | null = null;
      let errorMessage: string | null = null;

      // Si pas de date planifiée, publier immédiatement
      if (!scheduledDate) {
        try {
          if (account.platform === 'facebook') {
            // Publier sur Facebook
            if (!account.access_token) {
              throw new Error('Token d\'accès manquant pour ce compte');
            }

            const result = await publishToFacebook(
              account.platform_user_id,
              account.access_token,
              postContent,
              uploadedImageUrls
            );

            platformPostId = result.id || result.post_id;
            platformPostUrl = `https://facebook.com/${platformPostId}`;
            postStatus = 'published';

            toast.success('✅ Post publié sur Facebook !');
          } else if (account.platform === 'instagram') {
            // Publier sur Instagram
            if (!account.access_token) {
              throw new Error('Token d\'accès manquant pour ce compte');
            }

            if (uploadedImageUrls.length === 0) {
              throw new Error('Instagram nécessite au moins une image');
            }

            const result = await publishToInstagram(
              account.platform_user_id,
              account.access_token,
              uploadedImageUrls[0], // Instagram : 1 image à la fois
              postContent
            );

            platformPostId = result.id;
            platformPostUrl = `https://instagram.com/p/${platformPostId}`;
            postStatus = 'published';

            toast.success('✅ Post publié sur Instagram !');
          }
        } catch (publishError: any) {
          console.error('Publication error:', publishError);
          postStatus = 'failed';
          errorMessage = publishError.message;
          toast.error(`❌ Erreur : ${publishError.message}`);
        }
      } else {
        // Post planifié
        postStatus = 'scheduled';
      }

      // Créer le post dans la base de données
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user?.id,
          social_account_id: selectedAccountId,
          platform: account.platform,
          content: postContent,
          media_urls: uploadedImageUrls,
          status: postStatus,
          scheduled_at: scheduledDate || null,
          published_at: postStatus === 'published' ? new Date().toISOString() : null,
          platform_post_id: platformPostId,
          platform_post_url: platformPostUrl,
          error_message: errorMessage
        })
        .select()
        .single();

      if (error) throw error;

      if (scheduledDate) {
        toast.success('📅 Post planifié avec succès !');
      }

      // Réinitialiser le formulaire
      setPostContent('');
      setUploadedImageUrls([]);
      setScheduledDate('');
      setSelectedAccountId('');

      loadScheduledPosts();
      setActiveTab('scheduled');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Erreur : ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Supprimer ce post ?')) return;

    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success('Post supprimé');
      loadScheduledPosts();
    } catch (error: any) {
      toast.error('Erreur : ' + error.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'scheduled': return <Clock className="h-5 w-5 text-blue-600" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Edit className="h-5 w-5 text-zinc-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'scheduled': return 'Planifié';
      case 'failed': return 'Échec';
      default: return 'Brouillon';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-zinc-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
          <Send className="h-8 w-8" />
          Publication Réseaux Sociaux
        </h2>
        <p className="text-lg opacity-90">
          Connectez vos comptes et publiez sur Facebook, Instagram, LinkedIn, YouTube et X
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
        <div className="flex border-b border-zinc-200">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'accounts'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Facebook className="h-5 w-5" />
              <span>Comptes Connectés</span>
              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-600">
                {accounts.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'publish'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Send className="h-5 w-5" />
              <span>Publier</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'scheduled'
                ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                : 'text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>Posts Planifiés</span>
              <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-600">
                {scheduledPosts.filter(p => p.status === 'scheduled').length}
              </span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {/* Tab: Comptes Connectés */}
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              {/* Boutons de connexion */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <div className="inline-flex p-3 bg-blue-100 rounded-full mb-4">
                    <Facebook className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-800 mb-2">Facebook</h3>
                  <p className="text-sm text-zinc-600 mb-4">
                    Connectez votre page Facebook pour publier du contenu
                  </p>
                  <button
                    onClick={handleConnectFacebook}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Connecter Facebook
                  </button>
                </div>

                <div className="border-2 border-dashed border-pink-200 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
                  <div className="inline-flex p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
                    <Instagram className="h-8 w-8 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-800 mb-2">Instagram</h3>
                  <p className="text-sm text-zinc-600 mb-4">
                    Connectez votre compte Instagram Business
                  </p>
                  <button
                    onClick={handleConnectInstagram}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Connecter Instagram
                  </button>
                </div>

                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <div className="inline-flex p-3 bg-blue-50 rounded-full mb-4">
                    <Linkedin className="h-8 w-8 text-blue-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-800 mb-2">LinkedIn</h3>
                  <p className="text-sm text-zinc-600 mb-4">
                    Connectez votre profil ou page LinkedIn
                  </p>
                  <button
                    onClick={handleConnectLinkedIn}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Connecter LinkedIn
                  </button>
                </div>

                <div className="border-2 border-dashed border-red-200 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                  <div className="inline-flex p-3 bg-red-50 rounded-full mb-4">
                    <Youtube className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-800 mb-2">YouTube</h3>
                  <p className="text-sm text-zinc-600 mb-4">
                    Connectez votre chaîne YouTube
                  </p>
                  <button
                    onClick={handleConnectYouTube}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Connecter YouTube
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-500 transition-colors">
                  <div className="inline-flex p-3 bg-slate-100 rounded-full mb-4">
                    <Twitter className="h-8 w-8 text-slate-900" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-800 mb-2">X (Twitter)</h3>
                  <p className="text-sm text-zinc-600 mb-4">
                    Connectez votre compte X
                  </p>
                  <button
                    onClick={handleConnectTwitter}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Connecter X
                  </button>
                </div>
              </div>

              {/* Info OAuth */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-800 mb-1">Comment ça marche ?</p>
                  <p className="text-blue-700">
                    <strong>Facebook & Instagram :</strong> Cliquez sur "Connecter Facebook" pour autoriser l'accès à vos pages Facebook et comptes Instagram Business.
                    {!import.meta.env.VITE_FACEBOOK_APP_ID && (
                      <span className="block mt-2 text-amber-700 font-medium">
                        ⚠️ Configuration requise : Consultez <code className="bg-blue-100 px-1 rounded">FACEBOOK_APP_SETUP_SIMPLE.md</code>
                      </span>
                    )}
                  </p>
                  <p className="text-blue-700 mt-2">
                    <strong>LinkedIn, YouTube & X :</strong> OAuth en cours de développement. Les boutons vous informeront des permissions nécessaires.
                  </p>
                </div>
              </div>

              {/* Liste des comptes connectés */}
              {accounts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-zinc-800 mb-4">Vos comptes connectés</h3>
                  <div className="space-y-3">
                    {accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-4 p-4 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {account.profile_picture_url ? (
                            <img
                              src={account.profile_picture_url}
                              alt={account.page_name}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              account.platform === 'facebook' ? 'bg-blue-600' :
                              account.platform === 'instagram' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                              account.platform === 'linkedin' ? 'bg-blue-700' :
                              account.platform === 'youtube' ? 'bg-red-600' :
                              'bg-slate-900'
                            }`}>
                              {account.platform === 'facebook' && <Facebook className="h-6 w-6 text-white" />}
                              {account.platform === 'instagram' && <Instagram className="h-6 w-6 text-white" />}
                              {account.platform === 'linkedin' && <Linkedin className="h-6 w-6 text-white" />}
                              {account.platform === 'youtube' && <Youtube className="h-6 w-6 text-white" />}
                              {account.platform === 'twitter' && <Twitter className="h-6 w-6 text-white" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-zinc-800">{account.page_name}</h4>
                          <p className="text-sm text-zinc-600">
                            {account.platform === 'facebook' && 'Facebook'}
                            {account.platform === 'instagram' && 'Instagram'}
                            {account.platform === 'linkedin' && 'LinkedIn'}
                            {account.platform === 'youtube' && 'YouTube'}
                            {account.platform === 'twitter' && 'X (Twitter)'}
                            {' • @'}{account.platform_username}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDisconnectAccount(account.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Déconnecter"
                        >
                          <LogOut className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Publier */}
          {activeTab === 'publish' && (
            <div className="space-y-6">
              {accounts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 bg-zinc-100 rounded-full mb-4">
                    <Facebook className="h-12 w-12 text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-800 mb-2">
                    Aucun compte connecté
                  </h3>
                  <p className="text-zinc-600 mb-6">
                    Connectez d'abord un compte Facebook ou Instagram pour publier
                  </p>
                  <button
                    onClick={() => setActiveTab('accounts')}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Connecter un compte
                  </button>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <div className="space-y-4">
                    {/* Sélection du compte */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Publier sur
                      </label>
                      <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Sélectionner un compte</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.platform === 'facebook' && '📘'}
                            {account.platform === 'instagram' && '📷'}
                            {account.platform === 'linkedin' && '💼'}
                            {account.platform === 'youtube' && '📹'}
                            {account.platform === 'twitter' && '🐦'}
                            {' '}{account.page_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Contenu du post */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-zinc-700">
                          Contenu du post
                        </label>
                        <button
                          onClick={() => setShowAIGenerator(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Sparkles className="h-4 w-4" />
                          Écrire avec IA
                        </button>
                      </div>
                      <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Écrivez votre message..."
                        rows={6}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                      />
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-zinc-600">
                          {postContent.length} caractères
                        </span>
                      </div>
                    </div>

                    {/* Upload d'images et vidéos */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Médias ({uploadedImageUrls.length}/10)
                      </label>

                      {/* Boutons d'upload */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Upload Images */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
                        >
                          {isUploadingImages ? (
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                              <p className="text-sm text-zinc-600">Upload...</p>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="h-10 w-10 text-purple-500 mx-auto mb-2" />
                              <p className="text-sm font-medium text-zinc-700 mb-1">
                                Upload Images
                              </p>
                              <p className="text-xs text-zinc-500">
                                ImgBB (32MB max)
                              </p>
                            </>
                          )}
                        </div>

                        {/* Upload Vidéos */}
                        <div
                          onClick={() => setShowSupabaseUploader(true)}
                          className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer"
                        >
                          <Video className="h-10 w-10 text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-zinc-700 mb-1">
                            Upload Vidéo
                          </p>
                          <p className="text-xs text-zinc-500">
                            Supabase (100MB max)
                          </p>
                        </div>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={isUploadingImages || uploadedImageUrls.length >= 10}
                      />

                      {/* Preview des médias uploadés */}
                      {uploadedImageUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {uploadedImageUrls.map((url, index) => {
                            const isVideo = url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('.webm');

                            return (
                              <div key={index} className="relative group">
                                {isVideo ? (
                                  <div className="relative">
                                    <video
                                      src={url}
                                      className="w-full h-32 object-cover rounded-lg border border-zinc-200"
                                      muted
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                                      <Video className="h-8 w-8 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={url}
                                    alt={`Media ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border border-zinc-200"
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Supprimer"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Planification */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Planifier (optionnel)
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <p className="mt-2 text-sm text-zinc-600">
                        Laissez vide pour publier immédiatement
                      </p>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handlePublishPost}
                        disabled={isPublishing || !selectedAccountId || !postContent}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-300 text-white font-medium rounded-lg transition-colors"
                      >
                        {isPublishing ? (
                          <>
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            Publication...
                          </>
                        ) : scheduledDate ? (
                          <>
                            <Clock className="h-5 w-5" />
                            Planifier
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            Publier maintenant
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setPostContent('');
                          setUploadedImageUrls([]);
                          setScheduledDate('');
                          setSelectedAccountId('');
                        }}
                        className="px-6 py-3 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium rounded-lg transition-colors"
                      >
                        Réinitialiser
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Posts Planifiés - Vue Calendrier */}
          {activeTab === 'scheduled' && (
            <div className="space-y-4">
              {scheduledPosts.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-zinc-800 mb-2">
                    Aucun post planifié
                  </h3>
                  <p className="text-zinc-600 mb-6">
                    Créez votre premier post pour commencer
                  </p>
                  <button
                    onClick={() => setActiveTab('publish')}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Créer un post
                  </button>
                </div>
              ) : (
                <SocialMediaCalendar
                  posts={scheduledPosts}
                  onSelectPost={(post) => {
                    // Afficher les détails du post sélectionné (peut être étendu plus tard)
                    console.log('Post sélectionné:', post);
                    toast.info(`Post: ${post.content.substring(0, 50)}...`);
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal Supabase Video Uploader */}
      {showSupabaseUploader && (
        <SupabaseVideoUploader
          onUploadSuccess={handleSupabaseUploadSuccess}
          onClose={() => setShowSupabaseUploader(false)}
        />
      )}

      {/* Modal AI Content Generator */}
      {showAIGenerator && (
        <AIContentGenerator
          onClose={() => setShowAIGenerator(false)}
          onGenerate={(content) => setPostContent(content)}
          platform={accounts.find(a => a.id === selectedAccountId)?.platform || ''}
        />
      )}
    </div>
  );
};

export default SocialMediaPublisher;
