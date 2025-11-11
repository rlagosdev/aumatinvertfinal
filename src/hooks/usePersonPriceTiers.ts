import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

export interface PersonPriceTier {
  id: string;
  product_id: string;
  min_persons: number;
  max_persons: number | null;
  price_per_person: number;
  tier_order: number;
  discount_type?: 'fixed' | 'percentage';
  discount_percentage?: number | null;
}

export const usePersonPriceTiers = (productId: string | undefined) => {
  const [tiers, setTiers] = useState<PersonPriceTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!productId) {
      setTiers([]);
      setLoading(false);
      return;
    }

    const fetchTiers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('person_price_tiers')
          .select('*')
          .eq('product_id', productId)
          .order('tier_order');

        if (error) {
          if (error.code === '42P01') {
            // Table n'existe pas encore
            setTiers([]);
          } else {
            throw error;
          }
        } else {
          setTiers(data || []);
        }
      } catch (err) {
        console.error('Error fetching person price tiers:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setTiers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTiers();
  }, [productId]);

  return { tiers, loading, error };
};

/**
 * Trouve le palier de prix applicable pour un nombre de personnes donné
 */
export const findApplicableTier = (
  personCount: number,
  tiers: PersonPriceTier[]
): PersonPriceTier | null => {
  if (!tiers || tiers.length === 0) return null;

  return tiers.find(tier => {
    const meetsMin = personCount >= tier.min_persons;
    const meetsMax = tier.max_persons === null || personCount <= tier.max_persons;
    return meetsMin && meetsMax;
  }) || null;
};

/**
 * Calcule le prix total en appliquant le tarif dégressif si applicable
 */
export const calculatePersonPrice = (
  personCount: number,
  basePricePerPerson: number,
  tiers: PersonPriceTier[]
): {
  pricePerPerson: number;
  totalPrice: number;
  appliedTier: PersonPriceTier | null;
  hasTierDiscount: boolean;
} => {
  const applicableTier = findApplicableTier(personCount, tiers);

  if (applicableTier) {
    let pricePerPerson = applicableTier.price_per_person;

    // Si c'est un pourcentage, calculer le prix en appliquant la réduction
    if (applicableTier.discount_type === 'percentage' && applicableTier.discount_percentage) {
      pricePerPerson = basePricePerPerson * (1 - applicableTier.discount_percentage / 100);
    }

    return {
      pricePerPerson: pricePerPerson,
      totalPrice: pricePerPerson * personCount,
      appliedTier: applicableTier,
      hasTierDiscount: true
    };
  }

  return {
    pricePerPerson: basePricePerPerson,
    totalPrice: basePricePerPerson * personCount,
    appliedTier: null,
    hasTierDiscount: false
  };
};
