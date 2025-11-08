import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Video, Phone, Calendar, Clock, Send, MessageSquare, X } from 'lucide-react';
import { supabase } from '../supabase/client';
import { toast } from 'react-toastify';

interface AdminAvailability {
  is_available: boolean;
  status_message: string;
}

const VideoCallRequest: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isDirectCall, setIsDirectCall] = useState(true); // true = appel direct, false = rendez-vous
  const [availability, setAvailability] = useState<AdminAvailability | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  const [duration, setDuration] = useState(15);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_availability')
        .select('is_available, status_message')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching availability:', error);
      } else if (data) {
        setAvailability(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName || !clientEmail) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!isDirectCall && (!appointmentDate || !appointmentTime)) {
      toast.error('Veuillez sélectionner une date et heure');
      return;
    }

    setSubmitting(true);

    try {
      const appointmentDateTime = isDirectCall
        ? new Date().toISOString()
        : new Date(`${appointmentDate}T${appointmentTime}`).toISOString();

      const { error } = await supabase
        .from('video_call_appointments')
        .insert({
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          appointment_date: appointmentDateTime,
          duration_minutes: duration,
          call_type: callType,
          reason: reason,
          status: isDirectCall ? 'confirmed' : 'pending'
        });

      if (error) throw error;

      toast.success(
        isDirectCall
          ? 'Demande d\'appel envoyée ! Un administrateur va vous rejoindre.'
          : 'Rendez-vous enregistré ! Vous recevrez une confirmation par email.'
      );

      // Reset form
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setAppointmentDate('');
      setAppointmentTime('');
      setCallType('video');
      setDuration(15);
      setReason('');
      setShowModal(false);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setSubmitting(false);
    }
  };

  const content = loading ? (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      <div className="bg-white rounded-full p-4 shadow-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
      </div>
    </div>
  ) : (
    <>
      {/* Bouton flottant */}
      <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999 }}>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3 hover:scale-105"
          title="Appeler ou prendre rendez-vous"
        >
          <div className="relative">
            <Video className="w-6 h-6" />
            {availability?.is_available && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </div>
          <div className="text-left">
            <div className="font-semibold">Discuter avec nous</div>
            <div className="text-xs text-white/90">
              {availability?.is_available ? 'Disponible maintenant !' : 'Prendre rendez-vous'}
            </div>
          </div>
        </button>

        {availability?.is_available && availability?.status_message && (
          <div className="mt-2 bg-white rounded-lg shadow-lg p-3 max-w-xs">
            <p className="text-sm text-zinc-700">{availability.status_message}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-zinc-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Video className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-zinc-800">Contact Vidéo/Audio</h2>
                    <p className="text-sm text-zinc-600">
                      {availability?.is_available ? 'Disponible maintenant' : 'Prendre rendez-vous'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200">
              <button
                onClick={() => setIsDirectCall(true)}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  isDirectCall
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <Phone className="w-4 h-4 inline mr-2" />
                Appel Direct
              </button>
              <button
                onClick={() => setIsDirectCall(false)}
                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                  !isDirectCall
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Rendez-vous
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Info message */}
              {isDirectCall && availability?.is_available && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Un administrateur est disponible et va vous rejoindre dans quelques instants !
                  </p>
                </div>
              )}

              {isDirectCall && !availability?.is_available && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    ⚠️ Aucun administrateur n'est disponible actuellement. Choisissez "Rendez-vous" pour programmer un appel.
                  </p>
                </div>
              )}

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Votre nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Votre email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Votre téléphone (optionnel)
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Date et heure (seulement pour rendez-vous) */}
              {!isDirectCall && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required={!isDirectCall}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Heure <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required={!isDirectCall}
                    />
                  </div>
                </div>
              )}

              {/* Type d'appel */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  Type d'appel
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCallType('video')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      callType === 'video'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <Video className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Vidéo</div>
                    <div className="text-xs text-zinc-500 mt-1">Avec audio</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCallType('audio')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      callType === 'audio'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <Phone className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Audio seul</div>
                    <div className="text-xs text-zinc-500 mt-1">Sans vidéo</div>
                  </button>
                </div>
              </div>

              {/* Durée */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Durée estimée
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 heure</option>
                </select>
              </div>

              {/* Raison */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Motif de l'appel (optionnel)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Ex: Questions sur les produits, discuter, etc."
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || (isDirectCall && !availability?.is_available)}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {isDirectCall ? 'Demander l\'appel' : 'Réserver'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default VideoCallRequest;
