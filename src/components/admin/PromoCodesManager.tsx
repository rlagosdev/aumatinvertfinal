import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';

interface PromoCode {
  id: string;
  code: string;
  product_id: string;
  product_name?: string;
  pricing_type: string;
  pricing_item_id: string | null;
  discount_percentage: number;
  description: string | null;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string | null;
  valid_until: string | null;
  actif: boolean;
}

interface Product {
  id: string;
  nom: string;
}

const PromoCodesManager: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // États pour les options de pricing
  const [pricingOptions, setPricingOptions] = useState<any[]>([]);
  const [loadingPricingOptions, setLoadingPricingOptions] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    product_id: '',
    pricing_type: 'normal',
    pricing_item_id: null as string | null,
    discount_percentage: 10,
    description: '',
    usage_limit: null as number | null,
    valid_from: '',
    valid_until: '',
    actif: true
  });

  useEffect(() => {
    fetchPromoCodes();
    fetchProducts();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);

      // Récupérer les codes promo
      const { data: promoCodes, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false});

      if (error) throw error;

      // Récupérer tous les produits pour faire la correspondance
      const { data: allProducts } = await supabase
        .from('products')
        .select('id, nom');

      const productsMap = new Map((allProducts || []).map(p => [p.id, p.nom]));

      const codesWithProductNames = (promoCodes || []).map(code => ({
        ...code,
        product_name: code.product_id === 'ALL_PRODUCTS'
          ? '🌟 Tous les produits'
          : (productsMap.get(code.product_id) || 'Produit inconnu')
      }));

      setPromoCodes(codesWithProductNames);
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      toast.error('Erreur lors du chargement des codes promo');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, nom')
        .eq('actif', true)
        .order('nom');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Charger les options de pricing selon le type et le produit
  const fetchPricingOptions = async (productId: string, pricingType: string) => {
    if (!productId || productId === 'ALL_PRODUCTS' || pricingType === 'normal' || pricingType === 'person') {
      setPricingOptions([]);
      return;
    }

    setLoadingPricingOptions(true);
    try {
      let tableName = '';
      let selectFields = 'id, ';

      switch (pricingType) {
        case 'tier':
          tableName = 'product_price_tiers';
          selectFields += 'quantity, price';
          break;
        case 'section':
          tableName = 'product_sections';
          selectFields += 'nom, prix';
          break;
        case 'range':
          tableName = 'product_ranges';
          selectFields += 'nom, prix_par_personne';
          break;
        case 'weight':
          tableName = 'product_weight_tiers';
          selectFields += 'poids_grammes, prix';
          break;
        default:
          setPricingOptions([]);
          return;
      }

      const { data, error } = await supabase
        .from(tableName)
        .select(selectFields)
        .eq('product_id', productId)
        .order(pricingType === 'tier' ? 'quantity' : pricingType === 'weight' ? 'poids_grammes' : 'nom');

      if (error) throw error;
      setPricingOptions(data || []);
    } catch (error) {
      console.error('Error fetching pricing options:', error);
      setPricingOptions([]);
    } finally {
      setLoadingPricingOptions(false);
    }
  };

  // Charger les options quand le produit ou le type change
  useEffect(() => {
    if (formData.product_id && formData.pricing_type) {
      fetchPricingOptions(formData.product_id, formData.pricing_type);
    } else {
      setPricingOptions([]);
    }
  }, [formData.product_id, formData.pricing_type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code) {
      toast.error('Le code est obligatoire');
      return;
    }

    if (!formData.product_id) {
      toast.error('Veuillez sélectionner un produit ou "Tous les produits"');
      return;
    }

    try {
      const dataToSave = {
        code: formData.code.toUpperCase(),
        product_id: formData.product_id,
        pricing_type: formData.pricing_type,
        pricing_item_id: formData.pricing_item_id,
        discount_percentage: formData.discount_percentage,
        description: formData.description || null,
        usage_limit: formData.usage_limit,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
        actif: formData.actif
      };

      if (editingId) {
        const { error } = await supabase
          .from('promo_codes')
          .update(dataToSave)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Code promo mis à jour');
      } else {
        const { error } = await supabase
          .from('promo_codes')
          .insert(dataToSave);

        if (error) throw error;
        toast.success('Code promo créé');
      }

      resetForm();
      fetchPromoCodes();
    } catch (error: any) {
      console.error('Error saving promo code:', error);
      if (error.code === '23505') {
        toast.error('Ce code promo existe déjà');
      } else {
        toast.error('Erreur lors de l\'enregistrement');
      }
    }
  };

  const handleEdit = (promoCode: PromoCode) => {
    setFormData({
      code: promoCode.code,
      product_id: promoCode.product_id,
      pricing_type: promoCode.pricing_type,
      pricing_item_id: promoCode.pricing_item_id,
      discount_percentage: promoCode.discount_percentage,
      description: promoCode.description || '',
      usage_limit: promoCode.usage_limit,
      valid_from: promoCode.valid_from || '',
      valid_until: promoCode.valid_until || '',
      actif: promoCode.actif
    });
    setEditingId(promoCode.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce code promo ?')) return;

    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Code promo supprimé');
      fetchPromoCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      product_id: '',
      pricing_type: 'normal',
      pricing_item_id: null,
      discount_percentage: 10,
      description: '',
      usage_limit: null,
      valid_from: '',
      valid_until: '',
      actif: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getPricingTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'normal': 'Prix normal',
      'section': 'Section',
      'range': 'Gamme',
      'weight': 'Poids',
      'tier': 'Palier',
      'person': 'Par personne'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-site-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Ticket className="h-6 w-6 text-site-primary" />
          <h2 className="text-2xl font-bold text-gray-900">Codes Promo</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-site-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span>{showForm ? 'Annuler' : 'Nouveau code'}</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier le code promo' : 'Nouveau code promo'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                  placeholder="Ex: PROMO20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produit *
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Sélectionner un produit</option>
                  <option value="ALL_PRODUCTS" className="font-bold bg-green-50">🌟 Tous les produits</option>
                  <option disabled>───────────────</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.nom}
                    </option>
                  ))}
                </select>
                {formData.product_id === 'ALL_PRODUCTS' && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ Ce code promo s'appliquera à tous les produits du site
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de tarification *
                </label>
                <select
                  value={formData.pricing_type}
                  onChange={(e) => {
                    setFormData({ ...formData, pricing_type: e.target.value, pricing_item_id: null });
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="normal">Prix normal</option>
                  <option value="section">Section</option>
                  <option value="range">Gamme</option>
                  <option value="weight">Poids</option>
                  <option value="tier">Palier</option>
                  <option value="person">Par personne</option>
                </select>
              </div>

              {/* Sélecteur dynamique pour les options de pricing */}
              {['tier', 'section', 'range', 'weight'].includes(formData.pricing_type) &&
               formData.product_id &&
               formData.product_id !== 'ALL_PRODUCTS' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.pricing_type === 'tier' && 'Palier spécifique'}
                    {formData.pricing_type === 'section' && 'Section spécifique'}
                    {formData.pricing_type === 'range' && 'Gamme spécifique'}
                    {formData.pricing_type === 'weight' && 'Poids spécifique'}
                    {' '}(optionnel)
                  </label>
                  <select
                    value={formData.pricing_item_id || ''}
                    onChange={(e) => setFormData({ ...formData, pricing_item_id: e.target.value || null })}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={loadingPricingOptions}
                  >
                    <option value="">Tous les {formData.pricing_type === 'tier' ? 'paliers' : formData.pricing_type === 'section' ? 'sections' : formData.pricing_type === 'range' ? 'gammes' : 'poids'}</option>
                    {loadingPricingOptions ? (
                      <option disabled>Chargement...</option>
                    ) : (
                      pricingOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {formData.pricing_type === 'tier' && `${option.quantity} personnes - ${option.price}€`}
                          {formData.pricing_type === 'section' && `${option.nom} - ${option.prix}€`}
                          {formData.pricing_type === 'range' && `${option.nom} - ${option.prix_par_personne}€/pers`}
                          {formData.pricing_type === 'weight' && `${option.poids_grammes}g - ${option.prix}€`}
                        </option>
                      ))
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Laissez vide pour appliquer à tous les {formData.pricing_type === 'tier' ? 'paliers' : formData.pricing_type === 'section' ? 'sections' : formData.pricing_type === 'range' ? 'gammes' : 'poids'} de ce produit
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Réduction (%) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite d'utilisation
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.usage_limit || ''}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Illimité si vide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valide à partir de
                </label>
                <input
                  type="datetime-local"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valide jusqu'au
                </label>
                <input
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.actif}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Actif</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Description du code promo"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-site-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
              >
                <Save className="h-4 w-4" />
                <span>{editingId ? 'Mettre à jour' : 'Créer'}</span>
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réduction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promoCodes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  Aucun code promo créé
                </td>
              </tr>
            ) : (
              promoCodes.map((code) => (
                <tr key={code.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-site-primary">{code.code}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.product_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getPricingTypeLabel(code.pricing_type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    -{code.discount_percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.usage_count} {code.usage_limit ? `/ ${code.usage_limit}` : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${code.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {code.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button
                      onClick={() => handleEdit(code)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromoCodesManager;
