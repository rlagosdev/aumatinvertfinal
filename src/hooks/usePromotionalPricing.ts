import { useCallback } from 'react';

export interface Product {
  id: string;
  nom: string;
  prix: number;
  promotion_active?: boolean | null;
  prix_promotionnel?: number | null;
  promotion_date_debut?: string | null;
  promotion_date_fin?: string | null;
}

export interface PromotionalPriceInfo {
  originalPrice: number;
  currentPrice: number;
  isOnPromotion: boolean;
  discountPercentage: number;
  savings: number;
  isPromotionActive: boolean;
}

export const usePromotionalPricing = () => {
  
  const isPromotionActive = useCallback((product: Product): boolean => {
    if (!product.promotion_active || !product.prix_promotionnel) {
      if (product.nom === 'Abricots Royal') {
        console.log('❌ [usePromotionalPricing] Abricots Royal - Promotion inactive ou prix manquant:', {
          promotion_active: product.promotion_active,
          prix_promotionnel: product.prix_promotionnel
        });
      }
      return false;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

    if (product.nom === 'Abricots Royal') {
      console.log('⏰ [usePromotionalPricing] Abricots Royal - Date actuelle:', now.toISOString().split('T')[0]);
    }

    // Si pas de dates définies, la promotion est active si elle est cochée
    if (!product.promotion_date_debut && !product.promotion_date_fin) {
      if (product.nom === 'Abricots Royal') {
        console.log('✅ [usePromotionalPricing] Abricots Royal - Pas de dates, promotion active !');
      }
      return true;
    }

    // Si date de début définie, vérifier qu'on est après ou égal
    if (product.promotion_date_debut) {
      const startDate = new Date(product.promotion_date_debut);
      startDate.setHours(0, 0, 0, 0);
      if (product.nom === 'Abricots Royal') {
        console.log('📅 [usePromotionalPricing] Abricots Royal - Date début:', startDate.toISOString().split('T')[0], 'vs', now.toISOString().split('T')[0]);
      }
      if (now < startDate) {
        if (product.nom === 'Abricots Royal') {
          console.log('❌ [usePromotionalPricing] Abricots Royal - Trop tôt, promotion pas encore commencée');
        }
        return false;
      }
    }

    // Si date de fin définie, vérifier qu'on est avant ou égal
    if (product.promotion_date_fin) {
      const endDate = new Date(product.promotion_date_fin);
      endDate.setHours(23, 59, 59, 999); // Fin de journée
      if (product.nom === 'Abricots Royal') {
        console.log('📅 [usePromotionalPricing] Abricots Royal - Date fin:', endDate.toISOString().split('T')[0]);
      }
      if (now > endDate) {
        if (product.nom === 'Abricots Royal') {
          console.log('❌ [usePromotionalPricing] Abricots Royal - Trop tard, promotion expirée');
        }
        return false;
      }
    }

    if (product.nom === 'Abricots Royal') {
      console.log('✅ [usePromotionalPricing] Abricots Royal - PROMOTION ACTIVE !');
    }
    return true;
  }, []);

  const getPromotionalPriceInfo = useCallback((product: Product): PromotionalPriceInfo => {
    const promotionActive = isPromotionActive(product);
    const originalPrice = product.prix;
    const promotionalPrice = product.prix_promotionnel || 0;
    
    if (promotionActive && promotionalPrice > 0 && promotionalPrice < originalPrice) {
      const savings = originalPrice - promotionalPrice;
      const discountPercentage = Math.round((savings / originalPrice) * 100);
      
      return {
        originalPrice,
        currentPrice: promotionalPrice,
        isOnPromotion: true,
        discountPercentage,
        savings,
        isPromotionActive: true
      };
    }

    return {
      originalPrice,
      currentPrice: originalPrice,
      isOnPromotion: false,
      discountPercentage: 0,
      savings: 0,
      isPromotionActive: false
    };
  }, [isPromotionActive]);

  const calculateTotalWithPromotion = useCallback((product: Product, quantity: number): {
    originalTotal: number;
    promotionalTotal: number;
    totalSavings: number;
    isOnPromotion: boolean;
  } => {
    const priceInfo = getPromotionalPriceInfo(product);
    const originalTotal = priceInfo.originalPrice * quantity;
    const promotionalTotal = priceInfo.currentPrice * quantity;
    const totalSavings = originalTotal - promotionalTotal;

    return {
      originalTotal,
      promotionalTotal,
      totalSavings,
      isOnPromotion: priceInfo.isOnPromotion
    };
  }, [getPromotionalPriceInfo]);

  const getPromotionBadgeText = useCallback((product: Product): string | null => {
    const priceInfo = getPromotionalPriceInfo(product);
    
    if (!priceInfo.isOnPromotion) {
      return null;
    }

    return `-${priceInfo.discountPercentage}%`;
  }, [getPromotionalPriceInfo]);

  const getPromotionTimeInfo = useCallback((product: Product): {
    hasStartDate: boolean;
    hasEndDate: boolean;
    startDate: string | null;
    endDate: string | null;
    isStarted: boolean;
    isExpired: boolean;
    daysUntilStart: number | null;
    daysUntilEnd: number | null;
  } => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const startDate = product.promotion_date_debut;
    const endDate = product.promotion_date_fin;
    
    const hasStartDate = !!startDate;
    const hasEndDate = !!endDate;
    
    const isStarted = !hasStartDate || today >= startDate;
    const isExpired = hasEndDate && today > endDate;
    
    let daysUntilStart: number | null = null;
    let daysUntilEnd: number | null = null;
    
    if (hasStartDate && !isStarted) {
      const start = new Date(startDate);
      const diffTime = start.getTime() - now.getTime();
      daysUntilStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    if (hasEndDate && !isExpired) {
      const end = new Date(endDate);
      const diffTime = end.getTime() - now.getTime();
      daysUntilEnd = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return {
      hasStartDate,
      hasEndDate,
      startDate,
      endDate,
      isStarted,
      isExpired,
      daysUntilStart,
      daysUntilEnd
    };
  }, []);

  return {
    isPromotionActive,
    getPromotionalPriceInfo,
    calculateTotalWithPromotion,
    getPromotionBadgeText,
    getPromotionTimeInfo
  };
};