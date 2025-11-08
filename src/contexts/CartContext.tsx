import React, { createContext, useContext, useState } from 'react';
    import type { ReactNode } from 'react';

    interface Product {
      id: string;
      nom: string;
      prix: number;
      categorie: string;
      retrait_planifie: boolean | null;
      image_url: string | null;
      actif: boolean | null;
    }

    interface CartItem {
      product: Product;
      quantity: number;
      pickupDate?: string;
      priceAtTime?: number; // Prix au moment de l'ajout (pour les paliers de prix)
      // Metadata pour la validation des codes promo
      sectionId?: string;
      rangeId?: string;
      rangeName?: string;
      personCount?: number; // Nombre de personnes sélectionné (gamme ou prix par personne)
      weightTierId?: string;
      tierId?: string;
    }

    interface CartContextType {
      cartItems: CartItem[];
      addToCart: (
        product: Product,
        quantity: number,
        pickupDate?: string,
        priceOverride?: number,
        metadata?: {
          sectionId?: string;
          rangeId?: string;
          rangeName?: string;
          personCount?: number;
          weightTierId?: string;
          tierId?: string;
        }
      ) => void;
      updateQuantity: (productId: string, quantity: number) => void;
      updatePickupDate: (productId: string, pickupDate: string) => void;
      removeFromCart: (productId: string) => void;
      clearCart: () => void;
      getTotal: () => number;
    }

    const CartContext = createContext<CartContextType | undefined>(undefined);

    export const useCart = () => {
      const context = useContext(CartContext);
      if (!context) {
        throw new Error('useCart must be used within a CartProvider');
      }
      return context;
    };

    interface CartProviderProps {
      children: ReactNode;
    }

    export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
      const [cartItems, setCartItems] = useState<CartItem[]>([]);

      const addToCart = (
        product: Product,
        quantity: number,
        pickupDate?: string,
        priceOverride?: number,
        metadata?: {
          sectionId?: string;
          rangeId?: string;
          rangeName?: string;
          personCount?: number;
          weightTierId?: string;
          tierId?: string;
        }
      ) => {
        setCartItems(prev => {
          const existing = prev.find(item => item.product.id === product.id);
          if (existing) {
            return prev.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity, pickupDate: pickupDate || item.pickupDate }
                : item
            );
          }
          return [...prev, {
            product,
            quantity,
            pickupDate,
            priceAtTime: priceOverride,
            sectionId: metadata?.sectionId,
            rangeId: metadata?.rangeId,
            rangeName: metadata?.rangeName,
            personCount: metadata?.personCount,
            weightTierId: metadata?.weightTierId,
            tierId: metadata?.tierId
          }];
        });
      };

      const updateQuantity = (productId: string, quantity: number) => {
        setCartItems(prev =>
          prev.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          ).filter(item => item.quantity > 0)
        );
      };

      const updatePickupDate = (productId: string, pickupDate: string) => {
        setCartItems(prev =>
          prev.map(item =>
            item.product.id === productId ? { ...item, pickupDate } : item
          )
        );
      };

      const removeFromCart = (productId: string) => {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
      };

      const clearCart = () => {
        setCartItems([]);
      };

      const getTotal = () => {
        return cartItems.reduce((total, item) => {
          const price = item.priceAtTime ?? item.product.prix;
          return total + price * item.quantity;
        }, 0);
      };

      return (
        <CartContext.Provider value={{
          cartItems,
          addToCart,
          updateQuantity,
          updatePickupDate,
          removeFromCart,
          clearCart,
          getTotal
        }}>
          {children}
        </CartContext.Provider>
      );
    };