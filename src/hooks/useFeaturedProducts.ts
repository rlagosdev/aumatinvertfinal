import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

export interface FeaturedProduct {
  id: string;
  nom: string;
  prix: number;
  categorie: string;
  retrait_planifie: boolean;
  image_url: string;
  actif: boolean;
  description?: string;
  quantite_min?: number | null;
  quantite_max?: number | null;
}

export interface FeaturedProductsSettings {
  isEnabled: boolean;
  selectedProductIds: string[];
  products: FeaturedProduct[];
}

const DEFAULT_FEATURED_PRODUCTS: FeaturedProduct[] = [
  {
    id: 'default-1',
    nom: 'Le Curé Nantais',
    prix: 12.50,
    categorie: 'Fromages',
    retrait_planifie: false,
    image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop',
    actif: true
  },
  {
    id: 'default-2',
    nom: 'Plateau fromages & crudités - 6 pers',
    prix: 75.00,
    categorie: 'Plateaux',
    retrait_planifie: true,
    image_url: 'https://images.unsplash.com/photo-1559561853-08451507cbe7?w=400&h=400&fit=crop',
    actif: true
  },
  {
    id: 'default-3',
    nom: 'Acaùyer - Chocolat Noir Martinique',
    prix: 8.90,
    categorie: 'Chocolats',
    retrait_planifie: false,
    image_url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop',
    actif: true
  },
  {
    id: 'default-4',
    nom: 'Panier de fruits de saison',
    prix: 50.00,
    categorie: 'Paniers',
    retrait_planifie: true,
    image_url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop',
    actif: true
  }
];

export const useFeaturedProducts = () => {
  const [settings, setSettings] = useState<FeaturedProductsSettings>({
    isEnabled: true,
    selectedProductIds: [],
    products: DEFAULT_FEATURED_PRODUCTS
  });
  const [availableProducts, setAvailableProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger tous les produits actifs de la base de données
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('actif', true)
        .order('nom');

      if (productsError) {
        console.error('Error loading products:', productsError);
        setError('Erreur lors du chargement des produits');
        return;
      }

      // Récupérer la première image depuis product_media pour chaque produit
      const productsWithMedia = await Promise.all(
        (productsData || []).map(async (product) => {
          // Vérifier si c'est un UUID valide avant de faire la requête
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(product.id);

          if (!isUUID) {
            // Si ce n'est pas un UUID valide, ne pas faire de requête à product_media
            return {
              ...product,
              first_media_url: null
            };
          }

          try {
            const { data: mediaData } = await supabase
              .from('product_media')
              .select('media_url')
              .eq('product_id', product.id)
              .eq('media_type', 'image')
              .order('media_order')
              .limit(1)
              .maybeSingle();

            return {
              ...product,
              first_media_url: mediaData?.media_url || null
            };
          } catch (error) {
            // En cas d'erreur, simplement retourner le produit sans image
            return {
              ...product,
              first_media_url: null
            };
          }
        })
      );

      // Transformer les produits en format FeaturedProduct
      const allProducts: FeaturedProduct[] = productsWithMedia.map(p => ({
        id: p.id,
        nom: p.nom,
        prix: p.prix,
        categorie: p.categorie,
        retrait_planifie: p.retrait_planifie ?? false,
        image_url: p.first_media_url || p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
        actif: p.actif ?? true,
        description: p.description || undefined,
        quantite_min: p.quantite_min ?? null,
        quantite_max: p.quantite_max ?? null
      }));

      setAvailableProducts(allProducts);

      // Charger les paramètres des produits phares
      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['featured_products_enabled', 'featured_products_ids']);

      if (settingsError) {
        console.error('Error loading featured products settings:', settingsError);
        setError('Erreur lors du chargement des paramètres');
        return;
      }

      // Traiter les paramètres
      const isEnabled = settingsData?.find(s => s.setting_key === 'featured_products_enabled')?.setting_value === 'true';
      const selectedIds = settingsData?.find(s => s.setting_key === 'featured_products_ids')?.setting_value;

      let selectedProductIds: string[] = [];
      if (selectedIds) {
        try {
          selectedProductIds = JSON.parse(selectedIds);
        } catch (e) {
          console.error('Error parsing selected product IDs:', e);
          // En cas d'erreur, sélectionner les 4 premiers produits disponibles
          selectedProductIds = allProducts.slice(0, 4).map(p => p.id);
        }
      } else {
        // Si aucun produit n'est configuré, sélectionner les 4 premiers par défaut
        selectedProductIds = allProducts.slice(0, 4).map(p => p.id);
      }

      // Récupérer les produits sélectionnés depuis la liste complète
      const selectedProducts = selectedProductIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(Boolean) as FeaturedProduct[];

      // Si moins de 4 produits sélectionnés, compléter avec d'autres produits disponibles
      if (selectedProducts.length < 4 && allProducts.length > selectedProducts.length) {
        const remaining = allProducts.filter(p => !selectedProductIds.includes(p.id));
        selectedProducts.push(...remaining.slice(0, 4 - selectedProducts.length));
      }

      setSettings({
        isEnabled: isEnabled ?? true,
        selectedProductIds,
        products: selectedProducts.slice(0, 4) // Maximum 4 produits
      });

    } catch (err) {
      console.error('Error in loadSettings:', err);
      setError('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<FeaturedProductsSettings>) => {
    try {
      setError(null);

      const updates = [];

      if (newSettings.isEnabled !== undefined) {
        updates.push({
          setting_key: 'featured_products_enabled',
          setting_value: newSettings.isEnabled.toString(),
          setting_type: 'boolean',
          description: 'Affichage des produits phares sur la page d\'accueil'
        });
      }

      if (newSettings.selectedProductIds !== undefined) {
        updates.push({
          setting_key: 'featured_products_ids',
          setting_value: JSON.stringify(newSettings.selectedProductIds),
          setting_type: 'json',
          description: 'IDs des produits phares sélectionnés'
        });
      }

      if (updates.length > 0) {
        const { error: saveError } = await supabase
          .from('site_settings')
          .upsert(updates, { onConflict: 'setting_key' });

        if (saveError) {
          console.error('Error saving featured products settings:', saveError);
          setError('Erreur lors de la sauvegarde');
          return false;
        }

        // Recharger les paramètres
        await loadSettings();
        return true;
      }

      return true;
    } catch (err) {
      console.error('Error in saveSettings:', err);
      setError('Erreur lors de la sauvegarde');
      return false;
    }
  }, [loadSettings]);

  const updateSelectedProducts = useCallback(async (productIds: string[]) => {
    // Limiter à 4 produits maximum
    const limitedIds = productIds.slice(0, 4);
    
    const selectedProducts = limitedIds
      .map(id => availableProducts.find(p => p.id === id))
      .filter(Boolean) as FeaturedProduct[];

    // Mettre à jour l'état local immédiatement
    setSettings(prev => ({
      ...prev,
      selectedProductIds: limitedIds,
      products: selectedProducts
    }));

    // Sauvegarder en base
    return await saveSettings({ selectedProductIds: limitedIds });
  }, [availableProducts, saveSettings]);

  const toggleEnabled = useCallback(async () => {
    const newEnabled = !settings.isEnabled;
    setSettings(prev => ({ ...prev, isEnabled: newEnabled }));
    return await saveSettings({ isEnabled: newEnabled });
  }, [settings.isEnabled, saveSettings]);

  const getFeaturedProducts = useCallback(() => {
    if (!settings.isEnabled) {
      return [];
    }
    return settings.products;
  }, [settings.isEnabled, settings.products]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    availableProducts,
    loading,
    error,
    updateSelectedProducts,
    toggleEnabled,
    getFeaturedProducts,
    saveSettings,
    loadSettings
  };
};