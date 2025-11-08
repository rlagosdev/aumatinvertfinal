import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { Settings, Store, AlertCircle, CheckCircle2, Bot, Sparkles } from 'lucide-react';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: boolean;
  description: string;
  updated_at: string;
}

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_key');

      if (error) throw error;

      setSettings(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des paramètres:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (settingKey: string, currentValue: boolean) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('site_settings')
        .update({
          setting_value: !currentValue,
          updated_at: new Date().toISOString()
        })
        .eq('setting_key', settingKey);

      if (error) throw error;

      // Mettre à jour l'état local
      setSettings(prev =>
        prev.map(s =>
          s.setting_key === settingKey
            ? { ...s, setting_value: !currentValue }
            : s
        )
      );

      setMessage({
        type: 'success',
        text: `Paramètre ${settingKey} ${!currentValue ? 'activé' : 'désactivé'} avec succès`
      });

      // Effacer le message après 3 secondes
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const getSettingIcon = (key: string) => {
    switch (key) {
      case 'shop_enabled':
        return <Store className="w-5 h-5" />;
      case 'chatbot_client_enabled':
        return <Bot className="w-5 h-5" />;
      case 'chatbot_admin_enabled':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getSettingLabel = (key: string) => {
    switch (key) {
      case 'shop_enabled':
        return 'Activer la boutique';
      case 'chatbot_client_enabled':
        return 'Assistant Client (Pour les visiteurs)';
      case 'chatbot_admin_enabled':
        return 'Assistant Admin (Pour les administrateurs)';
      default:
        return key;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paramètres du site</h2>
          <p className="text-sm text-gray-600 mt-1">
            Gérez les fonctionnalités disponibles pour vos clients
          </p>
        </div>
        <Settings className="w-8 h-8 text-green-600" />
      </div>

      {/* Message de succès/erreur */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Liste des paramètres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {settings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Aucun paramètre disponible</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-lg text-green-600">
                    {getSettingIcon(setting.setting_key)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getSettingLabel(setting.setting_key)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {setting.description}
                    </p>
                    {setting.updated_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Dernière modification : {new Date(setting.updated_at).toLocaleString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => toggleSetting(setting.setting_key, setting.setting_value)}
                  disabled={saving}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    setting.setting_value ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      setting.setting_value ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">À propos de ces paramètres</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Activer la boutique :</strong> Permet aux clients d'accéder à la page de la boutique et de passer des commandes.
                Quand désactivé, la page boutique sera inaccessible côté client.
              </li>
              <li>
                <strong>Assistant Client :</strong> Active l'assistant AI pour les visiteurs du site. Il aide avec les produits bio,
                conseils nutritionnels et questions sur l'épicerie.
              </li>
              <li>
                <strong>Assistant Admin :</strong> Active l'assistant AI pour les administrateurs uniquement. Il aide avec la gestion
                de l'application, le marketing et les questions business.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
