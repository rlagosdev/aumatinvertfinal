import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, DollarSign, Save, AlertCircle, Tag, Calendar, Ticket } from 'lucide-react';
import { useProductPriceTiers, type PriceTier, isTierPromotionValid, getTierDiscountPercentage } from '../../hooks/useProductPriceTiers';
import PromoCodeManager from './PromoCodeManager';

interface ProductPriceTiersManagerProps {
  productId: string;
  productName?: string;
  usePriceTiers: boolean;
  onTogglePriceTiers: (enabled: boolean) => void;
}

const ProductPriceTiersManager: React.FC<ProductPriceTiersManagerProps> = ({
  productId,
  productName = 'Ce produit',
  usePriceTiers,
  onTogglePriceTiers
}) => {
  const { tiers, loading, error, saveTiers, enablePriceTiers, updateTierPromotion } = useProductPriceTiers(productId);
  const [localTiers, setLocalTiers] = useState<PriceTier[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [expandedTierId, setExpandedTierId] = useState<string | null>(null);
  const [showPromoCodeManager, setShowPromoCodeManager] = useState(false);

  useEffect(() => {
    if (tiers.length > 0) {
      // Vérifier si c'est un vrai changement ou juste un refetch
      const tiersChanged = JSON.stringify(tiers) !== JSON.stringify(localTiers);
      if (tiersChanged || localTiers.length === 0) {
        setLocalTiers(tiers);
      }
    } else if (usePriceTiers && localTiers.length === 0) {
      // Initialiser avec un palier vide seulement si pas déjà initialisé
      setLocalTiers([
        { product_id: productId, quantity: 6, price: 0, tier_order: 1 }
      ]);
    }
  }, [tiers, productId, usePriceTiers]);

  const handleToggle = async () => {
    const newValue = !usePriceTiers;
    const success = await enablePriceTiers(newValue);
    if (success) {
      onTogglePriceTiers(newValue);
      if (newValue && localTiers.length === 0) {
        // Ajouter un palier par défaut
        setLocalTiers([
          { product_id: productId, quantity: 6, price: 0, tier_order: 1 }
        ]);
      }
    }
  };

  const addTier = () => {
    const nextQuantity = localTiers.length > 0
      ? Math.max(...localTiers.map(t => t.quantity)) + 3
      : 6;

    setLocalTiers([
      ...localTiers,
      {
        product_id: productId,
        quantity: nextQuantity,
        price: 0,
        tier_order: localTiers.length + 1
      }
    ]);
  };

  const removeTier = (index: number) => {
    setLocalTiers(localTiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof PriceTier, value: any) => {
    const updated = [...localTiers];
    updated[index] = { ...updated[index], [field]: value };
    setLocalTiers(updated);
  };

  const togglePromotion = async (tier: PriceTier, index: number) => {
    if (!tier.id) {
      // Si le palier n'a pas encore d'ID (pas encore sauvegardé), juste mettre à jour localement
      updateTier(index, 'promotion_active', !tier.promotion_active);
      return;
    }

    // Si le palier a un ID, mettre à jour directement dans la base de données
    const newActiveState = !tier.promotion_active;
    const success = await updateTierPromotion(tier.id, {
      promotion_active: newActiveState
    });

    if (success) {
      // Mettre à jour l'état local pour éviter le refetch
      updateTier(index, 'promotion_active', newActiveState);

      setMessage({
        type: 'success',
        text: newActiveState ? 'Promotion activée!' : 'Promotion désactivée!'
      });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const savePromotion = async (tier: PriceTier, index: number) => {
    if (!tier.id) {
      setMessage({
        type: 'error',
        text: 'Veuillez d\'abord sauvegarder le palier avant d\'ajouter une promotion'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Validation selon le type de promotion
    if (tier.promotion_type === 'fixed') {
      if (tier.promotion_price && tier.promotion_price >= tier.price) {
        setMessage({
          type: 'error',
          text: 'Le prix promotionnel doit être inférieur au prix normal'
        });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
    } else if (tier.promotion_type === 'percent') {
      if (tier.promotion_discount_percent && (tier.promotion_discount_percent <= 0 || tier.promotion_discount_percent >= 100)) {
        setMessage({
          type: 'error',
          text: 'Le pourcentage doit être entre 0 et 100'
        });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
    }

    const success = await updateTierPromotion(tier.id, {
      promotion_price: tier.promotion_price,
      promotion_discount_percent: tier.promotion_discount_percent,
      promotion_type: tier.promotion_type,
      promotion_start_date: tier.promotion_start_date,
      promotion_end_date: tier.promotion_end_date
    });

    if (success) {
      // L'état local est déjà à jour car updateTier est appelé quand l'utilisateur modifie les champs
      // Pas besoin de refetch
      setMessage({
        type: 'success',
        text: 'Promotion sauvegardée avec succès!'
      });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleSave = async () => {
    // Validation
    if (localTiers.some(t => t.quantity <= 0 || t.price <= 0)) {
      setMessage({
        type: 'error',
        text: 'Tous les paliers doivent avoir une quantité et un prix positifs'
      });
      return;
    }

    // Vérifier les doublons
    const quantities = localTiers.map(t => t.quantity);
    if (new Set(quantities).size !== quantities.length) {
      setMessage({
        type: 'error',
        text: 'Chaque palier doit avoir une quantité unique'
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    // Trier par quantité
    const sortedTiers = [...localTiers].sort((a, b) => a.quantity - b.quantity);
    const success = await saveTiers(sortedTiers);

    if (success) {
      setMessage({
        type: 'success',
        text: 'Paliers de prix sauvegardés avec succès!'
      });
    } else {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la sauvegarde des paliers'
      });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const hasChanges = JSON.stringify(localTiers.map(t => ({ q: t.quantity, p: t.price }))) !==
                     JSON.stringify(tiers.map(t => ({ q: t.quantity, p: t.price })));

  if (!productId) return null;

  // Build pricing options for promo code manager
  const pricingOptions = localTiers
    .filter(tier => tier.id)
    .map(tier => ({
      type: 'tier',
      label: `Palier: ${tier.quantity} unités`,
      itemId: tier.id!
    }));

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Paliers de Prix</h3>
          <p className="text-sm text-gray-600">Définissez des prix par quantité (ex: 6, 9, 12 personnes)</p>
        </div>
        <div className="flex items-center space-x-3">
          {usePriceTiers && pricingOptions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPromoCodeManager(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              title="Gérer les codes promo pour les paliers"
            >
              <Ticket className="h-4 w-4" />
              <span>Codes Promo</span>
            </button>
          )}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={usePriceTiers}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-site-primary"></div>
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {usePriceTiers && (
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-500 text-sm">Chargement...</p>
          ) : (
            <>
              <div className="space-y-3">
                {localTiers.map((tier, index) => {
                  const isExpanded = expandedTierId === (tier.id || `new-${index}`);
                  const hasPromotion = isTierPromotionValid(tier);
                  const discountPercent = getTierDiscountPercentage(tier);

                  return (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* En-tête du palier */}
                      <div className="flex items-center space-x-3 p-3 bg-gray-50">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              <Users className="h-3 w-3 inline mr-1" />
                              Quantité (personnes)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={tier.quantity}
                              onChange={(e) => updateTier(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              <DollarSign className="h-3 w-3 inline mr-1" />
                              Prix normal (€)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={tier.price}
                              onChange={(e) => updateTier(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Boutons d'action */}
                        <div className="flex items-center space-x-2">
                          {tier.id && (
                            <button
                              type="button"
                              onClick={() => setExpandedTierId(isExpanded ? null : (tier.id || `new-${index}`))}
                              className={`p-2 rounded-lg transition-colors ${
                                hasPromotion
                                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                  : 'text-site-primary hover:bg-purple-50'
                              }`}
                              title={hasPromotion ? `Promotion active: -${discountPercent}%` : 'Gérer la promotion'}
                            >
                              <Tag className="h-4 w-4" />
                            </button>
                          )}
                          {localTiers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTier(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer ce palier"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Section promotion (affichée si étendue) */}
                      {isExpanded && tier.id && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                                <Tag className="h-4 w-4 mr-2 text-site-primary" />
                                Promotion pour ce palier
                              </h4>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={tier.promotion_active || false}
                                  onChange={() => togglePromotion(tier, index)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                              </label>
                            </div>

                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-2">
                                Type de promotion
                              </label>
                              <div className="flex gap-3">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`promo_type_${tier.id}`}
                                    checked={tier.promotion_type === 'fixed' || !tier.promotion_type}
                                    onChange={() => updateTier(index, 'promotion_type', 'fixed')}
                                    className="mr-2"
                                  />
                                  <span className="text-sm">Prix fixe (€)</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`promo_type_${tier.id}`}
                                    checked={tier.promotion_type === 'percent'}
                                    onChange={() => updateTier(index, 'promotion_type', 'percent')}
                                    className="mr-2"
                                  />
                                  <span className="text-sm">Pourcentage (%)</span>
                                </label>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              {(tier.promotion_type === 'fixed' || !tier.promotion_type) && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    <DollarSign className="h-3 w-3 inline mr-1" />
                                    Prix promotionnel (€)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={tier.promotion_price || ''}
                                    onChange={(e) => updateTier(index, 'promotion_price', parseFloat(e.target.value) || null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                    placeholder="Ex: 39.99"
                                  />
                                </div>
                              )}
                              {tier.promotion_type === 'percent' && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    <Tag className="h-3 w-3 inline mr-1" />
                                    Réduction (%)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={tier.promotion_discount_percent || ''}
                                    onChange={(e) => updateTier(index, 'promotion_discount_percent', parseFloat(e.target.value) || null)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                    placeholder="Ex: 15"
                                  />
                                </div>
                              )}
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  Date début
                                </label>
                                <input
                                  type="date"
                                  value={tier.promotion_start_date ? new Date(tier.promotion_start_date).toISOString().split('T')[0] : ''}
                                  onChange={(e) => updateTier(index, 'promotion_start_date', e.target.value || null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  Date fin
                                </label>
                                <input
                                  type="date"
                                  value={tier.promotion_end_date ? new Date(tier.promotion_end_date).toISOString().split('T')[0] : ''}
                                  onChange={(e) => updateTier(index, 'promotion_end_date', e.target.value || null)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                />
                              </div>
                            </div>

                            {((tier.promotion_type === 'fixed' && tier.promotion_price) ||
                              (tier.promotion_type === 'percent' && tier.promotion_discount_percent)) && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">
                                  {tier.promotion_type === 'fixed' && tier.promotion_price ? (
                                    <>
                                      <strong>Réduction :</strong> -{Math.round(((tier.price - tier.promotion_price) / tier.price) * 100)}%
                                      <span className="ml-2">
                                        (Prix final: {tier.promotion_price.toFixed(2)} € - Économie de {(tier.price - tier.promotion_price).toFixed(2)} €)
                                      </span>
                                    </>
                                  ) : tier.promotion_type === 'percent' && tier.promotion_discount_percent ? (
                                    <>
                                      <strong>Réduction :</strong> -{tier.promotion_discount_percent}%
                                      <span className="ml-2">
                                        (Prix final: {(tier.price * (1 - tier.promotion_discount_percent / 100)).toFixed(2)} € - Économie de {(tier.price * tier.promotion_discount_percent / 100).toFixed(2)} €)
                                      </span>
                                    </>
                                  ) : null}
                                </p>
                              </div>
                            )}

                            <div className="flex justify-end pt-2">
                              <button
                                type="button"
                                onClick={() => savePromotion(tier, index)}
                                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                              >
                                <Save className="h-4 w-4" />
                                <span>Sauvegarder la promotion</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addTier}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-site-primary hover:text-site-primary transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter un palier</span>
              </button>

              {hasChanges && (
                <div className="flex items-center justify-end pt-4 border-gray-200">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </button>
                </div>
              )}

              {localTiers.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Aperçu :</p>
                  <div className="space-y-1">
                    {[...localTiers].sort((a, b) => a.quantity - b.quantity).map((tier, index) => (
                      <p key={index} className="text-sm text-blue-800">
                        • {tier.quantity} personnes = <strong>{tier.price.toFixed(2)} €</strong>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal de gestion des codes promo */}
      {showPromoCodeManager && (
        <PromoCodeManager
          productId={productId}
          productName={productName}
          pricingOptions={pricingOptions}
          onClose={() => setShowPromoCodeManager(false)}
        />
      )}
    </div>
  );
};

export default ProductPriceTiersManager;
