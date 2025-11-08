import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

// Initialize Stripe with publishable key
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('Stripe publishable key not found');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export interface PaymentIntentData {
  amount: number; // in cents
  currency: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
}

// Create payment intent via backend (you'll need to create this endpoint)
export const createPaymentIntent = async (data: PaymentIntentData): Promise<string | null> => {
  try {
    // For now, we'll use Stripe Checkout which doesn't require a backend endpoint
    // This is a client-side only implementation
    const stripe = await getStripe();
    if (!stripe) {
      console.error('Stripe failed to initialize');
      return null;
    }

    // Note: For production, you should create a backend endpoint that creates the PaymentIntent
    // and returns the clientSecret. This is a simplified version.
    console.log('Payment intent data:', data);

    // Return success for now - in production, you'd create actual payment intent
    return 'payment_intent_placeholder';
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
};

// Process card payment
export const processCardPayment = async (
  clientSecret: string,
  cardElement: any
): Promise<{ success: boolean; error?: string }> => {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      return { success: false, error: 'Stripe failed to initialize' };
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (paymentIntent?.status === 'succeeded') {
      return { success: true };
    }

    return { success: false, error: 'Payment failed' };
  } catch (error) {
    console.error('Error processing payment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
