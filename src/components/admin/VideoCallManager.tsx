import React, { useState, useEffect } from 'react';
import { Video, Phone, Calendar, CheckCircle, XCircle, Clock, User, Mail, MessageSquare, Edit2, Trash2, PhoneCall } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import VideoCallRoom from '../VideoCallRoom';

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  appointment_date: string;
  duration_minutes: number;
  call_type: 'video' | 'audio' | 'both';
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  admin_notes: string;
  created_at: string;
  room_url?: string;
  room_name?: string;
}

const VideoCallManager: React.FC = () => {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [activeCall, setActiveCall] = useState<{appointmentId: string; roomUrl: string; clientName: string} | null>(null);
  const [creatingRoom, setCreatingRoom] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAvailability();
      fetchAppointments();
    }
  }, [user]);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_availability')
        .select('*')
        .eq('admin_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching availability:', error);
      } else if (data) {
        setIsAvailable(data.is_available);
        setStatusMessage(data.status_message || '');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('video_call_appointments')
        .select('*')
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);

      // Initialiser les notes admin
      const notesMap: { [key: string]: string } = {};
      data?.forEach(apt => {
        notesMap[apt.id] = apt.admin_notes || '';
      });
      setAdminNotes(notesMap);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const newStatus = !isAvailable;

      const { data: existing } = await supabase
        .from('admin_availability')
        .select('id')
        .eq('admin_id', user?.id)
        .single();

      if (existing) {
        await supabase
          .from('admin_availability')
          .update({
            is_available: newStatus,
            status_message: statusMessage
          })
          .eq('admin_id', user?.id);
      } else {
        await supabase
          .from('admin_availability')
          .insert({
            admin_id: user?.id,
            is_available: newStatus,
            status_message: statusMessage
          });
      }

      setIsAvailable(newStatus);
      toast.success(newStatus ? 'Vous êtes maintenant disponible' : 'Vous n\'êtes plus disponible');
    } catch (error: any) {
      console.error('Error updating availability:', error);
      toast.error('Erreur lors de la mise à jour de la disponibilité');
    }
  };

  const updateStatusMessage = async () => {
    try {
      const { data: existing } = await supabase
        .from('admin_availability')
        .select('id')
        .eq('admin_id', user?.id)
        .single();

      if (existing) {
        await supabase
          .from('admin_availability')
          .update({ status_message: statusMessage })
          .eq('admin_id', user?.id);
      } else {
        await supabase
          .from('admin_availability')
          .insert({
            admin_id: user?.id,
            is_available: false,
            status_message: statusMessage
          });
      }

      toast.success('Message de statut mis à jour');
    } catch (error: any) {
      console.error('Error updating status message:', error);
      toast.error('Erreur lors de la mise à jour du message');
    }
  };

  const updateAppointmentStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      await supabase
        .from('video_call_appointments')
        .update({ status })
        .eq('id', id);

      setAppointments(prev => prev.map(apt =>
        apt.id === id ? { ...apt, status } : apt
      ));

      toast.success('Statut du rendez-vous mis à jour');
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const saveAdminNotes = async (id: string) => {
    try {
      await supabase
        .from('video_call_appointments')
        .update({ admin_notes: adminNotes[id] })
        .eq('id', id);

      setAppointments(prev => prev.map(apt =>
        apt.id === id ? { ...apt, admin_notes: adminNotes[id] } : apt
      ));

      setEditingAppointment(null);
      toast.success('Notes sauvegardées');
    } catch (error: any) {
      console.error('Error saving notes:', error);
      toast.error('Erreur lors de la sauvegarde des notes');
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) return;

    try {
      await supabase
        .from('video_call_appointments')
        .delete()
        .eq('id', id);

      setAppointments(prev => prev.filter(apt => apt.id !== id));
      toast.success('Rendez-vous supprimé');
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return 'En attente';
    }
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Phone className="w-4 h-4" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const getCallTypeLabel = (type: string) => {
    switch (type) {
      case 'video': return 'Vidéo (avec audio)';
      case 'audio': return 'Audio seul';
      default: return type;
    }
  };

  const joinCall = async (appointment: Appointment) => {
    try {
      setCreatingRoom(appointment.id);

      // Si la salle existe déjà, on la rejoint directement
      if (appointment.room_url) {
        setActiveCall({
          appointmentId: appointment.id,
          roomUrl: appointment.room_url,
          clientName: appointment.client_name
        });
        setCreatingRoom(null);
        return;
      }

      // Sinon, créer une nouvelle salle via l'Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/create-daily-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          clientName: appointment.client_name,
          callType: appointment.call_type
        })
      });

      if (!response.ok) {
        throw new Error('Impossible de créer la salle');
      }

      const { roomUrl } = await response.json();

      // Mettre à jour l'état local
      setAppointments(prev => prev.map(apt =>
        apt.id === appointment.id ? { ...apt, room_url: roomUrl } : apt
      ));

      // Rejoindre la salle
      setActiveCall({
        appointmentId: appointment.id,
        roomUrl: roomUrl,
        clientName: appointment.client_name
      });

      toast.success('Salle créée ! Rejoignez l\'appel');
    } catch (error: any) {
      console.error('Error joining call:', error);
      toast.error('Erreur lors de la création de la salle');
    } finally {
      setCreatingRoom(null);
    }
  };

  const leaveCall = () => {
    setActiveCall(null);
  };

  // Si un appel est en cours, afficher la salle vidéo
  if (activeCall) {
    return (
      <VideoCallRoom
        roomUrl={activeCall.roomUrl}
        onLeave={leaveCall}
        userName="Administrateur Au Matin Vert"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Disponibilité Admin */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${isAvailable ? 'bg-green-50' : 'bg-zinc-50'}`}>
              <Video className={`w-6 h-6 ${isAvailable ? 'text-green-600' : 'text-zinc-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-800">Disponibilité pour les appels</h2>
              <p className="text-sm text-zinc-600">Gérez votre disponibilité pour les appels directs</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={toggleAvailability}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
            <span className="ml-3 text-sm font-medium text-zinc-700">
              {isAvailable ? 'Disponible' : 'Non disponible'}
            </span>
          </label>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-zinc-700">
            Message de statut (visible pour les clients)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              placeholder="Ex: Disponible pour papoter avec les mamies 😊"
              className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={updateStatusMessage}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      {/* Liste des rendez-vous */}
      <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-50 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-800">Rendez-vous programmés</h2>
            <p className="text-sm text-zinc-600">Gérez les rendez-vous de visio/audio</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-zinc-600">Chargement...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucun rendez-vous pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-zinc-200 rounded-lg p-4 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      {getCallTypeIcon(appointment.call_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-zinc-800">{appointment.client_name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {appointment.client_email}
                        {appointment.client_phone && ` • ${appointment.client_phone}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => joinCall(appointment)}
                        disabled={creatingRoom === appointment.id}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
                        title="Rejoindre l'appel"
                      >
                        {creatingRoom === appointment.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="text-sm">Création...</span>
                          </>
                        ) : (
                          <>
                            <PhoneCall className="w-4 h-4" />
                            <span className="text-sm">Rejoindre</span>
                          </>
                        )}
                      </button>
                    )}
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Confirmer"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Annuler"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Marquer comme terminé"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteAppointment(appointment.id)}
                      className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Clock className="w-4 h-4" />
                    {new Date(appointment.appointment_date).toLocaleString('fr-FR', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Video className="w-4 h-4" />
                    {getCallTypeLabel(appointment.call_type)} • {appointment.duration_minutes} min
                  </div>
                </div>

                {appointment.reason && (
                  <div className="mb-3 p-3 bg-zinc-50 rounded-lg">
                    <p className="text-sm text-zinc-700">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      <strong>Raison:</strong> {appointment.reason}
                    </p>
                  </div>
                )}

                {/* Notes admin */}
                <div className="border-t border-zinc-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-zinc-700">Notes administratives</label>
                    {editingAppointment !== appointment.id && (
                      <button
                        onClick={() => setEditingAppointment(appointment.id)}
                        className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Modifier
                      </button>
                    )}
                  </div>

                  {editingAppointment === appointment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={adminNotes[appointment.id] || ''}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [appointment.id]: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        rows={3}
                        placeholder="Ajoutez des notes privées..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveAdminNotes(appointment.id)}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditingAppointment(null)}
                          className="px-3 py-1.5 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 text-sm"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-600 italic">
                      {appointment.admin_notes || 'Aucune note'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallManager;
