import React, { useMemo, useState } from 'react';
    import Header from '../components/Header';
    import Footer from '../components/Footer';
    import OrderModal from '../components/OrderModal';
    import PaymentModal from '../components/PaymentModal';
    import OrderConfirmationModal from '../components/OrderConfirmationModal';
    import CartProductImage from '../components/CartProductImage';
    import type { CustomerInfo } from '../components/OrderModal';
    import { useCart } from '../contexts/CartContext';
    import { useDeliveryRates } from '../hooks/useDeliveryRates';
    import { useMinimumPickupDate } from '../hooks/useMinimumPickupDate';
    import { useVacationPeriods } from '../hooks/useVacationPeriods';
    import { useQuantityDiscounts } from '../hooks/useQuantityDiscounts';
    import { usePromotionalPricing } from '../hooks/usePromotionalPricing';
    import { validatePromoCode, calculatePriceWithPromo } from '../hooks/usePromoCodes';
    import { generateOrderNumber, saveOrderToDatabase, sendOrderConfirmationEmail } from '../utils/orderUtils';
    import { useLateOrderCheck } from '../hooks/useLateOrderCheck';
    import { supabase } from '../supabase/client';
    import { Trash2, Plus, Minus, Calendar, Percent, Tag, Ticket, X, ShoppingCart } from 'lucide-react';
    import { toast } from 'react-toastify';

    interface AppliedPromoCode {
      code: string;
      productId: string;
      productName: string;
      pricingType: string;
      pricingItemId: string | null;
      discountPercentage: number;
      savings: number;
    }

    // Component to display range/person count info for cart items
    const CartItemPersonInfo: React.FC<{ personCount: number; rangeName?: string }> = ({ personCount, rangeName }) => {
      return (
        <div className="flex items-center space-x-1 mt-1">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-site-primary text-white">
            👥 {personCount} pers.
          </span>
          {rangeName && <span className="text-xs text-zinc-600">• {rangeName}</span>}
        </div>
      );
    };

    const Cart: React.FC = () => {
      const { cartItems, updateQuantity, updatePickupDate, removeFromCart, getTotal, clearCart } = useCart();
      const { calculateDeliveryRate } = useDeliveryRates();
      const { getMinimumPickupDate } = useMinimumPickupDate();
      const { getCurrentVacationStatus, formatPeriod } = useVacationPeriods();
      const { calculateDiscountedPrice } = useQuantityDiscounts();
      const { getPromotionalPriceInfo } = usePromotionalPricing();
      const { isLateOrder, getImmediatePickupTime, getPickupMessage } = useLateOrderCheck();

      // Promo code state
      const [promoCodeInput, setPromoCodeInput] = useState('');
      const [appliedPromoCodes, setAppliedPromoCodes] = useState<AppliedPromoCode[]>([]);
      const [validatingPromo, setValidatingPromo] = useState(false);

      // Order modal state
      const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
      const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
      const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
      const [pendingOrder, setPendingOrder] = useState<any>(null);
      const [isProcessingOrder, setIsProcessingOrder] = useState(false);

      // Handle order confirmation (from OrderModal)
      const handleConfirmOrder = async (customerInfo: CustomerInfo) => {
        try {
          // Generate order number
          const orderNumber = generateOrderNumber();

          // Calculer la date de retrait et le choix du client
          const scheduledItems = cartItems.filter(item => item.product.retrait_planifie && item.pickupDate);
          const immediateItems = cartItems.filter(item => !item.product.retrait_planifie);
          const latestPickupDate = scheduledItems.length > 0
            ? scheduledItems.reduce((latest, item) => {
                if (!item.pickupDate) return latest;
                return !latest || new Date(item.pickupDate) > new Date(latest)
                  ? item.pickupDate
                  : latest;
              }, '' as string)
            : '';

          // Déterminer le pickupOption basé sur customerInfo (venant du modal)
          const customerInfoAny = customerInfo as any;
          const hasMixedItems = immediateItems.length > 0 && scheduledItems.length > 0;
          const pickupOption = hasMixedItems && customerInfoAny.pickupOption
            ? customerInfoAny.pickupOption
            : undefined;

          // Prepare order data with range information
          const orderData = {
            orderNumber,
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: customerInfo.phone,
            totalAmount: finalTotal,
            deliveryFee,
            subtotal: totalWithDiscounts,
            items: cartItems.map(item => {
              const unitPrice = item.priceAtTime ?? item.product.prix;
              return {
                productId: item.product.id,
                productName: item.product.nom,
                quantity: item.quantity,
                unitPrice: unitPrice,
                totalPrice: unitPrice * item.quantity,
                pickupDate: item.pickupDate,
                imageUrl: item.product.image_url,
                rangeName: item.rangeName,
                rangePersonCount: item.personCount
              };
            }),
            pickupOption,
            latestPickupDate,
            isLateOrder: isLateOrder(),
            immediatePickupMessage: immediateItems.length > 0 ? getPickupMessage() : undefined
          };

          // Store pending order and show payment modal
          setPendingOrder(orderData);
          setIsOrderModalOpen(false);
          setIsPaymentModalOpen(true);
        } catch (error) {
          console.error('Error preparing order:', error);
          toast.error('Une erreur est survenue lors de la préparation de la commande');
        }
      };

      // Handle successful payment
      const handlePaymentSuccess = async () => {
        try {
          console.log('🎉 Paiement réussi, début du traitement...');

          if (!pendingOrder) {
            toast.error('Aucune commande en attente');
            return;
          }

          // Show processing overlay
          setIsProcessingOrder(true);
          toast.info('Enregistrement de votre commande en cours...');

          console.log('📦 Enregistrement de la commande dans la base de données...');
          // Save order to database
          const orderId = await saveOrderToDatabase(pendingOrder);

          if (!orderId) {
            console.error('❌ Échec de l\'enregistrement de la commande');
            toast.error('Erreur lors de l\'enregistrement de la commande');
            setIsPaymentModalOpen(false);
            setIsProcessingOrder(false);
            return;
          }

          console.log('✅ Commande enregistrée avec ID:', orderId);

          toast.info('Envoi des emails de confirmation...');
          console.log('📧 Envoi des emails de confirmation...');

          // Send confirmation email
          const emailSent = await sendOrderConfirmationEmail(pendingOrder);

          if (!emailSent) {
            console.warn('⚠️ Email de confirmation non envoyé');
          } else {
            console.log('✅ Emails envoyés avec succès');
          }

          console.log('🎊 Fermeture du modal de paiement et ouverture du modal de confirmation');

          // Close payment modal and show confirmation modal
          setIsPaymentModalOpen(false);
          setIsProcessingOrder(false);
          setIsConfirmationModalOpen(true);

          console.log('🛒 Vidage du panier...');
          // Clear cart and applied promo codes
          clearCart();
          setAppliedPromoCodes([]);

          console.log('✅ Processus de commande terminé avec succès!');
        } catch (error) {
          console.error('❌ Error saving order after payment:', error);
          toast.error('Une erreur est survenue lors de l\'enregistrement de la commande');
          setIsPaymentModalOpen(false);
          setIsProcessingOrder(false);
        }
      };

      // Handle payment error
      const handlePaymentError = (error: string) => {
        toast.error(`Erreur de paiement : ${error}`);
      };

      // Handle confirmation modal close
      const handleConfirmationClose = () => {
        setIsConfirmationModalOpen(false);
        setPendingOrder(null);
      };

      const handleQuantityChange = (productId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        updateQuantity(productId, newQuantity);
      };

      const handleDateChange = (productId: string, date: string) => {
        // Vérifier si la date sélectionnée est un dimanche (0) ou lundi (1)
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 1) {
          toast.error('Les retraits ne sont pas disponibles le dimanche et le lundi');
          return;
        }

        updatePickupDate(productId, date);
      };

      const handleRemove = (productId: string) => {
        removeFromCart(productId);
        toast.success('Produit retiré du panier');
      };

      const handleClearCart = () => {
        if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
          clearCart();
          setAppliedPromoCodes([]);
          toast.success('Panier vidé');
        }
      };

      // Handle promo code application
      const handleApplyPromoCode = async () => {
        if (!promoCodeInput.trim()) {
          toast.error('Veuillez entrer un code promo');
          return;
        }

        setValidatingPromo(true);

        try {
          // Try to apply promo code to each cart item
          let codeApplied = false;

          for (const item of cartItems) {
            // Determine pricing type for this item
            let pricingType = 'normal';
            let pricingItemId: string | null = null;

            // Check cart item metadata to determine pricing type
            // (assuming cart items store this information)
            if (item.sectionId) {
              pricingType = 'section';
              pricingItemId = item.sectionId;
            } else if (item.rangeId) {
              pricingType = 'range';
              pricingItemId = item.rangeId;
            } else if (item.weightTierId) {
              pricingType = 'weight';
              pricingItemId = item.weightTierId;
            } else if (item.tierId) {
              pricingType = 'tier';
              pricingItemId = item.tierId;
            } else if (item.product.prix_par_personne) {
              pricingType = 'person';
            }

            console.log('🛒 Item panier:', {
              product: item.product.nom,
              pricingType,
              pricingItemId,
              tierId: item.tierId,
              metadata: {
                sectionId: item.sectionId,
                rangeId: item.rangeId,
                weightTierId: item.weightTierId,
                tierId: item.tierId
              }
            });

            // Try to validate for the specific product first
            let validation = await validatePromoCode(
              promoCodeInput,
              item.product.id,
              pricingType,
              pricingItemId
            );

            // If not valid for the specific product, try with ALL_PRODUCTS
            if (!validation.isValid) {
              validation = await validatePromoCode(
                promoCodeInput,
                'ALL_PRODUCTS',
                pricingType,
                pricingItemId
              );
            }

            if (validation.isValid) {
              // Check if code already applied for this product
              const alreadyApplied = appliedPromoCodes.some(
                pc => pc.code === promoCodeInput.toUpperCase() && pc.productId === item.product.id
              );

              if (alreadyApplied) {
                toast.warning(`Code "${promoCodeInput}" déjà appliqué à ce produit`);
                continue;
              }

              // Calculate savings
              const itemPrice = item.product.prix * item.quantity;
              const promoCalc = calculatePriceWithPromo(itemPrice, validation.discountPercentage);

              setAppliedPromoCodes(prev => [...prev, {
                code: promoCodeInput.toUpperCase(),
                productId: item.product.id,
                productName: item.product.nom,
                pricingType,
                pricingItemId,
                discountPercentage: validation.discountPercentage,
                savings: promoCalc.savings
              }]);

              toast.success(`Code "${promoCodeInput}" appliqué à ${item.product.nom} !`);
              codeApplied = true;
            }
          }

          if (!codeApplied) {
            toast.error('Ce code promo n\'est pas valide pour les produits de votre panier');
          }

          setPromoCodeInput('');
        } catch (error) {
          console.error('Error applying promo code:', error);
          toast.error('Erreur lors de l\'application du code promo');
        } finally {
          setValidatingPromo(false);
        }
      };

      // Handle promo code removal
      const handleRemovePromoCode = (code: string, productId: string) => {
        setAppliedPromoCodes(prev =>
          prev.filter(pc => !(pc.code === code && pc.productId === productId))
        );
        toast.info('Code promo retiré');
      };

      // Calculate promo code savings
      const promoCodeSavings = useMemo(() => {
        return appliedPromoCodes.reduce((total, promo) => total + promo.savings, 0);
      }, [appliedPromoCodes]);

      // Calculate total with promotions and discounts
      const totalWithDiscounts = useMemo(() => {
        const subtotal = cartItems.reduce((sum, item) => {
          // Si prix personnalisé (paliers, personnes, etc.)
          if (item.priceAtTime !== undefined && item.priceAtTime !== item.product.prix) {
            return sum + (item.priceAtTime * item.quantity);
          }

          // Vérifier d'abord les promotions
          const promotionInfo = getPromotionalPriceInfo(item.product);
          if (promotionInfo.isOnPromotion) {
            return sum + (promotionInfo.currentPrice * item.quantity);
          }

          // Puis les remises quantité si pas de promotion
          const discountInfo = calculateDiscountedPrice(item.product.id, item.product.prix, item.quantity);
          return sum + (discountInfo.discountedPrice * item.quantity);
        }, 0);

        // Apply promo code discounts
        return subtotal - promoCodeSavings;
      }, [cartItems, calculateDiscountedPrice, getPromotionalPriceInfo, promoCodeSavings]);
      
      const originalTotal = getTotal();
      const deliveryRate = calculateDeliveryRate(totalWithDiscounts);
      const deliveryFee = deliveryRate ? deliveryRate.rate : 0;
      const finalTotal = totalWithDiscounts + deliveryFee;
      const totalSavings = originalTotal - totalWithDiscounts;

      if (cartItems.length === 0) {
        return (
          <div className="min-h-screen bg-gray-50">
            <Header cartItemsCount={0} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-zinc-800 mb-4">Votre panier est vide</h1>
                <p className="text-zinc-600 mb-8">Ajoutez des produits à votre panier pour commencer vos achats.</p>
                <a
                  href="/produits"
                  className="bg-site-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Voir nos produits
                </a>
              </div>
            </main>
            <Footer />
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gray-50">
          <Header cartItemsCount={cartItems.length} />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-zinc-800">Votre Panier</h1>
              <button
                onClick={handleClearCart}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                <Trash2 className="h-4 w-4" />
                <span>Vider le panier</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  console.log('🛒 Cart item:', { productName: item.product.nom, rangeId: item.rangeId, hasRange: !!item.rangeId });
                  return (
                  <div key={item.product.id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center space-x-4">
                      <CartProductImage
                        productId={item.product.id}
                        productName={item.product.nom}
                        fallbackImageUrl={item.product.image_url}
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-zinc-800">{item.product.nom}</h3>
                        <p className="text-zinc-600 text-sm">{item.product.categorie}</p>
                        {/* Afficher le nombre de personnes pour les gammes et prix par personne */}
                        {item.personCount && <CartItemPersonInfo personCount={item.personCount} rangeName={item.rangeName} />}
                        {(() => {
                          // Si un prix spécifique a été défini au moment de l'ajout (paliers, personnes, etc.)
                          if (item.priceAtTime !== undefined && item.priceAtTime !== item.product.prix) {
                            return (
                              <div className="space-y-1">
                                <p className="text-zinc-800 font-bold">{item.priceAtTime.toFixed(2)} €</p>
                                <p className="text-xs text-zinc-500">Prix personnalisé</p>
                              </div>
                            );
                          }

                          const promotionInfo = getPromotionalPriceInfo(item.product);
                          if (promotionInfo.isOnPromotion) {
                            return (
                              <div className="space-y-1">
                                <p className="text-sm line-through text-gray-500">{promotionInfo.originalPrice.toFixed(2)} €</p>
                                <div className="flex items-center space-x-2">
                                  <p className="text-red-600 font-bold">{promotionInfo.currentPrice.toFixed(2)} €</p>
                                  <div className="flex items-center text-red-600 text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    <span>-{promotionInfo.discountPercentage}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          const discountInfo = calculateDiscountedPrice(item.product.id, item.product.prix, item.quantity);
                          if (discountInfo.discountPercentage > 0) {
                            return (
                              <div className="space-y-1">
                                <p className="text-sm line-through text-gray-500">{item.product.prix.toFixed(2)} €</p>
                                <div className="flex items-center space-x-2">
                                  <p className="text-zinc-800 font-bold">{discountInfo.discountedPrice.toFixed(2)} €</p>
                                  <div className="flex items-center text-green-600 text-xs">
                                    <Percent className="h-3 w-3 mr-1" />
                                    <span>-{discountInfo.discountPercentage}%</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return <p className="text-zinc-800 font-bold">{item.product.prix.toFixed(2)} €</p>;
                        })()}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="p-1 text-zinc-600 hover:text-zinc-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="p-1 text-zinc-600 hover:text-zinc-800"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        {(() => {
                          // Si un prix spécifique a été défini au moment de l'ajout
                          if (item.priceAtTime !== undefined && item.priceAtTime !== item.product.prix) {
                            const itemTotal = item.priceAtTime * item.quantity;
                            return (
                              <p className="font-bold text-zinc-800">
                                {itemTotal.toFixed(2)} €
                              </p>
                            );
                          }

                          const promotionInfo = getPromotionalPriceInfo(item.product);
                          if (promotionInfo.isOnPromotion) {
                            const originalItemTotal = promotionInfo.originalPrice * item.quantity;
                            const promotionalItemTotal = promotionInfo.currentPrice * item.quantity;
                            return (
                              <div className="space-y-1">
                                <p className="text-sm line-through text-gray-500">
                                  {originalItemTotal.toFixed(2)} €
                                </p>
                                <p className="font-bold text-red-600">
                                  {promotionalItemTotal.toFixed(2)} €
                                </p>
                                <p className="text-xs text-red-600">
                                  Promo : {(originalItemTotal - promotionalItemTotal).toFixed(2)} €
                                </p>
                              </div>
                            );
                          }

                          const discountInfo = calculateDiscountedPrice(item.product.id, item.product.prix, item.quantity);
                          const originalItemTotal = item.product.prix * item.quantity;
                          const discountedItemTotal = discountInfo.discountedPrice * item.quantity;

                          if (discountInfo.discountPercentage > 0) {
                            return (
                              <div className="space-y-1">
                                <p className="text-sm line-through text-gray-500">
                                  {originalItemTotal.toFixed(2)} €
                                </p>
                                <p className="font-bold text-zinc-800">
                                  {discountedItemTotal.toFixed(2)} €
                                </p>
                                <p className="text-xs text-green-600">
                                  Économie : {(originalItemTotal - discountedItemTotal).toFixed(2)} €
                                </p>
                              </div>
                            );
                          }
                          return (
                            <p className="font-bold text-zinc-800">
                              {originalItemTotal.toFixed(2)} €
                            </p>
                          );
                        })()}
                        <button
                          onClick={() => handleRemove(item.product.id)}
                          className="text-red-600 hover:text-red-800 mt-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {item.product.retrait_planifie && (
                      <div className="mt-4 pt-4 border-t border-zinc-200">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-site-buttons" />
                          <label className="text-sm font-medium text-zinc-700">
                            Date de retrait :
                          </label>
                          <input
                            type="date"
                            value={item.pickupDate || ''}
                            onChange={(e) => handleDateChange(item.product.id, e.target.value)}
                            min={getMinimumPickupDate()}
                            className="border border-zinc-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        {(() => {
                          const vacationStatus = getCurrentVacationStatus();
                          if (vacationStatus.isOnVacation && vacationStatus.currentPeriod && vacationStatus.returnDate) {
                            return (
                              <div className="text-xs mt-1">
                                <p className="text-orange-600 font-medium">
                                  🏖️ Période de vacances en cours
                                </p>
                                <p className="text-orange-600">
                                  {vacationStatus.currentPeriod.description}
                                </p>
                                <p className="text-site-buttons">
                                  Commandes disponibles à partir du {new Date(vacationStatus.returnDate).toLocaleDateString('fr-FR')}
                                  ({vacationStatus.currentPeriod.postVacationDelayDays || 4} jour{(vacationStatus.currentPeriod.postVacationDelayDays || 4) > 1 ? 's' : ''} après le retour)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
              
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
                <h2 className="text-xl font-bold text-zinc-800 mb-4">Récapitulatif</h2>

                {/* Pickup time info for immediate products */}
                {cartItems.some(item => !item.product.retrait_planifie) && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <span className="text-blue-600 text-lg mt-0.5">⏰</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800 mb-1">Heure de retrait - Produits disponibles</p>
                        <p className="text-xs text-blue-700">
                          {getPickupMessage()}
                          {(() => {
                            const scheduledItems = cartItems.filter(item => item.product.retrait_planifie && item.pickupDate);
                            if (scheduledItems.length > 0) {
                              // Regrouper les dates uniques
                              const uniqueDates = [...new Set(scheduledItems.map(item => item.pickupDate))].filter(Boolean) as string[];

                              if (uniqueDates.length > 0) {
                                // Trier les dates par ordre chronologique
                                const sortedDates = uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

                                return (
                                  <>
                                    <br />
                                    <strong>Sélection événement :</strong>
                                    {sortedDates.map((date, index) => {
                                      const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                      });
                                      return (
                                        <span key={date}>
                                          {index > 0 && ' et '}
                                          {index === 0 && ' Date'}
                                          {sortedDates.length > 1 && index === 0 && 's'}
                                          {index === 0 && ' de retrait prévue'}
                                          {sortedDates.length > 1 && index === 0 && 's'}
                                          {index === 0 && ' le '}
                                          {index > 0 && 'le '}
                                          {formattedDate}
                                          {index === sortedDates.length - 1 && '.'}
                                        </span>
                                      );
                                    })}
                                  </>
                                );
                              }
                            }
                            return null;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {totalSavings > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Sous-total original</span>
                        <span className="line-through">{originalTotal.toFixed(2)} €</span>
                      </div>
                      {(() => {
                        // Calculer séparément les promotions et remises quantité
                        let promotionSavings = 0;
                        let quantitySavings = 0;
                        
                        cartItems.forEach(item => {
                          const promotionInfo = getPromotionalPriceInfo(item.product);
                          if (promotionInfo.isOnPromotion) {
                            promotionSavings += promotionInfo.savings * item.quantity;
                          } else {
                            const discountInfo = calculateDiscountedPrice(item.product.id, item.product.prix, item.quantity);
                            if (discountInfo.discountPercentage > 0) {
                              quantitySavings += discountInfo.savings * item.quantity;
                            }
                          }
                        });
                        
                        return (
                          <>
                            {promotionSavings > 0 && (
                              <div className="flex justify-between text-red-600">
                                <span className="flex items-center">
                                  <Tag className="h-4 w-4 mr-1" />
                                  Promotions
                                </span>
                                <span>-{promotionSavings.toFixed(2)} €</span>
                              </div>
                            )}
                            {quantitySavings > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span className="flex items-center">
                                  <Percent className="h-4 w-4 mr-1" />
                                  Remises quantités
                                </span>
                                <span>-{quantitySavings.toFixed(2)} €</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </>
                  )}
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{totalWithDiscounts.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span className={deliveryFee === 0 ? "text-green-600" : "text-zinc-600"}>
                      {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee.toFixed(2)} €`}
                    </span>
                  </div>
                  {deliveryRate && deliveryFee > 0 && (
                    <div className="text-xs text-zinc-500">
                      {deliveryRate.description}
                    </div>
                  )}
                  <div className="border-t border-zinc-200 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>{finalTotal.toFixed(2)} €</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="text-xs text-center pt-2">
                      {(() => {
                        // Calculer séparément les promotions et remises quantité
                        let promotionSavings = 0;
                        let quantitySavings = 0;
                        
                        cartItems.forEach(item => {
                          const promotionInfo = getPromotionalPriceInfo(item.product);
                          if (promotionInfo.isOnPromotion) {
                            promotionSavings += promotionInfo.savings * item.quantity;
                          } else {
                            const discountInfo = calculateDiscountedPrice(item.product.id, item.product.prix, item.quantity);
                            if (discountInfo.discountPercentage > 0) {
                              quantitySavings += discountInfo.savings * item.quantity;
                            }
                          }
                        });
                        
                        if (promotionSavings > 0 && quantitySavings > 0) {
                          return (
                            <div className="space-y-1">
                              <div className="text-red-600">
                                🎉 Promotions : {promotionSavings.toFixed(2)} € d'économie !
                              </div>
                              <div className="text-green-600">
                                💰 Remises : {quantitySavings.toFixed(2)} € d'économie !
                              </div>
                            </div>
                          );
                        } else if (promotionSavings > 0) {
                          return (
                            <div className="text-red-600">
                              🎉 Vous économisez {promotionSavings.toFixed(2)} € grâce aux promotions !
                            </div>
                          );
                        } else if (quantitySavings > 0) {
                          return (
                            <div className="text-green-600">
                              🎉 Vous économisez {quantitySavings.toFixed(2)} € grâce aux tarifs dégressifs !
                            </div>
                          );
                        }
                        
                        return null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Promo Code Section */}
                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <h3 className="text-sm font-semibold text-zinc-800 mb-3 flex items-center">
                    <Ticket className="h-4 w-4 mr-2 text-site-primary" />
                    Code promo
                  </h3>

                  {/* Applied Promo Codes */}
                  {appliedPromoCodes.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {appliedPromoCodes.map((promo) => (
                        <div
                          key={`${promo.code}-${promo.productId}`}
                          className="flex items-center justify-between rounded-lg p-2"
                          style={{
                            backgroundColor: 'rgba(123, 138, 120, 0.15)',
                            borderColor: 'var(--color-primary)',
                            borderWidth: '1px',
                            borderStyle: 'solid'
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-site-company-title text-sm">
                                {promo.code}
                              </span>
                              <span className="text-xs text-site-primary">
                                -{promo.discountPercentage}%
                              </span>
                            </div>
                            <p className="text-xs text-site-primary">
                              {promo.productName} · Économie: {promo.savings.toFixed(2)} €
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemovePromoCode(promo.code, promo.productId)}
                            className="p-1 text-site-primary hover:text-site-company-title rounded transition-colors"
                            style={{ backgroundColor: 'rgba(123, 138, 120, 0.1)' }}
                            title="Retirer le code"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Promo Code Input */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleApplyPromoCode()}
                      placeholder="Entrez un code promo"
                      className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:border-transparent font-mono uppercase"
                      style={{ focusRing: 'var(--color-primary)' }}
                      disabled={validatingPromo}
                    />
                    <button
                      onClick={handleApplyPromoCode}
                      disabled={validatingPromo || !promoCodeInput.trim()}
                      className="px-4 py-2 bg-site-buttons text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
                    >
                      {validatingPromo ? 'Vérification...' : 'Appliquer'}
                    </button>
                  </div>

                  {/* Total promo code savings display */}
                  {promoCodeSavings > 0 && (
                    <div className="mt-3 flex justify-between text-site-primary font-medium">
                      <span className="flex items-center">
                        <Ticket className="h-4 w-4 mr-1" />
                        Codes promo
                      </span>
                      <span>-{promoCodeSavings.toFixed(2)} €</span>
                    </div>
                  )}
                </div>

                <button
                  className="w-full bg-site-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg mt-4"
                  onClick={() => setIsOrderModalOpen(true)}
                >
                  Commander
                </button>

                <p className="text-xs text-zinc-500 mt-4 text-center">
                  Retrait en magasin uniquement<br />
                  1 rue du Nil, 44800 Saint-Herblain
                </p>
              </div>
            </div>
          </main>

          <Footer />

          {/* Order Modal */}
          <OrderModal
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
            onConfirm={handleConfirmOrder}
            totalAmount={finalTotal}
            itemCount={cartItems.length}
            cartItems={cartItems}
          />

          {/* Payment Modal */}
          {pendingOrder && (
            <PaymentModal
              isOpen={isPaymentModalOpen}
              onClose={() => {
                setIsPaymentModalOpen(false);
                setPendingOrder(null);
              }}
              amount={pendingOrder.totalAmount}
              orderNumber={pendingOrder.orderNumber}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          )}

          {/* Order Confirmation Modal */}
          {pendingOrder && (
            <OrderConfirmationModal
              isOpen={isConfirmationModalOpen}
              onClose={handleConfirmationClose}
              orderNumber={pendingOrder.orderNumber}
              customerEmail={pendingOrder.customerEmail}
              pickupDate={pendingOrder.latestPickupDate}
              pickupOption={pendingOrder.pickupOption}
              totalAmount={pendingOrder.totalAmount}
            />
          )}

          {/* Processing Order Overlay */}
          {isProcessingOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center" style={{ zIndex: 20000 }}>
              <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
                <div className="mb-4">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-site-primary"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Traitement en cours...
                </h3>
                <p className="text-gray-600 text-sm">
                  Veuillez patienter pendant l'enregistrement de votre commande et l'envoi des emails de confirmation.
                </p>
                <p className="text-gray-500 text-xs mt-3">
                  Cela peut prendre quelques secondes
                </p>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default Cart;