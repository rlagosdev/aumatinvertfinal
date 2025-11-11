import React, { useState, useMemo } from 'react';
import { ShoppingCart, Clock, Plus, Minus, Percent, TrendingDown, Tag, Users, Weight, Divide } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCursorToast } from '../contexts/CursorToastContext';
import { useQuantityDiscounts } from '../hooks/useQuantityDiscounts';
import { usePromotionalPricing } from '../hooks/usePromotionalPricing';
import { useProductPriceTiers, getTierEffectivePrice, isTierPromotionValid, getTierDiscountPercentage } from '../hooks/useProductPriceTiers';
import { useWeightTiers } from '../hooks/useWeightTiers';
import { useProductRanges } from '../hooks/useProductRanges';
import { useRangeDiscountTiers, calculateRangeDiscountedPrice } from '../hooks/useRangeDiscountTiers';
import { useProductSections, formatFractionDisplay } from '../hooks/useProductSections';
import { usePersonPriceTiers, calculatePersonPrice } from '../hooks/usePersonPriceTiers';
import { useMinimumPickupDate } from '../hooks/useMinimumPickupDate';
import { useLateOrderCheck } from '../hooks/useLateOrderCheck';
import { toast } from 'react-toastify';
import ProductGallery from './ProductGallery';

interface Product {
  id: string;
  nom: string;
  prix: number;
  categorie: string;
  retrait_planifie: boolean | null;
  image_url: string | null;
  actif: boolean | null;
  delai_retrait_valeur?: number | null;
  delai_retrait_unite?: string | null;
  description?: string | null;
  promotion_active?: boolean | null;
  prix_promotionnel?: number | null;
  promotion_date_debut?: string | null;
  promotion_date_fin?: string | null;
  use_price_tiers?: boolean | null;
  vendu_au_poids?: boolean | null;
  prix_par_100g?: number | null;
  unite_poids?: string | null;
  prix_par_personne?: boolean | null;
  prix_unitaire_personne?: number | null;
  nb_personnes_min?: number | null;
  nb_personnes_max?: number | null;
  prix_par_gamme?: boolean | null;
  prix_par_section?: boolean | null;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { showToast } = useCursorToast();
  const { calculateDiscountedPrice, getProductDiscounts, getNextDiscountTier } = useQuantityDiscounts();
  const { getImmediatePickupTime } = useLateOrderCheck();
  const { getPromotionalPriceInfo, getPromotionBadgeText, calculateTotalWithPromotion } = usePromotionalPricing();
  const { tiers: priceTiers } = useProductPriceTiers(product.id);
  const { weightTiers } = useWeightTiers(product.id);
  const { ranges: productRanges } = useProductRanges(product.id);
  const { sections: productSections } = useProductSections(product.id);
  const { tiers: personPriceTiers } = usePersonPriceTiers(product.id);
  const { getMinimumPickupDate } = useMinimumPickupDate();

  // Debug: Log weight pricing info for ALL products
  console.log('🔍 [ProductCard] Analyse du produit:', {
    nom: product.nom,
    id: product.id,
    vendu_au_poids: product.vendu_au_poids,
    prix_par_100g: product.prix_par_100g,
    weightTiers: weightTiers,
    weightTiersLength: weightTiers.length,
    willShowWeightSelector: !!(product.vendu_au_poids && weightTiers.length > 0)
  });
  const [quantity, setQuantity] = useState(product.quantite_min || 1);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [selectedWeightTierId, setSelectedWeightTierId] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [selectedPersonCount, setSelectedPersonCount] = useState<number>(1);
  const [selectedRangeId, setSelectedRangeId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Récupérer les paliers de remise pour la gamme sélectionnée
  const { tiers: rangeDiscountTiers } = useRangeDiscountTiers(selectedRangeId || '');

  // Trier les paliers de prix par quantité
  const sortedPriceTiers = useMemo(() => {
    return [...priceTiers].sort((a, b) => a.quantity - b.quantity);
  }, [priceTiers]);

  // Trier les paliers de poids par grammes
  const sortedWeightTiers = useMemo(() => {
    return [...weightTiers].sort((a, b) => a.poids_grammes - b.poids_grammes);
  }, [weightTiers]);

  // Sélectionner automatiquement le premier palier si use_price_tiers est activé
  useMemo(() => {
    if (product.use_price_tiers && sortedPriceTiers.length > 0 && !selectedTierId) {
      setSelectedTierId(sortedPriceTiers[0].id || null);
      // La quantité reste à 1 (nombre d'unités), pas le nombre de personnes du palier
    }
  }, [product.use_price_tiers, sortedPriceTiers, selectedTierId]);

  // Sélectionner automatiquement le premier palier de poids si vendu_au_poids est activé
  useMemo(() => {
    if (product.vendu_au_poids && sortedWeightTiers.length > 0 && !selectedWeightTierId) {
      setSelectedWeightTierId(sortedWeightTiers[0].id);
    }
  }, [product.vendu_au_poids, sortedWeightTiers, selectedWeightTierId]);

  // Initialiser le nombre de personnes au minimum si pricing par personne activé
  useMemo(() => {
    if (product.prix_par_personne && product.nb_personnes_min) {
      setSelectedPersonCount(product.nb_personnes_min);
    }
  }, [product.prix_par_personne, product.nb_personnes_min]);

  // Sélectionner automatiquement la première gamme si pricing par gamme activé
  useMemo(() => {
    if (product.prix_par_gamme && productRanges.length > 0 && !selectedRangeId) {
      setSelectedRangeId(productRanges[0].id);
    }
  }, [product.prix_par_gamme, productRanges, selectedRangeId]);

  // Sélectionner automatiquement la première section si pricing par section activé
  useMemo(() => {
    if (product.prix_par_section && productSections.length > 0 && !selectedSectionId) {
      setSelectedSectionId(productSections[0].id);
    }
  }, [product.prix_par_section, productSections, selectedSectionId]);

  // Récupérer la gamme sélectionnée
  const selectedRange = useMemo(() => {
    if (!selectedRangeId) return null;
    return productRanges.find(r => r.id === selectedRangeId) || null;
  }, [selectedRangeId, productRanges]);

  // Récupérer la section sélectionnée
  const selectedSection = useMemo(() => {
    if (!selectedSectionId) return null;
    return productSections.find(s => s.id === selectedSectionId) || null;
  }, [selectedSectionId, productSections]);

  // Réinitialiser le nombre de personnes au minimum de la gamme sélectionnée
  useMemo(() => {
    if (product.prix_par_gamme && selectedRange) {
      setSelectedPersonCount(selectedRange.nb_personnes_min);
    }
  }, [product.prix_par_gamme, selectedRange]);

  // Calculer le prix avec remise pour la gamme sélectionnée
  const rangeDiscountedPrice = useMemo(() => {
    if (!selectedRange || !product.prix_par_gamme) {
      return null;
    }
    return calculateRangeDiscountedPrice(
      selectedRange.prix_par_personne,
      selectedPersonCount,
      rangeDiscountTiers
    );
  }, [selectedRange, selectedPersonCount, rangeDiscountTiers, product.prix_par_gamme]);

  // Calculer le prix avec tarifs dégressifs par personne
  const personPriceInfo = useMemo(() => {
    if (!product.prix_par_personne || !product.prix_unitaire_personne) {
      return null;
    }
    return calculatePersonPrice(
      selectedPersonCount,
      product.prix_unitaire_personne,
      personPriceTiers
    );
  }, [product.prix_par_personne, product.prix_unitaire_personne, selectedPersonCount, personPriceTiers]);

  // Récupérer le palier sélectionné
  const selectedTier = useMemo(() => {
    if (!selectedTierId) return null;
    return sortedPriceTiers.find(t => t.id === selectedTierId) || null;
  }, [selectedTierId, sortedPriceTiers]);

  // Récupérer le palier de poids sélectionné
  const selectedWeightTier = useMemo(() => {
    if (!selectedWeightTierId) return null;
    return sortedWeightTiers.find(t => t.id === selectedWeightTierId) || null;
  }, [selectedWeightTierId, sortedWeightTiers]);

  const discountTiers = useMemo(() => getProductDiscounts(product.id), [getProductDiscounts, product.id]);
  const currentDiscount = useMemo(() => calculateDiscountedPrice(product.id, product.prix, quantity), [calculateDiscountedPrice, product.id, product.prix, quantity]);
  const nextTier = useMemo(() => getNextDiscountTier(product.id, quantity), [getNextDiscountTier, product.id, quantity]);
  
  // Calculs promotionnels
  const promotionInfo = useMemo(() => {
    const info = getPromotionalPriceInfo(product);
    // Debug: Log promotion info pour Abricots Royal
    if (product.nom === 'Abricots Royal') {
      console.log('🔍 [ProductCard] Abricots Royal - Données produit:', {
        nom: product.nom,
        promotion_active: product.promotion_active,
        prix_promotionnel: product.prix_promotionnel,
        promotion_date_debut: product.promotion_date_debut,
        promotion_date_fin: product.promotion_date_fin,
      });
      console.log('🔍 [ProductCard] Abricots Royal - Info promotion calculée:', info);
    }
    return info;
  }, [getPromotionalPriceInfo, product]);

  const promotionBadge = useMemo(() => {
    const badge = getPromotionBadgeText(product);
    if (product.nom === 'Abricots Royal') {
      console.log('🔍 [ProductCard] Abricots Royal - Badge:', badge);
    }
    return badge;
  }, [getPromotionBadgeText, product]);
  const promotionTotal = useMemo(() => calculateTotalWithPromotion(product, quantity), [calculateTotalWithPromotion, product, quantity]);

  const minDate = useMemo(() => {
    if (!product.retrait_planifie) return '';

    const delaiValeur = product.delai_retrait_valeur || 4;
    return getMinimumPickupDate(delaiValeur);
  }, [product.retrait_planifie, product.delai_retrait_valeur, getMinimumPickupDate]);

  const handleAddToCart = (e: React.MouseEvent) => {
    if (product.retrait_planifie && !pickupDate) {
      toast.error('Veuillez sélectionner une date de retrait');
      return;
    }

    // Priorité : section > gamme+personnes > personnes > poids > paliers de prix > prix normal
    const priceToUse = product.prix_par_section && selectedSection
      ? selectedSection.prix
      : product.prix_par_gamme && selectedRange
        ? (rangeDiscountedPrice?.finalPrice || selectedRange.prix_par_personne * selectedPersonCount)
        : product.prix_par_personne && personPriceInfo
          ? personPriceInfo.totalPrice
          : product.vendu_au_poids && selectedWeightTier
            ? selectedWeightTier.prix
            : product.use_price_tiers && selectedTier
              ? getTierEffectivePrice(selectedTier)
              : undefined;

    // Préparer les métadonnées pour la validation des codes promo
    const metadata = {
      sectionId: product.prix_par_section && selectedSectionId ? selectedSectionId : undefined,
      rangeId: product.prix_par_gamme && selectedRangeId ? selectedRangeId : undefined,
      rangeName: product.prix_par_gamme && selectedRange ? selectedRange.nom : undefined,
      personCount: product.prix_par_gamme && selectedRange ? selectedPersonCount :
                   product.prix_par_personne ? selectedPersonCount :
                   product.use_price_tiers && selectedTier ? selectedTier.quantity : undefined,
      weightTierId: product.vendu_au_poids && selectedWeightTierId ? selectedWeightTierId : undefined,
      tierId: product.use_price_tiers && selectedTierId ? selectedTierId : undefined,
    };

    addToCart(product, quantity, pickupDate, priceToUse, metadata);

    // Déterminer le message à afficher
    let message = '';
    if (product.prix_par_section && selectedSection) {
      message = `${product.nom} - ${selectedSection.nom} ajouté !`;
    } else if (product.prix_par_gamme && selectedRange) {
      message = `${product.nom} - ${selectedRange.nom} (${selectedPersonCount} pers.) ajouté !`;
    } else if (product.prix_par_personne && product.prix_unitaire_personne) {
      message = `${product.nom} (${selectedPersonCount} pers.) ajouté !`;
    } else if (product.vendu_au_poids && selectedWeightTier) {
      message = `${product.nom} (${selectedWeightTier.poids_grammes}g) ajouté !`;
    } else if (product.use_price_tiers && selectedTier) {
      message = `${product.nom} (${selectedTier.quantity * quantity} pers.) ajouté !`;
    } else {
      message = `${product.nom} ajouté au panier !`;
    }

    // Afficher le toast au curseur
    showToast(message, e.clientX, e.clientY);

    setQuantity(1);
    setPickupDate('');
  };

  const getDelaiText = () => {
    if (!product.retrait_planifie) return null;
    
    const delaiValeur = product.delai_retrait_valeur || 4;
    const delaiUnite = product.delai_retrait_unite || 'jours';
    
    return `${delaiValeur} ${delaiUnite}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <ProductGallery 
          productId={product.id}
          fallbackImageUrl={product.image_url || `https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop`}
          productName={product.nom}
          className="aspect-square"
        />
        {/* Badge de promotion */}
        {promotionBadge && (
          <div className="absolute top-2 left-2 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center z-10 bg-site-company-title">
            <Tag className="h-3 w-3 mr-1" />
            {promotionBadge}
          </div>
        )}
        
        {/* Badge délai de retrait */}
        {product.retrait_planifie && (
          <div className={`absolute top-2 ${promotionBadge ? 'right-2' : 'right-2'} bg-site-buttons text-site-text-dark px-2 py-1 rounded-full text-xs font-medium flex items-center z-10`}>
            <Clock className="h-3 w-3 mr-1" />
            {getDelaiText()}
          </div>
        )}

        {/* Badge disponibilité immédiate avec heure de retrait - sauf pour les plateaux */}
        {!product.retrait_planifie && !product.use_price_tiers && (
          <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center z-10 shadow-md">
            <Clock className="h-3 w-3 mr-1" />
            <span className="whitespace-nowrap">Retrait {getImmediatePickupTime()}</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs text-site-text-light rounded-full" style={{ backgroundColor: 'var(--color-buttons)' }}>
            {product.categorie}
          </span>
        </div>
        
        <h3 className="font-semibold text-site-text-dark mb-2 line-clamp-2">
          {product.nom}
        </h3>

        {/* Description du produit */}
        {product.description && (
          <p className="text-sm text-zinc-600 mb-3 whitespace-pre-line">
            {product.description}
          </p>
        )}

        {/* Prix - section prioritaire, puis gamme+personne, puis personne, puis poids, puis paliers, puis promotion, puis remise quantité */}
        <div className="mb-4">
          {product.prix_par_section && selectedSection ? (
            /* Affichage prix par section */
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-site-primary">
                    {selectedSection.prix.toFixed(2)} €
                  </span>
                </div>
                <div className="flex items-center text-sm text-site-primary">
                  <Divide className="h-4 w-4 mr-1" />
                  <span>{selectedSection.nom}</span>
                </div>
              </div>
              {selectedSection.description && (
                <div className="text-xs text-site-text-dark">
                  {selectedSection.description}
                </div>
              )}
            </div>
          ) : product.prix_par_gamme && selectedRange ? (
            /* Affichage prix par gamme + personne */
            <div className="space-y-1">
              {rangeDiscountedPrice && rangeDiscountedPrice.discountPercentage > 0 ? (
                /* Avec remise dégressif */
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-gray-500 line-through">
                      {rangeDiscountedPrice.originalPrice.toFixed(2)} €
                    </span>
                    <div className="flex items-center text-green-600 text-sm">
                      <Percent className="h-4 w-4 mr-1" />
                      <span>-{rangeDiscountedPrice.discountPercentage}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        {rangeDiscountedPrice.finalPrice.toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{selectedPersonCount} pers.</span>
                    </div>
                  </div>
                  <div className="text-xs text-green-600">
                    Économie: {(rangeDiscountedPrice.originalPrice - rangeDiscountedPrice.finalPrice).toFixed(2)} €
                  </div>
                  <div className="text-xs text-site-text-dark">
                    {selectedRange.nom} • {selectedRange.prix_par_personne.toFixed(2)} € par personne
                  </div>
                </>
              ) : (
                /* Sans remise */
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-site-primary">
                        {(selectedRange.prix_par_personne * selectedPersonCount).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-site-primary">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{selectedPersonCount} pers.</span>
                    </div>
                  </div>
                  <div className="text-xs text-site-text-dark">
                    {selectedRange.nom} • {selectedRange.prix_par_personne.toFixed(2)} € par personne
                  </div>
                </>
              )}
            </div>
          ) : product.prix_par_personne && personPriceInfo ? (
            /* Affichage prix par personne */
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-site-primary">
                    {personPriceInfo.totalPrice.toFixed(2)} €
                  </span>
                  {personPriceInfo.hasTierDiscount && personPriceInfo.totalPrice < (product.prix_unitaire_personne! * selectedPersonCount) && (
                    <span className="ml-2 text-sm line-through text-gray-400">
                      {(product.prix_unitaire_personne! * selectedPersonCount).toFixed(2)} €
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-site-primary">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{selectedPersonCount} pers.</span>
                </div>
              </div>
              <div className="text-xs text-site-text-dark">
                {personPriceInfo.pricePerPerson.toFixed(2)} € par personne
                {personPriceInfo.hasTierDiscount && personPriceInfo.totalPrice < (product.prix_unitaire_personne! * selectedPersonCount) && (
                  <span className="ml-2 text-green-600 font-medium">
                    (Tarif dégressif appliqué !)
                  </span>
                )}
              </div>
            </div>
          ) : product.vendu_au_poids && selectedWeightTier ? (
            /* Affichage prix au poids */
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-site-primary">
                    {selectedWeightTier.prix.toFixed(2)} €
                  </span>
                </div>
                <div className="flex items-center text-sm text-site-primary">
                  <Weight className="h-4 w-4 mr-1" />
                  <span>{selectedWeightTier.poids_grammes}g</span>
                </div>
              </div>
              <div className="text-xs text-site-text-dark">
                Prix de base : {product.prix_par_100g?.toFixed(2)} € / 100g
              </div>
            </div>
          ) : product.use_price_tiers && selectedTier ? (
            /* Affichage palier de prix */
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  {isTierPromotionValid(selectedTier) && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg text-gray-500 line-through">
                        {selectedTier.price.toFixed(2)} €
                      </span>
                      <span className="bg-site-company-title text-white px-2 py-0.5 rounded-full text-xs font-bold">
                        -{getTierDiscountPercentage(selectedTier)}%
                      </span>
                    </div>
                  )}
                  <span className={`text-2xl font-bold ${
                    isTierPromotionValid(selectedTier) ? 'text-site-company-title' : 'text-site-primary'
                  }`}>
                    {getTierEffectivePrice(selectedTier).toFixed(2)} €
                  </span>
                </div>
                <div className={`flex items-center text-sm ${
                  isTierPromotionValid(selectedTier) ? 'text-site-company-title' : 'text-site-primary'
                }`}>
                  <Users className="h-4 w-4 mr-1" />
                  <span>{selectedTier.quantity} pers.</span>
                </div>
              </div>
              {product.retrait_planifie && (
                <div className="flex items-center text-xs text-site-buttons mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Précommande</span>
                </div>
              )}
            </div>
          ) : promotionInfo.isOnPromotion ? (
            /* Affichage promotion */
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-lg text-gray-500 line-through">
                  {promotionInfo.originalPrice.toFixed(2)} €
                </span>
                <div className="flex items-center text-site-company-title text-sm">
                  <Tag className="h-4 w-4 mr-1" />
                  <span>-{promotionInfo.discountPercentage}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-site-company-title">
                  {promotionInfo.currentPrice.toFixed(2)} €
                </span>
                <span className="text-sm text-site-company-title">
                  Économie: {promotionInfo.savings.toFixed(2)} €
                </span>
              </div>
              {product.retrait_planifie && (
                <div className="flex items-center text-xs text-site-buttons mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Précommande</span>
                </div>
              )}
            </div>
          ) : currentDiscount.discountPercentage > 0 ? (
            /* Affichage remise quantité */
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-lg text-gray-500 line-through">
                  {product.prix.toFixed(2)} €
                </span>
                <div className="flex items-center text-green-600 text-sm">
                  <Percent className="h-4 w-4 mr-1" />
                  <span>-{currentDiscount.discountPercentage}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-site-primary">
                  {currentDiscount.discountedPrice.toFixed(2)} €
                </span>
                <span className="text-sm text-green-600">
                  Économie: {currentDiscount.savings.toFixed(2)} €
                </span>
              </div>
              {product.retrait_planifie && (
                <div className="flex items-center text-xs text-site-buttons mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Précommande</span>
                </div>
              )}
            </div>
          ) : (
            /* Prix normal */
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-site-primary">
                {product.prix.toFixed(2)} €
              </span>
              {product.retrait_planifie && (
                <div className="flex items-center text-xs text-site-buttons">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Précommande</span>
                </div>
              )}
            </div>
          )}
        </div>

        {product.retrait_planifie && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(176, 195, 172, 0.15)', borderColor: 'var(--color-buttons)', borderWidth: '1px' }}>
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 mr-2 text-site-company-title" />
              <span className="text-sm font-medium text-site-company-title">
                Délai de préparation : {getDelaiText()}
              </span>
            </div>
            <p className="text-xs text-site-text-dark">
              Commandez au moins {getDelaiText()} avant le retrait souhaité
            </p>
          </div>
        )}

        {/* Price Tiers Selection */}
        {product.use_price_tiers && sortedPriceTiers.length > 0 && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--color-buttons-rgb, 176, 195, 172), 0.2)', borderColor: 'var(--color-buttons)', borderWidth: '1px' }}>
            <div className="flex items-center mb-3">
              <Users className="h-4 w-4 text-site-primary mr-2" />
              <span className="text-sm font-medium text-site-company-title">
                Choisissez le nombre de personnes
              </span>
            </div>
            <div className="space-y-2">
              {sortedPriceTiers.map((tier) => {
                const hasPromotion = isTierPromotionValid(tier);
                const effectivePrice = getTierEffectivePrice(tier);
                const discountPercent = getTierDiscountPercentage(tier);

                return (
                  <label
                    key={tier.id}
                    className={`relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTierId === tier.id
                        ? 'border-2'
                        : 'bg-white border-2'
                    }`}
                    style={{
                      backgroundColor: selectedTierId === tier.id ? (hasPromotion ? 'rgba(97, 103, 96, 0.1)' : 'rgba(176, 195, 172, 0.2)') : '#ffffff',
                      borderColor: selectedTierId === tier.id ? (hasPromotion ? 'var(--color-company-title)' : 'var(--color-buttons)') : (hasPromotion ? 'rgba(97, 103, 96, 0.3)' : 'rgba(176, 195, 172, 0.4)')
                    }}
                  >
                    {/* Badge promotion */}
                    {hasPromotion && (
                      <div className="absolute -top-2 -right-2 bg-site-company-title text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center shadow-md">
                        <Tag className="h-3 w-3 mr-1" />
                        -{discountPercent}%
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="price-tier"
                        checked={selectedTierId === tier.id}
                        onChange={() => {
                          setSelectedTierId(tier.id || null);
                          setQuantity(1); // Réinitialiser à 1 unité
                        }}
                        className={`mr-3 h-4 w-4 ${hasPromotion ? 'text-site-company-title focus:ring-site-company-title' : 'text-site-primary focus:ring-site-primary'}`}
                      />
                      <div>
                        <div className={`flex items-center text-sm font-medium ${hasPromotion ? 'text-site-company-title' : 'text-site-company-title'}`}>
                          <Users className="h-3 w-3 mr-1" />
                          {tier.quantity} personnes
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {hasPromotion && (
                        <div className="text-sm text-gray-500 line-through">
                          {tier.price.toFixed(2)} €
                        </div>
                      )}
                      <div className={`text-lg font-bold ${hasPromotion ? 'text-site-company-title' : 'text-site-primary'}`}>
                        {effectivePrice.toFixed(2)} €
                      </div>
                      <div className={`text-xs ${hasPromotion ? 'text-site-company-title' : 'text-site-primary'}`}>
                        par unité
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Weight Tiers Selection */}
        {product.vendu_au_poids && sortedWeightTiers.length > 0 && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(123, 138, 120, 0.15)', borderColor: 'var(--color-primary)', borderWidth: '1px' }}>
            <div className="flex items-center mb-3">
              <Weight className="h-4 w-4 text-site-primary mr-2" />
              <span className="text-sm font-medium text-site-company-title">
                Choisissez le poids
              </span>
            </div>
            <div className="space-y-2">
              {sortedWeightTiers.map((tier) => (
                <label
                  key={tier.id}
                  className={`relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedWeightTierId === tier.id
                      ? 'border-2'
                      : 'bg-white border-2'
                  }`}
                  style={{
                    backgroundColor: selectedWeightTierId === tier.id ? 'rgba(176, 195, 172, 0.2)' : '#ffffff',
                    borderColor: selectedWeightTierId === tier.id ? 'var(--color-buttons)' : 'rgba(176, 195, 172, 0.4)'
                  }}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="weight-tier"
                      checked={selectedWeightTierId === tier.id}
                      onChange={() => setSelectedWeightTierId(tier.id)}
                      className="mr-3 h-4 w-4 text-site-primary focus:ring-site-primary"
                    />
                    <div>
                      <div className="flex items-center text-sm font-medium text-site-company-title">
                        <Weight className="h-3 w-3 mr-1" />
                        {tier.poids_grammes}g
                        {tier.poids_grammes >= 1000 && (
                          <span className="ml-1 text-xs text-site-text-dark">
                            ({(tier.poids_grammes / 1000).toFixed(1)} kg)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-site-primary">
                      {tier.prix.toFixed(2)} €
                    </div>
                    <div className="text-xs text-site-text-dark">
                      {((tier.prix / tier.poids_grammes) * 100).toFixed(2)} € / 100g
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Section Selection - Sélection de la section */}
        {product.prix_par_section && productSections.length > 0 && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(123, 138, 120, 0.15)', borderColor: 'var(--color-primary)', borderWidth: '1px' }}>
            <div className="flex items-center mb-3">
              <Divide className="h-4 w-4 text-site-primary mr-2" />
              <span className="text-sm font-medium text-site-company-title">
                Choisissez votre portion
              </span>
            </div>
            <div className="space-y-2">
              {productSections.map((section) => (
                <label
                  key={section.id}
                  className={`relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSectionId === section.id
                      ? 'border-2'
                      : 'bg-white border-2'
                  }`}
                  style={{
                    backgroundColor: selectedSectionId === section.id ? 'rgba(176, 195, 172, 0.2)' : '#ffffff',
                    borderColor: selectedSectionId === section.id ? 'var(--color-buttons)' : 'rgba(176, 195, 172, 0.4)'
                  }}
                >
                  <div className="flex items-center flex-1">
                    <input
                      type="radio"
                      name="product-section"
                      checked={selectedSectionId === section.id}
                      onChange={() => setSelectedSectionId(section.id)}
                      className="mr-3 h-4 w-4 text-site-primary focus:ring-site-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center text-sm font-medium text-site-company-title">
                        <Divide className="h-3 w-3 mr-1" />
                        {section.nom}
                      </div>
                      {section.description && (
                        <div className="text-xs text-site-text-dark mt-0.5">
                          {section.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-lg font-bold text-site-primary">
                      {section.prix.toFixed(2)} €
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Range Selection - Sélection de la gamme */}
        {product.prix_par_gamme && productRanges.length > 0 && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(97, 103, 96, 0.1)', borderColor: 'var(--color-company-title)', borderWidth: '1px' }}>
            <div className="flex items-center mb-3">
              <Tag className="h-4 w-4 text-site-company-title mr-2" />
              <span className="text-sm font-medium text-site-company-title">
                Choisissez votre gamme
              </span>
            </div>
            <div className="space-y-2">
              {productRanges.map((range) => (
                <label
                  key={range.id}
                  className={`relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedRangeId === range.id
                      ? 'border-2'
                      : 'bg-white border-2'
                  }`}
                  style={{
                    backgroundColor: selectedRangeId === range.id ? 'rgba(176, 195, 172, 0.2)' : '#ffffff',
                    borderColor: selectedRangeId === range.id ? 'var(--color-buttons)' : 'rgba(176, 195, 172, 0.4)'
                  }}
                >
                  <div className="flex items-center flex-1">
                    <input
                      type="radio"
                      name="product-range"
                      checked={selectedRangeId === range.id}
                      onChange={() => setSelectedRangeId(range.id)}
                      className="mr-3 h-4 w-4 text-site-primary focus:ring-site-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center text-sm font-medium text-site-company-title">
                        {range.nom}
                      </div>
                      {range.description && (
                        <div className="text-xs text-site-text-dark mt-0.5">
                          {range.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-lg font-bold text-site-primary">
                      {range.prix_par_personne.toFixed(2)} €
                    </div>
                    <div className="text-xs text-site-primary">
                      par personne
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Person Count Selection */}
        {(product.prix_par_gamme || product.prix_par_personne) && (product.prix_par_gamme ? selectedRange : product.prix_unitaire_personne) && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(123, 138, 120, 0.15)', borderColor: 'var(--color-primary)', borderWidth: '1px' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-site-primary mr-2" />
                <span className="text-sm font-medium text-site-company-title">
                  Nombre de personnes
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const minPersons = product.prix_par_gamme && selectedRange
                      ? selectedRange.nb_personnes_min
                      : (product.nb_personnes_min || 1);
                    setSelectedPersonCount(Math.max(minPersons, selectedPersonCount - 1));
                  }}
                  disabled={selectedPersonCount <= (product.prix_par_gamme && selectedRange ? selectedRange.nb_personnes_min : (product.nb_personnes_min || 1))}
                  className="w-8 h-8 rounded-full bg-site-buttons flex items-center justify-center hover:bg-site-primary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-bold text-lg text-site-primary">{selectedPersonCount}</span>
                <button
                  onClick={() => {
                    const maxPersons = product.prix_par_gamme && selectedRange
                      ? selectedRange.nb_personnes_max
                      : product.nb_personnes_max;
                    if (!maxPersons || selectedPersonCount < maxPersons) {
                      setSelectedPersonCount(selectedPersonCount + 1);
                    }
                  }}
                  disabled={(() => {
                    const maxPersons = product.prix_par_gamme && selectedRange
                      ? selectedRange.nb_personnes_max
                      : product.nb_personnes_max;
                    return maxPersons !== null && selectedPersonCount >= maxPersons;
                  })()}
                  className="w-8 h-8 rounded-full bg-site-buttons flex items-center justify-center hover:bg-site-primary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-center p-2 rounded-lg bg-white border border-site-buttons">
              {product.prix_par_gamme && rangeDiscountedPrice && rangeDiscountedPrice.discountPercentage > 0 ? (
                /* Avec remise gamme */
                <>
                  <p className="text-xs text-gray-500 line-through">
                    {rangeDiscountedPrice.originalPrice.toFixed(2)} €
                  </p>
                  <p className="text-sm text-green-600">
                    Prix total : <strong className="text-lg">
                      {rangeDiscountedPrice.finalPrice.toFixed(2)} €
                    </strong>
                    <span className="ml-2 text-xs">(-{rangeDiscountedPrice.discountPercentage}%)</span>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Économie: {(rangeDiscountedPrice.originalPrice - rangeDiscountedPrice.finalPrice).toFixed(2)} €
                  </p>
                  <p className="text-xs text-site-text-dark mt-1">
                    {selectedRange!.prix_par_personne.toFixed(2)} € × {selectedPersonCount} {selectedPersonCount > 1 ? 'personnes' : 'personne'}
                  </p>
                </>
              ) : product.prix_par_personne && personPriceInfo && personPriceInfo.hasTierDiscount && personPriceInfo.totalPrice < (product.prix_unitaire_personne! * selectedPersonCount) ? (
                /* Avec tarif dégressif par personne (seulement si prix réduit) */
                <>
                  <p className="text-xs text-gray-500 line-through">
                    {(product.prix_unitaire_personne! * selectedPersonCount).toFixed(2)} €
                  </p>
                  <p className="text-sm text-green-600">
                    Prix total : <strong className="text-lg">
                      {personPriceInfo.totalPrice.toFixed(2)} €
                    </strong>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Économie: {((product.prix_unitaire_personne! * selectedPersonCount) - personPriceInfo.totalPrice).toFixed(2)} € (Tarif dégressif appliqué !)
                  </p>
                  <p className="text-xs text-site-text-dark mt-1">
                    {personPriceInfo.pricePerPerson.toFixed(2)} € × {selectedPersonCount} {selectedPersonCount > 1 ? 'personnes' : 'personne'}
                  </p>
                </>
              ) : (
                /* Sans remise */
                <>
                  <p className="text-sm text-site-primary">
                    Prix total : <strong className="text-lg">
                      {(product.prix_par_gamme && selectedRange
                        ? selectedRange.prix_par_personne * selectedPersonCount
                        : personPriceInfo
                          ? personPriceInfo.totalPrice
                          : product.prix_unitaire_personne! * selectedPersonCount
                      ).toFixed(2)} €
                    </strong>
                  </p>
                  <p className="text-xs text-site-text-dark mt-1">
                    {(product.prix_par_gamme && selectedRange
                      ? selectedRange.prix_par_personne
                      : personPriceInfo
                        ? personPriceInfo.pricePerPerson
                        : product.prix_unitaire_personne!
                    ).toFixed(2)} € × {selectedPersonCount} {selectedPersonCount > 1 ? 'personnes' : 'personne'}
                  </p>
                </>
              )}
            </div>
            {(() => {
              const minPersons = product.prix_par_gamme && selectedRange
                ? selectedRange.nb_personnes_min
                : product.nb_personnes_min;
              const maxPersons = product.prix_par_gamme && selectedRange
                ? selectedRange.nb_personnes_max
                : product.nb_personnes_max;

              return (minPersons && minPersons > 1) && (
                <p className="text-xs text-site-text-dark mt-2 text-center">
                  Minimum : {minPersons} personnes
                  {maxPersons && ` • Maximum : ${maxPersons} personnes`}
                </p>
              );
            })()}
          </div>
        )}

        {/* Discount Information */}
        {!product.use_price_tiers && discountTiers.length > 0 && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(123, 138, 120, 0.1)', borderColor: 'var(--color-primary)', borderWidth: '1px' }}>
            <div className="flex items-center mb-2">
              <TrendingDown className="h-4 w-4 text-site-primary mr-2" />
              <span className="text-sm font-medium text-site-company-title">
                Tarifs dégressifs disponibles
              </span>
            </div>

            {currentDiscount.discountPercentage > 0 && (
              <div className="mb-2 p-2 rounded" style={{ backgroundColor: 'rgba(123, 138, 120, 0.15)', borderColor: 'var(--color-primary)', borderWidth: '1px' }}>
                <div className="flex items-center text-site-primary">
                  <Percent className="h-3 w-3 mr-1" />
                  <span className="font-medium text-xs">Remise actuelle: {currentDiscount.discountPercentage}% pour {quantity} unité{quantity > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {nextTier && (
              <div className="text-xs text-site-text-dark">
                💡 <strong>Astuce:</strong> Achetez {nextTier.quantity} unités pour bénéficier de {nextTier.discountPercentage}% de remise!
              </div>
            )}

            <div className="mt-2 space-y-1">
              {discountTiers.slice(0, 3).map((tier, index) => (
                <div key={tier.id} className="flex justify-between text-xs text-site-primary">
                  <span>À partir de {tier.quantity} unités:</span>
                  <span className="font-medium">-{tier.discountPercentage}%</span>
                </div>
              ))}
              {discountTiers.length > 3 && (
                <div className="text-xs italic text-site-text-dark">
                  +{discountTiers.length - 3} palier{discountTiers.length - 3 > 1 ? 's' : ''} supplémentaire{discountTiers.length - 3 > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Sélecteur de quantité - masqué si pricing par personne ou par gamme */}
          {!product.prix_par_personne && !product.prix_par_gamme && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700">
                  {product.use_price_tiers && selectedTier
                    ? `Quantité (${selectedTier.quantity} pers. par unité)`
                    : 'Quantité'}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(product.quantite_min || 1, quantity - 1))}
                    disabled={quantity <= (product.quantite_min || 1)}
                    className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => {
                      const maxQty = product.quantite_max || Infinity;
                      setQuantity(Math.min(maxQty, quantity + 1));
                    }}
                    disabled={product.quantite_max ? quantity >= product.quantite_max : false}
                    className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

            {/* Affichage du total de personnes pour les paliers */}
            {product.use_price_tiers && selectedTier && (
              <div className="text-center p-2 rounded-lg mb-2" style={{ backgroundColor: 'rgba(176, 195, 172, 0.2)', borderColor: 'var(--color-buttons)', borderWidth: '1px' }}>
                <div className="flex items-center justify-center text-sm text-site-primary">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Total : {selectedTier.quantity * quantity} personnes</span>
                </div>
              </div>
            )}

            {/* Total Price with Tiers/Promotion/Discount */}
            {(quantity > 1 || (product.use_price_tiers && selectedTier) || (product.vendu_au_poids && selectedWeightTier)) && (
              <div className="text-center p-2 border rounded-lg"
                style={{
                  backgroundColor: product.vendu_au_poids && selectedWeightTier
                    ? 'rgba(176, 195, 172, 0.2)'
                    : product.use_price_tiers && selectedTier && isTierPromotionValid(selectedTier)
                      ? 'rgba(97, 103, 96, 0.1)'
                      : 'rgba(176, 195, 172, 0.2)',
                  borderColor: product.vendu_au_poids && selectedWeightTier
                    ? 'var(--color-buttons)'
                    : product.use_price_tiers && selectedTier && isTierPromotionValid(selectedTier)
                      ? 'var(--color-company-title)'
                      : 'var(--color-buttons)'
                }}
              >
                {product.vendu_au_poids && selectedWeightTier ? (
                  /* Total avec poids */
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-site-primary">
                      Total: {(selectedWeightTier.prix * quantity).toFixed(2)} €
                    </div>
                    <div className="text-xs text-site-primary">
                      {quantity} × {selectedWeightTier.poids_grammes}g
                      {quantity > 1 && ` = ${selectedWeightTier.poids_grammes * quantity}g`}
                    </div>
                  </div>
                ) : product.use_price_tiers && selectedTier ? (
                  /* Total avec palier de prix */
                  <div className="space-y-1">
                    {isTierPromotionValid(selectedTier) && (
                      <div className="text-sm text-gray-500 line-through">
                        Total normal: {(selectedTier.price * quantity).toFixed(2)} €
                      </div>
                    )}
                    <div className={`text-lg font-bold ${
                      isTierPromotionValid(selectedTier) ? 'text-site-company-title' : 'text-site-primary'
                    }`}>
                      Total: {(getTierEffectivePrice(selectedTier) * quantity).toFixed(2)} €
                    </div>
                    <div className={`text-xs ${
                      isTierPromotionValid(selectedTier) ? 'text-site-company-title' : 'text-site-primary'
                    }`}>
                      {quantity} × {getTierEffectivePrice(selectedTier).toFixed(2)}€ ({selectedTier.quantity} pers.)
                    </div>
                    {isTierPromotionValid(selectedTier) && (
                      <div className="text-xs text-site-company-title font-medium">
                        Économie: {((selectedTier.price - getTierEffectivePrice(selectedTier)) * quantity).toFixed(2)} €
                      </div>
                    )}
                  </div>
                ) : promotionInfo.isOnPromotion ? (
                  /* Total avec promotion */
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500 line-through">
                      Total: {(promotionInfo.originalPrice * quantity).toFixed(2)} €
                    </div>
                    <div className="text-lg font-bold text-site-company-title">
                      Total promo: {(promotionInfo.currentPrice * quantity).toFixed(2)} €
                    </div>
                    <div className="text-xs text-site-company-title">
                      Vous économisez {(promotionInfo.savings * quantity).toFixed(2)} €
                    </div>
                  </div>
                ) : currentDiscount.discountPercentage > 0 ? (
                  /* Total avec remise quantité */
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500 line-through">
                      Total: {(product.prix * quantity).toFixed(2)} €
                    </div>
                    <div className="text-lg font-bold text-site-primary">
                      Total avec remise: {(currentDiscount.discountedPrice * quantity).toFixed(2)} €
                    </div>
                    <div className="text-xs text-green-600">
                      Vous économisez {((product.prix - currentDiscount.discountedPrice) * quantity).toFixed(2)} €
                    </div>
                  </div>
                ) : (
                  /* Total normal */
                  <div className="text-lg font-bold text-site-primary">
                    Total: {(product.prix * quantity).toFixed(2)} €
                  </div>
                )}
              </div>
            )}
            </div>
          )}

          {/* Date de retrait */}
          {product.retrait_planifie && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Date de retrait souhaitée
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => {
                  const selectedDate = new Date(e.target.value);
                  const dayOfWeek = selectedDate.getDay();

                  if (dayOfWeek === 0 || dayOfWeek === 1) {
                    toast.error('Les retraits ne sont pas disponibles le dimanche et le lundi');
                    return;
                  }

                  setPickupDate(e.target.value);
                }}
                min={minDate}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent text-sm"
                required
              />
              <p className="text-xs text-site-text-dark mt-1">
                Les retraits ne sont pas disponibles le dimanche et le lundi
              </p>
            </div>
          )}
          
          <button
            onClick={handleAddToCart}
            className="w-full bg-site-buttons text-site-text-dark py-3 rounded-lg font-semibold hover:bg-site-primary hover:text-site-text-light transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Ajouter au panier</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;