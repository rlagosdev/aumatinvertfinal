import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

export interface InstagramSettings {
  isEnabled: boolean;
  postUrl: string;
  embedCode: string;
}

const defaultSettings: InstagramSettings = {
  isEnabled: false,
  postUrl: '',
  embedCode: ''
};

export const useInstagramSettings = () => {
  const [settings, setSettings] = useState<InstagramSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('setting_key', ['instagram_enabled', 'instagram_post_url', 'instagram_embed_code']);

      if (error) {
        console.warn('Could not fetch Instagram settings from database, using defaults');
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const newSettings = { ...defaultSettings };

        console.log('🔵 Instagram Settings - Raw data from DB:', data);

        data.forEach(setting => {
          switch (setting.setting_key) {
            case 'instagram_enabled':
              newSettings.isEnabled = setting.setting_value === 'true';
              console.log('🔵 instagram_enabled:', setting.setting_value, '→', newSettings.isEnabled);
              break;
            case 'instagram_post_url':
              newSettings.postUrl = setting.setting_value || '';
              console.log('🔵 instagram_post_url:', setting.setting_value);
              break;
            case 'instagram_embed_code':
              newSettings.embedCode = setting.setting_value || '';
              console.log('🔵 instagram_embed_code:', setting.setting_value ? 'Present' : 'Empty');
              break;
          }
        });

        console.log('🔵 Final settings:', newSettings);
        setSettings(newSettings);
      } else {
        console.log('🔴 No Instagram settings found in database');
      }
    } catch (error) {
      console.warn('Error fetching Instagram settings:', error);
      setError('Erreur lors du chargement des paramètres Instagram');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const generateEmbedCode = useCallback((postUrl: string): string => {
    if (!postUrl) return '';

    // Extraire l'ID de la publication depuis l'URL Instagram
    const regex = /instagram\.com\/(p|reel|stories)\/([A-Za-z0-9_-]+)/;
    const match = postUrl.match(regex);

    if (!match) return '';

    const postType = match[1];

    // Utiliser la méthode blockquote officielle d'Instagram qui fonctionne mieux
    // Le script Instagram transformera automatiquement le blockquote en iframe interactive
    if (postType === 'stories') {
      return `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${postUrl}" data-instgrm-version="14" style="max-width:540px; min-width:326px; width:100%;"></blockquote>`;
    } else {
      // Pour les posts et reels
      return `<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-permalink="${postUrl}" data-instgrm-version="14" style="max-width:540px; min-width:326px; width:100%;"></blockquote>`;
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: InstagramSettings) => {
    try {
      setLoading(true);
      setError(null);

      // Si un embedCode est fourni, l'utiliser directement
      // Sinon, générer automatiquement depuis l'URL
      let embedCode = newSettings.embedCode;
      if (!embedCode && newSettings.postUrl) {
        embedCode = generateEmbedCode(newSettings.postUrl);
      }

      const settingsToSave = [
        {
          setting_key: 'instagram_enabled',
          setting_value: newSettings.isEnabled.toString(),
          setting_type: 'string',
          description: 'Affichage de la publication Instagram sur la page d\'accueil'
        },
        {
          setting_key: 'instagram_post_url',
          setting_value: newSettings.postUrl || '',
          setting_type: 'string',
          description: 'URL de la publication Instagram à afficher'
        },
        {
          setting_key: 'instagram_embed_code',
          setting_value: embedCode || '',
          setting_type: 'string',
          description: 'Code d\'intégration généré pour la publication Instagram'
        }
      ];

      // Utiliser upsert au lieu de delete + insert
      console.log('🟢 Saving Instagram settings:', settingsToSave);
      console.log('🟢 Embed code preview:', embedCode ? embedCode.substring(0, 100) + '...' : 'EMPTY');

      const { error: upsertError } = await supabase
        .from('site_settings')
        .upsert(settingsToSave, {
          onConflict: 'setting_key',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('🔴 Error upserting settings:', upsertError);
        throw upsertError;
      }

      console.log('✅ Instagram settings saved successfully');

      // Mettre à jour l'état local
      const updatedSettings = {
        ...newSettings,
        embedCode
      };

      setSettings(updatedSettings);

      // Recharger les paramètres pour s'assurer de la cohérence
      await fetchSettings();

      return true;
    } catch (error) {
      console.error('Error saving Instagram settings:', error);
      setError('Erreur lors de la sauvegarde des paramètres Instagram');
      return false;
    } finally {
      setLoading(false);
    }
  }, [generateEmbedCode, fetchSettings]);

  const validateInstagramUrl = useCallback((url: string): boolean => {
    if (!url) return false;
    const regex = /^https:\/\/(www\.)?instagram\.com\/(p|reel|stories)\/[A-Za-z0-9_-]+/;
    return regex.test(url);
  }, []);

  return {
    settings,
    loading,
    error,
    saveSettings,
    validateInstagramUrl,
    generateEmbedCode,
    fetchSettings
  };
};