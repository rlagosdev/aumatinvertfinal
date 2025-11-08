import React, { useState } from 'react';
import { Weight, Plus, Trash2 } from 'lucide-react';

interface TempWeightTier {
  id: string;
  poids_grammes: number;
  prix: number;
}

interface TempWeightPricingManagerProps {
  venduAuPoids: boolean;
  prixPar100g: number;
  prixBase: number | null;
  poidsBaseGrammes: number | null;
  weightTiers: TempWeightTier[];
  onToggleWeightPricing: (enabled: boolean) => void;
  onUpdateBasePricePerWeight: (price: number) => void;
  onUpdateBasePrice: (price: number, weight: number) => void;
  onWeightTiersChange: (tiers: TempWeightTier[]) => void;
}

const TempWeightPricingManager: React.FC<TempWeightPricingManagerProps> = ({
  venduAuPoids,
  prixPar100g,
  prixBase,
  poidsBaseGrammes,
  weightTiers,
  onToggleWeightPricing,
  onUpdateBasePricePerWeight,
  onUpdateBasePrice,
  onWeightTiersChange
}) => {
  const [showAddTier, setShowAddTier] = useState(false);
  const [newTier, setNewTier] = useState({ poids_grammes: 100, prix: 0 });

  const handleAddTier = () => {
    if (newTier.poids_grammes <= 0 || newTier.prix <= 0) {
      alert('Le poids et le prix doivent être supérieurs à 0');
      return;
    }

    const tier: TempWeightTier = {
      id: `temp-${Date.now()}`,
      poids_grammes: newTier.poids_grammes,
      prix: newTier.prix
    };

    onWeightTiersChange([...weightTiers, tier].sort((a, b) => a.poids_grammes - b.poids_grammes));
    setNewTier({ poids_grammes: 100, prix: 0 });
    setShowAddTier(false);
  };

  const handleDeleteTier = (id: string) => {
    onWeightTiersChange(weightTiers.filter(t => t.id !== id));
  };

  return (
    <div className="border border-teal-200 rounded-lg p-4 bg-teal-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-teal-800 flex items-center">
            <Weight className="h-4 w-4 mr-2" />
            Tarification au poids
          </h3>
          <p className="text-xs text-teal-600">Vente au poids avec prix par 100g ou paliers</p>
        </div>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={venduAuPoids}
            onChange={(e) => onToggleWeightPricing(e.target.checked)}
            className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-teal-300 rounded"
          />
          <span className="ml-2 text-sm font-medium text-teal-700">Activer</span>
        </label>
      </div>

      {venduAuPoids && (
        <>
          {/* Prix de base */}
          <div className="bg-white border border-teal-200 rounded-lg p-4 mb-3">
            <h4 className="text-sm font-semibold text-teal-800 mb-3">Prix de base</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-teal-800 mb-1">
                  Prix (€)
                </label>
                <input
                  type="number"
                  value={prixBase || 0}
                  onChange={(e) => onUpdateBasePrice(parseFloat(e.target.value) || 0, poidsBaseGrammes || 100)}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-teal-800 mb-1">
                  Poids (g)
                </label>
                <input
                  type="number"
                  value={poidsBaseGrammes || 100}
                  onChange={(e) => onUpdateBasePrice(prixBase || 0, parseInt(e.target.value) || 100)}
                  min="1"
                  className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            {prixBase && poidsBaseGrammes && (
              <p className="text-xs text-teal-600 mt-2">
                Prix par 100g: <strong>{((prixBase / poidsBaseGrammes) * 100).toFixed(2)}€</strong>
              </p>
            )}
          </div>

          {/* Paliers de poids */}
          <div className="bg-white border border-teal-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-teal-800 mb-3">Paliers de poids</h4>

            {weightTiers.length > 0 && (
              <div className="space-y-2 mb-3">
                {weightTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-lg p-2"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-teal-800">
                        <strong>{tier.poids_grammes}g</strong>
                      </span>
                      <span className="text-sm font-bold text-teal-600">
                        {tier.prix.toFixed(2)}€
                      </span>
                      <span className="text-xs text-teal-500">
                        ({((tier.prix / tier.poids_grammes) * 100).toFixed(2)}€/100g)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTier(tier.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!showAddTier && (
              <button
                type="button"
                onClick={() => setShowAddTier(true)}
                className="w-full px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter un palier</span>
              </button>
            )}

            {showAddTier && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-teal-800 mb-1">
                        Poids (g)
                      </label>
                      <input
                        type="number"
                        value={newTier.poids_grammes}
                        onChange={(e) => setNewTier({ ...newTier, poids_grammes: parseInt(e.target.value) || 0 })}
                        min="1"
                        className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-teal-800 mb-1">
                        Prix (€)
                      </label>
                      <input
                        type="number"
                        value={newTier.prix}
                        onChange={(e) => setNewTier({ ...newTier, prix: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddTier(false);
                        setNewTier({ poids_grammes: 100, prix: 0 });
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTier}
                      className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-xs"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {!venduAuPoids && (
        <p className="text-xs text-teal-600 italic">
          Activez cette option pour vendre ce produit au poids avec différents paliers.
        </p>
      )}
    </div>
  );
};

export default TempWeightPricingManager;
