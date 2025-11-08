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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
    fetchCarouselImages();
  }, []);

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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Comment utiliser ?</h3>
              <p className="text-sm text-blue-800">
                Modifiez les images du carrousel et les textes de la section Hero, des features et des boutons d'action.
                Les modifications sont sauvegardées automatiquement lorsque vous quittez un champ.
              </p>
            </div>
          </div>
        </div>

        {/* Section Carrousel */}
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
