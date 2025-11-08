import React, { useEffect, useState } from 'react';
    import { supabase } from '../../supabase/client';
    import { Package, Users, Calendar, TrendingUp } from 'lucide-react';
    import ExportButton from './ExportButton';

    interface Stats {
      totalProducts: number;
      totalOrders: number;
      pendingOrders: number;
      todayPickups: number;
    }

    interface AdminOverviewProps {
      onNavigate?: (tab: string) => void;
    }

    const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigate }) => {
      const [stats, setStats] = useState<Stats>({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        todayPickups: 0,
      });
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchStats = async () => {
          try {
            // Get total products
            const { count: productsCount } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true });

            // Get total orders
            const { count: ordersCount } = await supabase
              .from('commandes')
              .select('*', { count: 'exact', head: true });

            // Get pending orders
            const { count: pendingCount } = await supabase
              .from('commandes')
              .select('*', { count: 'exact', head: true })
              .eq('payment_status', 'pending');

            // Get today's pickups - compte les événements de retrait pour aujourd'hui
            const today = new Date().toISOString().split('T')[0];

            // Récupérer toutes les commandes avec leurs items
            const { data: ordersWithItems } = await supabase
              .from('commandes')
              .select(`
                id,
                created_at,
                commande_items (
                  pickup_date
                )
              `);

            // Compter les retraits aujourd'hui (articles disponibles immédiatement créés aujourd'hui + précommandes avec pickup_date aujourd'hui)
            let todayPickupsCount = 0;
            ordersWithItems?.forEach(order => {
              const createdDate = new Date(order.created_at).toISOString().split('T')[0];

              order.commande_items?.forEach((item: any) => {
                if (item.pickup_date) {
                  // Précommande : vérifier si la date de retrait est aujourd'hui
                  if (item.pickup_date === today) {
                    todayPickupsCount++;
                  }
                } else {
                  // Article immédiat : vérifier si créé aujourd'hui
                  if (createdDate === today) {
                    todayPickupsCount++;
                  }
                }
              });
            });

            setStats({
              totalProducts: productsCount || 0,
              totalOrders: ordersCount || 0,
              pendingOrders: pendingCount || 0,
              todayPickups: todayPickupsCount,
            });
          } catch (error) {
            console.error('Error fetching stats:', error);
          } finally {
            setLoading(false);
          }
        };

        // Charger les statistiques initialement
        fetchStats();

        // Mettre à jour les statistiques toutes les 30 secondes pour garder les données fraîches
        const intervalId = setInterval(fetchStats, 30000);

        // Nettoyer l'intervalle lors du démontage du composant
        return () => clearInterval(intervalId);
      }, []);

      const statCards = [
        {
          title: 'Total Produits',
          value: stats.totalProducts,
          icon: Package,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        },
        {
          title: 'Total Commandes',
          value: stats.totalOrders,
          icon: Users,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        },
        {
          title: 'Commandes en Attente',
          value: stats.pendingOrders,
          icon: TrendingUp,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
        },
        {
          title: 'Retraits Aujourd\'hui',
          value: stats.todayPickups,
          icon: Calendar,
          color: 'text-site-primary',
          bgColor: 'bg-purple-100',
        },
      ];

      if (loading) {
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-site-primary mx-auto"></div>
            <p className="mt-4 text-zinc-600">Chargement des statistiques...</p>
          </div>
        );
      }

      // Préparer les statistiques pour l'export
      const prepareStatsForExport = () => {
        return [
          {
            'Statistique': 'Total Produits',
            'Valeur': stats.totalProducts,
            'Date Export': new Date().toLocaleDateString('fr-FR')
          },
          {
            'Statistique': 'Total Commandes',
            'Valeur': stats.totalOrders,
            'Date Export': new Date().toLocaleDateString('fr-FR')
          },
          {
            'Statistique': 'Commandes en Attente',
            'Valeur': stats.pendingOrders,
            'Date Export': new Date().toLocaleDateString('fr-FR')
          },
          {
            'Statistique': 'Retraits Aujourd\'hui',
            'Valeur': stats.todayPickups,
            'Date Export': new Date().toLocaleDateString('fr-FR')
          }
        ];
      };

      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-800">Vue d'ensemble</h2>
            <ExportButton 
              data={prepareStatsForExport()}
              filename="statistiques-dashboard"
              disabled={loading}
              label="Exporter Stats"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="bg-white border border-zinc-200 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-zinc-600">{card.title}</p>
                      <p className="text-2xl font-bold text-zinc-800">{card.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-zinc-800 mb-4">Actions Rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => onNavigate?.('products')}
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Package className="h-8 w-8 text-site-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-800">Ajouter un Produit</p>
              </button>
              <button
                onClick={() => onNavigate?.('orders')}
                className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors"
              >
                <Users className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-cyan-800">Voir les Commandes</p>
              </button>
              <button
                onClick={() => onNavigate?.('calendar')}
                className="p-4 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Calendar className="h-8 w-8 text-site-buttons mx-auto mb-2" />
                <p className="text-sm font-medium text-pink-800">Calendrier des Retraits</p>
              </button>
            </div>
          </div>
        </div>
      );
    };

    export default AdminOverview;