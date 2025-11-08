import React, { useState, useEffect } from 'react';
import { useQuantityDiscounts } from '../../hooks/useQuantityDiscounts';
import { Plus, Trash2, Percent, TrendingDown } from 'lucide-react';
import { toast } from 'react-toastify';

interface QuantityDiscountTier {
  id: string;
  quantity: number;
  discountPercentage: number;
}

interface QuantityDiscountManagerProps {
  productId: string;
  className?: string;
}

const QuantityDiscountManager: React.FC<QuantityDiscountManagerProps> = ({ 
  productId, 
  className = '' 
}) => {
  const {
    getProductDiscounts,
    addDiscountTier,
    updateDiscountTier,
    removeDiscountTier,
    saveProductDiscounts,
    calculateDiscountedPrice
  } = useQuantityDiscounts();

  const [tiers, setTiers] = useState<QuantityDiscountTier[]>([]);
  const [initialTiers, setInitialTiers] = useState<QuantityDiscountTier[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewQuantity, setPreviewQuantity] = useState(10);
  const [previewPrice, setPreviewPrice] = useState(15);

  useEffect(() => {
    const productTiers = getProductDiscounts(productId);
    setTiers(productTiers);
    setInitialTiers(productTiers);
  }, [productId, getProductDiscounts]);

  // Vérifier s'il y a des modifications non sauvegardées
  const hasUnsavedChanges = (() => {
    // Comparer les longueurs
    if (tiers.length !== initialTiers.length) return true;

    // Si les deux sont vides, pas de changements
    if (tiers.length === 0 && initialTiers.length === 0) return false;

    // Comparer chaque palier (en ignorant les IDs qui peuvent changer)
    const currentSorted = [...tiers].sort((a, b) => a.quantity - b.quantity);
    const initialSorted = [...initialTiers].sort((a, b) => a.quantity - b.quantity);

    for (let i = 0; i < currentSorted.length; i++) {
      if (currentSorted[i].quantity !== initialSorted[i].quantity ||
          currentSorted[i].discountPercentage !== initialSorted[i].discountPercentage) {
        return true;
      }
    }

    return false;
  })();

  const handleAddTier = () => {
    const newQuantity = tiers.length > 0 ? Math.max(...tiers.map(t => t.quantity)) + 1 : 5;
    const tierId = addDiscountTier(productId, newQuantity, 5);
    
    // Mettre à jour l'état local
    const newTier: QuantityDiscountTier = {
      id: tierId,
      quantity: newQuantity,
      discountPercentage: 5
    };
    setTiers(prev => [...prev, newTier].sort((a, b) => a.quantity - b.quantity));
  };

  const handleUpdateTier = (tierId: string, field: 'quantity' | 'discountPercentage', value: number) => {
    updateDiscountTier(productId, tierId, { [field]: value });
    setTiers(prev => 
      prev.map(tier => 
        tier.id === tierId ? { ...tier, [field]: value } : tier
      ).sort((a, b) => a.quantity - b.quantity)
    );
  };

  const handleRemoveTier = (tierId: string) => {
    removeDiscountTier(productId, tierId);
    setTiers(prev => prev.filter(tier => tier.id !== tierId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Valider les données
      const validTiers = tiers.filter(tier =>
        tier.quantity > 0 &&
        tier.discountPercentage > 0 &&
        tier.discountPercentage < 100
      );

      // Vérifier les doublons de quantité (seulement s'il y a des paliers)
      if (validTiers.length > 0) {
        const quantities = validTiers.map(t => t.quantity);
        const uniqueQuantities = [...new Set(quantities)];

        if (quantities.length !== uniqueQuantities.length) {
          toast.error('Plusieurs paliers ont la même quantité. Corrigez avant de sauvegarder.');
          setSaving(false);
          return;
        }
      }

      const success = await saveProductDiscounts(productId, validTiers);
      if (success) {
        if (validTiers.length === 0 && initialTiers.length === 0) {
          toast.success('Confirmé: aucun tarif dégressif pour ce produit');
        } else if (validTiers.length === 0) {
          toast.success('Tarifs dégressifs supprimés avec succès');
        } else {
          toast.success('Tarifs dégressifs sauvegardés avec succès');
        }
        setTiers(validTiers);
        setInitialTiers(validTiers); // Mettre à jour les données initiales
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const previewCalculation = calculateDiscountedPrice(productId, previewPrice, previewQuantity);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <TrendingDown className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-zinc-800">Tarifs dégressifs</h3>
        </div>
        <button
          type="button"
          onClick={handleAddTier}
          className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un palier</span>
        </button>
      </div>

      {/* Aperçu et test */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-3">Aperçu des calculs</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Prix unitaire (€)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={previewPrice}
              onChange={(e) => setPreviewPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Quantité test
            </label>
            <input
              type="number"
              min="1"
              value={previewQuantity}
              onChange={(e) => setPreviewQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">
              Résultat
            </label>
            <div className="p-2 bg-white rounded-lg border border-blue-200">
              {previewCalculation.discountPercentage > 0 ? (
                <div className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="line-through text-gray-500">
                      {(previewCalculation.originalPrice * previewQuantity).toFixed(2)}€
                    </span>
                    <span className="font-bold text-green-600">
                      {(previewCalculation.discountedPrice * previewQuantity).toFixed(2)}€
                    </span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    -{previewCalculation.discountPercentage}% • Économie: {(previewCalculation.savings * previewQuantity).toFixed(2)}€
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  {(previewPrice * previewQuantity).toFixed(2)}€
                  <div className="text-xs text-gray-500 mt-1">Aucune remise applicable</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des paliers */}
      <div className="space-y-3">
        {tiers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Percent className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucun tarif dégressif configuré</p>
            <p className="text-sm">Les clients paieront le prix standard</p>
          </div>
        ) : (
          tiers.map((tier, index) => (
            <div key={tier.id} className="p-4 border border-zinc-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-zinc-800">Palier {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveTier(tier.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Supprimer ce palier"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Quantité minimum
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tier.quantity}
                    onChange={(e) => handleUpdateTier(tier.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Remise (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.1"
                      max="99.9"
                      step="0.1"
                      value={tier.discountPercentage}
                      onChange={(e) => handleUpdateTier(tier.id, 'discountPercentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8"
                    />
                    <Percent className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">À partir de {tier.quantity} unité{tier.quantity > 1 ? 's' : ''} :</span>
                  <span className="ml-2">{tier.discountPercentage}% de remise appliquée</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-zinc-200 mt-6">
        <div className="text-sm text-zinc-600">
          {tiers.length > 0 ? (
            <span>
              {tiers.length} palier{tiers.length > 1 ? 's' : ''} configuré{tiers.length > 1 ? 's' : ''}
              {hasUnsavedChanges && <span className="ml-2 text-orange-600">• Non sauvegardé</span>}
            </span>
          ) : (
            <span className="text-gray-600">
              {hasUnsavedChanges && initialTiers.length > 0 ? (
                <span className="text-orange-600">⚠️ Tous les tarifs dégressifs seront supprimés</span>
              ) : (
                <span>Aucun tarif dégressif</span>
              )}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-semibold ${
            tiers.length === 0
              ? hasUnsavedChanges && initialTiers.length > 0
                ? 'bg-red-600 text-white hover:bg-red-700'  // Suppression
                : 'bg-gray-600 text-white hover:bg-gray-700'  // Confirmation aucun tarif
              : 'bg-purple-600 text-white hover:bg-purple-700'  // Sauvegarde normale
          } disabled:opacity-50`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sauvegarde...</span>
            </>
          ) : (
            <>
              <span>
                {tiers.length === 0
                  ? hasUnsavedChanges && initialTiers.length > 0
                    ? '🗑️ Supprimer les tarifs'
                    : '✓ Confirmer (aucun tarif)'
                  : '💾 Sauvegarder les tarifs'
                }
              </span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-semibold text-blue-900 mb-2">📋 Instructions:</p>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside mb-3">
          <li>Cliquez sur <strong>"Ajouter un palier"</strong> pour créer vos remises</li>
          <li>Configurez la quantité minimum et le pourcentage de remise</li>
          <li>Cliquez sur <strong>"Sauvegarder les tarifs"</strong> (ou "Supprimer" / "Confirmer")</li>
          <li className="text-green-700 font-semibold">✓ C'est tout ! Pas besoin du bouton "Modifier" en bas de page</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          💡 <strong>Comment ça marche :</strong>
        </p>
        <ul className="text-sm text-amber-700 mt-2 space-y-1">
          <li>• Plus la quantité augmente, plus la remise appliquée est importante</li>
          <li>• Les paliers s'appliquent automatiquement selon la quantité dans le panier</li>
          <li>• Les clients voient l'économie réalisée et les prochains seuils disponibles</li>
          <li>• Les remises s'appliquent sur le total de chaque produit</li>
        </ul>
      </div>
    </div>
  );
};

export default QuantityDiscountManager;