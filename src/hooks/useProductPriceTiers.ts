import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

export interface PriceTier {
  id?: string;
  product_id: string;
  quantity: number;
  price: number;
  tier_order: number;
  promotion_price?: number | null;
  promotion_discount_percent?: number | null;
  promotion_type?: 'fixed' | 'percent' | null;
  promotion_active?: boolean | null;
  promotion_start_date?: string | null;
  promotion_end_date?: string | null;
}

// Helper pour vérifier si une promotion est valide
export const isTierPromotionValid = (tier: PriceTier): boolean => {
  if (!tier.promotion_active) {
    return false;
  }

  // Vérifier qu'il y a soit un prix fixe soit un pourcentage
  if (tier.promotion_type === 'fixed' && !tier.promotion_price) {
    return false;
  }
  if (tier.promotion_type === 'percent' && !tier.promotion_discount_percent) {
    return false;
  }

  const now = new Date();

  if (tier.promotion_start_date) {
    const startDate = new Date(tier.promotion_start_date);
    if (now < startDate) return false;
  }

  if (tier.promotion_end_date) {
    const endDate = new Date(tier.promotion_end_date);
    if (now > endDate) return false;
  }

  return true;
};

// Helper pour obtenir le prix effectif d'un palier
export const getTierEffectivePrice = (tier: PriceTier): number => {
  if (!isTierPromotionValid(tier)) {
    return tier.price;
  }

  if (tier.promotion_type === 'fixed' && tier.promotion_price) {
    return tier.promotion_price;
  }

  if (tier.promotion_type === 'percent' && tier.promotion_discount_percent) {
    return tier.price * (1 - tier.promotion_discount_percent / 100);
  }

  return tier.price;
};

// Helper pour calculer le pourcentage de réduction
export const getTierDiscountPercentage = (tier: PriceTier): number => {
  if (!isTierPromotionValid(tier)) {
    return 0;
  }

  if (tier.promotion_type === 'percent' && tier.promotion_discount_percent) {
    return tier.promotion_discount_percent;
  }

  if (tier.promotion_type === 'fixed' && tier.promotion_price) {
    return Math.round(((tier.price - tier.promotion_price) / tier.price) * 100);
  }

  return 0;
};

export const useProductPriceTiers = (productId: string) => {
  const [tiers, setTiers] = useState<PriceTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTiers = useCallback(async () => {
    if (!productId) {
      setTiers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('product_price_tiers')
        .select('*')
        .eq('product_id', productId)
        .order('tier_order');

      if (fetchError) throw fetchError;

      setTiers(data || []);
    } catch (err) {
      console.error('Error fetching price tiers:', err);
      setError('Erreur lors du chargement des paliers de prix');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchTiers();
  }, [fetchTiers]);

  const saveTiers = useCallback(async (newTiers: PriceTier[]) => {
    try {
      setError(null);

      // Supprimer tous les paliers existants
      const { error: deleteError } = await supabase
        .from('product_price_tiers')
        .delete()
        .eq('product_id', productId);

      if (deleteError) throw deleteError;

      // Insérer les nouveaux paliers
      if (newTiers.length > 0) {
        const tiersToInsert = newTiers.map((tier, index) => ({
          product_id: productId,
          quantity: tier.quantity,
          price: tier.price,
          tier_order: index + 1
        }));

        const { error: insertError } = await supabase
          .from('product_price_tiers')
          .insert(tiersToInsert);

        if (insertError) throw insertError;
      }

      await fetchTiers();
      return true;
    } catch (err) {
      console.error('Error saving price tiers:', err);
      setError('Erreur lors de la sauvegarde des paliers de prix');
      return false;
    }
  }, [productId, fetchTiers]);

  const enablePriceTiers = useCallback(async (enable: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ use_price_tiers: enable })
        .eq('id', productId);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Error updating use_price_tiers:', err);
      setError('Erreur lors de la mise à jour');
      return false;
    }
  }, [productId]);

  const updateTierPromotion = useCallback(async (
    tierId: string,
    promotionData: {
      promotion_price?: number | null;
      promotion_discount_percent?: number | null;
      promotion_type?: 'fixed' | 'percent' | null;
      promotion_active?: boolean;
      promotion_start_date?: string | null;
      promotion_end_date?: string | null;
    }
  ) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('product_price_tiers')
        .update(promotionData)
        .eq('id', tierId);

      if (updateError) throw updateError;

      // Ne pas refetch automatiquement pour éviter les re-renders intempestifs
      // Le composant mettra à jour l'état local directement
      return true;
    } catch (err) {
      console.error('Error updating tier promotion:', err);
      setError('Erreur lors de la mise à jour de la promotion');
      return false;
    }
  }, []);

  return {
    tiers,
    loading,
    error,
    saveTiers,
    enablePriceTiers,
    updateTierPromotion,
    fetchTiers
  };
};
