import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Users, DollarSign, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabase/client';

interface PersonPriceTier {
  id?: string;
  product_id: string;
  min_persons: number;
  max_persons: number | null;
  price_per_person: number;
  tier_order: number;
  discount_type?: 'fixed' | 'percentage';
  discount_percentage?: number | null;
}

interface PersonPriceTiersManagerProps {
  productId: string;
  prixParPersonne: boolean;
  prixUnitairePersonne?: number;
}

const PersonPriceTiersManager: React.FC<PersonPriceTiersManagerProps> = ({
  productId,
  prixParPersonne,
  prixUnitairePersonne
}) => {
  const [tiers, setTiers] = useState<PersonPriceTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (prixParPersonne && productId) {
      fetchTiers();
    }
  }, [productId, prixParPersonne]);

  const fetchTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('person_price_tiers')
        .select('*')
        .eq('product_id', productId)
        .order('tier_order');

      if (error) {
        // Si la table n'existe pas encore, c'est normal
        if (error.code === '42P01') {
          console.log('Table person_price_tiers not created yet');
          setTiers([]);
        } else {
          throw error;
        }
      } else {
        // S'assurer que tous les paliers ont un discount_type défini
        const tiersWithDefaults = (data || []).map(tier => ({
          ...tier,
          discount_type: tier.discount_type || 'fixed',
          discount_percentage: tier.discount_percentage || null
        }));
        setTiers(tiersWithDefaults);
      }
    } catch (error) {
      console.error('Error fetching person price tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMinPersons = lastTier ? (lastTier.max_persons || lastTier.min_persons) + 1 : 1;

    setTiers([
      ...tiers,
      {
        product_id: productId,
        min_persons: newMinPersons,
        max_persons: newMinPersons + 9,
        price_per_person: 0,
        tier_order: tiers.length + 1,
        discount_type: 'fixed',
        discount_percentage: null
      }
    ]);
  };

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index));
  };

  const updateTier = (index: number, field: keyof PersonPriceTier, value: any) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    setTiers(updated);
  };

  const validateTiers = (): boolean => {
    // Vérifier qu'il n'y a pas de chevauchements
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];

      // Validation selon le type de remise
      if (tier.discount_type === 'percentage') {
        if (!tier.discount_percentage || tier.discount_percentage <= 0 || tier.discount_percentage > 100) {
          setMessage({
            type: 'error',
            text: `Le palier ${i + 1} doit avoir un pourcentage entre 1 et 100`
          });
          setTimeout(() => setMessage(null), 3000);
          return false;
        }
      } else {
        if (tier.price_per_person <= 0) {
          setMessage({
            type: 'error',
            text: `Le palier ${i + 1} doit avoir un prix positif`
          });
          setTimeout(() => setMessage(null), 3000);
          return false;
        }
      }

      if (tier.min_persons <= 0) {
        setMessage({
          type: 'error',
          text: `Le palier ${i + 1} doit avoir un minimum de personnes positif`
        });
        setTimeout(() => setMessage(null), 3000);
        return false;
      }

      if (tier.max_persons && tier.max_persons < tier.min_persons) {
        setMessage({
          type: 'error',
          text: `Le palier ${i + 1} : le maximum doit être supérieur au minimum`
        });
        setTimeout(() => setMessage(null), 3000);
        return false;
      }

      // Vérifier les chevauchements avec les autres paliers
      for (let j = 0; j < tiers.length; j++) {
        if (i !== j) {
          const otherTier = tiers[j];
          const overlap = (
            (tier.min_persons >= otherTier.min_persons && tier.min_persons <= (otherTier.max_persons || Infinity)) ||
            (tier.max_persons && tier.max_persons >= otherTier.min_persons && tier.max_persons <= (otherTier.max_persons || Infinity)) ||
            (tier.min_persons <= otherTier.min_persons && (tier.max_persons === null || tier.max_persons >= (otherTier.max_persons || Infinity)))
          );

          if (overlap) {
            setMessage({
              type: 'error',
              text: `Les paliers ${i + 1} et ${j + 1} se chevauchent`
            });
            setTimeout(() => setMessage(null), 3000);
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateTiers()) {
      return;
    }

    setSaving(true);

    try {
      console.log('💾 Sauvegarde des tarifs dégressifs...', { productId, tiersCount: tiers.length });

      // D'abord, supprimer tous les paliers existants pour ce produit
      const { error: deleteError } = await supabase
        .from('person_price_tiers')
        .delete()
        .eq('product_id', productId);

      if (deleteError && deleteError.code !== '42P01') {
        console.error('❌ Erreur lors de la suppression:', deleteError);
        throw deleteError;
      }

      console.log('✅ Anciens paliers supprimés');

      // Ensuite, insérer les nouveaux paliers
      if (tiers.length > 0) {
        const tiersToInsert = tiers.map((tier, index) => {
          // Calculer le prix par personne en fonction du type
          let finalPricePerPerson = tier.price_per_person;

          if (tier.discount_type === 'percentage' && tier.discount_percentage && prixUnitairePersonne) {
            // Si c'est un pourcentage, calculer le prix final
            finalPricePerPerson = prixUnitairePersonne * (1 - tier.discount_percentage / 100);
          }

          // S'assurer qu'on a un prix valide (>= 0)
          if (finalPricePerPerson < 0) {
            finalPricePerPerson = 0;
          }

          return {
            product_id: tier.product_id,
            min_persons: tier.min_persons,
            max_persons: tier.max_persons,
            price_per_person: finalPricePerPerson,
            tier_order: index + 1,
            discount_type: tier.discount_type || 'fixed',
            discount_percentage: tier.discount_percentage
          };
        });

        console.log('📝 Données à insérer:', tiersToInsert);

        const { data: insertedData, error: insertError } = await supabase
          .from('person_price_tiers')
          .insert(tiersToInsert)
          .select();

        if (insertError) {
          console.error('❌ Erreur lors de l\'insertion:', insertError);
          throw insertError;
        }

        console.log('✅ Paliers insérés:', insertedData);
      }

      setMessage({
        type: 'success',
        text: 'Tarifs dégressifs sauvegardés avec succès!'
      });

      // Recharger les paliers pour obtenir les IDs
      await fetchTiers();
    } catch (error: any) {
      console.error('❌ Error saving person price tiers:', error);
      if (error.code === '42P01') {
        setMessage({
          type: 'error',
          text: 'La table person_price_tiers doit être créée dans Supabase. Contactez l\'administrateur.'
        });
      } else {
        setMessage({
          type: 'error',
          text: `Erreur lors de la sauvegarde: ${error.message || 'Erreur inconnue'}`
        });
      }
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (!prixParPersonne) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tarifs dégressifs par personne</h3>
          <p className="text-sm text-gray-600">Définissez différents prix selon le nombre de personnes</p>
        </div>
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

      <div className="space-y-4">
        {tiers.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Aucun palier défini. Cliquez sur "Ajouter un palier" pour commencer.</p>
          </div>
        )}

        {tiers.map((tier, index) => (
          <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Palier {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeTier(index)}
                className="text-red-600 hover:text-red-800 transition-colors"
                title="Supprimer ce palier"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Minimum de personnes */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Users className="h-3 w-3 inline mr-1" />
                    Min. personnes
                  </label>
                  <input
                    type="number"
                    value={tier.min_persons}
                    onChange={(e) => updateTier(index, 'min_persons', parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Maximum de personnes */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    <Users className="h-3 w-3 inline mr-1" />
                    Max. personnes
                  </label>
                  <input
                    type="number"
                    value={tier.max_persons || ''}
                    onChange={(e) => updateTier(index, 'max_persons', e.target.value ? parseInt(e.target.value) : null)}
                    min={tier.min_persons}
                    placeholder="Illimité"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Type de remise */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type de tarif
                  </label>
                  <select
                    value={tier.discount_type || 'fixed'}
                    onChange={(e) => {
                      const newType = e.target.value as 'fixed' | 'percentage';
                      const updated = [...tiers];
                      updated[index] = {
                        ...updated[index],
                        discount_type: newType,
                        discount_percentage: newType === 'percentage' ? 10 : null
                      };
                      setTiers(updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fixed">Prix fixe</option>
                    <option value="percentage">Pourcentage de réduction</option>
                  </select>
                </div>
              </div>

              {/* Champ de saisie selon le type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tier.discount_type === 'percentage' ? (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <DollarSign className="h-3 w-3 inline mr-1" />
                      Réduction (%)
                    </label>
                    <input
                      type="number"
                      value={tier.discount_percentage || ''}
                      onChange={(e) => updateTier(index, 'discount_percentage', parseFloat(e.target.value) || 0)}
                      step="1"
                      min="1"
                      max="100"
                      placeholder="Ex: 20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {prixUnitairePersonne && tier.discount_percentage ? (
                        <>Prix résultant: {(prixUnitairePersonne * (1 - tier.discount_percentage / 100)).toFixed(2)}€/pers</>
                      ) : (
                        'Pourcentage de réduction sur le prix de base'
                      )}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <DollarSign className="h-3 w-3 inline mr-1" />
                      Prix/personne (€)
                    </label>
                    <input
                      type="number"
                      value={tier.price_per_person}
                      onChange={(e) => updateTier(index, 'price_per_person', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Aperçu */}
            {(() => {
              let pricePerPerson = tier.price_per_person;
              if (tier.discount_type === 'percentage' && tier.discount_percentage && prixUnitairePersonne) {
                pricePerPerson = prixUnitairePersonne * (1 - tier.discount_percentage / 100);
              }

              if (pricePerPerson > 0) {
                return (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                    <strong>Aperçu :</strong> {tier.min_persons}-{tier.max_persons || '∞'} personnes → {pricePerPerson.toFixed(2)}€/pers
                    {tier.discount_type === 'percentage' && tier.discount_percentage && (
                      <span className="ml-2 text-green-700 font-medium">(-{tier.discount_percentage}%)</span>
                    )}
                    {' '}(Ex: {tier.min_persons} pers = {(pricePerPerson * tier.min_persons).toFixed(2)}€)
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ))}

        {/* Boutons d'action */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={addTier}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un palier</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || tiers.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>

      {tiers.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Note :</strong> Les tarifs dégressifs permettent d'offrir des prix plus avantageux pour les grandes quantités.
            Le système choisira automatiquement le bon palier selon le nombre de personnes sélectionné.
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonPriceTiersManager;
