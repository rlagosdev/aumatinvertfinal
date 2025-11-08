import React, { useEffect, useState } from 'react';
    import { supabase } from '../../supabase/client';
    import { Search, Filter, Eye, Trash2 } from 'lucide-react';
    import { toast } from 'react-toastify';
    import StatusBadge from './StatusBadge';
    import OrderDetailsModal from './OrderDetailsModal';
    import ExportButton from './ExportButton';
    
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
      commande_items: Array<{
        quantity: number;
        unit_price: number;
        total_price: number;
        produit_nom: string;
      }>;
    }

    const AdminOrders: React.FC = () => {
      const [orders, setOrders] = useState<Order[]>([]);
      const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
      const [loading, setLoading] = useState(true);
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState('all');
      const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
      const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
      const [isDeleting, setIsDeleting] = useState(false);

      useEffect(() => {
        fetchOrders();
      }, []);

      useEffect(() => {
        filterOrders();
      }, [orders, searchTerm, statusFilter]);

      const fetchOrders = async () => {
        try {
          const { data, error } = await supabase
            .from('commandes')
            .select(`
              *,
              commande_items (
                quantity,
                unit_price,
                total_price,
                produit_nom
              )
            `)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setOrders(data as Order[] || []);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      };

      const filterOrders = () => {
        let filtered = orders;

        if (searchTerm) {
          filtered = filtered.filter(order =>
            order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (statusFilter !== 'all') {
          filtered = filtered.filter(order => order.payment_status === statusFilter);
        }

        setFilteredOrders(filtered);
      };

      const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
          const { error } = await supabase
            .from('commandes')
            .update({ payment_status: newStatus })
            .eq('id', orderId);

          if (error) throw error;

          setOrders(orders.map(order =>
            order.id === orderId ? { ...order, payment_status: newStatus } : order
          ));
        } catch (error) {
          console.error('Error updating order status:', error);
        }
      };

      const handleDeleteOrder = async (orderId: string) => {
        setIsDeleting(true);
        try {
          const { error } = await supabase
            .from('commandes')
            .delete()
            .eq('id', orderId);

          if (error) throw error;

          toast.success('Commande supprimée avec succès');
          fetchOrders(); // Recharger la liste
        } catch (error) {
          console.error('Error deleting order:', error);
          toast.error('Erreur lors de la suppression de la commande');
        } finally {
          setIsDeleting(false);
          setOrderToDelete(null);
        }
      };

      // Préparation des données pour l'export avec notre nouveau format
      const prepareOrdersForExport = () => {
        return filteredOrders.map(order => ({
          'Numéro Commande': order.order_number,
          'Client': order.customer_name || 'N/A',
          'Email': order.customer_email || 'N/A',
          'Téléphone': order.customer_phone || 'N/A',
          'Date Retrait': order.pickup_date ? new Date(order.pickup_date).toLocaleDateString('fr-FR') : 'N/A',
          'Statut': order.payment_status,
          'Total': `${order.total_amount}€`,
          'Date Commande': order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : 'N/A',
          'Produits': order.commande_items.map(item => `${item.quantity}x ${item.produit_nom}`).join('; '),
        }));
      };

      const statusOptions = [
        { value: 'all', label: 'Tous les statuts' },
        { value: 'pending', label: 'En attente' },
        { value: 'succeeded', label: 'Payée' },
        { value: 'preparing', label: 'En préparation' },
        { value: 'ready', label: 'Prête' },
        { value: 'completed', label: 'Récupérée' },
        { value: 'refunded', label: 'Remboursée' },
        { value: 'canceled', label: 'Annulée' },
      ];

      if (loading) {
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-zinc-600">Chargement des commandes...</p>
          </div>
        );
      }

      return (
        <div className="w-full max-w-full overflow-x-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-800">Gestion des Commandes</h2>
            <ExportButton 
              data={prepareOrdersForExport()}
              filename="commandes"
              disabled={loading || filteredOrders.length === 0}
            />
          </div>

          {/* Filters */}
          <div className="bg-white border border-zinc-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Date Retrait
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-zinc-900">{order.order_number}</div>
                        <div className="text-sm text-zinc-500">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-zinc-900">
                          {order.customer_name || 'N/A'}
                        </div>
                        <div className="text-sm text-zinc-500">{order.customer_email || 'N/A'}</div>
                        <div className="text-sm text-zinc-500">{order.customer_phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                        {order.pickup_date ? new Date(order.pickup_date).toLocaleDateString('fr-FR') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.payment_status || 'pending'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                        {order.total_amount.toFixed(2)} €
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setOrderToDelete(order.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer la commande"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <select
                            value={order.payment_status || 'pending'}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs border border-zinc-300 rounded px-2 py-1"
                          >
                            <option value="pending">En attente</option>
                            <option value="succeeded">Payée</option>
                            <option value="preparing">En préparation</option>
                            <option value="ready">Prête</option>
                            <option value="completed">Récupérée</option>
                            <option value="refunded">Remboursée</option>
                            <option value="canceled">Annulée</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500">Aucune commande trouvée.</p>
            </div>
          )}

          {/* Order Details Modal */}
          {selectedOrder && (
            <OrderDetailsModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onOrderDeleted={() => {
                setSelectedOrder(null);
                fetchOrders(); // Recharger les commandes
              }}
              onOrderRefunded={() => {
                setSelectedOrder(null);
                fetchOrders(); // Recharger les commandes
              }}
            />
          )}

          {/* Delete Confirmation Modal */}
          {orderToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                      Supprimer la commande
                    </h3>
                    <p className="text-sm text-zinc-600">
                      Êtes-vous sûr de vouloir supprimer définitivement cette commande ?
                      Cette action est irréversible et supprimera tous les items associés.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setOrderToDelete(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors font-medium disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(orderToDelete)}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {isDeleting ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default AdminOrders;