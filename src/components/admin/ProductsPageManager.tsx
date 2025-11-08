import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { Save, RefreshCw } from 'lucide-react';

interface ProductsPageConfig {
  id?: string;
  page_title: string;
  custom_orders_title: string;
  custom_orders_description: string;
  custom_order_item_1: string;
  custom_order_item_2: string;
  custom_order_item_3: string;
  store_info_text: string;
}

const ProductsPageManager: React.FC = () => {
  const [config, setConfig] = useState<ProductsPageConfig>({
    page_title: 'Nos Produits',
    custom_orders_title: 'Besoin d\'une idée cadeau ou d\'un buffet gourmand ?',
    custom_orders_description: 'Nous préparons sur commande :',
    custom_order_item_1: 'Corbeilles de fruits frais',
    custom_order_item_2: 'Plateaux apéritifs ou fromagers',
    custom_order_item_3: 'Assortiments sur mesure selon vos envies',
    store_info_text: '📍 Retrait en magasin : 1 rue du Nil, 44800 Saint-Herblain • 🚚 Livraison possible dans un rayon de 3km',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('products_page_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching products page config:', error);
      toast.error('Erreur lors du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products_page_config')
        .upsert({
          id: config.id || 1,
          ...config,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success('Configuration de la page produits sauvegardée avec succès !');
      fetchConfig();
    } catch (error) {
      console.error('Error saving products page config:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      page_title: 'Nos Produits',
      custom_orders_title: 'Besoin d\'une idée cadeau ou d\'un buffet gourmand ?',
      custom_orders_description: 'Nous préparons sur commande :',
      custom_order_item_1: 'Corbeilles de fruits frais',
      custom_order_item_2: 'Plateaux apéritifs ou fromagers',
      custom_order_item_3: 'Assortiments sur mesure selon vos envies',
      store_info_text: '📍 Retrait en magasin : 1 rue du Nil, 44800 Saint-Herblain • 🚚 Livraison possible dans un rayon de 3km',
    });
    toast.info('Configuration réinitialisée (non sauvegardée)');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-site-primary mx-auto"></div>
        <p className="mt-4 text-zinc-600">Chargement de la configuration...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-800">Gestion de la Page Produits</h2>
          <p className="text-sm text-zinc-600 mt-1">
            Personnalisez les textes et messages de la page produits
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-site-primary text-white rounded-lg hover:bg-site-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Titre de la page */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4">En-tête de la page</h3>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Titre principal
            </label>
            <input
              type="text"
              value={config.page_title}
              onChange={(e) => setConfig({ ...config, page_title: e.target.value })}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
              placeholder="Nos Produits"
            />
          </div>
        </div>

        {/* Section commandes personnalisées */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4">Section Commandes Personnalisées</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Titre de la section
              </label>
              <input
                type="text"
                value={config.custom_orders_title}
                onChange={(e) => setConfig({ ...config, custom_orders_title: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                placeholder="Besoin d'une idée cadeau ou d'un buffet gourmand ?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={config.custom_orders_description}
                onChange={(e) => setConfig({ ...config, custom_orders_description: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                placeholder="Nous préparons sur commande :"
              />
            </div>

            <div className="border-t border-zinc-200 pt-4">
              <label className="block text-sm font-medium text-zinc-700 mb-3">
                Liste des services (3 items)
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-site-buttons text-xl">•</span>
                  <input
                    type="text"
                    value={config.custom_order_item_1}
                    onChange={(e) => setConfig({ ...config, custom_order_item_1: e.target.value })}
                    className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                    placeholder="Corbeilles de fruits frais"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-site-buttons text-xl">•</span>
                  <input
                    type="text"
                    value={config.custom_order_item_2}
                    onChange={(e) => setConfig({ ...config, custom_order_item_2: e.target.value })}
                    className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                    placeholder="Plateaux apéritifs ou fromagers"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-site-buttons text-xl">•</span>
                  <input
                    type="text"
                    value={config.custom_order_item_3}
                    onChange={(e) => setConfig({ ...config, custom_order_item_3: e.target.value })}
                    className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                    placeholder="Assortiments sur mesure selon vos envies"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations du magasin */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4">Informations du magasin</h3>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Texte en bas de page
            </label>
            <textarea
              value={config.store_info_text}
              onChange={(e) => setConfig({ ...config, store_info_text: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
              placeholder="📍 Retrait en magasin : 1 rue du Nil, 44800 Saint-Herblain • 🚚 Livraison possible dans un rayon de 3km"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Vous pouvez utiliser des emojis pour rendre le texte plus visuel
            </p>
          </div>
        </div>

        {/* Aperçu */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            👁️ Aperçu
          </h3>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h1 className="text-4xl font-bold text-zinc-800 mb-6 text-center font-display">
              {config.page_title}
            </h1>

            <div className="rounded-lg p-6 bg-zinc-50 border border-zinc-200 mb-6">
              <h2 className="text-xl font-bold text-site-company-title mb-3">
                {config.custom_orders_title}
              </h2>
              <p className="text-base text-site-text-dark mb-3 font-medium">
                {config.custom_orders_description}
              </p>
              <ul className="space-y-2 text-site-text-dark">
                <li className="flex items-start">
                  <span className="text-site-buttons mr-3 text-xl">•</span>
                  <span>{config.custom_order_item_1}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-site-buttons mr-3 text-xl">•</span>
                  <span>{config.custom_order_item_2}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-site-buttons mr-3 text-xl">•</span>
                  <span>{config.custom_order_item_3}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg p-4 bg-white border border-zinc-200">
              <p className="text-site-text-dark text-center text-sm">
                {config.store_info_text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPageManager;
