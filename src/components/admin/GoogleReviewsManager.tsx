import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { Save, RotateCcw, Star, ExternalLink, Info, MessageSquare } from 'lucide-react';
import GoogleReviewsList from './GoogleReviewsList';

interface GoogleReviewsConfig {
  id?: number;
  place_id: string;
  business_name: string;
  show_on_homepage: boolean;
  direct_link?: string;
}

const GoogleReviewsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'reviews'>('reviews');
  const [config, setConfig] = useState<GoogleReviewsConfig>({
    place_id: '',
    business_name: 'Au Matin Vert',
    show_on_homepage: true,
    direct_link: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('google_reviews_config')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.warn('Google reviews config not found, using defaults');
      } else if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching google reviews config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof GoogleReviewsConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('google_reviews_config')
        .upsert({
          id: 1,
          ...config,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Configuration Google Reviews sauvegardée avec succès !');
      fetchConfig();
    } catch (error) {
      console.error('Error saving google reviews config:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      place_id: '',
      business_name: 'Au Matin Vert',
      show_on_homepage: true,
      direct_link: '',
    });
    toast.info('Configuration réinitialisée aux valeurs par défaut');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-zinc-600">Chargement...</span>
      </div>
    );
  }

  const googleMapsUrl = config.direct_link ||
    (config.place_id ? `https://search.google.com/local/reviews?placeid=${config.place_id}` : '#');

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'reviews'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-zinc-600 hover:text-zinc-800'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Gestion des Avis</span>
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'config'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-zinc-600 hover:text-zinc-800'
          }`}
        >
          <Star className="h-4 w-4" />
          <span>Configuration</span>
        </button>
      </div>

      {/* Reviews Tab */}
      {activeTab === 'reviews' && <GoogleReviewsList />}

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* Actions */}
          <div className="flex justify-end space-x-3">
        <button
          onClick={handleReset}
          className="flex items-center space-x-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Réinitialiser</span>
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-3 text-sm text-blue-800">
            <p className="font-semibold">Deux façons de configurer les avis Google :</p>

            <div className="mt-3">
              <p className="font-medium">Option 1 : Lien Direct (Recommandé - Plus Simple)</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 mt-1">
                <li>Recherchez votre entreprise sur Google</li>
                <li>Cliquez sur "Avis" ou votre note d'étoiles</li>
                <li>Copiez l'URL complète de la page</li>
                <li>Collez-la dans le champ "Lien Direct" ci-dessous</li>
              </ol>
            </div>

            <div className="mt-3">
              <p className="font-medium">Option 2 : Google Place ID (Avancé)</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 mt-1">
                <li>Allez sur <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Place ID Finder</a></li>
                <li>Recherchez votre entreprise</li>
                <li>Copiez le "Place ID" (commence par "ChIJ...")</li>
                <li>Collez-le dans le champ "Google Place ID"</li>
              </ol>
            </div>

            <p className="mt-4 font-medium text-blue-900">
              💡 Si vous avez les deux, le lien direct sera utilisé en priorité
            </p>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg border border-zinc-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <h3 className="text-lg font-semibold text-zinc-800">Configuration Google Reviews</h3>
        </div>

        <div className="space-y-6">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Nom de l'entreprise
            </label>
            <input
              type="text"
              value={config.business_name}
              onChange={(e) => handleChange('business_name', e.target.value)}
              placeholder="Ex: Au Matin Vert"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Le nom de votre entreprise tel qu'il apparaît sur Google
            </p>
          </div>

          {/* Direct Link */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Lien Direct vers vos Avis (Recommandé)
            </label>
            <input
              type="url"
              value={config.direct_link || ''}
              onChange={(e) => handleChange('direct_link', e.target.value)}
              placeholder="Ex: https://www.google.com/search?q=Au+Matin+Vert+Avis"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Copiez l'URL complète depuis Google (méthode la plus simple)
            </p>
          </div>

          {/* Place ID */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Google Place ID (Optionnel)
            </label>
            <input
              type="text"
              value={config.place_id}
              onChange={(e) => handleChange('place_id', e.target.value)}
              placeholder="Ex: ChIJxxx..."
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Identifiant unique de votre fiche Google Business (commence par "ChIJ")
            </p>
          </div>

          {/* Show on Homepage Toggle */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Afficher sur la page d'accueil
              </label>
              <p className="text-xs text-zinc-500">
                Active ou désactive l'affichage du widget Google Reviews
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.show_on_homepage}
                onChange={(e) => handleChange('show_on_homepage', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-site-primary"></div>
            </label>
          </div>

          {/* Preview Link */}
          {(config.direct_link || config.place_id) && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">
                ✅ {config.direct_link ? 'Lien direct configuré' : 'Place ID configuré'}
              </p>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-900 underline"
              >
                <span>Tester le lien (Voir les avis sur Google)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-lg border border-zinc-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <h3 className="text-lg font-semibold text-zinc-800">Aperçu</h3>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-cyan-50 rounded-lg p-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-site-primary/20 p-8 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <img
                src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
                alt="Google"
                className="h-6"
              />
            </div>

            <h4 className="text-xl font-bold text-zinc-800 mb-3">
              {config.business_name || 'Nom de l\'entreprise'}
            </h4>

            <div className="flex items-center justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-6 h-6 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            <p className="text-zinc-600 mb-6 text-sm">
              Consultez tous nos avis clients vérifiés sur Google
            </p>

            <button
              className="inline-flex items-center gap-2 bg-site-primary text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
              disabled
            >
              <span>Voir tous les avis Google</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {!config.show_on_homepage && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700">
                  ⚠️ Actuellement désactivé sur la page d'accueil
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">📋 Statut</h3>
        <div className="space-y-2 text-sm text-zinc-700">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${(config.direct_link || config.place_id) ? 'bg-green-500' : 'bg-orange-400'}`}></div>
            <span>Lien : {config.direct_link ? 'Lien direct configuré' : config.place_id ? 'Place ID configuré' : 'Non configuré'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${config.show_on_homepage ? 'bg-green-500' : 'bg-zinc-400'}`}></div>
            <span>Affichage : {config.show_on_homepage ? 'Activé' : 'Désactivé'}</span>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default GoogleReviewsManager;
