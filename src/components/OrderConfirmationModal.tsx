import React from 'react';
import { CheckCircle, MapPin, Mail, Calendar, X } from 'lucide-react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  customerEmail: string;
  pickupDate?: string;
  pickupOption?: 'single' | 'multiple';
  totalAmount: number;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  customerEmail,
  pickupDate,
  pickupOption,
  totalAmount
}) => {
  if (!isOpen) return null;

  // Format pickup date in French
  const formatPickupDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success Icon */}
        <div className="flex flex-col items-center pt-10 pb-8 px-8 bg-gradient-to-b from-green-50 to-white">
          <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle className="w-20 h-20 text-green-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Commande confirmée !
          </h2>
          <p className="text-lg text-gray-600 text-center">
            Votre commande a été enregistrée avec succès
          </p>
        </div>

        {/* Order Details */}
        <div className="px-8 py-8 space-y-6">
          {/* Order Number */}
          <div className="bg-gray-50 rounded-lg p-5">
            <p className="text-base text-gray-600 mb-2">Numéro de commande</p>
            <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
          </div>

          {/* Email Confirmation - Enhanced */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                  <Mail className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-blue-900 text-2xl mb-3">
                  📧 Consultez vos emails !
                </p>
                <p className="text-base text-blue-800 mb-3">
                  Un email de confirmation avec tous les détails de votre commande a été envoyé à :
                </p>
                <p className="text-base font-semibold text-blue-900 bg-white px-4 py-3 rounded-lg border-2 border-blue-300 shadow-sm">
                  {customerEmail}
                </p>
                <p className="text-sm text-blue-700 mt-3 italic flex items-center gap-2">
                  <span className="text-lg">💡</span>
                  <span>Pensez à vérifier vos spams si vous ne le trouvez pas</span>
                </p>
              </div>
            </div>
          </div>

          {/* Pickup Information */}
          {pickupDate && (
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Date de retrait</p>
                {pickupOption === 'single' && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>🎯 Retrait en une seule fois</strong>
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Le {formatPickupDate(pickupDate)}
                    </p>
                  </div>
                )}
                {pickupOption === 'multiple' && (
                  <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>📦 Retrait en 2 fois</strong>
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      Articles disponibles immédiatement : dès maintenant<br />
                      Précommandes : le {formatPickupDate(pickupDate)}
                    </p>
                  </div>
                )}
                {!pickupOption && (
                  <p className="text-sm text-gray-600 mt-1">
                    Le {formatPickupDate(pickupDate)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Store Location */}
          <div className="flex items-start gap-4">
            <MapPin className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 text-lg">Adresse de retrait</p>
              <p className="text-base text-gray-600 mt-2">
                Au Matin Vert<br />
                1 rue du Nil<br />
                44800 Saint-Herblain
              </p>
              <p className="text-sm text-gray-500 mt-3">
                Vous serez contacté pour confirmer l'heure de retrait
              </p>
            </div>
          </div>

          {/* Total Amount */}
          <div className="pt-6 border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg text-gray-600 font-medium">Montant total</span>
              <span className="text-3xl font-bold text-gray-900">
                {totalAmount.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;
