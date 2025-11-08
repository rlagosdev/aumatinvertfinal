import React, { useState } from 'react';
import { Plus, Trash2, Percent } from 'lucide-react';

interface TempPriceTier {
  id: string;
  quantity: number;
  price: number;
}

interface TempProductPriceTiersManagerProps {
  usePriceTiers: boolean;
  tiers: TempPriceTier[];
  onTogglePriceTiers: (enabled: boolean) => void;
  onTiersChange: (tiers: TempPriceTier[]) => void;
}

const TempProductPriceTiersManager: React.FC<TempProductPriceTiersManagerProps> = ({
  usePriceTiers,
  tiers,
  onTogglePriceTiers,
  onTiersChange
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTier, setNewTier] = useState({ quantity: 1, price: 0 });

  const handleAddTier = () => {
    if (newTier.quantity <= 0 || newTier.price <= 0) {
      alert('La quantité et le prix doivent être supérieurs à 0');
      return;
    }

    const tier: TempPriceTier = {
      id: `temp-${Date.now()}`,
      quantity: newTier.quantity,
      price: newTier.price
    };

    onTiersChange([...tiers, tier].sort((a, b) => a.quantity - b.quantity));
    setNewTier({ quantity: 1, price: 0 });
    setShowAddForm(false);
  };

  const handleDeleteTier = (id: string) => {
    onTiersChange(tiers.filter(t => t.id !== id));
  };

  return (
    <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-indigo-800">Paliers de prix</h3>
          <p className="text-xs text-indigo-600">Prix dégressifs selon la quantité</p>
        </div>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={usePriceTiers}
            onChange={(e) => onTogglePriceTiers(e.target.checked)}
            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-indigo-300 rounded"
          />
          <span className="ml-2 text-sm font-medium text-indigo-700">Activer</span>
        </label>
      </div>

      {usePriceTiers && (
        <>
          {/* Liste des paliers */}
          {tiers.length > 0 && (
            <div className="space-y-2 mb-3">
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="bg-white border border-indigo-200 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-indigo-800">
                      À partir de <strong>{tier.quantity}</strong> unités
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      {tier.price.toFixed(2)}€
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTier(tier.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bouton ajouter */}
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter un palier</span>
            </button>
          )}

          {/* Formulaire d'ajout */}
          {showAddForm && (
            <div className="bg-white border border-indigo-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-indigo-800 mb-3">
                Nouveau palier de prix
              </h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-indigo-800 mb-1">
                      Quantité minimum
                    </label>
                    <input
                      type="number"
                      value={newTier.quantity}
                      onChange={(e) => setNewTier({ ...newTier, quantity: parseInt(e.target.value) || 0 })}
                      min="1"
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-indigo-800 mb-1">
                      Prix (€)
                    </label>
                    <input
                      type="number"
                      value={newTier.price}
                      onChange={(e) => setNewTier({ ...newTier, price: parseFloat(e.target.value) || 0 })}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTier({ quantity: 1, price: 0 });
                    }}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!usePriceTiers && (
        <p className="text-xs text-indigo-600 italic">
          Activez cette option pour définir des prix dégressifs selon la quantité commandée.
        </p>
      )}
    </div>
  );
};

export default TempProductPriceTiersManager;
