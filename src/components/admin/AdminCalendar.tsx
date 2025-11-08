import React, { useEffect, useState } from 'react';
    import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
    import { format, parse, startOfWeek, getDay } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import { supabase } from '../../supabase/client';
    import ExportButton from './ExportButton';
    import OrderDetailsModal from './OrderDetailsModal';
    import { getHolidaysForRange, type Holiday } from '../../utils/holidays';
    import 'react-big-calendar/lib/css/react-big-calendar.css';

    const locales = {
      fr: fr,
    };

    const localizer = dateFnsLocalizer({
      format,
      parse,
      startOfWeek,
      getDay,
      locales,
    });

    interface OrderEvent {
      id: string;
      title: string;
      start: Date;
      end: Date;
      resource: {
        status: string | null;
        client: string;
        total: number;
        type?: 'order' | 'holiday';
        holidayName?: string;
        orderId?: string;
        isPreorder?: boolean;
        itemsCount?: number;
        items?: any[];
      };
    }

    const AdminCalendar: React.FC = () => {
      const [events, setEvents] = useState<OrderEvent[]>([]);
      const [loading, setLoading] = useState(true);
      const [selectedDate, setSelectedDate] = useState<Date | null>(null);
      const [dayOrders, setDayOrders] = useState<any[]>([]);
      const [currentDate, setCurrentDate] = useState<Date>(new Date());
      const [showHolidays, setShowHolidays] = useState<boolean>(true);
      const [selectedOrder, setSelectedOrder] = useState<any>(null);
      const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

      useEffect(() => {
        fetchOrders();
      }, []);

      // Réactualiser les événements quand on toggle les jours fériés
      useEffect(() => {
        if (!loading) {
          fetchOrders();
        }
      }, [showHolidays]);

      const createHolidayEvents = (): OrderEvent[] => {
        const holidays = getHolidaysForRange(2020, 2030);
        return holidays.map((holiday: Holiday) => ({
          id: `holiday-${holiday.date.getTime()}`,
          title: `🇫🇷 ${holiday.name}`,
          start: holiday.date,
          end: holiday.date,
          resource: {
            status: null,
            client: '',
            total: 0,
            type: 'holiday',
            holidayName: holiday.name
          }
        }));
      };

      const fetchOrders = async () => {
        try {
          const { data, error } = await supabase
            .from('commandes')
            .select(`
              id,
              order_number,
              pickup_date,
              payment_status,
              total_amount,
              customer_name,
              customer_email,
              customer_phone,
              created_at,
              commande_items (
                pickup_date,
                produit_nom,
                quantity
              )
            `);

          if (error) throw error;

          const orderEvents: OrderEvent[] = [];

          (data || []).forEach(order => {
            // Grouper les articles par date de retrait
            const itemsByDate = new Map<string, any[]>();

            order.commande_items?.forEach((item: any) => {
              const dateKey = item.pickup_date || 'immediate';
              if (!itemsByDate.has(dateKey)) {
                itemsByDate.set(dateKey, []);
              }
              itemsByDate.get(dateKey)!.push(item);
            });

            // Créer un événement pour chaque date de retrait
            itemsByDate.forEach((items, dateKey) => {
              let eventDate: Date;
              let orderType = '';

              if (dateKey === 'immediate') {
                // Articles disponibles immédiatement : afficher à la date de création
                eventDate = new Date(order.created_at);
                orderType = '✓';
              } else {
                // Articles en précommande : afficher à leur date de retrait
                eventDate = new Date(dateKey);
                orderType = '📅';
              }

              const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
              const itemsLabel = dateKey === 'immediate' ? 'articles dispo' : 'précommandes';

              orderEvents.push({
                id: `${order.id}-${dateKey}`,
                title: `${orderType} ${order.customer_name || 'Client'} - ${itemsCount} ${itemsLabel}`,
                start: eventDate,
                end: eventDate,
                resource: {
                  status: order.payment_status,
                  client: order.customer_name || 'N/A',
                  total: order.total_amount,
                  type: 'order',
                  orderId: order.id,
                  isPreorder: dateKey !== 'immediate',
                  itemsCount: itemsCount,
                  items: items
                },
              });
            });
          });

          const holidayEvents = createHolidayEvents();
          const allEvents = showHolidays ? [...orderEvents, ...holidayEvents] : orderEvents;

          setEvents(allEvents);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      };

      const eventStyleGetter = (event: OrderEvent) => {
        let backgroundColor = '#6b7280'; // default gray
        let borderColor = 'transparent';
        let opacity = 0.8;

        if (event.resource.type === 'holiday') {
          backgroundColor = '#dc2626'; // rouge pour les jours fériés
          borderColor = '#b91c1c';
          opacity = 0.9;
        } else {
          // Styles pour les commandes
          switch (event.resource.status) {
            case 'succeeded':
            case 'ready':
              backgroundColor = '#10b981'; // green
              break;
            case 'pending':
              backgroundColor = '#f59e0b'; // yellow
              break;
            case 'canceled':
              backgroundColor = '#ef4444'; // red
              break;
            case 'preparing':
              backgroundColor = '#8b5cf6'; // purple
              break;
            case 'completed':
              backgroundColor = '#3b82f6'; // blue
              break;
            case 'refunded':
              backgroundColor = '#f97316'; // orange
              break;
          }
        }

        return {
          style: {
            backgroundColor,
            borderRadius: '4px',
            opacity,
            color: 'white',
            border: `2px solid ${borderColor}`,
            display: 'block',
            fontWeight: event.resource.type === 'holiday' ? 'bold' : 'normal',
          },
        };
      };

      const handleSelectSlot = ({ start }: { start: Date }) => {
        const selectedDateStr = format(start, 'yyyy-MM-dd');
        const ordersForDay = events.filter(event =>
          format(event.start, 'yyyy-MM-dd') === selectedDateStr &&
          event.resource.type === 'order' // Filtrer uniquement les commandes, pas les jours fériés
        );
        setSelectedDate(start);
        setDayOrders(ordersForDay);
      };

      const handleNavigate = (newDate: Date) => {
        setCurrentDate(newDate);
      };

      const goToToday = () => {
        setCurrentDate(new Date());
      };

      const goToPrevious = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentDate(newDate);
      };

      const goToNext = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentDate(newDate);
      };

      const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(parseInt(event.target.value));
        setCurrentDate(newDate);
      };

      const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newDate = new Date(currentDate);
        newDate.setFullYear(parseInt(event.target.value));
        setCurrentDate(newDate);
      };

      const handleOrderClick = async (eventId: string, orderId?: string) => {
        if (eventId.startsWith('holiday-')) return; // Ignore les jours fériés
        if (!orderId) return; // Pas d'ID de commande

        setLoadingOrderDetails(true);
        try {
          const { data, error } = await supabase
            .from('commandes')
            .select(`
              *,
              commande_items (
                quantity,
                unit_price,
                total_price,
                produit_nom,
                pickup_date
              )
            `)
            .eq('id', orderId)
            .single();

          if (error) throw error;
          setSelectedOrder(data);
        } catch (error) {
          console.error('Error fetching order details:', error);
        } finally {
          setLoadingOrderDetails(false);
        }
      };

      const messages = {
        allDay: 'Toute la journée',
        previous: 'Précédent',
        next: 'Suivant',
        today: 'Aujourd\'hui',
        month: 'Mois',
        week: 'Semaine',
        day: 'Jour',
        agenda: 'Agenda',
        date: 'Date',
        time: 'Heure',
        event: 'Événement',
        noEventsInRange: 'Aucun événement dans cette période.',
        showMore: (total: number) => `+ ${total} de plus`,
      };

      if (loading) {
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-zinc-600">Chargement du calendrier...</p>
          </div>
        );
      }

      // Préparer les données du calendrier pour l'export
      const prepareCalendarDataForExport = () => {
        return events.map(event => ({
          'Date': format(event.start, 'dd/MM/yyyy', { locale: fr }),
          'Type': event.resource.type === 'holiday' ? 'Jour férié' : 'Commande',
          'Titre': event.title,
          'Client': event.resource.type === 'order' ? event.resource.client : '',
          'Statut': event.resource.type === 'order' ? (event.resource.status || 'N/A') : '',
          'Total': event.resource.type === 'order' ? `${event.resource.total}€` : '',
          'Nom du jour férié': event.resource.holidayName || ''
        }));
      };

      return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-800">Calendrier des Retraits</h2>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showHolidays}
                  onChange={(e) => setShowHolidays(e.target.checked)}
                  className="w-4 h-4 text-red-600 bg-zinc-100 border-zinc-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-zinc-700">🇫🇷 Afficher jours fériés</span>
              </label>
              <ExportButton 
                data={prepareCalendarDataForExport()}
                filename="calendrier-retraits"
                disabled={loading || events.length === 0}
              />
            </div>
          </div>

          {/* Navigation personnalisée */}
          <div className="bg-white border border-zinc-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={goToPrevious}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  ← Mois précédent
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={goToNext}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Mois suivant →
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={currentDate.getMonth()}
                  onChange={handleMonthChange}
                  className="px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>
                      {format(new Date(2024, i, 1), 'MMMM', { locale: fr })}
                    </option>
                  ))}
                </select>
                <select
                  value={currentDate.getFullYear()}
                  onChange={handleYearChange}
                  className="px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {Array.from({ length: 11 }, (_, i) => (
                    <option key={i} value={2020 + i}>
                      {2020 + i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-zinc-200 rounded-lg p-4">
                <Calendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 600 }}
                  eventPropGetter={eventStyleGetter}
                  onSelectSlot={handleSelectSlot}
                  onNavigate={handleNavigate}
                  date={currentDate}
                  selectable
                  messages={messages}
                  culture="fr"
                  views={['month', 'week', 'day']}
                  defaultView="month"
                  step={60}
                  showMultiDayTimes
                  max={new Date(2030, 11, 31)}
                  min={new Date(2020, 0, 1)}
                />
              </div>

              {/* Legend */}
              <div className="mt-4 bg-white border border-zinc-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-zinc-800 mb-3">Légende</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-blue-800">
                      ℹ️ <strong>Important :</strong> Les commandes mixtes apparaissent à plusieurs dates :
                      une fois pour les articles disponibles immédiatement et une fois à la date de retrait des précommandes.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-700 mb-2">Type d'article :</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">✓</span>
                        <span className="text-sm">Articles disponibles immédiatement</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base">📅</span>
                        <span className="text-sm">Articles en précommande</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-700 mb-2">Statut de commande :</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm">Payée / Prête</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span className="text-sm">En attente</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        <span className="text-sm">En préparation</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm">Récupérée</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-orange-500 rounded"></div>
                        <span className="text-sm">Remboursée</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span className="text-sm">Annulée</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-700 mb-2">Jours spéciaux :</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-600 rounded border-2 border-red-800"></div>
                      <span className="text-sm">🇫🇷 Jours fériés</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Day Details */}
            <div>
              <div className="bg-white border border-zinc-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-zinc-800">
                    {selectedDate
                      ? `Retraits du ${format(selectedDate, 'dd/MM/yyyy', { locale: fr })}`
                      : 'Sélectionnez une date'
                    }
                  </h3>
                  {dayOrders.length > 0 && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                      {dayOrders.length} retrait{dayOrders.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {dayOrders.length > 0 ? (
                  <div className="space-y-3">
                    {dayOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border-2 border-zinc-200 rounded-lg overflow-hidden hover:border-purple-300 transition-colors"
                      >
                        {/* En-tête du retrait */}
                        <div
                          className="bg-zinc-50 p-3 cursor-pointer hover:bg-zinc-100"
                          onClick={() => handleOrderClick(order.id, order.resource.orderId)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-zinc-900 flex items-center gap-2">
                                {order.resource.isPreorder ? '📅' : '✓'}
                                {order.resource.client}
                              </div>
                              <div className="text-xs text-zinc-500 mt-1">
                                Commande #{order.resource.orderId?.substring(0, 8)}... • {order.resource.status}
                              </div>
                            </div>
                            <div className="text-xs text-purple-600 hover:text-purple-800">
                              👁️ Voir commande complète
                            </div>
                          </div>
                        </div>

                        {/* Liste des articles à retirer ce jour */}
                        <div className="p-3 bg-white">
                          <div className="text-xs font-medium text-zinc-600 mb-2 uppercase tracking-wide">
                            {order.resource.isPreorder ? '📅 Précommandes à préparer' : '✓ Articles disponibles'}
                          </div>
                          {order.resource.items && order.resource.items.length > 0 ? (
                            <div className="space-y-1.5">
                              {order.resource.items.map((item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-sm bg-zinc-50 rounded px-2 py-1.5"
                                >
                                  <span className="text-zinc-700">{item.produit_nom}</span>
                                  <span className="font-semibold text-zinc-900 ml-2">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-400">Aucun article</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedDate ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="text-zinc-500">Aucun retrait prévu ce jour.</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-zinc-500">Cliquez sur une date pour voir les retraits.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

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
        </div>
      );
    };

    export default AdminCalendar;