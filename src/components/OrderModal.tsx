import React, { useState } from 'react';
import { X, Loader, ShoppingBag, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { useLateOrderCheck } from '../hooks/useLateOrderCheck';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export type { CustomerInfo as CustomerInfoType };

interface CartItem {
  product: {
    id: string;
    nom: string;
    retrait_planifie: boolean | null;
  };
  quantity: number;
  pickupDate?: string;
  priceAtTime?: number;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customerInfo: CustomerInfo) => Promise<void>;
  totalAmount: number;
  itemCount: number;
  cartItems?: CartItem[];
}

const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  itemCount,
  cartItems = []
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: ''
  });
  const [pickupOption, setPickupOption] = useState<'single' | 'multiple'>('single');
  const { getImmediatePickupTime, getPickupMessage } = useLateOrderCheck();

  if (!isOpen) return null;

  // Séparer les produits par type de retrait
  const immediateItems = cartItems.filter(item => !item.product.retrait_planifie);
  const scheduledItems = cartItems.filter(item => item.product.retrait_planifie && item.pickupDate);

  // Trouver la date de retrait la plus tardive
  const latestPickupDate = scheduledItems.length > 0
    ? scheduledItems.reduce((latest, item) => {
        if (!item.pickupDate) return latest;
        return !latest || new Date(item.pickupDate) > new Date(latest)
          ? item.pickupDate
          : latest;
      }, '' as string)
    : '';

  const hasMultiplePickupDates = scheduledItems.length > 0 && scheduledItems.some(
    item => item.pickupDate && item.pickupDate !== latestPickupDate
  );

  const hasMixedItems = immediateItems.length > 0 && scheduledItems.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo.name || !customerInfo.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast.error('Veuillez entrer une adresse email valide');
      return;
    }

    setIsProcessing(true);

    try {
      // Passer les informations de retrait avec le customer info
      await onConfirm({
        ...customerInfo,
        pickupOption: hasMixedItems ? pickupOption : undefined,
        latestPickupDate
      } as any);
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Une erreur est survenue lors de la commande');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={!isProcessing ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-site-company-title flex items-center">
              <ShoppingBag className="h-6 w-6 mr-2" />
              Finaliser ma commande
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {itemCount} article{itemCount > 1 ? 's' : ''} • <span className="font-bold text-site-primary">{totalAmount.toFixed(2)} €</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form - Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Mode test activé</strong> - Aucun paiement ne sera effectué. Cette commande sera enregistrée pour test.
            </p>
          </div>

          {/* Info heure de retrait */}
          {immediateItems.length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 text-xl mt-0.5">⏰</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-800 mb-1">
                    Heure de retrait - Produits disponibles
                  </p>
                  <p className="text-sm text-blue-700">
                    {getPickupMessage()}
                    {scheduledItems.length > 0 && latestPickupDate && (
                      <>
                        <br />
                        <strong>Sélection événement :</strong> Date de retrait prévue le {new Date(latestPickupDate).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={customerInfo.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
              placeholder="Votre nom"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={customerInfo.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
              placeholder="votre@email.com"
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Vous recevrez une confirmation de commande à cette adresse
            </p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={customerInfo.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
              placeholder="06 12 34 56 78"
              disabled={isProcessing}
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📍 Retrait en magasin</h3>
            <p className="text-sm text-gray-600">
              1 rue du Nil<br />
              44800 Saint-Herblain
            </p>

            {/* Options de retrait si commande mixte */}
            {hasMixedItems && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-site-primary" />
                  Choisissez votre mode de retrait :
                </p>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 p-4 border-2 rounded-xl cursor-pointer hover:shadow-md transition-all"
                    style={{
                      borderColor: pickupOption === 'single' ? 'var(--color-primary)' : '#d1d5db',
                      backgroundColor: pickupOption === 'single' ? 'rgba(123, 138, 120, 0.08)' : '#ffffff',
                      boxShadow: pickupOption === 'single' ? '0 0 0 1px rgba(123, 138, 120, 0.2)' : 'none'
                    }}>
                    <input
                      type="radio"
                      name="pickupOption"
                      value="single"
                      checked={pickupOption === 'single'}
                      onChange={() => setPickupOption('single')}
                      className="mt-1 w-4 h-4"
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900 mb-1">
                        🎯 Tout récupérer en une seule fois
                      </div>
                      <div className="text-sm text-gray-700 font-medium mb-1">
                        {latestPickupDate ? (
                          <>📅 {new Date(latestPickupDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}</>
                        ) : '📅 À la date de retrait choisie'}
                      </div>
                      <div className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        ✓ Un seul déplacement
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-4 border-2 rounded-xl cursor-pointer hover:shadow-md transition-all"
                    style={{
                      borderColor: pickupOption === 'multiple' ? 'var(--color-primary)' : '#d1d5db',
                      backgroundColor: pickupOption === 'multiple' ? 'rgba(123, 138, 120, 0.08)' : '#ffffff',
                      boxShadow: pickupOption === 'multiple' ? '0 0 0 1px rgba(123, 138, 120, 0.2)' : 'none'
                    }}>
                    <input
                      type="radio"
                      name="pickupOption"
                      value="multiple"
                      checked={pickupOption === 'multiple'}
                      onChange={() => setPickupOption('multiple')}
                      className="mt-1 w-4 h-4"
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900 mb-2">
                        📦 Récupération en 2 fois
                      </div>
                      <div className="space-y-1.5 text-xs text-gray-700">
                        <div className="flex items-start">
                          <span className="mr-2">✓</span>
                          <span><strong>{getImmediatePickupTime().charAt(0).toUpperCase() + getImmediatePickupTime().slice(1)} :</strong> {immediateItems.length} article{immediateItems.length > 1 ? 's' : ''} disponible{immediateItems.length > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-start">
                          <span className="mr-2">📅</span>
                          <span><strong>{latestPickupDate ? new Date(latestPickupDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long'
                          }) : 'Dates choisies'} :</strong> {scheduledItems.length} précommande{scheduledItems.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium mt-2">
                        ⚠️ 2 déplacements requis
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Afficher les dates de retrait pour les précommandes */}
            {scheduledItems.length > 0 && pickupOption === 'multiple' && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Dates de retrait des précommandes :
                </p>
                <div className="space-y-1">
                  {scheduledItems.map((item, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2">•</span>
                      <span>
                        <strong>{item.product.nom}</strong> : {new Date(item.pickupDate!).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Affichage simple pour commande sans produits immédiats */}
            {!hasMixedItems && scheduledItems.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Date de retrait :
                </p>
                <div className="text-sm text-gray-800 font-medium">
                  {latestPickupDate && new Date(latestPickupDate).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-3">
              Vous serez contacté pour confirmer l'heure de retrait
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-site-primary text-white rounded-lg hover:bg-opacity-90 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  Confirmer la commande
                </>
              )}
            </button>
          </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-600">
          <p>
            <strong>Vous pouvez aussi commander par téléphone :</strong>
          </p>
          <p className="mt-1">📞 <a href="tel:+33240634931" className="text-site-primary hover:underline">02 40 63 49 31</a></p>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
