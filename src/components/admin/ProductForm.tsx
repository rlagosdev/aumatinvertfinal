import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { X, Clock, Plus, Tag, Calendar } from 'lucide-react';
import ProductMediaManager from './ProductMediaManager';
import TempMediaManager from './TempMediaManager';
import QuantityDiscountManager from './QuantityDiscountManager';
import TempQuantityDiscountManager from './TempQuantityDiscountManager';
import TempProductPriceTiersManager from './TempProductPriceTiersManager';
import TempWeightPricingManager from './TempWeightPricingManager';
import ProductPriceTiersManager from './ProductPriceTiersManager';
import WeightPricingManager from './WeightPricingManager';
import PersonPricingManager from './PersonPricingManager';
import PersonPriceTiersManager from './PersonPriceTiersManager';
import RangePricingManager from './RangePricingManager';
import SectionPricingManager from './SectionPricingManager';
import PromoCodeManager from './PromoCodeManager';
import { useQuantityDiscounts } from '../../hooks/useQuantityDiscounts';
import { useProductSections } from '../../hooks/useProductSections';
import { useProductRanges } from '../../hooks/useProductRanges';
import { useWeightTiers } from '../../hooks/useWeightTiers';
import { useProductPriceTiers } from '../../hooks/useProductPriceTiers';

interface Product {
  id: string;
  nom: string;
  prix: number;
  categorie: string;
  retrait_planifie: boolean | null;
  image_url: string | null;
  actif: boolean | null;
  delai_retrait_valeur?: number | null;
  delai_retrait_unite?: string | null;
  description?: string | null;
  promotion_active?: boolean | null;
  prix_promotionnel?: number | null;
  promotion_date_debut?: string | null;
  promotion_date_fin?: string | null;
  use_price_tiers?: boolean | null;
  quantite_min?: number | null;
  quantite_max?: number | null;
  vendu_au_poids?: boolean | null;
  prix_par_100g?: number | null;
  prix_base?: number | null;
  poids_base_grammes?: number | null;
  unite_poids?: string | null;
  prix_par_personne?: boolean | null;
  prix_unitaire_personne?: number | null;
  nb_personnes_min?: number | null;
  nb_personnes_max?: number | null;
  prix_par_gamme?: boolean | null;
  prix_par_section?: boolean | null;
}

interface Category {
  id: string;
  nom: string;
  description?: string | null;
}

interface TempQuantityDiscountTier {
  id: string;
  quantity: number;
  discountPercentage: number;
}

interface TempPriceTier {
  id: string;
  quantity: number;
  price: number;
}

interface TempWeightTier {
  id: string;
  poids_grammes: number;
  prix: number;
}

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product: initialProduct, onClose }) => {
  const { saveProductDiscounts } = useQuantityDiscounts();
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [isDraft, setIsDraft] = useState(false); // Nouveau: indique si c'est un brouillon
  const modalContentRef = React.useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    nom: '',
    prix: '' as any,
    categorie: '',
    retrait_planifie: false,
    image_url: '',
    actif: false, // Désactivé par défaut pour les brouillons
    delai_retrait_valeur: 4,
    delai_retrait_unite: 'jours',
    description: '',
    promotion_active: false,
    prix_promotionnel: '' as any,
    promotion_date_debut: '',
    promotion_date_fin: '',
    use_price_tiers: false,
    quantite_min: 1,
    quantite_max: null,
    vendu_au_poids: false,
    prix_par_100g: '' as any,
    prix_base: null,
    poids_base_grammes: 100,
    unite_poids: 'g',
    prix_par_personne: false,
    prix_unitaire_personne: null,
    nb_personnes_min: 1,
    nb_personnes_max: null,
    prix_par_gamme: false,
    prix_par_section: false,
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [tempMediaList, setTempMediaList] = useState<{url: string, type: 'image' | 'video', alt: string}[]>([]);
  const [tempDiscountTiers, setTempDiscountTiers] = useState<TempQuantityDiscountTier[]>([]);
  const [tempPriceTiers, setTempPriceTiers] = useState<TempPriceTier[]>([]);
  const [tempWeightTiers, setTempWeightTiers] = useState<TempWeightTier[]>([]);
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [showPromoCodeManager, setShowPromoCodeManager] = useState(false);
  const [productJustCreated, setProductJustCreated] = useState(false);

  // Load pricing data for promo code manager
  const { sections } = useProductSections(product?.id || '');
  const { ranges } = useProductRanges(product?.id || '');
  const { weightTiers } = useWeightTiers(product?.id || '');
  const { tiers: priceTiers } = useProductPriceTiers(product?.id || '');

  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset modal scroll to top when opening
  useEffect(() => {
    const timer = setTimeout(() => {
      if (modalContentRef.current) {
        modalContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Créer un produit brouillon pour permettre la configuration complète dès le début
  useEffect(() => {
    const createDraftProduct = async () => {
      if (!initialProduct && !product) {
        try {
          // Créer un produit brouillon avec des valeurs minimales
          const { data: draftProduct, error } = await supabase
            .from('products')
            .insert([{
              nom: '[Brouillon]',
              prix: 0.01,
              categorie: 'Brouillon',
              actif: false, // Invisible sur le site
              retrait_planifie: false
            }])
            .select()
            .single();

          if (error) throw error;

          setProduct(draftProduct);
          setIsDraft(true);
        } catch (error) {
          console.error('Error creating draft product:', error);
          // Si la création échoue, on continue sans brouillon
        }
      }
    };

    createDraftProduct();
  }, [initialProduct]); // Seulement au montage si pas de produit initial

  useEffect(() => {
    // Ne charger les données du produit que si ce n'est PAS un brouillon
    if (product && !isDraft) {
      setFormData({
        nom: product.nom,
        prix: product.prix,
        categorie: product.categorie,
        retrait_planifie: product.retrait_planifie ?? false,
        image_url: product.image_url ?? '',
        actif: product.actif ?? true,
        delai_retrait_valeur: product.delai_retrait_valeur || 4,
        delai_retrait_unite: product.delai_retrait_unite || 'jours',
        description: product.description || '',
        promotion_active: product.promotion_active ?? false,
        prix_promotionnel: product.prix_promotionnel || 0,
        promotion_date_debut: product.promotion_date_debut ? product.promotion_date_debut.split('T')[0] : '',
        promotion_date_fin: product.promotion_date_fin ? product.promotion_date_fin.split('T')[0] : '',
        use_price_tiers: product.use_price_tiers ?? false,
        quantite_min: product.quantite_min ?? 1,
        quantite_max: product.quantite_max ?? null,
        vendu_au_poids: product.vendu_au_poids ?? false,
        prix_par_100g: product.prix_par_100g || 0,
        prix_base: product.prix_base || null,
        poids_base_grammes: product.poids_base_grammes || 100,
        unite_poids: product.unite_poids || 'g',
        prix_par_personne: product.prix_par_personne ?? false,
        prix_unitaire_personne: product.prix_unitaire_personne || null,
        nb_personnes_min: product.nb_personnes_min || 1,
        nb_personnes_max: product.nb_personnes_max || null,
        prix_par_gamme: product.prix_par_gamme ?? false,
        prix_par_section: product.prix_par_section ?? false,
      });
    }
  }, [product, isDraft]);

  // Build pricing options dynamically based on product configuration
  const pricingOptions = useMemo(() => {
    const options: { type: string; label: string; itemId?: string | null }[] = [];

    // Normal pricing (always available)
    options.push({ type: 'normal', label: 'Prix normal' });

    // Section pricing
    if (formData.prix_par_section && sections.length > 0) {
      sections.forEach(section => {
        options.push({
          type: 'section',
          label: `Section: ${section.nom}`,
          itemId: section.id
        });
      });
    }

    // Range pricing
    if (formData.prix_par_gamme && ranges.length > 0) {
      ranges.forEach(range => {
        options.push({
          type: 'range',
          label: `Gamme: ${range.nom}`,
          itemId: range.id
        });
      });
    }

    // Weight tiers
    if (formData.vendu_au_poids && weightTiers.length > 0) {
      weightTiers.forEach(tier => {
        options.push({
          type: 'weight',
          label: `Poids: ${tier.poids_grammes}g`,
          itemId: tier.id
        });
      });
    }

    // Price tiers
    if (formData.use_price_tiers && priceTiers.length > 0) {
      priceTiers.forEach(tier => {
        options.push({
          type: 'tier',
          label: `Palier: ${tier.quantity} unités`,
          itemId: tier.id
        });
      });
    }

    // Person pricing
    if (formData.prix_par_personne) {
      options.push({ type: 'person', label: 'Par personne' });
    }

    return options;
  }, [
    formData.prix_par_section,
    formData.prix_par_gamme,
    formData.vendu_au_poids,
    formData.use_price_tiers,
    formData.prix_par_personne,
    sections,
    ranges,
    weightTiers,
    priceTiers
  ]);

  const fetchCategories = async () => {
    try {
      // 1. Récupérer les catégories officielles de la table categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('actif', true)
        .order('nom');

      // 2. Récupérer les catégories uniques utilisées par les produits
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('categorie')
        .not('categorie', 'is', null);

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      }
      if (productsError) {
        console.error('Error fetching product categories:', productsError);
      }

      // 3. Combiner les catégories officielles et celles des produits
      const officialCategories = categoriesData || [];
      const productCategories = productsData || [];

      // Créer un Set des noms de catégories officielles pour éviter les doublons
      const officialCategoryNames = new Set(officialCategories.map(cat => cat.nom));

      // Extraire les catégories uniques des produits qui ne sont pas déjà officielles
      const uniqueProductCategories = [...new Set(productCategories.map(p => p.categorie))]
        .filter(categoryName => categoryName && !officialCategoryNames.has(categoryName))
        .map(categoryName => ({
          id: `product-${categoryName}`,
          nom: categoryName,
          description: `Catégorie utilisée par les produits existants`
        }));

      // 4. Combiner toutes les catégories
      const allCategories = [
        ...officialCategories,
        ...uniqueProductCategories
      ].sort((a, b) => a.nom.localeCompare(b.nom));

      setCategories(allCategories);
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      // Fallback vers des catégories statiques en cas d'erreur
      const fallbackCategories = [
        { id: 'fallback-1', nom: 'Fruits', description: 'Fruits frais' },
        { id: 'fallback-2', nom: 'Légumes', description: 'Légumes bio' },
        { id: 'fallback-3', nom: 'Produits laitiers', description: 'Fromages et yaourts' },
        { id: 'fallback-4', nom: 'Épicerie', description: 'Produits secs' }
      ];
      setCategories(fallbackCategories);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Le nom de la catégorie est obligatoire');
      return;
    }

    try {
      // Vérifier si la catégorie existe déjà
      const { data: existingCategory } = await supabase
        .from('categories')
        .select('nom')
        .eq('nom', newCategoryName.trim())
        .single();

      if (existingCategory) {
        toast.error('Cette catégorie existe déjà');
        return;
      }

      // Créer la nouvelle catégorie dans la base de données
      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({
          nom: newCategoryName.trim(),
          description: newCategoryDescription.trim() || null,
          actif: true
        })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour la liste locale
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.nom.localeCompare(b.nom)));
      setFormData(prev => ({ ...prev, categorie: newCategory.nom }));
      setNewCategoryName('');
      setNewCategoryDescription('');
      setShowNewCategory(false);
      toast.success('Catégorie créée avec succès');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Erreur lors de la création de la catégorie');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Fonction de retry avec backoff exponentiel
    const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3, delay = 1000) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (error: any) {
          // Si c'est la dernière tentative ou une erreur non-réseau, lancer l'erreur
          const isNetworkError = error?.message?.includes('Failed to fetch') ||
                                 error?.message?.includes('NetworkError') ||
                                 error?.code === 'ECONNRESET' ||
                                 !error?.message; // ERR_CONNECTION_CLOSED n'a souvent pas de message

          if (i === maxRetries - 1 || !isNetworkError) {
            throw error;
          }

          // Attendre avant la prochaine tentative (backoff exponentiel)
          console.log(`Tentative ${i + 1} échouée, nouvelle tentative dans ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Doubler le délai à chaque tentative
        }
      }
    };

    try {
      // Nettoyer les données : remplacer les chaînes vides par null pour les dates
      const cleanedData = {
        ...formData,
        promotion_date_debut: formData.promotion_date_debut || null,
        promotion_date_fin: formData.promotion_date_fin || null,
        actif: true, // Activer le produit lors de la finalisation
      };

      console.log('Sauvegarde du produit avec les données:', cleanedData);

      if (product && !initialProduct) {
        // Update draft or newly created product with real data
        await retryWithBackoff(async () => {
          const { data, error } = await supabase
            .from('products')
            .update({
              ...cleanedData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', product.id)
            .select();

          if (error) {
            console.error('Erreur Supabase:', error);
            throw error;
          }

          console.log('Produit créé avec succès:', data);
          return data;
        });

        toast.success('Produit créé avec succès!');
        onClose();
      } else if (initialProduct && product) {
        // Update existing product
        await retryWithBackoff(async () => {
          const { data, error } = await supabase
            .from('products')
            .update({
              ...cleanedData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', product.id)
            .select();

          if (error) {
            console.error('Erreur Supabase:', error);
            throw error;
          }

          console.log('Produit modifié avec succès:', data);
          return data;
        });

        toast.success('Produit modifié avec succès');
        onClose();
      }
    } catch (error: any) {
      console.error('Error saving product:', error);

      // Message d'erreur détaillé
      let errorMessage = 'Erreur lors de la sauvegarde';

      if (error?.message) {
        errorMessage += `: ${error.message}`;
      } else if (!error) {
        errorMessage += ': Erreur de connexion réseau (ERR_CONNECTION_CLOSED)';
      }

      if (error?.code) {
        errorMessage += ` (Code: ${error.code})`;
      }

      // Suggestions selon le type d'erreur
      if (error?.message?.includes('Failed to fetch') || !error?.message) {
        errorMessage += '\n\nSuggestions:\n- Vérifiez votre connexion internet\n- Désactivez temporairement votre VPN (ProtonVPN)\n- Vérifiez que Supabase est accessible';
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? parseFloat(value) || 0
          : value
    }));
  };

  const handleClose = async () => {
    // Si c'est un brouillon, le supprimer avant de fermer
    if (isDraft && product) {
      try {
        await supabase
          .from('products')
          .delete()
          .eq('id', product.id);
      } catch (error) {
        console.error('Error deleting draft product:', error);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto">
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        ref={modalContentRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-zinc-800">
              {initialProduct ? 'Modifier le produit' : productJustCreated ? 'Configurer le produit' : 'Ajouter un produit'}
            </h2>
            {productJustCreated && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Produit créé ! Configurez maintenant les options avancées.
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {product && (
              <>
                <a
                  href={`/produits/${encodeURIComponent(product.categorie)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium inline-flex items-center shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Prévisualiser
                </a>
                <a
                  href={`/pricing/${product.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium inline-flex items-center shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Comment ça marche
                </a>
              </>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Formulaire de base - masqué après création */}
          {!productJustCreated && (
            <>
          {/* Nom du produit */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
              required
            />
          </div>

          {/* Prix et Catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Prix (€) *
              </label>
              <input
                type="number"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Catégorie *
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.nom}>{cat.nom}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    title="Créer une nouvelle catégorie"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Formulaire de création de catégorie */}
                {showNewCategory && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-green-800">Nouvelle catégorie</h4>
                    <div>
                      <input
                        type="text"
                        placeholder="Nom de la catégorie *"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Description (optionnelle)"
                        value={newCategoryDescription}
                        onChange={(e) => setNewCategoryDescription(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Créer
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategory(false);
                          setNewCategoryName('');
                          setNewCategoryDescription('');
                        }}
                        className="px-3 py-2 bg-zinc-300 text-zinc-700 text-sm rounded-lg hover:bg-zinc-400 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description du produit */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Description (optionnelle)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={8}
              maxLength={500}
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent resize-none"
              placeholder="Décrivez le produit... Cette description sera visible par vos clients."
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-zinc-500">
                Ajoutez une description pour aider vos clients à mieux comprendre ce produit.
              </p>
              <p className="text-xs text-zinc-500">
                {formData.description.length}/500 caractères
              </p>
            </div>
          </div>

          {/* Quantités min/max */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-3">Limites de quantité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Quantité minimum *
                </label>
                <input
                  type="number"
                  name="quantite_min"
                  value={formData.quantite_min ?? 1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setFormData(prev => ({
                      ...prev,
                      quantite_min: value,
                      quantite_max: prev.quantite_max && prev.quantite_max < value ? value : prev.quantite_max
                    }));
                  }}
                  min="1"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-blue-600 mt-1">
                  Nombre minimum d'unités que le client doit commander
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700 mb-2">
                  Quantité maximum
                </label>
                <input
                  type="number"
                  name="quantite_max"
                  value={formData.quantite_max ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : null;
                    setFormData(prev => ({ ...prev, quantite_max: value }));
                  }}
                  min={formData.quantite_min ?? 1}
                  placeholder="Pas de limite"
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-blue-600 mt-1">
                  Nombre maximum d'unités (laissez vide pour aucune limite)
                </p>
              </div>
            </div>

            {/* Aperçu des limites */}
            <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Résumé :</strong> Les clients pourront commander entre{' '}
                <strong>{formData.quantite_min ?? 1}</strong> et{' '}
                <strong>{formData.quantite_max ? formData.quantite_max : '∞'}</strong> unités
              </p>
            </div>
          </div>

          {/* Gestionnaire de Médias */}
          {product ? (
            <div className="border border-zinc-200 rounded-lg p-4">
              <ProductMediaManager 
                productId={product.id} 
                onMediaChange={(media) => {
                  // Optionnel : mettre à jour l'image principale si nécessaire
                  const firstImage = media.find(m => m.media_type === 'image');
                  if (firstImage) {
                    setFormData(prev => ({ ...prev, image_url: firstImage.media_url }));
                  }
                }}
              />
            </div>
          ) : (
            <div>
              <TempMediaManager 
                mediaList={tempMediaList}
                onMediaChange={setTempMediaList}
              />
              
              {/* URL Image (compatibilité) - optionnelle si pas de médias temporaires */}
              {tempMediaList.length === 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    URL de l'image (optionnelle)
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Vous pouvez utiliser le gestionnaire de médias ci-dessus ou simplement ajouter une URL d'image.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Retrait planifié */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="retrait_planifie"
                checked={formData.retrait_planifie}
                onChange={handleChange}
                className="h-4 w-4 text-site-primary focus:ring-site-primary border-zinc-300 rounded"
              />
              <label className="ml-2 block text-sm text-zinc-700">
                Retrait planifié (nécessite une précommande)
              </label>
            </div>

            {/* Configuration du délai si retrait planifié */}
            {formData.retrait_planifie && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Clock className="h-4 w-4 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-800">
                    Configuration du délai de retrait
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-orange-700 mb-1">
                      Délai
                    </label>
                    <input
                      type="number"
                      name="delai_retrait_valeur"
                      value={formData.delai_retrait_valeur}
                      onChange={handleChange}
                      min="1"
                      max="30"
                      className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-orange-700 mb-1">
                      Unité
                    </label>
                    <select
                      name="delai_retrait_unite"
                      value={formData.delai_retrait_unite}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="heures">Heures</option>
                      <option value="jours">Jours</option>
                    </select>
                  </div>
                </div>
                
                <p className="text-xs text-orange-600 mt-2">
                  Les clients devront commander au moins {formData.delai_retrait_valeur} {formData.delai_retrait_unite} avant le retrait souhaité.
                </p>
              </div>
            )}
          </div>

          {/* Actif */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="actif"
              checked={formData.actif}
              onChange={handleChange}
              className="h-4 w-4 text-site-primary focus:ring-site-primary border-zinc-300 rounded"
            />
            <label className="ml-2 block text-sm text-zinc-700">
              Produit actif (visible sur le site)
            </label>
          </div>

          {/* Promotion */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="promotion_active"
                checked={formData.promotion_active}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-zinc-300 rounded"
              />
              <label className="ml-2 block text-sm text-zinc-700">
                Activer la promotion (prix barré)
              </label>
            </div>

            {/* Configuration de la promotion si activée */}
            {formData.promotion_active && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Tag className="h-4 w-4 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-800">
                    Configuration de la promotion
                  </span>
                </div>
                
                <div className="space-y-4">
                  {/* Prix promotionnel */}
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">
                      Prix promotionnel (€) *
                    </label>
                    <input
                      type="number"
                      name="prix_promotionnel"
                      value={formData.prix_promotionnel}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max={formData.prix - 0.01}
                      className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required={formData.promotion_active}
                    />
                    <p className="text-xs text-red-600 mt-1">
                      Le prix promotionnel doit être inférieur au prix normal ({formData.prix.toFixed(2)}€)
                    </p>
                  </div>

                  {/* Dates de promotion */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">
                        Date de début
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="promotion_date_debut"
                          value={formData.promotion_date_debut}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-8"
                        />
                        <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">
                        Date de fin
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          name="promotion_date_fin"
                          value={formData.promotion_date_fin}
                          onChange={handleChange}
                          min={formData.promotion_date_debut}
                          className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-8"
                        />
                        <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Message d'information sur les dates */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <svg className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-xs text-blue-800">
                        <p className="font-medium mb-1">💡 Comment fonctionnent les dates ?</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li><strong>Sans dates :</strong> La promotion est active immédiatement et en permanence</li>
                          <li><strong>Avec date de début :</strong> La promotion démarre à cette date (ex: {new Date().toLocaleDateString('fr-FR')} pour aujourd'hui)</li>
                          <li><strong>Avec date de fin :</strong> La promotion se termine automatiquement à cette date</li>
                          <li><strong>Important :</strong> Les clients ne verront la promotion que si la date actuelle est entre le début et la fin</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Aperçu de la promotion */}
                  <div className="bg-white rounded-lg p-3 border border-red-300">
                    <h4 className="font-medium text-red-800 mb-2">Aperçu</h4>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg line-through text-gray-500">
                        {formData.prix.toFixed(2)}€
                      </span>
                      <span className="text-xl font-bold text-red-600">
                        {formData.prix_promotionnel.toFixed(2)}€
                      </span>
                      {formData.prix > 0 && formData.prix_promotionnel > 0 && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          -{Math.round(((formData.prix - formData.prix_promotionnel) / formData.prix) * 100)}%
                        </span>
                      )}
                    </div>
                    {formData.prix > 0 && formData.prix_promotionnel > 0 && (
                      <p className="text-sm text-red-600 mt-1">
                        Économie : {(formData.prix - formData.prix_promotionnel).toFixed(2)}€
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gestionnaire de tarifs dégressifs */}
          <div className="border border-zinc-200 rounded-lg p-4">
            {product ? (
              <QuantityDiscountManager
                productId={product.id}
                className=""
              />
            ) : (
              <TempQuantityDiscountManager
                tiers={tempDiscountTiers}
                onTiersChange={setTempDiscountTiers}
                className=""
              />
            )}
          </div>
            </>
          )}

          {/* Options avancées - toujours visibles */}
          {/* Gestionnaire de paliers de prix */}
          {product ? (
            <ProductPriceTiersManager
              productId={product.id}
              productName={product.nom}
              usePriceTiers={formData.use_price_tiers}
              onTogglePriceTiers={(enabled) => setFormData(prev => ({ ...prev, use_price_tiers: enabled }))}
            />
          ) : (
            <TempProductPriceTiersManager
              usePriceTiers={formData.use_price_tiers}
              tiers={tempPriceTiers}
              onTogglePriceTiers={(enabled) => setFormData(prev => ({ ...prev, use_price_tiers: enabled }))}
              onTiersChange={setTempPriceTiers}
            />
          )}

          {/* Gestionnaire de tarification au poids */}
          {product ? (
            <WeightPricingManager
              productId={product.id}
              venduAuPoids={formData.vendu_au_poids}
              prixPar100g={formData.prix_par_100g}
              prixBase={formData.prix_base}
              poidsBaseGrammes={formData.poids_base_grammes}
              onToggleWeightPricing={(enabled) => setFormData(prev => ({ ...prev, vendu_au_poids: enabled }))}
              onUpdateBasePricePerWeight={(price) => setFormData(prev => ({ ...prev, prix_par_100g: price }))}
              onUpdateBasePrice={(price, weight) => {
                setFormData(prev => ({
                  ...prev,
                  prix_base: price,
                  poids_base_grammes: weight,
                  prix_par_100g: (price / weight) * 100
                }));
              }}
            />
          ) : (
            <TempWeightPricingManager
              venduAuPoids={formData.vendu_au_poids}
              prixPar100g={formData.prix_par_100g}
              prixBase={formData.prix_base}
              poidsBaseGrammes={formData.poids_base_grammes}
              weightTiers={tempWeightTiers}
              onToggleWeightPricing={(enabled) => setFormData(prev => ({ ...prev, vendu_au_poids: enabled }))}
              onUpdateBasePricePerWeight={(price) => setFormData(prev => ({ ...prev, prix_par_100g: price }))}
              onUpdateBasePrice={(price, weight) => {
                setFormData(prev => ({
                  ...prev,
                  prix_base: price,
                  poids_base_grammes: weight,
                  prix_par_100g: (price / weight) * 100
                }));
              }}
              onWeightTiersChange={setTempWeightTiers}
            />
          )}

          {/* Gestionnaire de tarification par personne */}
          {product ? (
            <PersonPricingManager
              productId={product.id}
              prixParPersonne={formData.prix_par_personne || false}
              prixUnitairePersonne={formData.prix_unitaire_personne}
              nbPersonnesMin={formData.nb_personnes_min}
              nbPersonnesMax={formData.nb_personnes_max}
              onTogglePersonPricing={(enabled) => {
                setFormData(prev => ({ ...prev, prix_par_personne: enabled }));
              }}
              onUpdatePersonPricing={(price, min, max) => {
                setFormData(prev => ({
                  ...prev,
                  prix_unitaire_personne: price,
                  nb_personnes_min: min,
                  nb_personnes_max: max
                }));
              }}
            />
          ) : (
            <div className="border border-pink-200 rounded-lg p-4 bg-pink-50 opacity-60">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-pink-800">Tarification par personne</h3>
                  <p className="text-xs text-pink-600">Prix calculé selon le nombre de personnes</p>
                </div>
                <span className="px-3 py-1 bg-pink-200 text-pink-700 rounded-lg text-xs font-medium">
                  Disponible après création
                </span>
              </div>
              <p className="text-xs text-pink-600 italic">
                La tarification par personne sera disponible après la création du produit.
              </p>
            </div>
          )}

          {/* Gestionnaire de tarifs dégressifs par personne */}
          {product && formData.prix_par_personne && (
            <PersonPriceTiersManager
              productId={product.id}
              prixParPersonne={formData.prix_par_personne || false}
              prixUnitairePersonne={formData.prix_unitaire_personne || undefined}
            />
          )}

          {/* Gestionnaire de tarification par gamme + personne */}
          {product ? (
            <RangePricingManager
              productId={product.id}
              prixParGamme={formData.prix_par_gamme || false}
              nbPersonnesMin={formData.nb_personnes_min}
              nbPersonnesMax={formData.nb_personnes_max}
              onToggleRangePricing={(enabled) => {
                setFormData(prev => ({ ...prev, prix_par_gamme: enabled }));
              }}
            />
          ) : (
            <div className="border border-amber-200 rounded-lg p-4 bg-amber-50 opacity-60">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-amber-800">Tarification par gamme + personne</h3>
                  <p className="text-xs text-amber-600">Prix selon gamme et nombre de personnes</p>
                </div>
                <span className="px-3 py-1 bg-amber-200 text-amber-700 rounded-lg text-xs font-medium">
                  Disponible après création
                </span>
              </div>
              <p className="text-xs text-amber-600 italic">
                La tarification par gamme sera disponible après la création du produit.
              </p>
            </div>
          )}

          {/* Gestionnaire de tarification par section */}
          {product ? (
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-purple-800">Tarification par section</h3>
                  <p className="text-xs text-purple-600">Définir des prix pour 1/4, 1/2, entier, etc.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.prix_par_section || false}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, prix_par_section: e.target.checked }));
                      }}
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-purple-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-purple-700">Activer</span>
                  </label>
                  {formData.prix_par_section && (
                    <button
                      type="button"
                      onClick={() => setShowSectionManager(true)}
                      className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
                    >
                      Gérer les sections
                    </button>
                  )}
                </div>
              </div>

              {!formData.prix_par_section && (
                <p className="text-xs text-purple-600 italic">
                  Activez cette option pour définir des sections (1/4, 1/2, entier...) avec leurs prix spécifiques.
                </p>
              )}
            </div>
          ) : (
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 opacity-60">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-purple-800">Tarification par section</h3>
                  <p className="text-xs text-purple-600">Définir des prix pour 1/4, 1/2, entier, etc.</p>
                </div>
                <span className="px-3 py-1 bg-purple-200 text-purple-700 rounded-lg text-xs font-medium">
                  Disponible après création
                </span>
              </div>
              <p className="text-xs text-purple-600 italic">
                La tarification par section sera disponible après la création du produit.
              </p>
            </div>
          )}

          {/* Modal de gestion des sections */}
          {showSectionManager && product && (
            <SectionPricingManager
              productId={product.id}
              productName={product.nom}
              onClose={() => setShowSectionManager(false)}
            />
          )}

          {/* Gestionnaire de codes promo */}
          {product ? (
            pricingOptions.length > 0 && (
              <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-orange-800">Codes promo</h3>
                    <p className="text-xs text-orange-600">Créer des codes promo pour ce produit</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPromoCodeManager(true)}
                    className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs"
                  >
                    Gérer les codes promo
                  </button>
                </div>
                <p className="text-xs text-orange-600 italic">
                  Créez des codes promotionnels pour offrir des réductions en pourcentage sur différents types de tarification.
                </p>
              </div>
            )
          ) : (
            <div className="border border-orange-200 rounded-lg p-4 bg-orange-50 opacity-60">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-orange-800">Codes promo</h3>
                  <p className="text-xs text-orange-600">Créer des codes promo pour ce produit</p>
                </div>
                <span className="px-3 py-1 bg-orange-200 text-orange-700 rounded-lg text-xs font-medium">
                  Disponible après création
                </span>
              </div>
              <p className="text-xs text-orange-600 italic">
                Les codes promo seront disponibles après la création du produit.
              </p>
            </div>
          )}

          {/* Modal de gestion des codes promo */}
          {showPromoCodeManager && product && (
            <PromoCodeManager
              productId={product.id}
              productName={product.nom}
              pricingOptions={pricingOptions}
              onClose={() => setShowPromoCodeManager(false)}
            />
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-zinc-600 hover:text-zinc-800"
            >
              {productJustCreated ? 'Terminer' : 'Annuler'}
            </button>
            {!productJustCreated && (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-site-primary text-white rounded-lg hover:bg-site-primary disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : (initialProduct ? 'Modifier' : 'Créer')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;