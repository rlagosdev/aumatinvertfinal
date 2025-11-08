import React, { useState, useEffect } from 'react';
import { Mail, ExternalLink, Inbox, Send, UserCircle, Settings, Shield, AlertCircle, Save, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';

interface EmailConfig {
  roundcube_url: string;
  use_roundcube: boolean;
}

const EmailManager: React.FC = () => {
  const [config, setConfig] = useState<EmailConfig>({
    roundcube_url: 'https://aumatinvert.fr/mail/',
    use_roundcube: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const hostingerEmailUrl = 'https://mail.hostinger.com/?_task=mail&_mbox=INBOX';

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('email_config')
        .select('*')
        .single();

      if (data) {
        setConfig({
          roundcube_url: data.roundcube_url || 'https://aumatinvert.fr/mail/',
          use_roundcube: data.use_roundcube !== undefined ? data.use_roundcube : true
        });
      } else {
        // Pas de config trouvée, créer la config par défaut avec Roundcube activé
        const defaultConfig = {
          roundcube_url: 'https://aumatinvert.fr/mail/',
          use_roundcube: true
        };

        await supabase
          .from('email_config')
          .upsert({
            id: 1,
            roundcube_url: defaultConfig.roundcube_url,
            use_roundcube: defaultConfig.use_roundcube,
            updated_at: new Date().toISOString()
          });

        setConfig(defaultConfig);
      }
    } catch (err) {
      console.log('Error loading config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('email_config')
        .upsert({
          id: 1,
          roundcube_url: config.roundcube_url,
          use_roundcube: config.use_roundcube,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Configuration email enregistrée');
      setIsEditing(false);
    } catch (error: any) {
      toast.error('Erreur lors de l\'enregistrement : ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const openEmail = (section?: string) => {
    const baseUrl = config.use_roundcube && config.roundcube_url
      ? config.roundcube_url
      : hostingerEmailUrl;

    const url = section ? `${baseUrl}?_task=${section}` : baseUrl;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
          <Mail className="h-8 w-8" />
          Messagerie Email
        </h2>
        <p className="text-lg opacity-90">
          Accédez à votre messagerie professionnelle
        </p>
      </div>

      {/* Roundcube Configuration */}
      {!config.use_roundcube && (
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-800 flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Configuration
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Configurer
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={config.use_roundcube}
                    onChange={(e) => setConfig({ ...config, use_roundcube: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-zinc-700">
                    Utiliser Roundcube
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  URL de votre installation Roundcube
                </label>
                <input
                  type="url"
                  value={config.roundcube_url}
                  onChange={(e) => setConfig({ ...config, roundcube_url: e.target.value })}
                  placeholder="https://aumatinvert.fr/mail/"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={saveConfig}
                  disabled={isSaving || !config.roundcube_url}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 text-white font-medium rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    loadConfig();
                  }}
                  className="px-4 py-2 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-600">Mode actuel :</span>
                <span className="font-semibold text-zinc-800">Hostinger</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Display */}
      {config.use_roundcube && config.roundcube_url ? (
        // Roundcube iframe
        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Mail className="h-5 w-5" />
              <span className="font-semibold">Roundcube Webmail</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setConfig({ ...config, use_roundcube: false });
                  saveConfig();
                }}
                className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded transition-colors text-white"
              >
                Changer
              </button>
              <button
                onClick={() => window.location.reload()}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
          <div className="relative" style={{ height: 'calc(100vh - 320px)', minHeight: '700px' }}>
            <iframe
              src={config.roundcube_url}
              className="w-full h-full border-0"
              title="Roundcube Webmail"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
              allow="clipboard-read; clipboard-write"
            />
          </div>
        </div>
      ) : (
        // Hostinger quick access buttons
        <div className="bg-white rounded-lg border border-zinc-200 p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-4">
                <Mail className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-800 mb-2">Accéder à votre messagerie</h3>
              <p className="text-zinc-600">
                Cliquez sur le bouton ci-dessous pour ouvrir votre messagerie Hostinger
              </p>
            </div>

            <button
              onClick={() => openEmail()}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Mail className="h-5 w-5" />
              <span>Ouvrir la messagerie</span>
              <ExternalLink className="h-4 w-4" />
            </button>

            <div className="mt-6 p-4 bg-zinc-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm text-zinc-600">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Connexion sécurisée SSL/TLS</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManager;
