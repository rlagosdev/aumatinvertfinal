import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { Save, RotateCcw, Truck, Users, Building } from 'lucide-react';
import ImageUploadField from './ImageUploadField';

interface ServicesPageConfig {
  id?: number;
  page_title: string;
  page_description: string;
  // Service Seniors
  seniors_title: string;
  seniors_description: string;
  seniors_image: string;
  seniors_phone_label: string;
  // Service Entreprises
  business_title: string;
  business_description: string;
  business_image: string;
  business_email_label: string;
}

const ServicesPageManager: React.FC = () => {
  const [config, setConfig] = useState<ServicesPageConfig>({
    page_title: 'Services & Livraison',
    page_description: 'Découvrez nos différents services : retrait en magasin, livraison à domicile, et nos offres spéciales pour les seniors et entreprises.',
    // Service Seniors
    seniors_title: 'Service Seniors',
    seniors_description: 'Service dédié aux personnes âgées de 65 ans et plus.',
    seniors_image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    seniors_phone_label: 'Commande par téléphone',
    // Service Entreprises
    business_title: 'Service Entreprises',
    business_description: 'Solutions sur mesure pour vos événements professionnels.',
    business_image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    business_email_label: 'Devis personnalisé',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('services_page_config')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.warn('Services page config not found, using defaults');
      } else if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching services page config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ServicesPageConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('services_page_config')
        .upsert({
          id: 1,
          ...config,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Configuration de la page Services sauvegardée avec succès !');
      fetchConfig();
    } catch (error) {
      console.error('Error saving services page config:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      page_title: 'Services & Livraison',
      page_description: 'Découvrez nos différents services : retrait en magasin, livraison à domicile, et nos offres spéciales pour les seniors et entreprises.',
      seniors_title: 'Service Seniors',
      seniors_description: 'Service dédié aux personnes âgées de 65 ans et plus.',
      seniors_image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      seniors_phone_label: 'Commande par téléphone',
      business_title: 'Service Entreprises',
      business_description: 'Solutions sur mesure pour vos événements professionnels.',
      business_image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      business_email_label: 'Devis personnalisé',
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

  return (
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

      {/* En-tête de la Page */}
      <div className="bg-white rounded-lg border border-zinc-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Truck className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-zinc-800">En-tête de la Page</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Titre de la page
            </label>
            <input
              type="text"
              value={config.page_title}
              onChange={(e) => handleChange('page_title', e.target.value)}
              placeholder="Ex: Services & Livraison"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Description de la page
            </label>
            <textarea
              value={config.page_description}
              onChange={(e) => handleChange('page_description', e.target.value)}
              placeholder="Description..."
              rows={3}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Service Seniors */}
      <div className="bg-white rounded-lg border border-zinc-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-site-primary" />
          <h3 className="text-lg font-semibold text-zinc-800">Service Seniors (65+ ans)</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Titre du service
            </label>
            <input
              type="text"
              value={config.seniors_title}
              onChange={(e) => handleChange('seniors_title', e.target.value)}
              placeholder="Ex: Service Seniors"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Description
            </label>
            <textarea
              value={config.seniors_description}
              onChange={(e) => handleChange('seniors_description', e.target.value)}
              placeholder="Description du service..."
              rows={2}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Label du téléphone
            </label>
            <input
              type="text"
              value={config.seniors_phone_label}
              onChange={(e) => handleChange('seniors_phone_label', e.target.value)}
              placeholder="Ex: Commande par téléphone"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadField
              label="Image du Service Seniors"
              value={config.seniors_image}
              onChange={(url) => handleChange('seniors_image', url)}
              placeholder="https://exemple.com/service-seniors.jpg"
              showPreview={false}
            />
            {config.seniors_image && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-700">Aperçu</label>
                <div className="h-64 border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                  <img
                    src={config.seniors_image}
                    alt="Service Seniors"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              💡 <strong>Ce service inclut :</strong> Livraison gratuite (sans minimum), créneaux prioritaires, aide au portage, conseils nutritionnels
            </p>
          </div>
        </div>
      </div>

      {/* Service Entreprises */}
      <div className="bg-white rounded-lg border border-zinc-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Building className="h-5 w-5 text-site-buttons" />
          <h3 className="text-lg font-semibold text-zinc-800">Service Entreprises</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Titre du service
            </label>
            <input
              type="text"
              value={config.business_title}
              onChange={(e) => handleChange('business_title', e.target.value)}
              placeholder="Ex: Service Entreprises"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Description
            </label>
            <textarea
              value={config.business_description}
              onChange={(e) => handleChange('business_description', e.target.value)}
              placeholder="Description du service..."
              rows={2}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Label de l'email
            </label>
            <input
              type="text"
              value={config.business_email_label}
              onChange={(e) => handleChange('business_email_label', e.target.value)}
              placeholder="Ex: Devis personnalisé"
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadField
              label="Image du Service Entreprises"
              value={config.business_image}
              onChange={(url) => handleChange('business_image', url)}
              placeholder="https://exemple.com/service-entreprises.jpg"
              showPreview={false}
            />
            {config.business_image && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-zinc-700">Aperçu</label>
                <div className="h-64 border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
                  <img
                    src={config.business_image}
                    alt="Service Entreprises"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Ce service inclut :</strong> Plateaux pour réunions, livraison en entreprise, facturation dédiée, commandes récurrentes
            </p>
          </div>
        </div>
      </div>

      {/* Aperçu Final */}
      <div className="bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">📋 Aperçu</h3>
        <div className="space-y-3 text-sm text-zinc-700">
          <div>
            <span className="font-medium">Page :</span> {config.page_title}
          </div>
          <div>
            <span className="font-medium">Service 1 :</span> {config.seniors_title}
          </div>
          <div>
            <span className="font-medium">Service 2 :</span> {config.business_title}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPageManager;
