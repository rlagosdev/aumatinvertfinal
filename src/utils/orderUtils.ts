import { supabase } from '../supabase/client';
import emailjs from '@emailjs/browser';

export interface OrderData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  deliveryFee: number;
  subtotal: number;
  items: OrderItem[];
  pickupOption?: 'single' | 'multiple';
  latestPickupDate?: string;
  isLateOrder?: boolean;
  pickupDayText?: string;
  immediatePickupMessage?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  pickupDate?: string;
  imageUrl?: string;
  rangeName?: string;
  rangePersonCount?: number;
}

// Generate unique order number
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `AMV-${timestamp}-${random}`.toUpperCase();
};

// Save order to Supabase
export const saveOrderToDatabase = async (orderData: OrderData): Promise<string | null> => {
  try {
    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('commandes')
      .insert({
        order_number: orderData.orderNumber,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        total_amount: orderData.totalAmount,
        delivery_fee: orderData.deliveryFee,
        subtotal: orderData.subtotal,
        payment_status: 'pending',
        delivery_method: 'pickup',
        pickup_date: orderData.latestPickupDate || null
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error inserting order:', orderError);
      return null;
    }

    // Insert order items
    const itemsToInsert = orderData.items.map(item => ({
      commande_id: order.id,
      produit_id: item.productId,
      produit_nom: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      pickup_date: item.pickupDate || null
    }));

    const { error: itemsError } = await supabase
      .from('commande_items')
      .insert(itemsToInsert);

    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
      return null;
    }

    return order.id;
  } catch (error) {
    console.error('Error saving order:', error);
    return null;
  }
};

// Keep track of sent emails to prevent duplicates (React StrictMode issue)
const sentEmails = new Set<string>();
let sendingInProgress = false;

// Send order confirmation email
export const sendOrderConfirmationEmail = async (orderData: OrderData): Promise<boolean> => {
  try {
    // Check if email already sent for this order (prevents React StrictMode double-send)
    const emailKey = `${orderData.orderNumber}-${orderData.customerEmail}`;

    if (sentEmails.has(emailKey)) {
      console.log('⚠️ Email déjà envoyé pour cette commande, skip pour éviter doublon');
      return true;
    }

    // If already sending, wait and return
    if (sendingInProgress) {
      console.log('⚠️ Envoi d\'email déjà en cours, skip pour éviter doublon');
      return true;
    }

    // Mark as sending
    sendingInProgress = true;
    sentEmails.add(emailKey);

    console.log('📧 Envoi de l\'email de commande (client + vendeur)...');

    // Configuration EmailJS
    const serviceId = import.meta.env.VITE_EMAILJS_ORDER_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    const vendorEmail = import.meta.env.VITE_VENDOR_EMAIL;

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS configuration missing');
      sendingInProgress = false;
      return false;
    }

    // Calculate totals
    const subtotal = orderData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = orderData.deliveryFee;
    const tax = 0; // TVA incluse dans les prix
    const total = subtotal + shipping;

    // Format order items for email template
    const orders = orderData.items.map(item => ({
      image_url: item.imageUrl || 'https://via.placeholder.com/64',
      name: item.productName,
      units: item.quantity,
      price: item.totalPrice.toFixed(2),
      is_preorder: item.pickupDate ? true : false,
      pickup_date: item.pickupDate ? new Date(item.pickupDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) : '',
      has_range: item.rangePersonCount ? true : false,
      range_name: item.rangeName || '',
      range_person_count: item.rangePersonCount || 0,
      immediate_pickup_time: !item.pickupDate ? orderData.immediatePickupMessage || '' : ''
    }));

    // Formater la date de retrait si présente
    let pickupDateFormatted = '';
    if (orderData.latestPickupDate) {
      pickupDateFormatted = new Date(orderData.latestPickupDate).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    // Déterminer si on affiche le choix de retrait ou juste la date
    const hasPickupOption = orderData.pickupOption !== undefined;
    const hasMixedItems = orderData.pickupOption !== undefined;

    // Déterminer si la commande contient des produits immédiats
    const hasImmediateProducts = orderData.items.some(item => !item.pickupDate);

    const emailParams = {
      order_id: orderData.orderNumber,
      email: orderData.customerEmail,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      to_email: vendorEmail, // Email du vendeur
      orders: orders,
      cost: {
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
      },
      // Informations de retrait
      pickup_option: hasPickupOption,
      is_single_pickup: orderData.pickupOption === 'single',
      is_multiple_pickup: orderData.pickupOption === 'multiple',
      pickup_date: pickupDateFormatted,
      pickup_date_only: !hasPickupOption && pickupDateFormatted !== '',
      // Information de retrait pour produits immédiats
      is_late_order: hasImmediateProducts,
      late_order_warning: orderData.immediatePickupMessage || ''
    };

    // Envoyer l'email UNE SEULE FOIS
    // EmailJS se chargera d'envoyer aux 2 destinataires configurés dans le template
    console.log('📤 Envoi email de commande à:', orderData.customerEmail, 'et', vendorEmail);
    await emailjs.send(serviceId, templateId, emailParams, publicKey);
    console.log('✅ Email de commande envoyé avec succès aux 2 destinataires');

    // Clean up old entries after 5 minutes to prevent memory leak
    setTimeout(() => {
      sentEmails.delete(emailKey);
    }, 5 * 60 * 1000);

    // Reset sending flag
    sendingInProgress = false;

    return true;
  } catch (error) {
    console.error('❌ Error sending order emails:', error);
    sendingInProgress = false;
    return false;
  }
};

// Update order payment status
export const updateOrderPaymentStatus = async (
  orderId: string,
  status: string,
  paymentIntentId?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('commandes')
      .update({
        payment_status: status,
        stripe_payment_intent_id: paymentIntentId || null
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating payment status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
};
