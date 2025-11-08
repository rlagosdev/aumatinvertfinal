import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  Tag,
  ShoppingCart,
  Package,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { useSiteLogo } from '../../hooks/useSiteLogo';

interface NotificationTemplate {
  id: string;
  title: string;
  body: string;
  icon: string;
  category: string;
}

interface FCMToken {
  id: string;
  user_email: string;
  fcm_token: string;
  device_type: string;
  created_at: string;
}

const NotificationManager: React.FC = () => {
  const [tokens, setTokens] = useState<FCMToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Récupérer le logo depuis les paramètres du site
  const { logoSettings } = useSiteLogo();

  // Formulaire
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'specific'>('all');
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]); // Changé: sélection par ID de token
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Templates de notifications
  const templates: NotificationTemplate[] = [
    {
      id: 'new-products',
      title: 'Nouveaux produits disponibles ! 🌿',
      body: 'Découvrez nos derniers arrivages de produits frais et bio',
      icon: '🌿',
      category: 'Produits'
    },
    {
      id: 'promo',
      title: 'Promotion exclusive ! 🎉',
      body: '-20% sur tous les fruits et légumes cette semaine',
      icon: '🎉',
      category: 'Promotions'
    },
    {
      id: 'order-ready',
      title: 'Votre commande est prête ! ✅',
      body: 'Vous pouvez venir récupérer votre commande au magasin',
      icon: '✅',
      category: 'Commandes'
    },
    {
      id: 'order-cancelled',
      title: 'Commande annulée',
      body: 'Votre commande a été annulée. Contactez-nous pour plus d\'infos',
      icon: '❌',
      category: 'Commandes'
    },
    {
      id: 'new-event',
      title: 'Nouvel événement ! 🎪',
      body: 'Venez découvrir notre prochain atelier cuisine bio',
      icon: '🎪',
      category: 'Événements'
    },
    {
      id: 'cart-reminder',
      title: 'Votre panier vous attend ! 🛒',
      body: 'Vous avez des produits dans votre panier. Finalisez votre commande !',
      icon: '🛒',
      category: 'Rappels'
    }
  ];

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    try {
      setLoading(true);

      // Charger tous les tokens FCM
      const { data, error } = await supabase
        .from('user_fcm_tokens')
        .select('*')
        .order('created_at', { ascending: false});

      if (error) throw error;

      console.log(`📊 ${data?.length || 0} token(s) chargé(s):`, data);
      setTokens(data || []);
    } catch (error: any) {
      console.error('Error loading tokens:', error);
      toast.error('Erreur lors du chargement des tokens');
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (tokens.length === 0) {
      toast.error('Aucun token disponible pour le test');
      return;
    }

    setSending(true);

    try {
      const notificationIcon = logoSettings.logo_image || '/icon-192x192.png';

      console.log('🧪 Test de notification vers le premier token:', tokens[0]);

      // Préparer le payload de test
      const testPayload = {
        tokens: [tokens[0].fcm_token],
        title: '🧪 Test de notification',
        body: 'Si vous recevez ceci, les notifications fonctionnent parfaitement !',
        url: '/',
        icon: notificationIcon
      };

      console.log('🧪 ========================================');
      console.log('🧪 Payload TEST envoyé à l\'Edge Function:');
      console.log('  - tokens:', testPayload.tokens.length, 'token(s)');
      console.log('  - title:', `"${testPayload.title}"`);
      console.log('  - body:', `"${testPayload.body}"`);
      console.log('  - url:', testPayload.url);
      console.log('  - icon:', testPayload.icon);
      console.log('🧪 Payload complet:', JSON.stringify(testPayload, null, 2));
      console.log('🧪 ========================================');

      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: testPayload
      });

      if (error) {
        console.error('❌ Erreur Edge Function:', error);
        throw error;
      }

      console.log('✅ Résultat Edge Function:', data);
      toast.success('✅ Test envoyé ! Vérifiez votre téléphone.');
    } catch (error: any) {
      console.error('Error sending test:', error);
      toast.error('Erreur test: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const useTemplate = (template: NotificationTemplate) => {
    setTitle(template.title);
    setMessage(template.body);
    setSelectedTemplate(template.id);
  };

  const sendNotification = async () => {
    if (!title || !message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setSending(true);

    try {
      // Récupérer les tokens à cibler
      let targetTokens: FCMToken[] = [];

      if (targetAudience === 'all') {
        targetTokens = tokens;
      } else {
        // Filtrer les tokens en fonction des IDs sélectionnés
        targetTokens = tokens.filter(t => selectedTokenIds.includes(t.id));
      }

      if (targetTokens.length === 0) {
        toast.error('Aucun destinataire sélectionné');
        setSending(false);
        return;
      }

      console.log(`📧 Envoi vers ${targetTokens.length} token(s):`, targetTokens);

      // Utiliser le logo de l'entreprise ou l'icône par défaut
      const notificationIcon = logoSettings.logo_image || '/icon-192x192.png';

      console.log('🖼️ Icône utilisée pour la notification:', notificationIcon);

      // Préparer le payload
      const payload = {
        tokens: targetTokens.map(t => t.fcm_token),
        title: title,
        body: message,
        url: '/',
        icon: notificationIcon
      };

      console.log('📤 ========================================');
      console.log('📤 Payload envoyé à l\'Edge Function:');
      console.log('  - tokens:', payload.tokens.length, 'token(s)');
      console.log('  - title:', `"${payload.title}"`, '(length:', payload.title?.length || 0, ')');
      console.log('  - body:', `"${payload.body}"`, '(length:', payload.body?.length || 0, ')');
      console.log('  - url:', payload.url);
      console.log('  - icon:', payload.icon);
      console.log('📤 Payload complet:', JSON.stringify(payload, null, 2));
      console.log('📤 ========================================');

      // Envoyer la notification via Edge Function
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: payload
      });

      if (error) throw error;

      toast.success(`✅ Notification envoyée à ${targetTokens.length} utilisateur(s) !`);

      // Réinitialiser le formulaire
      setTitle('');
      setMessage('');
      setSelectedTokenIds([]);
      setSelectedTemplate('');

    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error('Erreur lors de l\'envoi : ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const toggleTokenSelection = (tokenId: string) => {
    if (selectedTokenIds.includes(tokenId)) {
      setSelectedTokenIds(selectedTokenIds.filter(id => id !== tokenId));
    } else {
      setSelectedTokenIds([...selectedTokenIds, tokenId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Bell className="h-8 w-8" />
          <h2 className="text-3xl font-bold">Gestion des Notifications</h2>
        </div>
        <p className="text-lg opacity-90">
          Envoyez des notifications push à vos clients directement sur leur appareil
        </p>
      </div>

      {/* Bouton de test */}
      {tokens.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-800">Test rapide</h4>
                <p className="text-sm text-zinc-600">Envoyer une notification de test au premier utilisateur</p>
              </div>
            </div>
            <button
              onClick={sendTestNotification}
              disabled={sending}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-medium rounded-lg transition-colors"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Tester</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-zinc-800">Utilisateurs inscrits</h4>
          </div>
          <p className="text-3xl font-bold text-green-600">{tokens.length}</p>
          <p className="text-sm text-zinc-600 mt-1">Peuvent recevoir des notifications</p>
        </div>

        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="font-semibold text-zinc-800">Templates</h4>
          </div>
          <p className="text-3xl font-bold text-blue-600">{templates.length}</p>
          <p className="text-sm text-zinc-600 mt-1">Modèles prédéfinis</p>
        </div>

        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Send className="h-5 w-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-zinc-800">Sélectionnés</h4>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {targetAudience === 'all' ? tokens.length : selectedTokenIds.length}
          </p>
          <p className="text-sm text-zinc-600 mt-1">Destinataires de l'envoi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire d'envoi */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <h3 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-purple-600" />
            Créer une notification
          </h3>

          <div className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Titre de la notification
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Nouveaux produits disponibles !"
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                maxLength={50}
              />
              <p className="text-xs text-zinc-500 mt-1">{title.length}/50 caractères</p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ex: Découvrez nos derniers arrivages de produits frais et bio"
                rows={4}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                maxLength={150}
              />
              <p className="text-xs text-zinc-500 mt-1">{message.length}/150 caractères</p>
            </div>

            {/* Audience cible */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Destinataires
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTargetAudience('all')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    targetAudience === 'all'
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <Users className="h-4 w-4 inline mr-2" />
                  Tous ({tokens.length})
                </button>
                <button
                  onClick={() => setTargetAudience('specific')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    targetAudience === 'specific'
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <Tag className="h-4 w-4 inline mr-2" />
                  Sélection ({selectedTokenIds.length})
                </button>
              </div>
            </div>

            {/* Bouton d'envoi */}
            <button
              onClick={sendNotification}
              disabled={sending || !title || !message}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-zinc-300 disabled:to-zinc-400 text-white font-semibold rounded-lg transition-all"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Envoyer la notification</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <h3 className="text-xl font-bold text-zinc-800 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Templates rapides
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => useTemplate(template)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                  selectedTemplate === template.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-zinc-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
                        {template.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-zinc-800 mb-1">{template.title}</h4>
                    <p className="text-sm text-zinc-600">{template.body}</p>
                  </div>
                  {selectedTemplate === template.id && (
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs (si sélection spécifique) */}
      {targetAudience === 'specific' && (
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-zinc-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Sélectionner les destinataires
            </h3>

            {!loading && tokens.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTokenIds(tokens.map(t => t.id))}
                  className="px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 border border-green-300 rounded-lg transition-colors"
                >
                  Tout sélectionner
                </button>
                <button
                  onClick={() => setSelectedTokenIds([])}
                  className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 border border-zinc-300 rounded-lg transition-colors"
                >
                  Tout désélectionner
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent mx-auto"></div>
              <p className="text-zinc-600 mt-4">Chargement...</p>
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-600">Aucun utilisateur inscrit aux notifications</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tokens.map((token, index) => (
                <button
                  key={token.id}
                  onClick={() => {
                    console.log('Toggle selection for token:', token.id, token.user_email);
                    toggleTokenSelection(token.id);
                  }}
                  className={`text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedTokenIds.includes(token.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-zinc-200 hover:border-green-300 hover:bg-green-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      selectedTokenIds.includes(token.id)
                        ? 'bg-green-500'
                        : 'bg-zinc-200'
                    }`}>
                      {selectedTokenIds.includes(token.id) ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Users className="h-5 w-5 text-zinc-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-800 truncate">{token.user_email}</p>
                        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-medium rounded">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {token.device_type} • {new Date(token.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-zinc-800 mb-2">💡 Conseils pour de bonnes notifications</h4>
            <ul className="text-sm text-zinc-700 space-y-2">
              <li>✅ <strong>Soyez concis</strong> : Titre max 50 caractères, message max 150</li>
              <li>✅ <strong>Utilisez des emojis</strong> : Ils attirent l'attention (🌿 🎉 ✅)</li>
              <li>✅ <strong>Personnalisez</strong> : Adaptez le message à votre audience</li>
              <li>✅ <strong>Timing</strong> : Envoyez aux heures où vos clients sont actifs</li>
              <li>⚠️ <strong>Modération</strong> : Maximum 1-2 notifications par jour pour ne pas saturer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;
