import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Save, AlertCircle, Plus, Trash2, GripVertical, Edit2, Percent } from 'lucide-react';
import { supabase } from '../../supabase/client';
import RangeDiscountTiersManager from './RangeDiscountTiersManager';

interface ProductRange {
  id: string;
  product_id: string;
  nom: string;
  description?: string | null;
  prix_par_personne: number;
  nb_personnes_min: number;
  nb_personnes_max: number | null;
  ordre: number;
  actif: boolean;
}

interface RangePricingManagerProps {
  productId: string;
  prixParGamme: boolean;
  nbPersonnesMin?: number | null;
  nbPersonnesMax?: number | null;
  onToggleRangePricing: (enabled: boolean) => void;
}

const RangePricingManager: React.FC<RangePricingManagerProps> = ({
  productId,
  prixParGamme,
  nbPersonnesMin,
  nbPersonnesMax,
  onToggleRangePricing
}) => {
  const [ranges, setRanges] = useState<ProductRange[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingRange, setEditingRange] = useState<ProductRange | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [discountTiersRange, setDiscountTiersRange] = useState<ProductRange | null>(null);

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix_par_personne: 0,
    nb_personnes_min: 1,
    nb_personnes_max: null as number | null
  });

  useEffect(() => {
    if (productId) {
      loadRanges();
    }
  }, [productId]);

  const loadRanges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_ranges')
        .select('*')
        .eq('product_id', productId)
        .order('ordre', { ascending: true });

      if (error) throw error;
      setRanges(data || []);
    } catch (err) {
      console.error('Error loading ranges:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors du chargement des gammes'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    const newValue = !prixParGamme;

    // Si on active, vérifier qu'il y a au moins une gamme
    if (newValue && ranges.length === 0) {
      setMessage({
        type: 'error',
        text: 'Veuillez d\'abord créer au moins une gamme avant d\'activer'
      });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    // Vérifier que les limites de personnes sont définies
    if (newValue && (!nbPersonnesMin || nbPersonnesMin <= 0)) {
      setMessage({
        type: 'error',
        text: 'Veuillez d\'abord définir un nombre minimum de personnes dans la section "Tarification par Personne"'
      });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          prix_par_gamme: newValue,
          prix_par_personne: newValue // Activer aussi le prix par personne
        })
        .eq('id', productId);

      if (error) throw error;

      onToggleRangePricing(newValue);

      setMessage({
        type: 'success',
        text: newValue ? 'Tarification par gamme activée!' : 'Tarification par gamme désactivée!'
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Error toggling range pricing:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddRange = async () => {
    if (!formData.nom.trim()) {
      setMessage({
        type: 'error',
        text: 'Le nom de la gamme est requis'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (formData.prix_par_personne <= 0) {
      setMessage({
        type: 'error',
        text: 'Le prix par personne doit être positif'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

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

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from('product_ranges')
        .insert({
          product_id: productId,
          nom: formData.nom,
          description: formData.description || null,
          prix_par_personne: formData.prix_par_personne,
          nb_personnes_min: formData.nb_personnes_min,
          nb_personnes_max: formData.nb_personnes_max,
          ordre: ranges.length,
          actif: true
        })
        .select()
        .single();

      if (error) throw error;

      setRanges([...ranges, data]);
      setFormData({ nom: '', description: '', prix_par_personne: 0, nb_personnes_min: 1, nb_personnes_max: null });
      setShowAddForm(false);

      setMessage({
        type: 'success',
        text: 'Gamme ajoutée avec succès!'
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Error adding range:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de l\'ajout de la gamme'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRange = async () => {
    if (!editingRange) return;

    if (!formData.nom.trim()) {
      setMessage({
        type: 'error',
        text: 'Le nom de la gamme est requis'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (formData.prix_par_personne <= 0) {
      setMessage({
        type: 'error',
        text: 'Le prix par personne doit être positif'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

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

    setSaving(true);

    try {
      const { error } = await supabase
        .from('product_ranges')
        .update({
          nom: formData.nom,
          description: formData.description || null,
          prix_par_personne: formData.prix_par_personne,
          nb_personnes_min: formData.nb_personnes_min,
          nb_personnes_max: formData.nb_personnes_max
        })
        .eq('id', editingRange.id);

      if (error) throw error;

      setRanges(ranges.map(r =>
        r.id === editingRange.id
          ? {
              ...r,
              nom: formData.nom,
              description: formData.description || null,
              prix_par_personne: formData.prix_par_personne,
              nb_personnes_min: formData.nb_personnes_min,
              nb_personnes_max: formData.nb_personnes_max
            }
          : r
      ));

      setEditingRange(null);
      setFormData({ nom: '', description: '', prix_par_personne: 0, nb_personnes_min: 1, nb_personnes_max: null });

      setMessage({
        type: 'success',
        text: 'Gamme mise à jour avec succès!'
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Error updating range:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour de la gamme'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRange = async (rangeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette gamme ?')) {
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('product_ranges')
        .delete()
        .eq('id', rangeId);

      if (error) throw error;

      setRanges(ranges.filter(r => r.id !== rangeId));

      setMessage({
        type: 'success',
        text: 'Gamme supprimée avec succès!'
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      console.error('Error deleting range:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la suppression de la gamme'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const startEditRange = (range: ProductRange) => {
    setEditingRange(range);
    setFormData({
      nom: range.nom,
      description: range.description || '',
      prix_par_personne: range.prix_par_personne,
      nb_personnes_min: range.nb_personnes_min || 1,
      nb_personnes_max: range.nb_personnes_max || null
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingRange(null);
    setFormData({ nom: '', description: '', prix_par_personne: 0, nb_personnes_min: 1, nb_personnes_max: null });
  };

  if (!productId) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tarification par Gamme + Personne</h3>
          <p className="text-sm text-gray-600">Différentes gammes (ex: Fruits de saison, Fruits exotiques)</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={prixParGamme}
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

      {/* Note importante */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800">
          <strong>Important :</strong> Assurez-vous d'avoir défini le nombre minimum et maximum de personnes dans la section "Tarification par Personne" ci-dessus avant d'activer.
        </p>
      </div>

      {/* Liste des gammes existantes */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-purple-800 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Gammes configurées ({ranges.length})
          </h4>
          {!showAddForm && !editingRange && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs flex items-center space-x-1"
            >
              <Plus className="h-3 w-3" />
              <span>Ajouter une gamme</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-4 text-purple-600">Chargement...</div>
        ) : ranges.length === 0 ? (
          <div className="text-center py-4 text-purple-600 text-sm">
            Aucune gamme configurée. Ajoutez-en une pour commencer.
          </div>
        ) : (
          <div className="space-y-2">
            {ranges.map((range) => (
              <div
                key={range.id}
                className="bg-white border border-purple-200 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <GripVertical className="h-4 w-4 text-purple-400" />
                  <div>
                    <div className="font-medium text-purple-900">{range.nom}</div>
                    {range.description && (
                      <div className="text-xs text-purple-600">{range.description}</div>
                    )}
                    <div className="text-sm text-purple-700 mt-1">
                      <DollarSign className="h-3 w-3 inline mr-1" />
                      {range.prix_par_personne.toFixed(2)} € par personne
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      <Users className="h-3 w-3 inline mr-1" />
                      {range.nb_personnes_min} {range.nb_personnes_min > 1 ? 'personnes' : 'personne'} min
                      {range.nb_personnes_max ? ` • ${range.nb_personnes_max} max` : ' • Illimité'}
                    </div>
                    <div className="text-xs text-purple-600 mt-1">
                      Exemple : {range.nb_personnes_min} pers. = {(range.prix_par_personne * range.nb_personnes_min).toFixed(2)} € •
                      10 pers. = {(range.prix_par_personne * 10).toFixed(2)} €
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setDiscountTiersRange(range)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="Tarifs dégressifs"
                  >
                    <Percent className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startEditRange(range)}
                    className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteRange(range.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulaire d'ajout/modification */}
      {(showAddForm || editingRange) && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-800 mb-3">
            {editingRange ? 'Modifier la gamme' : 'Ajouter une nouvelle gamme'}
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-purple-800 mb-1">
                Nom de la gamme *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ex: Fruits de saison, Fruits exotiques"
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-purple-800 mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Pommes, poires, oranges de saison"
                rows={2}
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-purple-800 mb-1">
                Prix par personne (€) *
              </label>
              <input
                type="number"
                value={formData.prix_par_personne}
                onChange={(e) => setFormData({ ...formData, prix_par_personne: parseFloat(e.target.value) || 0 })}
                step="0.01"
                min="0"
                placeholder="Ex: 5.00"
                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Limites de personnes pour cette gamme */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-purple-800 mb-1">
                  <Users className="h-3 w-3 inline mr-1" />
                  Minimum de personnes *
                </label>
                <input
                  type="number"
                  value={formData.nb_personnes_min}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setFormData(prev => ({
                      ...prev,
                      nb_personnes_min: value,
                      // Ajuster le max si nécessaire
                      nb_personnes_max: prev.nb_personnes_max && prev.nb_personnes_max < value ? value : prev.nb_personnes_max
                    }));
                  }}
                  min="1"
                  step="1"
                  placeholder="Ex: 2"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-purple-800 mb-1">
                  <Users className="h-3 w-3 inline mr-1" />
                  Maximum de personnes
                </label>
                <input
                  type="number"
                  value={formData.nb_personnes_max || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : null;
                    setFormData(prev => ({ ...prev, nb_personnes_max: value }));
                  }}
                  min={formData.nb_personnes_min}
                  step="1"
                  placeholder="Illimité"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-purple-600 mt-1">Laissez vide pour illimité</p>
              </div>
            </div>

            {/* Aperçu */}
            {formData.prix_par_personne > 0 && formData.nb_personnes_min > 0 && (
              <div className="p-2 bg-white rounded-lg border border-purple-200">
                <p className="text-xs font-medium text-purple-900 mb-1">Aperçu pour cette gamme :</p>
                <p className="text-xs text-purple-700">
                  • {formData.nb_personnes_min} {formData.nb_personnes_min > 1 ? 'personnes' : 'personne'} (min) : <strong>{(formData.prix_par_personne * formData.nb_personnes_min).toFixed(2)} €</strong>
                </p>
                {formData.nb_personnes_min < 10 && (!formData.nb_personnes_max || formData.nb_personnes_max >= 10) && (
                  <p className="text-xs text-purple-700">
                    • 10 personnes : <strong>{(formData.prix_par_personne * 10).toFixed(2)} €</strong>
                  </p>
                )}
                {formData.nb_personnes_max && (
                  <p className="text-xs text-purple-700">
                    • {formData.nb_personnes_max} personnes (max) : <strong>{(formData.prix_par_personne * formData.nb_personnes_max).toFixed(2)} €</strong>
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  cancelEdit();
                }}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={editingRange ? handleUpdateRange : handleAddRange}
                disabled={saving}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm flex items-center space-x-1"
              >
                <Save className="h-3 w-3" />
                <span>{saving ? 'Sauvegarde...' : editingRange ? 'Mettre à jour' : 'Ajouter'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {prixParGamme && ranges.length > 0 && (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-xs text-purple-700">
            <strong>Note :</strong> Le client pourra choisir une gamme puis le nombre de personnes (entre {nbPersonnesMin || 1} et {nbPersonnesMax || '∞'}).
            Le prix sera calculé : Prix de la gamme × Nombre de personnes.
          </p>
        </div>
      )}

      {/* Modal pour gérer les tarifs dégressifs */}
      {discountTiersRange && (
        <RangeDiscountTiersManager
          rangeId={discountTiersRange.id}
          rangeName={discountTiersRange.nom}
          onClose={() => setDiscountTiersRange(null)}
        />
      )}
    </div>
  );
};

export default RangePricingManager;
