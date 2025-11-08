import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

export interface WeightTier {
  id?: string;
  product_id: string;
  poids_grammes: number;
  prix: number;
  tier_order: number;
}

export const useWeightPricing = (productId: string) => {
  const [weightTiers, setWeightTiers] = useState<WeightTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeightTiers = useCallback(async () => {
    if (!productId) {
      setWeightTiers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('product_weight_tiers')
        .select('*')
        .eq('product_id', productId)
        .order('tier_order');

      if (fetchError) throw fetchError;

      setWeightTiers(data || []);
    } catch (err) {
      console.error('Error fetching weight tiers:', err);
      setError('Erreur lors du chargement des paliers de poids');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchWeightTiers();
  }, [fetchWeightTiers]);

  const saveWeightTiers = useCallback(async (newTiers: WeightTier[]) => {
    try {
      setError(null);

      // Supprimer tous les paliers existants
      const { error: deleteError } = await supabase
        .from('product_weight_tiers')
        .delete()
        .eq('product_id', productId);

      if (deleteError) throw deleteError;

      // Insérer les nouveaux paliers
      if (newTiers.length > 0) {
        const tiersToInsert = newTiers.map((tier, index) => ({
          product_id: productId,
          poids_grammes: tier.poids_grammes,
          prix: tier.prix,
          tier_order: index + 1
        }));

        const { error: insertError } = await supabase
          .from('product_weight_tiers')
          .insert(tiersToInsert);

        if (insertError) throw insertError;
      }

      // Ne pas refetch pour éviter les re-renders intempestifs
      return true;
    } catch (err) {
      console.error('Error saving weight tiers:', err);
      setError('Erreur lors de la sauvegarde des paliers de poids');
      return false;
    }
  }, [productId]);

  const enableWeightPricing = useCallback(async (enable: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ vendu_au_poids: enable })
        .eq('id', productId);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error updating vendu_au_poids:', err);
      setError('Erreur lors de la mise à jour');
      return false;
    }
  }, [productId]);

  const updateBasePricePerWeight = useCallback(async (prixPar100g: number) => {
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ prix_par_100g: prixPar100g })
        .eq('id', productId);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error updating prix_par_100g:', err);
      setError('Erreur lors de la mise à jour du prix de base');
      return false;
    }
  }, [productId]);

  return {
    weightTiers,
    loading,
    error,
    saveWeightTiers,
    enableWeightPricing,
    updateBasePricePerWeight,
    fetchWeightTiers
  };
};
