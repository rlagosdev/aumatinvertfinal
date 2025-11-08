import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface PromoCode {
  id: string;
  code: string;
  product_id: string;
  pricing_type: string;
  pricing_item_id: string | null;
  discount_percentage: number;
  description: string | null;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string | null;
  valid_until: string | null;
  actif: boolean;
}

export interface PromoCodeValidation {
  isValid: boolean;
  discountPercentage: number;
  message: string;
}

export const usePromoCodes = (productId: string) => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPromoCodes = async () => {
    if (!productId) {
      setPromoCodes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPromoCodes(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching promo codes:', err);
      setError(err as Error);
      setPromoCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, [productId]);

  return { promoCodes, loading, error, refetch: fetchPromoCodes };
};

// Fonction pour valider un code promo
export const validatePromoCode = async (
  code: string,
  productId: string,
  pricingType: string,
  pricingItemId: string | null = null
): Promise<PromoCodeValidation> => {
  try {
    console.log('🔍 Validation code promo:', {
      code: code.toUpperCase(),
      productId,
      pricingType,
      pricingItemId
    });

    // Validation manuelle via requête directe à la table
    const { data: promoCodes, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('product_id', productId)
      .eq('pricing_type', pricingType)
      .eq('actif', true)
      .limit(1);

    if (error) {
      console.error('❌ Erreur validation:', error);
      return {
        isValid: false,
        discountPercentage: 0,
        message: 'Erreur lors de la validation'
      };
    }

    console.log('📦 Codes promo trouvés:', promoCodes);

    // Si aucun code trouvé avec le pricing_type exact, essayer avec 'normal' en fallback
    if (!promoCodes || promoCodes.length === 0) {
      console.log('⚠️ Aucun code trouvé, essai avec pricing_type=normal');

      const { data: fallbackCodes, error: fallbackError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('product_id', productId)
        .eq('pricing_type', 'normal')
        .eq('actif', true)
        .limit(1);

      if (fallbackError || !fallbackCodes || fallbackCodes.length === 0) {
        return {
          isValid: false,
          discountPercentage: 0,
          message: 'Code promo invalide ou inexistant'
        };
      }

      const promo = fallbackCodes[0];
      return validatePromoData(promo);
    }

    const promo = promoCodes[0];
    return validatePromoData(promo);

  } catch (err) {
    console.error('❌ Error validating promo code:', err);
    return {
      isValid: false,
      discountPercentage: 0,
      message: 'Erreur lors de la validation du code promo'
    };
  }
};

// Fonction helper pour valider les données du code promo
function validatePromoData(promo: any): PromoCodeValidation {
  // Vérifier les dates de validité
  if (promo.valid_from && new Date() < new Date(promo.valid_from)) {
    return {
      isValid: false,
      discountPercentage: 0,
      message: 'Ce code promo n\'est pas encore valide'
    };
  }

  if (promo.valid_until && new Date() > new Date(promo.valid_until)) {
    return {
      isValid: false,
      discountPercentage: 0,
      message: 'Ce code promo a expiré'
    };
  }

  // Vérifier la limite d'utilisation
  if (promo.usage_limit !== null && promo.usage_count >= promo.usage_limit) {
    return {
      isValid: false,
      discountPercentage: 0,
      message: 'Ce code promo a atteint sa limite d\'utilisation'
    };
  }

  // Code valide !
  console.log('✅ Code promo valide:', {
    code: promo.code,
    discount: promo.discount_percentage
  });

  return {
    isValid: true,
    discountPercentage: promo.discount_percentage,
    message: 'Code promo valide'
  };
}

// Fonction pour incrémenter l'usage d'un code promo
export const incrementPromoCodeUsage = async (code: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_promo_code_usage', {
      p_code: code.toUpperCase()
    });

    if (error) throw error;
  } catch (err) {
    console.error('Error incrementing promo code usage:', err);
  }
};

// Fonction pour calculer le prix avec code promo
export const calculatePriceWithPromo = (
  originalPrice: number,
  discountPercentage: number
): { finalPrice: number; savings: number } => {
  const discountAmount = (originalPrice * discountPercentage) / 100;
  const finalPrice = originalPrice - discountAmount;

  return {
    finalPrice: Math.max(0, finalPrice),
    savings: discountAmount
  };
};

// Fonction helper pour obtenir le label du type de tarification
export const getPricingTypeLabel = (pricingType: string): string => {
  const labels: { [key: string]: string } = {
    'normal': 'Prix normal',
    'section': 'Section',
    'range': 'Gamme',
    'weight': 'Poids',
    'tier': 'Palier',
    'person': 'Par personne'
  };
  return labels[pricingType] || pricingType;
};
