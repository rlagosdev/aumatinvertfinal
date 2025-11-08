import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../supabase/client';
import { Users, Mail, Phone, ShoppingBag, Calendar, Search, Filter, Edit, Trash2, Plus, Tag, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';

interface Contact {
  id: string;
  nom: string | null;
  prenom: string | null;
  email: string;
  telephone: string | null;
  adresse: string | null;
  type_contact: 'client' | 'prospect';
  nombre_commandes: number;
  total_achats: number;
  derniere_commande: string | null;
  date_premier_contact: string;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
}

const AdminCRM: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'tous' | 'client' | 'prospect'>('tous');
  const [sortBy, setSortBy] = useState<'nom' | 'date' | 'commandes' | 'montant'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Erreur lors du chargement des contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) return;

    try {
      const { error } = await supabase
        .from('crm_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      setContacts(contacts.filter(c => c.id !== contactId));
      toast.success('Contact supprimé avec succès');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Erreur lors de la suppression du contact');
    }
  };

  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      const matchesSearch =
        (contact.nom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.prenom?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.telephone?.includes(searchTerm));

      const matchesType = filterType === 'tous' || contact.type_contact === filterType;

      return matchesSearch && matchesType;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'nom':
          aValue = (a.nom || a.email).toLowerCase();
          bValue = (b.nom || b.email).toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case 'commandes':
          aValue = a.nombre_commandes;
          bValue = b.nombre_commandes;
          break;
        case 'montant':
          aValue = a.total_achats;
          bValue = b.total_achats;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [contacts, searchTerm, filterType, sortBy, sortOrder]);

  // Statistiques
  const stats = useMemo(() => {
    const clients = contacts.filter(c => c.type_contact === 'client');
    const prospects = contacts.filter(c => c.type_contact === 'prospect');
    const totalRevenue = contacts.reduce((sum, c) => sum + (c.total_achats || 0), 0);
    const totalOrders = contacts.reduce((sum, c) => sum + (c.nombre_commandes || 0), 0);

    return {
      totalContacts: contacts.length,
      clients: clients.length,
      prospects: prospects.length,
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  }, [contacts]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-site-primary mx-auto"></div>
        <p className="mt-4 text-zinc-600">Chargement des contacts...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-zinc-800">CRM - Gestion des Contacts</h2>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600">Total Contacts</p>
              <p className="text-2xl font-bold text-zinc-800">{stats.totalContacts}</p>
            </div>
            <Users className="h-8 w-8 text-site-primary" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600">Clients</p>
              <p className="text-2xl font-bold text-green-600">{stats.clients}</p>
              <p className="text-xs text-zinc-500">{stats.prospects} prospects</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600">Commandes Totales</p>
              <p className="text-2xl font-bold text-zinc-800">{stats.totalOrders}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-zinc-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-600">Chiffre d'Affaires</p>
              <p className="text-2xl font-bold text-zinc-800">{stats.totalRevenue.toFixed(2)} €</p>
              <p className="text-xs text-zinc-500">Panier moyen: {stats.averageOrderValue.toFixed(2)} €</p>
            </div>
            <TrendingUp className="h-8 w-8 text-site-buttons" />
          </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
            />
          </div>

          {/* Filtre par type */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent bg-white"
            >
              <option value="tous">Tous les contacts</option>
              <option value="client">Clients</option>
              <option value="prospect">Prospects</option>
            </select>
          </div>

          {/* Trier par */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent bg-white"
          >
            <option value="date">Trier par date</option>
            <option value="nom">Trier par nom</option>
            <option value="commandes">Trier par commandes</option>
            <option value="montant">Trier par montant</option>
          </select>

          {/* Ordre */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent bg-white"
          >
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>
        </div>
      </div>

      {/* Table des contacts */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Email / Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Commandes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Total Achats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Dernière Activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-200">
              {filteredAndSortedContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-site-primary to-site-buttons rounded-full flex items-center justify-center text-white font-bold">
                        {contact.prenom?.[0] || contact.nom?.[0] || contact.email[0].toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-zinc-900">
                          {contact.prenom} {contact.nom || 'Sans nom'}
                        </div>
                        <div className="text-sm text-zinc-500">
                          Depuis le {formatDate(contact.date_premier_contact)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-zinc-900">
                      <div className="flex items-center mb-1">
                        <Mail className="h-3 w-3 mr-1 text-zinc-400" />
                        {contact.email}
                      </div>
                      {contact.telephone && (
                        <div className="flex items-center text-zinc-500">
                          <Phone className="h-3 w-3 mr-1 text-zinc-400" />
                          {contact.telephone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      contact.type_contact === 'client'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {contact.type_contact === 'client' ? '👤 Client' : '🎯 Prospect'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                    <div className="flex items-center">
                      <ShoppingBag className="h-4 w-4 mr-1 text-zinc-400" />
                      {contact.nombre_commandes}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                    {contact.total_achats.toFixed(2)} €
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                    {contact.derniere_commande ? (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-zinc-400" />
                        {formatDate(contact.derniere_commande)}
                      </div>
                    ) : (
                      <span className="text-zinc-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredAndSortedContacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-500">
            {contacts.length === 0 ? 'Aucun contact trouvé.' : 'Aucun contact ne correspond aux critères de recherche.'}
          </p>
        </div>
      )}

      {/* Compteur */}
      {!loading && (
        <div className="mt-4 text-sm text-zinc-600">
          Affichage de {filteredAndSortedContacts.length} sur {contacts.length} contacts
        </div>
      )}
    </div>
  );
};

export default AdminCRM;
