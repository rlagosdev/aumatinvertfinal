import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

export interface WeightTierClient {
  id: string;
  poids_grammes: number;
  prix: number;
  tier_order: number;
}

export const useWeightTiers = (productId: string) => {
  const [weightTiers, setWeightTiers] = useState<WeightTierClient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeightTiers = useCallback(async () => {
    if (!productId) {
      setWeightTiers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 [useWeightTiers] Fetching weight tiers for product:', productId);

      const { data, error } = await supabase
        .from('product_weight_tiers')
        .select('*')
        .eq('product_id', productId)
        .order('tier_order');

      if (error) {
        console.error('❌ [useWeightTiers] Error:', error);
        throw error;
      }

      console.log('📦 [useWeightTiers] Weight tiers loaded:', data);
      setWeightTiers(data || []);
    } catch (err) {
      console.error('❌ [useWeightTiers] Error fetching weight tiers:', err);
      setWeightTiers([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchWeightTiers();
  }, [fetchWeightTiers]);

  return {
    weightTiers,
    loading
  };
};
