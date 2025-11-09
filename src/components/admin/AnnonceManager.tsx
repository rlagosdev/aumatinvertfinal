import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Save, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import ImageUploadField from './ImageUploadField';

interface AnnonceButton {
  text: string;
  url: string;
  isExternal: boolean;
  enabled: boolean;
}

const AnnonceManager: React.FC = () => {
  const [title, setTitle] = useState('Annonce Spéciale');
  const [description, setDescription] = useState('Découvrez nos offres exclusives !');
  const [imageUrl, setImageUrl] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [button1, setButton1] = useState<AnnonceButton>({ text: 'Bouton 1', url: '/', isExternal: false, enabled: true });
  const [button2, setButton2] = useState<AnnonceButton>({ text: 'Bouton 2', url: '/', isExternal: false, enabled: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customUrl1, setCustomUrl1] = useState('');
  const [customUrl2, setCustomUrl2] = useState('');
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
    fetchAnnonceConfig();
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

  const fetchAnnonceConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'annonce_title',
          'annonce_description',
          'annonce_image',
          'annonce_buttons',
          'annonce_bg_color',
          'annonce_text_color'
        ]);

      if (error) {
        console.error('Error fetching annonce config:', error);
        setLoading(false);
        return;
      }

      setTitle(data?.find(s => s.setting_key === 'annonce_title')?.setting_value || 'Annonce Spéciale');
      setDescription(data?.find(s => s.setting_key === 'annonce_description')?.setting_value || 'Découvrez nos offres exclusives !');
      setImageUrl(data?.find(s => s.setting_key === 'annonce_image')?.setting_value || '');
      setBackgroundColor(data?.find(s => s.setting_key === 'annonce_bg_color')?.setting_value || '#ffffff');
      setTextColor(data?.find(s => s.setting_key === 'annonce_text_color')?.setting_value || '#000000');

      const buttonsData = data?.find(s => s.setting_key === 'annonce_buttons')?.setting_value;
      if (buttonsData) {
        try {
          const buttons = JSON.parse(buttonsData);
          if (buttons[0]) {
            setButton1(buttons[0]);
            // Si l'URL n'est pas dans les pages prédéfinies, c'est une URL personnalisée
            const isCustom1 = !sitePages.some(page => page.value === buttons[0].url);
            if (isCustom1) {
              setCustomUrl1(buttons[0].url);
            }
          }
          if (buttons[1]) {
            setButton2(buttons[1]);
            // Si l'URL n'est pas dans les pages prédéfinies, c'est une URL personnalisée
            const isCustom2 = !sitePages.some(page => page.value === buttons[1].url);
            if (isCustom2) {
              setCustomUrl2(buttons[1].url);
            }
          }
        } catch (e) {
          console.error('Error parsing buttons:', e);
        }
      }
    } catch (error) {
      console.error('Error fetching annonce config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const buttons = [button1, button2];
      const settings = [
        { key: 'annonce_title', value: title, description: 'Titre de l\'annonce' },
        { key: 'annonce_description', value: description, description: 'Description de l\'annonce' },
        { key: 'annonce_image', value: imageUrl, description: 'Image de l\'annonce' },
        { key: 'annonce_buttons', value: JSON.stringify(buttons), description: 'Boutons de l\'annonce' },
        { key: 'annonce_bg_color', value: backgroundColor, description: 'Couleur de fond de l\'annonce' },
        { key: 'annonce_text_color', value: textColor, description: 'Couleur du texte de l\'annonce' }
      ];

      for (const setting of settings) {
        const { data: existing } = await supabase
          .from('site_settings')
          .select('id')
          .eq('setting_key', setting.key)
          .single();

        if (existing) {
          const { error } = await supabase
            .from('site_settings')
            .update({ setting_value: setting.value })
            .eq('setting_key', setting.key);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('site_settings')
            .insert([{
              setting_key: setting.key,
              setting_value: setting.value,
              description: setting.description
            }]);

          if (error) throw error;
        }
      }

      toast.success('Configuration de l\'annonce sauvegardée !');
    } catch (error) {
      console.error('Error saving annonce config:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateButton1 = (field: keyof AnnonceButton, value: string | boolean) => {
    setButton1({ ...button1, [field]: value });
  };

  const updateButton2 = (field: keyof AnnonceButton, value: string | boolean) => {
    setButton2({ ...button2, [field]: value });
  };

  const handlePageSelect1 = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    let updatedButton1: AnnonceButton;

    if (selectedValue === 'custom') {
      setCustomUrl1('');
      updatedButton1 = { ...button1, url: '' };
      setButton1(updatedButton1);
    } else {
      setCustomUrl1('');
      updatedButton1 = {
        ...button1,
        url: selectedValue,
        isExternal: !selectedValue.startsWith('/')
      };
      setButton1(updatedButton1);

      // Sauvegarder automatiquement avec les nouvelles valeurs
      setSaving(true);
      try {
        const buttons = [updatedButton1, button2];
        const settings = [
          { key: 'annonce_title', value: title, description: 'Titre de l\'annonce' },
          { key: 'annonce_description', value: description, description: 'Description de l\'annonce' },
          { key: 'annonce_image', value: imageUrl, description: 'Image de l\'annonce' },
          { key: 'annonce_buttons', value: JSON.stringify(buttons), description: 'Boutons de l\'annonce' },
          { key: 'annonce_bg_color', value: backgroundColor, description: 'Couleur de fond de l\'annonce' },
          { key: 'annonce_text_color', value: textColor, description: 'Couleur du texte de l\'annonce' }
        ];

        for (const setting of settings) {
          const { data: existing } = await supabase
            .from('site_settings')
            .select('id')
            .eq('setting_key', setting.key)
            .single();

          if (existing) {
            await supabase
              .from('site_settings')
              .update({ setting_value: setting.value })
              .eq('setting_key', setting.key);
          } else {
            await supabase
              .from('site_settings')
              .insert([{
                setting_key: setting.key,
                setting_value: setting.value,
                description: setting.description
              }]);
          }
        }

        toast.success('Page de destination mise à jour !');
      } catch (error) {
        console.error('Error saving:', error);
        toast.error('Erreur lors de la sauvegarde');
      } finally {
        setSaving(false);
      }
    }
  };

  const handlePageSelect2 = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;

    let updatedButton2: AnnonceButton;

    if (selectedValue === 'custom') {
      setCustomUrl2('');
      updatedButton2 = { ...button2, url: '' };
      setButton2(updatedButton2);
    } else {
      setCustomUrl2('');
      updatedButton2 = {
        ...button2,
        url: selectedValue,
        isExternal: !selectedValue.startsWith('/')
      };
      setButton2(updatedButton2);

      // Sauvegarder automatiquement avec les nouvelles valeurs
      setSaving(true);
      try {
        const buttons = [button1, updatedButton2];
        const settings = [
          { key: 'annonce_title', value: title, description: 'Titre de l\'annonce' },
          { key: 'annonce_description', value: description, description: 'Description de l\'annonce' },
          { key: 'annonce_image', value: imageUrl, description: 'Image de l\'annonce' },
          { key: 'annonce_buttons', value: JSON.stringify(buttons), description: 'Boutons de l\'annonce' },
          { key: 'annonce_bg_color', value: backgroundColor, description: 'Couleur de fond de l\'annonce' },
          { key: 'annonce_text_color', value: textColor, description: 'Couleur du texte de l\'annonce' }
        ];

        for (const setting of settings) {
          const { data: existing } = await supabase
            .from('site_settings')
            .select('id')
            .eq('setting_key', setting.key)
            .single();

          if (existing) {
            await supabase
              .from('site_settings')
              .update({ setting_value: setting.value })
              .eq('setting_key', setting.key);
          } else {
            await supabase
              .from('site_settings')
              .insert([{
                setting_key: setting.key,
                setting_value: setting.value,
                description: setting.description
              }]);
          }
        }

        toast.success('Page de destination mise à jour !');
      } catch (error) {
        console.error('Error saving:', error);
        toast.error('Erreur lors de la sauvegarde');
      } finally {
        setSaving(false);
      }
    }
  };

  const getSelectedPage1 = () => {
    const found = sitePages.find(page => page.value === button1.url);
    return found ? found.value : 'custom';
  };

  const getSelectedPage2 = () => {
    const found = sitePages.find(page => page.value === button2.url);
    return found ? found.value : 'custom';
  };

  const copyAnnonceLink = () => {
    const link = `${window.location.origin}/annonces`;
    navigator.clipboard.writeText(link);
    toast.success('Lien copié dans le presse-papiers !');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-site-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Bell className="h-6 w-6 mr-2 text-site-primary" />
              Gestion des Annonces
            </h2>
            <p className="text-gray-600 mt-1">
              Créez une annonce popup personnalisée accessible via lien unique
            </p>
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={saving}
            className="flex items-center gap-2 bg-site-primary hover:bg-site-primary-dark text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>

        {/* Lien vers l'annonce */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <LinkIcon className="h-5 w-5 mr-2 text-blue-600" />
            Lien de l'annonce
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={`${window.location.origin}/annonces`}
              readOnly
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700"
            />
            <button
              onClick={copyAnnonceLink}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <LinkIcon className="h-5 w-5" />
              Copier
            </button>
            <a
              href="/annonces"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <ExternalLink className="h-5 w-5" />
              Voir
            </a>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Partagez ce lien avec vos clients ou utilisez-le dans le bouton "Spéciale Fêtes"
          </p>
        </div>

        {/* Configuration de base */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de l'annonce
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
              placeholder="Ex: Offre Spéciale Noël"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
              placeholder="Décrivez votre offre spéciale..."
            />
          </div>

          <div>
            <ImageUploadField
              label="Image de l'annonce"
              value={imageUrl}
              onChange={setImageUrl}
              placeholder="https://example.com/image.jpg"
              showPreview={true}
              previewClassName="aspect-video h-64"
              cropAspect={16 / 9}
            />
          </div>

          {/* Couleurs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur de fond
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur du texte
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Boutons d'action (2 boutons configurables)
              </label>
            </div>

            <div className="space-y-4">
              {/* Bouton 1 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-800">Bouton 1</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={button1.enabled}
                      onChange={(e) => updateButton1('enabled', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-site-primary focus:ring-site-primary"
                    />
                    <span className={`text-sm font-medium ${button1.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {button1.enabled ? 'Activé' : 'Désactivé'}
                    </span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Texte du bouton
                    </label>
                    <input
                      type="text"
                      value={button1.text}
                      onChange={(e) => updateButton1('text', e.target.value)}
                      disabled={!button1.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Ex: Voir l'offre"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Page de destination
                    </label>
                    <select
                      value={getSelectedPage1()}
                      onChange={handlePageSelect1}
                      disabled={!button1.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      {sitePages.map((page) => (
                        <option key={page.value} value={page.value}>
                          {page.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {getSelectedPage1() === 'custom' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        URL personnalisée
                      </label>
                      <input
                        type="text"
                        value={button1.url}
                        onChange={(e) => updateButton1('url', e.target.value)}
                        disabled={!button1.enabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="/ma-page ou https://example.com"
                      />
                    </div>
                  )}

                  {getSelectedPage1() === 'custom' && (
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={button1.isExternal}
                        onChange={(e) => updateButton1('isExternal', e.target.checked)}
                        disabled={!button1.enabled}
                        className="rounded border-gray-300 text-site-primary focus:ring-site-primary disabled:bg-gray-100"
                      />
                      Lien externe (s'ouvre dans un nouvel onglet)
                    </label>
                  )}
                </div>
              </div>

              {/* Bouton 2 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-800">Bouton 2</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={button2.enabled}
                      onChange={(e) => updateButton2('enabled', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-site-primary focus:ring-site-primary"
                    />
                    <span className={`text-sm font-medium ${button2.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                      {button2.enabled ? 'Activé' : 'Désactivé'}
                    </span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Texte du bouton
                    </label>
                    <input
                      type="text"
                      value={button2.text}
                      onChange={(e) => updateButton2('text', e.target.value)}
                      disabled={!button2.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="Ex: Commander maintenant"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Page de destination
                    </label>
                    <select
                      value={getSelectedPage2()}
                      onChange={handlePageSelect2}
                      disabled={!button2.enabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      {sitePages.map((page) => (
                        <option key={page.value} value={page.value}>
                          {page.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {getSelectedPage2() === 'custom' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        URL personnalisée
                      </label>
                      <input
                        type="text"
                        value={button2.url}
                        onChange={(e) => updateButton2('url', e.target.value)}
                        disabled={!button2.enabled}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:text-gray-500"
                        placeholder="/ma-page ou https://example.com"
                      />
                    </div>
                  )}

                  {getSelectedPage2() === 'custom' && (
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={button2.isExternal}
                        onChange={(e) => updateButton2('isExternal', e.target.checked)}
                        disabled={!button2.enabled}
                        className="rounded border-gray-300 text-site-primary focus:ring-site-primary disabled:bg-gray-100"
                      />
                      Lien externe (s'ouvre dans un nouvel onglet)
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Aperçu */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu</h3>
            <div
              className="relative rounded-lg overflow-hidden shadow-lg"
              style={{ backgroundColor, color: textColor }}
            >
              <div className="flex flex-col md:flex-row">
                {imageUrl && (
                  <div className="md:w-1/2 h-48 md:h-64">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={`${imageUrl ? 'md:w-1/2' : 'w-full'} p-8`}>
                  <h3 className="text-2xl font-bold mb-3">{title}</h3>
                  <p className="mb-4 whitespace-pre-wrap" style={{ opacity: 0.9 }}>
                    {description}
                  </p>
                  <div className="space-y-2">
                    {button1.enabled && (
                      <div className="bg-site-primary text-white font-semibold py-2 px-4 rounded-lg text-center">
                        {button1.text}
                        {button1.isExternal && <ExternalLink className="inline h-4 w-4 ml-2" />}
                      </div>
                    )}
                    {button2.enabled && (
                      <div className="bg-site-primary text-white font-semibold py-2 px-4 rounded-lg text-center">
                        {button2.text}
                        {button2.isExternal && <ExternalLink className="inline h-4 w-4 ml-2" />}
                      </div>
                    )}
                    {!button1.enabled && !button2.enabled && (
                      <p className="text-sm italic opacity-60">Aucun bouton activé</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnonceManager;
