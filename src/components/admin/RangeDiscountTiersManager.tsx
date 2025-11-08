import React, { useState, useEffect } from 'react';
import { Percent, Plus, Trash2, AlertCircle, Save, Users } from 'lucide-react';
import { supabase } from '../../supabase/client';

interface RangeDiscountTier {
  id: string;
  range_id: string;
  nb_personnes_min: number;
  nb_personnes_max: number | null;
  pourcentage_remise: number;
  actif: boolean;
}

interface RangeDiscountTiersManagerProps {
  rangeId: string;
  rangeName: string;
  onClose: () => void;
}

const RangeDiscountTiersManager: React.FC<RangeDiscountTiersManagerProps> = ({
  rangeId,
  rangeName,
  onClose
}) => {
  const [tiers, setTiers] = useState<RangeDiscountTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    nb_personnes_min: 1,
    nb_personnes_max: null as number | null,
    pourcentage_remise: 0
  });

  useEffect(() => {
    loadTiers();
  }, [rangeId]);

  const loadTiers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('range_discount_tiers')
        .select('*')
        .eq('range_id', rangeId)
        .order('nb_personnes_min', { ascending: true });

      if (error) throw error;
      setTiers(data || []);
    } catch (err) {
      console.error('Error loading tiers:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors du chargement des paliers'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTier = async () => {
    if (formData.nb_personnes_min <= 0) {
      setMessage({
        type: 'error',
        text: 'Le nombre minimum de personnes doit être positif'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (formData.nb_personnes_max && formData.nb_personnes_max < formData.nb_personnes_min) {
      setMessage({
        type: 'error',
        text: 'Le nombre maximum doit être supérieur ou égal au minimum'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (formData.pourcentage_remise < 0 || formData.pourcentage_remise > 100) {
      setMessage({
        type: 'error',
        text: 'Le pourcentage de remise doit être entre 0 et 100'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('range_discount_tiers')
        .insert({
          range_id: rangeId,
          nb_personnes_min: formData.nb_personnes_min,
          nb_personnes_max: formData.nb_personnes_max,
          pourcentage_remise: formData.pourcentage_remise,
          actif: true
        })
        .select()
        .single();

      if (error) throw error;

      setTiers([...tiers, data]);
      setFormData({ nb_personnes_min: 1, nb_personnes_max: null, pourcentage_remise: 0 });
      setShowAddForm(false);

      setMessage({
        type: 'success',
        text: 'Palier ajouté avec succès!'
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Error adding tier:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'ajout du palier'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce palier ?')) {
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('range_discount_tiers')
        .delete()
        .eq('id', tierId);

      if (error) throw error;

      setTiers(tiers.filter(t => t.id !== tierId));

      setMessage({
        type: 'success',
        text: 'Palier supprimé avec succès!'
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Error deleting tier:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la suppression du palier'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Tarifs dégressifs</h3>
            <p className="text-sm text-gray-600">Gamme : {rangeName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
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

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Info :</strong> Définissez des remises selon le nombre de personnes.
              Exemple : -5% pour 6-10 personnes, -10% pour 11-20 personnes.
            </p>
          </div>

          {/* Liste des paliers existants */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                <Percent className="h-4 w-4 mr-2" />
                Paliers configurés ({tiers.length})
              </h4>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Ajouter un palier</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-4 text-gray-600">Chargement...</div>
            ) : tiers.length === 0 ? (
              <div className="text-center py-4 text-gray-600 text-sm">
                Aucun palier configuré. Prix normal appliqué pour tous.
              </div>
            ) : (
              <div className="space-y-2">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-900">
                          {tier.nb_personnes_min} {tier.nb_personnes_max ? `à ${tier.nb_personnes_max}` : '+'} personnes
                        </span>
                      </div>
                      <div className="text-sm text-green-700 mt-1 flex items-center">
                        <Percent className="h-3 w-3 mr-1" />
                        Remise de {tier.pourcentage_remise}%
                      </div>
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
          </div>

          {/* Formulaire d'ajout */}
          {showAddForm && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-800 mb-3">
                Ajouter un nouveau palier
              </h4>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">
                      <Users className="h-3 w-3 inline mr-1" />
                      Nombre min de personnes *
                    </label>
                    <input
                      type="number"
                      value={formData.nb_personnes_min}
                      onChange={(e) => setFormData({ ...formData, nb_personnes_min: parseInt(e.target.value) || 1 })}
                      min="1"
                      step="1"
                      placeholder="Ex: 6"
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-green-800 mb-1">
                      <Users className="h-3 w-3 inline mr-1" />
                      Nombre max de personnes
                    </label>
                    <input
                      type="number"
                      value={formData.nb_personnes_max || ''}
                      onChange={(e) => setFormData({ ...formData, nb_personnes_max: e.target.value ? parseInt(e.target.value) : null })}
                      min={formData.nb_personnes_min}
                      step="1"
                      placeholder="Illimité"
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                    <p className="text-xs text-green-600 mt-1">Laissez vide pour illimité</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-green-800 mb-1">
                    <Percent className="h-3 w-3 inline mr-1" />
                    Pourcentage de remise (%) *
                  </label>
                  <input
                    type="number"
                    value={formData.pourcentage_remise}
                    onChange={(e) => setFormData({ ...formData, pourcentage_remise: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Ex: 10 pour -10%"
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ nb_personnes_min: 1, nb_personnes_max: null, pourcentage_remise: 0 });
                    }}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleAddTier}
                    disabled={saving}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Save className="h-3 w-3" />
                    <span>{saving ? 'Sauvegarde...' : 'Ajouter'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RangeDiscountTiersManager;
