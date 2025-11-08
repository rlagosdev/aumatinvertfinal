import React, { useState } from 'react';
import { X, CreditCard, Lock, Loader2 } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripe } from '../utils/stripeUtils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderNumber: string;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    invalid: {
      color: '#dc2626',
      iconColor: '#dc2626',
    },
  },
  hidePostalCode: false,
};

const PaymentForm: React.FC<Omit<PaymentModalProps, 'isOpen'>> = ({
  onClose,
  amount,
  orderNumber,
  onPaymentSuccess,
  onPaymentError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setCardError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      // For test mode, we'll simulate a successful payment
      // In production, you would create a PaymentIntent on your backend first

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For now, we'll just mark the payment as successful
      // In production, you would:
      // 1. Create PaymentIntent on backend
      // 2. Confirm the payment with Stripe
      // 3. Verify the payment status

      onPaymentSuccess();
    } catch (error: any) {
      console.error('Payment error:', error);
      setCardError(error.message || 'Une erreur est survenue lors du paiement');
      onPaymentError(error.message || 'Une erreur est survenue lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  const handleCardChange = (event: any) => {
    if (event.error) {
      setCardError(event.error.message);
    } else {
      setCardError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Commande n°</span>
          <span className="text-sm font-medium text-gray-900">{orderNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base font-medium text-gray-900">Montant à payer</span>
          <span className="text-2xl font-bold text-gray-900">{amount.toFixed(2)} €</span>
        </div>
      </div>

      {/* Card Information */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CreditCard className="w-4 h-4 inline mr-2" />
          Informations de carte bancaire
        </label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={handleCardChange}
          />
        </div>
        {cardError && (
          <p className="mt-2 text-sm text-red-600">{cardError}</p>
        )}
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Lock className="w-4 h-4" />
        <span>Paiement sécurisé par Stripe. Vos informations sont cryptées.</span>
      </div>

      {/* Test Mode Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800">
          <strong>Mode Test :</strong> Utilisez la carte de test : 4242 4242 4242 4242,
          n'importe quelle date future et n'importe quel CVC.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={processing}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: processing ? undefined : 'var(--color-primary)' }}
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              Payer {amount.toFixed(2)} €
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = (props) => {
  if (!props.isOpen) return null;

  const stripePromise = getStripe();

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50" style={{ zIndex: 10000 }}>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Paiement sécurisé</h3>
          <button
            onClick={props.onClose}
            disabled={false}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Elements stripe={stripePromise}>
            <PaymentForm {...props} />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
