import React, { useState } from 'react';
import { Ticket, Plus, Trash2, AlertCircle, Save, Calendar, Percent, X } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { usePromoCodes, getPricingTypeLabel } from '../../hooks/usePromoCodes';

interface PromoCodeManagerProps {
  productId: string;
  productName: string;
  pricingOptions: {
    type: string;
    label: string;
    itemId?: string | null;
  }[];
  onClose: () => void;
}

const PromoCodeManager: React.FC<PromoCodeManagerProps> = ({
  productId,
  productName,
  pricingOptions,
  onClose
}) => {
  const { promoCodes, loading, refetch } = usePromoCodes(productId);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    pricingType: 'normal',
    pricingItemId: null as string | null,
    discountPercentage: 10,
    description: '',
    usageLimit: null as number | null,
    validFrom: '',
    validUntil: ''
  });

  const handleAddPromoCode = async () => {
    if (!formData.code.trim()) {
      setMessage({
        type: 'error',
        text: 'Le code promo est requis'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (formData.discountPercentage <= 0 || formData.discountPercentage > 100) {
      setMessage({
        type: 'error',
        text: 'Le pourcentage doit être entre 0 et 100'
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('promo_codes')
        .insert({
          code: formData.code.toUpperCase().trim(),
          product_id: productId,
          pricing_type: formData.pricingType,
          pricing_item_id: formData.pricingItemId,
          discount_percentage: formData.discountPercentage,
          description: formData.description.trim() || null,
          usage_limit: formData.usageLimit,
          valid_from: formData.validFrom || null,
          valid_until: formData.validUntil || null,
          actif: true
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ce code promo existe déjà');
        }
        throw error;
      }

      setFormData({
        code: '',
        pricingType: 'normal',
        pricingItemId: null,
        discountPercentage: 10,
        description: '',
        usageLimit: null,
        validFrom: '',
        validUntil: ''
      });
      setShowAddForm(false);

      setMessage({
        type: 'success',
        text: 'Code promo créé avec succès!'
      });
      setTimeout(() => setMessage(null), 2000);

      // Recharger les données
      await refetch();
    } catch (err: any) {
      console.error('Error adding promo code:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Erreur lors de la création du code promo'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromoCode = async (promoId: string, code: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le code "${code}" ?`)) {
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', promoId);

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Code promo supprimé avec succès!'
      });
      setTimeout(() => setMessage(null), 2000);

      // Recharger les données
      await refetch();
    } catch (err) {
      console.error('Error deleting promo code:', err);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la suppression du code promo'
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getPricingLabel = (pricingType: string, pricingItemId: string | null) => {
    const option = pricingOptions.find(
      opt => opt.type === pricingType && opt.itemId === pricingItemId
    );
    return option ? option.label : getPricingTypeLabel(pricingType);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-orange-800 flex items-center">
              <Ticket className="h-5 w-5 mr-2" />
              Codes promo - {productName}
            </h2>
            <p className="text-sm text-orange-600">Gérer les codes promotionnels pour ce produit</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-orange-800 flex items-center">
            <Ticket className="h-4 w-4 mr-2" />
            Codes promo
          </h3>
          <p className="text-xs text-orange-600">Créer des codes promo pour ce produit</p>
        </div>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs flex items-center space-x-1"
          >
            <Plus className="h-3 w-3" />
            <span>Nouveau code</span>
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-3 p-3 rounded-lg flex items-center space-x-2 ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Liste des codes promo */}
      {loading ? (
        <div className="text-center py-4 text-orange-600">Chargement...</div>
      ) : promoCodes.length === 0 ? (
        <div className="text-center py-4 text-orange-600 text-sm">
          Aucun code promo. Créez-en un pour offrir des réductions!
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {promoCodes.map((promo) => (
            <div
              key={promo.id}
              className="bg-white border border-orange-200 rounded-lg p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono font-bold text-orange-800 bg-orange-100 px-2 py-1 rounded">
                      {promo.code}
                    </span>
                    <span className="flex items-center text-orange-600 text-sm">
                      <Percent className="h-3 w-3 mr-1" />
                      -{promo.discount_percentage}%
                    </span>
                    {!promo.actif && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                        Désactivé
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-orange-700">
                    <strong>Tarification:</strong> {getPricingLabel(promo.pricing_type, promo.pricing_item_id)}
                  </div>
                  {promo.description && (
                    <div className="text-xs text-orange-600 mt-1">{promo.description}</div>
                  )}
                  <div className="flex items-center space-x-3 mt-2 text-xs text-orange-600">
                    {promo.usage_limit && (
                      <span>
                        Utilisé: {promo.usage_count}/{promo.usage_limit}
                      </span>
                    )}
                    {promo.valid_from && (
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Du {new Date(promo.valid_from).toLocaleDateString()}
                      </span>
                    )}
                    {promo.valid_until && (
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Au {new Date(promo.valid_until).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeletePromoCode(promo.id, promo.code)}
                  disabled={saving}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-white border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-orange-800 mb-3">
            Créer un nouveau code promo
          </h4>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-orange-800 mb-1">
                  Code promo *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: SUMMER2024"
                  maxLength={50}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-orange-800 mb-1">
                  <Percent className="h-3 w-3 inline mr-1" />
                  Réduction (%) *
                </label>
                <input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="10"
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-orange-800 mb-1">
                Type de tarification *
              </label>
              <select
                value={formData.pricingType + (formData.pricingItemId ? '|' + formData.pricingItemId : '')}
                onChange={(e) => {
                  const [type, itemId] = e.target.value.split('|');
                  setFormData({ ...formData, pricingType: type, pricingItemId: itemId || null });
                }}
                className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              >
                {pricingOptions.map((option) => (
                  <option key={option.type + (option.itemId || '')} value={option.type + (option.itemId ? '|' + option.itemId : '')}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-orange-800 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Promotion d'été"
                className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-orange-800 mb-1">
                  Limite d'utilisation
                </label>
                <input
                  type="number"
                  value={formData.usageLimit || ''}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                  min="1"
                  placeholder="Illimité"
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-orange-800 mb-1">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Valide à partir du
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-orange-800 mb-1">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Valide jusqu'au
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  min={formData.validFrom}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({
                    code: '',
                    pricingType: 'normal',
                    pricingItemId: null,
                    discountPercentage: 10,
                    description: '',
                    usageLimit: null,
                    validFrom: '',
                    validUntil: ''
                  });
                }}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddPromoCode}
                disabled={saving}
                className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors text-sm flex items-center space-x-1"
              >
                <Save className="h-3 w-3" />
                <span>{saving ? 'Création...' : 'Créer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCodeManager;
