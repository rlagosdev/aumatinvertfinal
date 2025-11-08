import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface RangeDiscountTier {
  id: string;
  range_id: string;
  nb_personnes_min: number;
  nb_personnes_max: number | null;
  pourcentage_remise: number;
  actif: boolean;
}

export const useRangeDiscountTiers = (rangeId: string) => {
  const [tiers, setTiers] = useState<RangeDiscountTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!rangeId) {
      setTiers([]);
      setLoading(false);
      return;
    }

    const fetchTiers = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('range_discount_tiers')
          .select('*')
          .eq('range_id', rangeId)
          .eq('actif', true)
          .order('nb_personnes_min', { ascending: true });

        if (fetchError) throw fetchError;
        setTiers(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching range discount tiers:', err);
        setError(err as Error);
        setTiers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, [rangeId]);

  return { tiers, loading, error };
};

// Fonction pour calculer le prix avec remise selon le nombre de personnes
export const calculateRangeDiscountedPrice = (
  basePricePerPerson: number,
  personCount: number,
  tiers: RangeDiscountTier[]
): { finalPrice: number; discountPercentage: number; originalPrice: number } => {
  const originalPrice = basePricePerPerson * personCount;

  if (tiers.length === 0) {
    return {
      finalPrice: originalPrice,
      discountPercentage: 0,
      originalPrice
    };
  }

  // Trouver le palier applicable
  const applicableTier = tiers.find(tier => {
    const isAboveMin = personCount >= tier.nb_personnes_min;
    const isBelowMax = tier.nb_personnes_max === null || personCount <= tier.nb_personnes_max;
    return isAboveMin && isBelowMax;
  });

  if (!applicableTier || applicableTier.pourcentage_remise === 0) {
    return {
      finalPrice: originalPrice,
      discountPercentage: 0,
      originalPrice
    };
  }

  const discountAmount = (originalPrice * applicableTier.pourcentage_remise) / 100;
  const finalPrice = originalPrice - discountAmount;

  return {
    finalPrice,
    discountPercentage: applicableTier.pourcentage_remise,
    originalPrice
  };
};
