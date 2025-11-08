import React, { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '../../supabase/client';
import { Users, Mail, Phone, ShoppingBag, Calendar, Search, Filter, Edit, Trash2, Plus, Tag, TrendingUp, Download, Upload } from 'lucide-react';
import { toast } from 'react-toastify';

interface Contact {
  id: string;
  nom: string | null;
  prenom: string | null;
  email: string;
  telephone: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  type_contact: 'client' | 'prospect';
  nombre_commandes: number;
  total_achats: number;
  derniere_commande: string | null;
  date_premier_contact: string;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
}

interface ContactFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  code_postal: string;
  ville: string;
  type_contact: 'client' | 'prospect';
  notes: string;
}

const AdminCRM: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'tous' | 'client' | 'prospect'>('tous');
  const [sortBy, setSortBy] = useState<'nom' | 'date' | 'commandes' | 'montant'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactOrders, setContactOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ContactFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    code_postal: '',
    ville: '',
    type_contact: 'prospect',
    notes: ''
  });

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

  const fetchContactOrders = async (email: string) => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('commandes')
        .select('*')
        .eq('customer_email', email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContactOrders(data || []);
    } catch (error) {
      console.error('Error fetching contact orders:', error);
      setContactOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOpenModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        nom: contact.nom || '',
        prenom: contact.prenom || '',
        email: contact.email,
        telephone: contact.telephone || '',
        adresse: contact.adresse || '',
        code_postal: contact.code_postal || '',
        ville: contact.ville || '',
        type_contact: contact.type_contact,
        notes: contact.notes || ''
      });
      // Charger l'historique des commandes
      fetchContactOrders(contact.email);
    } else {
      setEditingContact(null);
      setContactOrders([]);
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        code_postal: '',
        ville: '',
        type_contact: 'prospect',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContact(null);
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      code_postal: '',
      ville: '',
      type_contact: 'prospect',
      notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error('L\'email est obligatoire');
      return;
    }

    try {
      if (editingContact) {
        // Mise à jour d'un contact existant
        const { error } = await supabase
          .from('crm_contacts')
          .update({
            nom: formData.nom || null,
            prenom: formData.prenom || null,
            email: formData.email,
            telephone: formData.telephone || null,
            adresse: formData.adresse || null,
            code_postal: formData.code_postal || null,
            ville: formData.ville || null,
            type_contact: formData.type_contact,
            notes: formData.notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingContact.id);

        if (error) throw error;

        toast.success('Contact mis à jour avec succès');
      } else {
        // Création d'un nouveau contact
        const { error } = await supabase
          .from('crm_contacts')
          .insert([{
            nom: formData.nom || null,
            prenom: formData.prenom || null,
            email: formData.email,
            telephone: formData.telephone || null,
            adresse: formData.adresse || null,
            code_postal: formData.code_postal || null,
            ville: formData.ville || null,
            type_contact: formData.type_contact,
            notes: formData.notes || null,
            nombre_commandes: 0,
            total_achats: 0,
            date_premier_contact: new Date().toISOString()
          }]);

        if (error) throw error;

        toast.success('Contact créé avec succès');
      }

      fetchContacts();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving contact:', error);
      if (error?.code === '23505') {
        toast.error('Un contact avec cet email existe déjà');
      } else {
        toast.error('Erreur lors de l\'enregistrement du contact');
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredAndSortedContacts.length === 0) {
      toast.error('Aucun contact à exporter');
      return;
    }

    // Créer le contenu CSV
    const headers = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Adresse', 'Code Postal', 'Ville', 'Type', 'Nombre de commandes', 'Total achats', 'Dernière commande', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredAndSortedContacts.map(contact => [
        contact.prenom || '',
        contact.nom || '',
        contact.email,
        contact.telephone || '',
        contact.adresse ? `"${contact.adresse.replace(/"/g, '""')}"` : '',
        contact.code_postal || '',
        contact.ville || '',
        contact.type_contact,
        contact.nombre_commandes,
        contact.total_achats.toFixed(2),
        contact.derniere_commande ? new Date(contact.derniere_commande).toLocaleDateString('fr-FR') : '',
        contact.notes ? `"${contact.notes.replace(/"/g, '""')}"` : ''
      ].join(','))
    ].join('\n');

    // Créer le fichier et télécharger
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `contacts_crm_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${filteredAndSortedContacts.length} contacts exportés avec succès`);
  };

  // Import CSV
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        toast.error('Le fichier CSV est vide');
        return;
      }

      // Ignorer la ligne d'en-tête
      const dataLines = lines.slice(1);
      let imported = 0;
      let errors = 0;

      for (const line of dataLines) {
        // Parser la ligne CSV en tenant compte des guillemets
        const values: string[] = [];
        let currentValue = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim());

        const [prenom, nom, email, telephone, adresse, code_postal, ville, type_contact, , , , notes] = values;

        if (!email || !email.includes('@')) {
          errors++;
          continue;
        }

        try {
          const { error } = await supabase
            .from('crm_contacts')
            .insert([{
              prenom: prenom || null,
              nom: nom || null,
              email: email.trim(),
              telephone: telephone || null,
              adresse: adresse?.replace(/^"|"$/g, '').replace(/""/g, '"') || null,
              code_postal: code_postal || null,
              ville: ville || null,
              type_contact: (type_contact === 'client' || type_contact === 'prospect') ? type_contact : 'prospect',
              notes: notes?.replace(/^"|"$/g, '').replace(/""/g, '"') || null,
              nombre_commandes: 0,
              total_achats: 0,
              date_premier_contact: new Date().toISOString()
            }]);

          if (error && error.code !== '23505') {
            errors++;
          } else if (!error) {
            imported++;
          }
        } catch (err) {
          errors++;
        }
      }

      fetchContacts();
      toast.success(`${imported} contacts importés avec succès${errors > 0 ? ` (${errors} erreurs)` : ''}`);
      setShowImportModal(false);
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast.error('Erreur lors de l\'import du fichier CSV');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        <div className="flex items-center space-x-3">
          {/* Bouton Export CSV */}
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center space-x-2"
            title="Exporter les contacts en CSV"
          >
            <Download className="h-5 w-5" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </button>

          {/* Bouton Import CSV */}
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
            title="Importer des contacts depuis un CSV"
          >
            <Upload className="h-5 w-5" />
            <span className="hidden sm:inline">Importer CSV</span>
          </button>

          {/* Bouton Ajouter un contact */}
          <button
            onClick={() => handleOpenModal()}
            className="bg-site-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Ajouter</span>
          </button>
        </div>
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
                        onClick={() => handleOpenModal(contact)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
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

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-800">
                    {editingContact ? 'Fiche Contact' : 'Ajouter un contact'}
                  </h3>
                  {editingContact && (
                    <p className="text-sm text-zinc-500 mt-1">
                      Client depuis le {formatDate(editingContact.date_premier_contact)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Statistiques du contact (si édition) */}
              {editingContact && (
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-site-primary/10 to-site-buttons/10 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <ShoppingBag className="h-4 w-4 text-site-primary mr-1" />
                      <p className="text-2xl font-bold text-zinc-800">{editingContact.nombre_commandes}</p>
                    </div>
                    <p className="text-xs text-zinc-600">Commandes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      <p className="text-2xl font-bold text-zinc-800">{editingContact.total_achats.toFixed(2)} €</p>
                    </div>
                    <p className="text-xs text-zinc-600">Total achats</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="h-4 w-4 text-blue-600 mr-1" />
                      <p className="text-sm font-bold text-zinc-800">
                        {editingContact.derniere_commande ? formatDate(editingContact.derniere_commande) : '-'}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-600">Dernière commande</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Prénom */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                      placeholder="Jean"
                    />
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                      placeholder="Dupont"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                      placeholder="jean.dupont@example.com"
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                      placeholder="06 12 34 56 78"
                    />
                  </div>

                  {/* Type de contact */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Type de contact
                    </label>
                    <select
                      value={formData.type_contact}
                      onChange={(e) => setFormData({ ...formData, type_contact: e.target.value as 'client' | 'prospect' })}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent bg-white"
                    >
                      <option value="prospect">🎯 Prospect</option>
                      <option value="client">👤 Client</option>
                    </select>
                  </div>
                </div>

                {/* Adresse */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                    placeholder="123 Rue de la Paix"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Code postal */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={formData.code_postal}
                      onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                      placeholder="44800"
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                      placeholder="Saint-Herblain"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
                    placeholder="Notes internes sur ce contact..."
                  />
                </div>

                {/* Historique des commandes (si édition) */}
                {editingContact && (
                  <div className="mt-6 pt-6 border-t border-zinc-200">
                    <h4 className="text-lg font-semibold text-zinc-800 mb-3 flex items-center">
                      <ShoppingBag className="h-5 w-5 mr-2 text-site-primary" />
                      Historique des commandes ({contactOrders.length})
                    </h4>

                    {loadingOrders ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-site-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-zinc-500">Chargement...</p>
                      </div>
                    ) : contactOrders.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {contactOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-zinc-800">
                                  Commande #{order.order_number}
                                </p>
                                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                  order.payment_status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : order.payment_status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {order.payment_status === 'paid' ? 'Payé' : order.payment_status === 'pending' ? 'En attente' : 'Annulé'}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500 mt-1">
                                {formatDate(order.created_at)}
                                {order.pickup_date && ` • Retrait prévu: ${formatDate(order.pickup_date)}`}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm font-bold text-zinc-800">{order.total_amount.toFixed(2)} €</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 text-center py-6">Aucune commande pour ce contact</p>
                    )}
                  </div>
                )}

                {/* Boutons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-site-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    {editingContact ? 'Mettre à jour' : 'Créer le contact'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'import CSV */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-zinc-800 mb-4">Importer des contacts (CSV)</h3>

            <div className="mb-4">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-2">📋 Format du fichier CSV</p>
                <p className="text-xs text-blue-700">
                  Le fichier doit contenir les colonnes suivantes (dans cet ordre) :
                </p>
                <ul className="text-xs text-blue-700 mt-2 ml-4 list-disc">
                  <li>Prénom, Nom, Email, Téléphone, Adresse, Code Postal, Ville, Type, Nombre de commandes, Total achats, Dernière commande, Notes</li>
                </ul>
                <p className="text-xs text-blue-700 mt-2">
                  <strong>Email est obligatoire.</strong> Type = "client" ou "prospect".
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                disabled={importing}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
              />
            </div>

            {importing && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-site-primary mx-auto"></div>
                <p className="mt-2 text-sm text-zinc-600">Import en cours...</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={importing}
                className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={importing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger un exemple</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCRM;
