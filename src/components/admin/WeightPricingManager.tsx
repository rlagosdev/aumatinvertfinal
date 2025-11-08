import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Weight, DollarSign, Save, AlertCircle } from 'lucide-react';
import { useWeightPricing, type WeightTier } from '../../hooks/useWeightPricing';

interface WeightPricingManagerProps {
  productId: string;
  venduAuPoids: boolean;
  prixPar100g?: number | null;
  prixBase?: number | null;
  poidsBaseGrammes?: number | null;
  onToggleWeightPricing: (enabled: boolean) => void;
  onUpdateBasePricePerWeight?: (price: number) => void;
  onUpdateBasePrice?: (price: number, weight: number) => void;
}

const WeightPricingManager: React.FC<WeightPricingManagerProps> = ({
  productId,
  venduAuPoids,
  prixPar100g,
  prixBase,
  poidsBaseGrammes,
  onToggleWeightPricing,
  onUpdateBasePricePerWeight,
  onUpdateBasePrice
}) => {
  const { weightTiers, loading, error, saveWeightTiers, enableWeightPricing, updateBasePricePerWeight } = useWeightPricing(productId);
  const [localTiers, setLocalTiers] = useState<WeightTier[]>([]);
  const [localBasePricePer100g, setLocalBasePricePer100g] = useState<number>(prixPar100g || 0);
  const [localBasePrice, setLocalBasePrice] = useState<number>(prixBase || 0);
  const [localBaseWeight, setLocalBaseWeight] = useState<number>(poidsBaseGrammes || 100);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (weightTiers.length > 0) {
      // Vérifier si c'est un vrai changement ou juste un refetch
      const tiersChanged = JSON.stringify(weightTiers) !== JSON.stringify(localTiers);
      if (tiersChanged || localTiers.length === 0) {
        setLocalTiers(weightTiers);
      }
    } else if (venduAuPoids && localTiers.length === 0) {
      // Initialiser avec des paliers par défaut pour les fromages
      setLocalTiers([
        { product_id: productId, poids_grammes: 100, prix: 0, tier_order: 1 },
        { product_id: productId, poids_grammes: 200, prix: 0, tier_order: 2 },
        { product_id: productId, poids_grammes: 500, prix: 0, tier_order: 3 }
      ]);
    }
  }, [weightTiers, productId, venduAuPoids]);

  useEffect(() => {
    if (prixPar100g !== undefined && prixPar100g !== null) {
      setLocalBasePricePer100g(prixPar100g);
    }
  }, [prixPar100g]);

  useEffect(() => {
    if (prixBase !== undefined && prixBase !== null) {
      setLocalBasePrice(prixBase);
    }
    if (poidsBaseGrammes !== undefined && poidsBaseGrammes !== null) {
      setLocalBaseWeight(poidsBaseGrammes);
    }
  }, [prixBase, poidsBaseGrammes]);

  const handleToggle = async () => {
    const newValue = !venduAuPoids;

    // Simplement toggle sans validation complexe
    const success = await enableWeightPricing(newValue);
    if (success) {
      onToggleWeightPricing(newValue);
      if (newValue && localTiers.length === 0) {
        // Ajouter des paliers par défaut
        setLocalTiers([
          { product_id: productId, poids_grammes: 100, prix: 0, tier_order: 1 },
          { product_id: productId, poids_grammes: 200, prix: 0, tier_order: 2 },
          { product_id: productId, poids_grammes: 500, prix: 0, tier_order: 3 }
        ]);
      }
      setMessage({
        type: 'success',
        text: newValue ? 'Tarification au poids activée! Configurez vos paliers ci-dessous.' : 'Tarification au poids désactivée!'
      });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour'
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const addTier = () => {
    const lastWeight = localTiers.length > 0
      ? Math.max(...localTiers.map(t => t.poids_grammes))
      : 0;
    const nextWeight = lastWeight + 100;

    setLocalTiers([
      ...localTiers,
      {
        product_id: productId,
        poids_grammes: nextWeight,
        prix: 0,
        tier_order: localTiers.length + 1
      }
    ]);
  };

  const removeTier = (index: number) => {
    setLocalTiers(localTiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof WeightTier, value: any) => {
    const updated = [...localTiers];
    updated[index] = { ...updated[index], [field]: value };
    setLocalTiers(updated);
  };

  const handleSaveBasePricePer100g = async () => {
    if (localBasePrice <= 0) {
      setMessage({
        type: 'error',
        text: 'Le prix de base doit être positif'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (localBaseWeight <= 0) {
      setMessage({
        type: 'error',
        text: 'Le poids de référence doit être positif'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSaving(true);

    // Calculer le prix par 100g pour compatibilité
    const prixPar100gCalcule = (localBasePrice / localBaseWeight) * 100;
    const success = await updateBasePricePerWeight(prixPar100gCalcule);

    if (success) {
      if (onUpdateBasePricePerWeight) {
        onUpdateBasePricePerWeight(prixPar100gCalcule);
      }
      if (onUpdateBasePrice) {
        onUpdateBasePrice(localBasePrice, localBaseWeight);
      }
      setMessage({
        type: 'success',
        text: 'Prix de base sauvegardé avec succès!'
      });
    } else {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la sauvegarde du prix de base'
      });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveTiers = async () => {
    // Validation
    if (localTiers.some(t => t.poids_grammes <= 0 || t.prix <= 0)) {
      setMessage({
        type: 'error',
        text: 'Tous les paliers doivent avoir un poids et un prix positifs'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Vérifier les doublons
    const weights = localTiers.map(t => t.poids_grammes);
    if (new Set(weights).size !== weights.length) {
      setMessage({
        type: 'error',
        text: 'Chaque palier doit avoir un poids unique'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSaving(true);
    setMessage(null);

    // Trier par poids
    const sortedTiers = [...localTiers].sort((a, b) => a.poids_grammes - b.poids_grammes);
    const success = await saveWeightTiers(sortedTiers);

    if (success) {
      setMessage({
        type: 'success',
        text: 'Paliers de poids sauvegardés avec succès!'
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

  const hasChanges = JSON.stringify(localTiers.map(t => ({ w: t.poids_grammes, p: t.prix }))) !==
                     JSON.stringify(weightTiers.map(t => ({ w: t.poids_grammes, p: t.prix })));

  if (!productId) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tarification au Poids</h3>
          <p className="text-sm text-gray-600">Pour les fromages à la découpe et produits vendus au poids</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={venduAuPoids}
            onChange={handleToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
        </label>
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


      {venduAuPoids && (
        <div className="space-y-4">
          {/* Instructions importantes */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">📋 Instructions:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Cliquez sur <strong>"Ajouter un palier"</strong> autant de fois que nécessaire</li>
              <li>Remplissez les <strong>poids (en grammes)</strong> et <strong>prix (en €)</strong> pour chaque palier</li>
              <li>Cliquez sur <strong>"Sauvegarder les paliers"</strong></li>
              <li>Puis cliquez sur le bouton <strong>"Modifier"</strong> en bas de page pour finaliser</li>
            </ol>
            <p className="text-xs text-blue-700 mt-2">
              ℹ️ Vous pouvez ajouter autant de paliers que vous voulez (10, 20, 100...)
            </p>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm">Chargement...</p>
          ) : (
            <>
              {/* Paliers de poids */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <Weight className="h-4 w-4 mr-2 text-orange-600" />
                  Paliers de poids
                </h4>
                <p className="text-xs text-gray-600 mb-3">
                  Définissez le poids (en grammes) et le prix (en €) pour chaque palier. Les clients pourront choisir parmi ces options.
                </p>

                <div className="space-y-3">
                  {localTiers.map((tier, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            <Weight className="h-3 w-3 inline mr-1" />
                            Poids (grammes)
                          </label>
                          <input
                            type="number"
                            value={tier.poids_grammes}
                            onChange={(e) => updateTier(index, 'poids_grammes', parseInt(e.target.value) || 0)}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            <DollarSign className="h-3 w-3 inline mr-1" />
                            Prix (€)
                          </label>
                          <input
                            type="number"
                            value={tier.prix}
                            onChange={(e) => updateTier(index, 'prix', parseFloat(e.target.value) || 0)}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>
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
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addTier}
                  className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter un palier</span>
                </button>

                {hasChanges && (
                  <div className="flex items-center justify-end pt-4 border-t border-gray-200 mt-4">
                    <button
                      type="button"
                      onClick={handleSaveTiers}
                      disabled={saving}
                      className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>{saving ? 'Sauvegarde...' : 'Sauvegarder les paliers'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Aperçu des paliers */}
              {localTiers.length > 0 && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-medium text-orange-900 mb-2">Aperçu :</p>
                  <div className="space-y-1">
                    {[...localTiers].sort((a, b) => a.poids_grammes - b.poids_grammes).map((tier, index) => (
                      <p key={index} className={`text-sm ${tier.prix === 0 ? 'text-red-600 font-semibold' : 'text-orange-800'}`}>
                        • {tier.poids_grammes}g = <strong>{tier.prix.toFixed(2)} €</strong>
                        {tier.prix === 0 && <span className="ml-2">⚠️ Prix non défini!</span>}
                      </p>
                    ))}
                  </div>
                  {localTiers.some(t => t.prix === 0) && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        ⚠️ <strong>Attention:</strong> Remplissez les prix pour tous les paliers avant de sauvegarder.
                        Les paliers à 0€ ne s'afficheront pas correctement côté client.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WeightPricingManager;
