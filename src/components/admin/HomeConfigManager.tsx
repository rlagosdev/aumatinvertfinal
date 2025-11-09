import React, { useState, useEffect } from 'react';
import { Home, Save, AlertCircle, Leaf, Heart, Users, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import ImageUploadField from './ImageUploadField';

interface HomeConfig {
  id: string;
  config_key: string;
  config_value: string;
  config_type: string;
  description: string;
  position: number;
}

interface GroupedConfigs {
  hero: HomeConfig[];
  features: HomeConfig[];
  cta: HomeConfig[];
}

const HomeConfigManager: React.FC = () => {
  const [configs, setConfigs] = useState<HomeConfig[]>([]);
  const [carouselImages, setCarouselImages] = useState<{[key: string]: string}>({
    carousel_image_1: '',
    carousel_image_2: '',
    carousel_image_3: '',
    carousel_image_4: ''
  });
  const [heroType, setHeroType] = useState<'video' | 'carousel'>('video');
  const [specialButtonText, setSpecialButtonText] = useState<string>('Spéciale Fêtes');
  const [specialButtonUrl, setSpecialButtonUrl] = useState<string>('/evenements');
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>('/hero-video.mp4');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sitePages, setSitePages] = useState<Array<{ label: string; value: string }>>([
    { label: 'Accueil', value: '/' },
    { label: 'Produits', value: '/produits' },
    { label: 'Boutique', value: '/boutique' },
    { label: 'Événements', value: '/evenements' },
    { label: 'Services', value: '/services' },
    { label: 'À Propos', value: '/a-propos' },
    { label: 'Panier', value: '/panier' },
    { label: 'Annonces', value: '/annonces' },
    // Catégories de produits
    { label: 'Produits > Alternatives café', value: '/produits/Alternatives%20café' },
    { label: 'Produits > Produits laitiers', value: '/produits/Produits%20laitiers' },
    { label: 'Produits > Biscuits apéritifs', value: '/produits/Biscuits%20apéritifs' },
    { label: 'Produits > Légumes', value: '/produits/Légumes' },
    { label: 'Produits > Conserves de légumes', value: '/produits/Conserves%20de%20légumes' },
    { label: 'Produits > Biscuits', value: '/produits/Biscuits' },
    { label: 'Produits > Conserves de poisson', value: '/produits/Conserves%20de%20poisson' },
    { label: 'Produits > Chocolats', value: '/produits/Chocolats' },
    { label: 'Produits > Confitures', value: '/produits/Confitures' },
    { label: 'Produits > Fruits', value: '/produits/Fruits' },
    { label: 'Produits > Jus & boissons', value: '/produits/Jus%20%26%20boissons' },
    // Catégories d'événements
    { label: 'Événements > Plateaux fromage & crudités', value: '/evenements/Plateaux%20fromage%20%26%20crudités' },
    { label: 'Événements > Autres plateaux & produits événementiels', value: '/evenements/Autres%20plateaux%20%26%20produits%20événementiels' },
    { label: 'URL personnalisée', value: 'custom' }
  ]);

  useEffect(() => {
    fetchCategoriesAndUpdatePages();
    fetchConfigs();
    fetchCarouselImages();
    fetchHeroType();
    fetchButtonConfig();
    fetchHeroVideoUrl();
  }, []);

  const fetchCategoriesAndUpdatePages = async () => {
    try {
      // Récupérer les catégories de produits
      const { data: productCategories, error: productError } = await supabase
        .from('categories')
        .select('nom')
        .eq('actif', true)
        .order('nom');

      if (productError) {
        console.error('Error fetching product categories:', productError);
      }

      // Récupérer les catégories d'événements
      const { data: eventCategories, error: eventError } = await supabase
        .from('event_categories')
        .select('nom')
        .eq('actif', true)
        .order('nom');

      if (eventError) {
        console.error('Error fetching event categories:', eventError);
      }

      // Construire la nouvelle liste de pages
      const basePages = [
        { label: 'Accueil', value: '/' },
        { label: 'Produits', value: '/produits' },
        { label: 'Boutique', value: '/boutique' },
        { label: 'Événements', value: '/evenements' },
        { label: 'Services', value: '/services' },
        { label: 'À Propos', value: '/a-propos' },
        { label: 'Panier', value: '/panier' },
        { label: 'Annonces', value: '/annonces' }
      ];

      // Ajouter les catégories de produits avec le format /produits/CategoryName
      const productPages = productCategories?.map(cat => ({
        label: `Produits > ${cat.nom}`,
        value: `/produits/${encodeURIComponent(cat.nom)}`
      })) || [];

      // Ajouter les catégories d'événements
      const eventPages = eventCategories?.map(cat => ({
        label: `Événements > ${cat.nom}`,
        value: `/evenements/${encodeURIComponent(cat.nom)}`
      })) || [];

      // Combiner toutes les pages
      const allPages = [
        ...basePages,
        ...productPages,
        ...eventPages,
        { label: 'URL personnalisée', value: 'custom' }
      ];

      setSitePages(allPages);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('home_config')
        .select('*')
        .order('position');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching home configs:', error);
      toast.error('Erreur lors du chargement des configurations');
    } finally {
      setLoading(false);
    }
  };

  const fetchCarouselImages = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('setting_key', ['carousel_image_1', 'carousel_image_2', 'carousel_image_3', 'carousel_image_4']);

      if (error) throw error;

      const images: {[key: string]: string} = {};
      data?.forEach(setting => {
        images[setting.setting_key] = setting.setting_value;
      });
      setCarouselImages(images);
    } catch (error) {
      console.error('Error fetching carousel images:', error);
    }
  };

  const fetchHeroType = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'home_hero_type')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setHeroType(data.setting_value as 'video' | 'carousel');
      }
    } catch (error) {
      console.error('Error fetching hero type:', error);
    }
  };

  const fetchButtonConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['hero_special_button_text', 'hero_special_button_url']);

      if (error) {
        console.warn('Error fetching button config:', error);
        return;
      }

      const buttonText = data?.find(s => s.setting_key === 'hero_special_button_text')?.setting_value;
      const buttonUrl = data?.find(s => s.setting_key === 'hero_special_button_url')?.setting_value;

      if (buttonText) setSpecialButtonText(buttonText);
      if (buttonUrl) setSpecialButtonUrl(buttonUrl);
    } catch (error) {
      console.warn('Error fetching button config:', error);
    }
  };

  const fetchHeroVideoUrl = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'hero_video_url')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching hero video URL:', error);
        return;
      }

      if (data?.setting_value) {
        setHeroVideoUrl(data.setting_value);
      }
    } catch (error) {
      console.warn('Error fetching hero video URL:', error);
    }
  };

  const handleHeroTypeChange = async (newType: 'video' | 'carousel') => {
    setSaving(true);
    try {
      // Vérifier si la clé existe
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'home_hero_type')
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: newType })
          .eq('setting_key', 'home_hero_type');

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            setting_key: 'home_hero_type',
            setting_value: newType,
            description: 'Type de hero sur la page d\'accueil (video ou carousel)'
          }]);

        if (error) throw error;
      }

      setHeroType(newType);
      toast.success(`Hero changé en mode ${newType === 'video' ? 'Vidéo' : 'Carrousel'}`);
    } catch (error) {
      console.error('Error updating hero type:', error);
      toast.error('Erreur lors du changement de mode');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateConfig = async (configId: string, newValue: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('home_config')
        .update({ config_value: newValue })
        .eq('id', configId);

      if (error) throw error;

      // Update local state
      setConfigs(configs.map(c =>
        c.id === configId ? { ...c, config_value: newValue } : c
      ));

      toast.success('Configuration mise à jour');
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleCarouselImageUpdate = async (imageKey: string, newUrl: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: newUrl })
        .eq('setting_key', imageKey);

      if (error) throw error;

      // Update local state
      setCarouselImages(prev => ({
        ...prev,
        [imageKey]: newUrl
      }));

      toast.success('Image du carrousel mise à jour');
    } catch (error) {
      console.error('Error updating carousel image:', error);
      toast.error('Erreur lors de la mise à jour de l\'image');
    } finally {
      setSaving(false);
    }
  };

  const handleButtonConfigUpdate = async (settingKey: string, newValue: string) => {
    setSaving(true);
    try {
      // Vérifier si la clé existe
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', settingKey)
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: newValue })
          .eq('setting_key', settingKey);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            setting_key: settingKey,
            setting_value: newValue,
            description: settingKey === 'hero_special_button_text'
              ? 'Texte du bouton spécial du hero'
              : 'URL du bouton spécial du hero'
          }]);

        if (error) throw error;
      }

      // Update local state
      if (settingKey === 'hero_special_button_text') {
        setSpecialButtonText(newValue);
      } else if (settingKey === 'hero_special_button_url') {
        setSpecialButtonUrl(newValue);
      }

      toast.success('Configuration du bouton mise à jour');
    } catch (error) {
      console.error('Error updating button config:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const getSelectedSpecialButtonPage = () => {
    const found = sitePages.find(page => page.value === specialButtonUrl);
    return found ? found.value : 'custom';
  };

  const handleSpecialButtonPageSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue !== 'custom') {
      setSpecialButtonUrl(selectedValue);
      await handleButtonConfigUpdate('hero_special_button_url', selectedValue);
    } else {
      setSpecialButtonUrl('');
    }
  };

  const handleHeroVideoUpdate = async (newUrl: string) => {
    setSaving(true);
    try {
      // Vérifier si la clé existe
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'hero_video_url')
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: newUrl })
          .eq('setting_key', 'hero_video_url');

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            setting_key: 'hero_video_url',
            setting_value: newUrl,
            description: 'URL de la vidéo hero'
          }]);

        if (error) throw error;
      }

      setHeroVideoUrl(newUrl);
      toast.success('Vidéo hero mise à jour');
    } catch (error) {
      console.error('Error updating hero video:', error);
      toast.error('Erreur lors de la mise à jour de la vidéo');
    } finally {
      setSaving(false);
    }
  };

  const groupConfigs = (): GroupedConfigs => {
    return {
      hero: configs.filter(c => c.config_key.startsWith('hero_') && !c.config_key.includes('cta')),
      features: configs.filter(c => c.config_key.startsWith('feature_')),
      cta: configs.filter(c => c.config_key.startsWith('cta_') || c.config_key.includes('hero_cta'))
    };
  };

  const getFeatureIcon = (configKey: string) => {
    if (configKey.includes('feature_1')) return <Leaf className="h-5 w-5 text-site-primary" />;
    if (configKey.includes('feature_2')) return <Heart className="h-5 w-5 text-site-primary" />;
    if (configKey.includes('feature_3')) return <Users className="h-5 w-5 text-site-primary" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-site-primary"></div>
      </div>
    );
  }

  const grouped = groupConfigs();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Home className="h-6 w-6 mr-2 text-site-primary" />
              Configuration de la Page d'Accueil
            </h2>
            <p className="text-gray-600 mt-1">
              Gérez les textes de votre page d'accueil
            </p>
          </div>
        </div>

        {/* Sélecteur de type de Hero */}
        <div className="bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Type de bannière d'accueil</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleHeroTypeChange('video')}
              disabled={saving}
              className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${
                heroType === 'video'
                  ? 'border-site-primary bg-white shadow-md'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  heroType === 'video' ? 'bg-site-primary' : 'bg-gray-200'
                }`}>
                  <svg className={`w-6 h-6 ${heroType === 'video' ? 'text-white' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className={`font-semibold ${heroType === 'video' ? 'text-site-primary' : 'text-gray-700'}`}>
                  Vidéo Hero
                </span>
                <span className="text-xs text-gray-500 mt-1">Vidéo en arrière-plan</span>
              </div>
            </button>

            <button
              onClick={() => handleHeroTypeChange('carousel')}
              disabled={saving}
              className={`flex-1 px-6 py-4 rounded-lg border-2 transition-all ${
                heroType === 'carousel'
                  ? 'border-site-primary bg-white shadow-md'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  heroType === 'carousel' ? 'bg-site-primary' : 'bg-gray-200'
                }`}>
                  <ImageIcon className={`w-6 h-6 ${heroType === 'carousel' ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <span className={`font-semibold ${heroType === 'carousel' ? 'text-site-primary' : 'text-gray-700'}`}>
                  Carrousel d'images
                </span>
                <span className="text-xs text-gray-500 mt-1">Diaporama d'images</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Comment utiliser ?</h3>
              <p className="text-sm text-blue-800">
                {heroType === 'video'
                  ? 'Mode Vidéo Hero activé. Les textes de la section Hero et des boutons d\'action s\'afficheront par-dessus la vidéo.'
                  : 'Mode Carrousel activé. Modifiez les images du carrousel ci-dessous et les textes de la section Hero.'}
                {' '}Les modifications sont sauvegardées automatiquement lorsque vous quittez un champ.
              </p>
            </div>
          </div>
        </div>

        {/* Section Vidéo Hero - Affichée uniquement si mode vidéo */}
        {heroType === 'video' && (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            Vidéo du Hero
          </h3>
          <p className="text-sm text-gray-600 mb-4 pl-10">
            Choisissez la vidéo qui sera affichée en arrière-plan de votre page d'accueil.
          </p>
          <div className="pl-10">
            <ImageUploadField
              label="Vidéo Hero (MP4, WebM)"
              value={heroVideoUrl}
              onChange={(url) => handleHeroVideoUpdate(url)}
              placeholder="/hero-video.mp4 ou https://example.com/video.mp4"
              showPreview={false}
              accept="video/*"
            />
            <p className="text-xs text-gray-500 mt-2">
              Formats acceptés: MP4, WebM. Recommandé: 1920x1080 ou supérieur, optimisé pour le web.
            </p>
            {heroVideoUrl && (
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Aperçu de la vidéo:</p>
                <video
                  src={heroVideoUrl}
                  className="w-full max-w-2xl rounded-lg"
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                  controls
                  muted
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Configuration du bouton spécial - Visible pour les deux modes */}
        <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-2">★</span>
            Bouton Spécial (en haut à droite du hero)
          </h3>
          <p className="text-sm text-gray-600 mb-4 pl-10">
            Ce bouton apparaît en haut à droite de la bannière d'accueil, que vous soyez en mode vidéo ou carrousel.
          </p>
          <div className="space-y-4 pl-10">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte du bouton
              </label>
              <input
                type="text"
                value={specialButtonText}
                onChange={(e) => setSpecialButtonText(e.target.value)}
                onBlur={(e) => handleButtonConfigUpdate('hero_special_button_text', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                placeholder="Spéciale Fêtes"
                disabled={saving}
              />
              <p className="text-xs text-gray-500 mt-1">
                Exemple: "Spéciale Fêtes", "Promotions", "Nouveautés", etc.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page de destination
              </label>
              <select
                value={getSelectedSpecialButtonPage()}
                onChange={handleSpecialButtonPageSelect}
                disabled={saving}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
              >
                {sitePages.map((page) => (
                  <option key={page.value} value={page.value}>
                    {page.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Sélectionnez une page du site ou "URL personnalisée" pour entrer un lien personnalisé
              </p>
            </div>

            {getSelectedSpecialButtonPage() === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL personnalisée
                </label>
                <input
                  type="text"
                  value={specialButtonUrl}
                  onChange={(e) => setSpecialButtonUrl(e.target.value)}
                  onBlur={(e) => handleButtonConfigUpdate('hero_special_button_url', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                  placeholder="/ma-page ou https://example.com"
                  disabled={saving}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Exemples: "/evenements", "/produits", "/promotions", "https://example.com"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section Carrousel - Affichée uniquement si mode carrousel */}
        {heroType === 'carousel' && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
            <span className="w-8 h-8 bg-site-primary text-white rounded-full flex items-center justify-center text-sm mr-2">0</span>
            Images du carrousel d'accueil
          </h3>
          <div className="grid md:grid-cols-2 gap-6 pl-10">
            {[1, 2, 3, 4].map((num) => (
              <div key={`carousel_image_${num}`}>
                <ImageUploadField
                  label={`Image ${num} du carrousel`}
                  value={carouselImages[`carousel_image_${num}`] || ''}
                  onChange={(url) => handleCarouselImageUpdate(`carousel_image_${num}`, url)}
                  placeholder="https://example.com/image.jpg"
                  showPreview={true}
                  previewClassName="aspect-video h-48"
                  cropAspect={16 / 9}
                />
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Section Hero */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
            <span className="w-8 h-8 bg-site-primary text-white rounded-full flex items-center justify-center text-sm mr-2">1</span>
            Section Hero (Bannière principale)
          </h3>
          <div className="space-y-4 pl-10">
            {grouped.hero.map((config) => (
              <div key={config.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {config.description}
                </label>
                {config.config_key === 'hero_description' || config.config_key === 'hero_subtitle' ? (
                  <textarea
                    value={config.config_value}
                    onChange={(e) => {
                      const newConfigs = [...configs];
                      const index = newConfigs.findIndex(c => c.id === config.id);
                      newConfigs[index].config_value = e.target.value;
                      setConfigs(newConfigs);
                    }}
                    onBlur={(e) => handleUpdateConfig(config.id, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent text-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={config.config_value}
                    onChange={(e) => {
                      const newConfigs = [...configs];
                      const index = newConfigs.findIndex(c => c.id === config.id);
                      newConfigs[index].config_value = e.target.value;
                      setConfigs(newConfigs);
                    }}
                    onBlur={(e) => handleUpdateConfig(config.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
            <span className="w-8 h-8 bg-site-primary text-white rounded-full flex items-center justify-center text-sm mr-2">2</span>
            Features (Caractéristiques)
          </h3>
          <div className="space-y-4 pl-10">
            <div className="grid md:grid-cols-3 gap-4">
              {grouped.features.map((config) => (
                <div key={config.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    {getFeatureIcon(config.config_key)}
                    <label className="block text-sm font-medium text-gray-700 ml-2">
                      {config.description}
                    </label>
                  </div>
                  <input
                    type="text"
                    value={config.config_value}
                    onChange={(e) => {
                      const newConfigs = [...configs];
                      const index = newConfigs.findIndex(c => c.id === config.id);
                      newConfigs[index].config_value = e.target.value;
                      setConfigs(newConfigs);
                    }}
                    onBlur={(e) => handleUpdateConfig(config.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b pb-2">
            <span className="w-8 h-8 bg-site-primary text-white rounded-full flex items-center justify-center text-sm mr-2">3</span>
            Boutons & Section CTA (Appels à l'action)
          </h3>
          <div className="space-y-4 pl-10">
            {grouped.cta.map((config) => (
              <div key={config.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {config.description}
                </label>
                {config.config_key === 'cta_description' ? (
                  <textarea
                    value={config.config_value}
                    onChange={(e) => {
                      const newConfigs = [...configs];
                      const index = newConfigs.findIndex(c => c.id === config.id);
                      newConfigs[index].config_value = e.target.value;
                      setConfigs(newConfigs);
                    }}
                    onBlur={(e) => handleUpdateConfig(config.id, e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent text-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={config.config_value}
                    onChange={(e) => {
                      const newConfigs = [...configs];
                      const index = newConfigs.findIndex(c => c.id === config.id);
                      newConfigs[index].config_value = e.target.value;
                      setConfigs(newConfigs);
                    }}
                    onBlur={(e) => handleUpdateConfig(config.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">💡 Astuce</h3>
          <p className="text-sm text-green-800">
            Les modifications sont automatiquement sauvegardées lorsque vous quittez un champ de texte.
            Vérifiez régulièrement la page d'accueil pour voir vos changements en direct !
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomeConfigManager;
