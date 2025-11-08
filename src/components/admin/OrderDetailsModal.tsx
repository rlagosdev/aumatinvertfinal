import React, { useState } from 'react';
    import { X, Trash2, RefreshCcw, AlertTriangle } from 'lucide-react';
    import { supabase } from '../../supabase/client';
    import { toast } from 'react-toastify';
    import StatusBadge from './StatusBadge';

    interface Order {
      id: string;
      order_number: string;
      created_at: string | null;
      pickup_date: string | null;
      payment_status: string;
      total_amount: number;
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      stripe_payment_intent_id?: string;
      commande_items: Array<{
        quantity: number;
        unit_price: number;
        total_price: number;
        produit_nom: string;
      }>;
    }

    interface OrderDetailsModalProps {
      order: Order;
      onClose: () => void;
      onOrderDeleted?: () => void;
      onOrderRefunded?: () => void;
    }

    const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
      order,
      onClose,
      onOrderDeleted,
      onOrderRefunded
    }) => {
      const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
      const [showRefundConfirm, setShowRefundConfirm] = useState(false);
      const [isProcessing, setIsProcessing] = useState(false);

      const handleDeleteOrder = async () => {
        setIsProcessing(true);
        try {
          const { error } = await supabase
            .from('commandes')
            .delete()
            .eq('id', order.id);

          if (error) throw error;

          toast.success('Commande supprimée avec succès');
          onOrderDeleted?.();
          onClose();
        } catch (error) {
          console.error('Error deleting order:', error);
          toast.error('Erreur lors de la suppression de la commande');
        } finally {
          setIsProcessing(false);
          setShowDeleteConfirm(false);
        }
      };

      const handleRefundOrder = async () => {
        setIsProcessing(true);
        try {
          // Marquer la commande comme remboursée
          const { error } = await supabase
            .from('commandes')
            .update({ payment_status: 'refunded' })
            .eq('id', order.id);

          if (error) throw error;

          toast.success('Commande marquée comme remboursée. N\'oubliez pas de traiter le remboursement dans Stripe.');
          onOrderRefunded?.();
          onClose();
        } catch (error) {
          console.error('Error refunding order:', error);
          toast.error('Erreur lors du remboursement de la commande');
        } finally {
          setIsProcessing(false);
          setShowRefundConfirm(false);
        }
      };

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-zinc-800">
                  Détails de la Commande
                </h2>
                <button
                  onClick={onClose}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Numéro Commande</label>
                    <p className="text-zinc-900">{order.order_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Statut</label>
                    <StatusBadge status={order.payment_status || 'pending'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Date de Création</label>
                    <p className="text-zinc-900">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">Date de Retrait</label>
                    <p className="text-zinc-900">
                      {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString('fr-FR') : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Client Info */}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3">Informations Client</h3>
                  <div className="bg-zinc-50 rounded-lg p-4">
                    <p className="font-medium text-zinc-900">{order.customer_name || 'N/A'}</p>
                    <p className="text-zinc-600">{order.customer_email || 'N/A'}</p>
                    <p className="text-zinc-600">{order.customer_phone || 'N/A'}</p>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h3 className="text-lg font-semibold text-zinc-800 mb-3">Produits Commandés</h3>
                  <div className="space-y-3">
                    {order.commande_items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-zinc-50 rounded-lg p-4">
                        <div>
                          <p className="font-medium text-zinc-900">{item.produit_nom}</p>
                          <p className="text-sm text-zinc-600">Quantité: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-zinc-900">
                          {item.total_price.toFixed(2)} €
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-zinc-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-zinc-800">Total</span>
                    <span className="text-lg font-bold text-zinc-800">{order.total_amount.toFixed(2)} €</span>
                  </div>
                </div>

                {/* Actions Admin */}
                <div className="border-t border-zinc-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-zinc-800 mb-4">Actions Administrateur</h3>

                  {!showDeleteConfirm && !showRefundConfirm && (
                    <div className="flex gap-3">
                      {/* Bouton Rembourser */}
                      {order.payment_status === 'succeeded' && (
                        <button
                          onClick={() => setShowRefundConfirm(true)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                        >
                          <RefreshCcw className="h-5 w-5" />
                          Rembourser
                        </button>
                      )}

                      {/* Bouton Supprimer */}
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        <Trash2 className="h-5 w-5" />
                        Supprimer
                      </button>
                    </div>
                  )}

                  {/* Confirmation de suppression */}
                  {showDeleteConfirm && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-red-900 mb-1">Confirmer la suppression</h4>
                          <p className="text-sm text-red-800">
                            Êtes-vous sûr de vouloir supprimer définitivement cette commande ?
                            Cette action est irréversible.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors font-medium disabled:opacity-50"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleDeleteOrder}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                        >
                          {isProcessing ? 'Suppression...' : 'Confirmer la suppression'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Confirmation de remboursement */}
                  {showRefundConfirm && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-orange-900 mb-1">Confirmer le remboursement</h4>
                          <p className="text-sm text-orange-800 mb-2">
                            Cette action marquera la commande comme remboursée.
                          </p>
                          <p className="text-sm text-orange-800 font-medium">
                            ⚠️ N'oubliez pas de traiter le remboursement manuellement dans Stripe !
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowRefundConfirm(false)}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors font-medium disabled:opacity-50"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleRefundOrder}
                          disabled={isProcessing}
                          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
                        >
                          {isProcessing ? 'Traitement...' : 'Confirmer le remboursement'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    export default OrderDetailsModal;