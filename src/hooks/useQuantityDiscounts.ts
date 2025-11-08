import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

export interface QuantityDiscountTier {
  id: string;
  quantity: number;
  discountPercentage: number;
}

export interface ProductQuantityDiscounts {
  productId: string;
  tiers: QuantityDiscountTier[];
}

export const useQuantityDiscounts = () => {
  const [discounts, setDiscounts] = useState<ProductQuantityDiscounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscounts();

    // Rafraîchir les données quand la fenêtre reprend le focus
    const handleFocus = () => {
      fetchDiscounts();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .like('setting_key', 'quantity_discount_%');

      if (error) {
        console.warn('Could not fetch quantity discounts from database, using defaults');
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const parsedDiscounts: ProductQuantityDiscounts[] = [];

        data.forEach(setting => {
          const match = setting.setting_key.match(/quantity_discount_(.+)/);
          if (match) {
            try {
              const productId = match[1];
              const tiers = JSON.parse(setting.setting_value) as QuantityDiscountTier[];
              parsedDiscounts.push({ productId, tiers });
            } catch (e) {
              console.warn(`Failed to parse quantity discount for product ${match[1]}:`, e);
            }
          }
        });

        setDiscounts(parsedDiscounts);
      }
    } catch (error) {
      console.warn('Error fetching quantity discounts:', error);
      setError('Erreur lors du chargement des tarifs dégressifs');
    } finally {
      setLoading(false);
    }
  };

  const saveProductDiscounts = async (productId: string, tiers: QuantityDiscountTier[]) => {
    try {
      const settingKey = `quantity_discount_${productId}`;

      if (tiers.length === 0) {
        // Supprimer les remises si aucun tier
        const { error } = await supabase
          .from('site_settings')
          .delete()
          .eq('setting_key', settingKey);

        if (error) throw error;
      } else {
        // Sauvegarder ou mettre à jour les remises
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            setting_key: settingKey,
            setting_value: JSON.stringify(tiers),
            setting_type: 'json',
            description: `Tarifs dégressifs pour le produit ${productId}`
          }, {
            onConflict: 'setting_key'
          });

        if (error) throw error;
      }

      // Rafraîchir les données depuis la base pour synchroniser toutes les instances
      await fetchDiscounts();

      return true;
    } catch (error) {
      console.error('Error saving quantity discounts:', error);
      setError('Erreur lors de la sauvegarde des tarifs dégressifs');
      return false;
    }
  };

  const getProductDiscounts = useCallback((productId: string): QuantityDiscountTier[] => {
    const productDiscounts = discounts.find(d => d.productId === productId);
    return productDiscounts ? productDiscounts.tiers : [];
  }, [discounts]);

  const calculateDiscountedPrice = useCallback((productId: string, basePrice: number, quantity: number): {
    originalPrice: number;
    discountedPrice: number;
    discountPercentage: number;
    savings: number;
  } => {
    const tiers = getProductDiscounts(productId);

    if (tiers.length === 0) {
      return {
        originalPrice: basePrice,
        discountedPrice: basePrice,
        discountPercentage: 0,
        savings: 0
      };
    }

    // Trouver le tier applicable (plus haute quantité <= quantité demandée)
    const applicableTier = tiers
      .filter(tier => quantity >= tier.quantity)
      .sort((a, b) => b.quantity - a.quantity)[0];

    if (!applicableTier) {
      return {
        originalPrice: basePrice,
        discountedPrice: basePrice,
        discountPercentage: 0,
        savings: 0
      };
    }

    const discountAmount = (basePrice * applicableTier.discountPercentage) / 100;
    const discountedPrice = basePrice - discountAmount;

    return {
      originalPrice: basePrice,
      discountedPrice,
      discountPercentage: applicableTier.discountPercentage,
      savings: discountAmount
    };
  }, [getProductDiscounts]);

  const getNextDiscountTier = useCallback((productId: string, currentQuantity: number): QuantityDiscountTier | null => {
    const tiers = getProductDiscounts(productId);
    
    if (tiers.length === 0) return null;

    // Trouver le prochain tier disponible
    const nextTier = tiers
      .filter(tier => tier.quantity > currentQuantity)
      .sort((a, b) => a.quantity - b.quantity)[0];

    return nextTier || null;
  }, [getProductDiscounts]);

  const addDiscountTier = (productId: string, quantity: number, discountPercentage: number): string => {
    const tierId = `tier_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTier: QuantityDiscountTier = {
      id: tierId,
      quantity,
      discountPercentage
    };

    setDiscounts(prev => {
      const existingIndex = prev.findIndex(d => d.productId === productId);
      
      if (existingIndex >= 0) {
        // Produit existe, ajouter le tier
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          tiers: [...updated[existingIndex].tiers, newTier].sort((a, b) => a.quantity - b.quantity)
        };
        return updated;
      } else {
        // Nouveau produit
        return [...prev, { productId, tiers: [newTier] }];
      }
    });

    return tierId;
  };

  const updateDiscountTier = (productId: string, tierId: string, updates: Partial<QuantityDiscountTier>) => {
    setDiscounts(prev => 
      prev.map(discount => 
        discount.productId === productId
          ? {
              ...discount,
              tiers: discount.tiers.map(tier =>
                tier.id === tierId ? { ...tier, ...updates } : tier
              ).sort((a, b) => a.quantity - b.quantity)
            }
          : discount
      )
    );
  };

  const removeDiscountTier = (productId: string, tierId: string) => {
    setDiscounts(prev => 
      prev.map(discount => 
        discount.productId === productId
          ? {
              ...discount,
              tiers: discount.tiers.filter(tier => tier.id !== tierId)
            }
          : discount
      ).filter(discount => discount.tiers.length > 0) // Supprimer le produit si plus de tiers
    );
  };

  return {
    discounts,
    loading,
    error,
    saveProductDiscounts,
    getProductDiscounts,
    calculateDiscountedPrice,
    getNextDiscountTier,
    addDiscountTier,
    updateDiscountTier,
    removeDiscountTier,
    fetchDiscounts
  };
};