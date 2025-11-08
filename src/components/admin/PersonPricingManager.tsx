import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabase/client';

interface PersonPricingManagerProps {
  productId: string;
  prixParPersonne: boolean;
  prixUnitairePersonne?: number | null;
  nbPersonnesMin?: number | null;
  nbPersonnesMax?: number | null;
  onTogglePersonPricing: (enabled: boolean) => void;
  onUpdatePersonPricing?: (price: number, min: number, max: number | null) => void;
}

const PersonPricingManager: React.FC<PersonPricingManagerProps> = ({
  productId,
  prixParPersonne,
  prixUnitairePersonne,
  nbPersonnesMin,
  nbPersonnesMax,
  onTogglePersonPricing,
  onUpdatePersonPricing
}) => {
  const [localPrixPersonne, setLocalPrixPersonne] = useState<number>(prixUnitairePersonne || 0);
  const [localMinPersonnes, setLocalMinPersonnes] = useState<number>(nbPersonnesMin || 1);
  const [localMaxPersonnes, setLocalMaxPersonnes] = useState<number | null>(nbPersonnesMax || null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (prixUnitairePersonne !== undefined && prixUnitairePersonne !== null) {
      setLocalPrixPersonne(prixUnitairePersonne);
    }
    if (nbPersonnesMin !== undefined && nbPersonnesMin !== null) {
      setLocalMinPersonnes(nbPersonnesMin);
    }
    if (nbPersonnesMax !== undefined && nbPersonnesMax !== null) {
      setLocalMaxPersonnes(nbPersonnesMax);
    }
  }, [prixUnitairePersonne, nbPersonnesMin, nbPersonnesMax]);

  const handleToggle = async () => {
    const newValue = !prixParPersonne;

    // Si on active, vérifier que le prix par personne est défini
    if (newValue && (!localPrixPersonne || localPrixPersonne <= 0)) {
      setMessage({
        type: 'error',
        text: 'Veuillez d\'abord définir un prix par personne avant d\'activer cette tarification'
      });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    // Valider les limites
    if (newValue && localMaxPersonnes && localMaxPersonnes < localMinPersonnes) {
      setMessage({
        type: 'error',
        text: 'Le nombre maximum de personnes doit être supérieur ou égal au minimum'
      });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    setSaving(true);

    try {
      // Sauvegarder dans la base de données
      const { error } = await supabase
        .from('products')
        .update({
          prix_par_personne: newValue,
          prix_unitaire_personne: newValue ? localPrixPersonne : null,
          nb_personnes_min: newValue ? localMinPersonnes : 1,
          nb_personnes_max: newValue ? localMaxPersonnes : null
        })
        .eq('id', productId);

      if (error) throw error;

      onTogglePersonPricing(newValue);
      if (newValue && onUpdatePersonPricing) {
        onUpdatePersonPricing(localPrixPersonne, localMinPersonnes, localMaxPersonnes);
      }

      setMessage({
        type: 'success',
        text: newValue ? 'Tarification par personne activée!' : 'Tarification par personne désactivée!'
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Error toggling person pricing:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (localPrixPersonne <= 0) {
      setMessage({
        type: 'error',
        text: 'Le prix par personne doit être positif'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (localMinPersonnes <= 0) {
      setMessage({
        type: 'error',
        text: 'Le nombre minimum de personnes doit être positif'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (localMaxPersonnes && localMaxPersonnes < localMinPersonnes) {
      setMessage({
        type: 'error',
        text: 'Le nombre maximum doit être supérieur ou égal au minimum'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          prix_unitaire_personne: localPrixPersonne,
          nb_personnes_min: localMinPersonnes,
          nb_personnes_max: localMaxPersonnes
        })
        .eq('id', productId);

      if (error) throw error;

      if (onUpdatePersonPricing) {
        onUpdatePersonPricing(localPrixPersonne, localMinPersonnes, localMaxPersonnes);
      }

      setMessage({
        type: 'success',
        text: 'Tarification par personne sauvegardée avec succès!'
      });
    } catch (err) {
      console.error('Error saving person pricing:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la sauvegarde'
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (!productId) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tarification par Personne</h3>
          <p className="text-sm text-gray-600">Pour les corbeilles de fruits, plateaux, etc.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={prixParPersonne}
            onChange={handleToggle}
            disabled={saving}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
        </label>
      </div>

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

      {/* Configuration - Toujours visible */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
          <DollarSign className="h-4 w-4 mr-2" />
          Configuration {!prixParPersonne && <span className="ml-2 text-xs font-normal text-blue-600">(Définissez d'abord ces paramètres pour activer)</span>}
        </h4>

        <div className="space-y-4">
          {/* Prix par personne */}
          <div>
            <label className="block text-xs font-medium text-blue-800 mb-2">
              <DollarSign className="h-3 w-3 inline mr-1" />
              Prix par personne (€)
            </label>
            <input
              type="number"
              value={localPrixPersonne}
              onChange={(e) => setLocalPrixPersonne(parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 5.00"
            />
            <p className="text-xs text-blue-600 mt-1">
              Le prix de base sera calculé : Prix par personne × Nombre de personnes
            </p>
          </div>

          {/* Limites de personnes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-blue-800 mb-2">
                <Users className="h-3 w-3 inline mr-1" />
                Minimum de personnes
              </label>
              <input
                type="number"
                value={localMinPersonnes}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setLocalMinPersonnes(value);
                  // Ajuster le max si nécessaire
                  if (localMaxPersonnes && localMaxPersonnes < value) {
                    setLocalMaxPersonnes(value);
                  }
                }}
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-blue-800 mb-2">
                <Users className="h-3 w-3 inline mr-1" />
                Maximum de personnes
              </label>
              <input
                type="number"
                value={localMaxPersonnes || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : null;
                  setLocalMaxPersonnes(value);
                }}
                min={localMinPersonnes}
                step="1"
                placeholder="Illimité"
                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Aperçu */}
          {localPrixPersonne > 0 && (
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">Aperçu des prix :</p>
              <div className="space-y-1">
                <p className="text-sm text-blue-800">
                  • Pour {localMinPersonnes} {localMinPersonnes > 1 ? 'personnes' : 'personne'} : <strong>{(localPrixPersonne * localMinPersonnes).toFixed(2)} €</strong>
                </p>
                {localMinPersonnes < 10 && (
                  <p className="text-sm text-blue-800">
                    • Pour 10 personnes : <strong>{(localPrixPersonne * 10).toFixed(2)} €</strong>
                  </p>
                )}
                {localMaxPersonnes && (
                  <p className="text-sm text-blue-800">
                    • Maximum ({localMaxPersonnes} {localMaxPersonnes > 1 ? 'personnes' : 'personne'}) : <strong>{(localPrixPersonne * localMaxPersonnes).toFixed(2)} €</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
          </div>
        </div>
      </div>

      {prixParPersonne && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Note :</strong> Le client pourra choisir le nombre de personnes entre {localMinPersonnes} et {localMaxPersonnes || '∞'}.
            Le prix sera calculé automatiquement : {localPrixPersonne.toFixed(2)}€ × nombre de personnes.
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonPricingManager;
