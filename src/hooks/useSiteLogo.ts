import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

interface LogoSettings {
  logo_image: string;
  logo_shape: 'circle' | 'square';
}

const CACHE_KEY = 'site_logo_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

// Fonction pour récupérer depuis le cache
const getCachedLogo = (): LogoSettings | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Vérifier si le cache est encore valide
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Error reading logo cache:', error);
  }
  return null;
};

// Fonction pour sauvegarder dans le cache
const setCachedLogo = (settings: LogoSettings) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: settings,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Error saving logo cache:', error);
  }
};

export const useSiteLogo = () => {
  // Initialiser avec le cache s'il existe
  const cachedLogo = getCachedLogo();
  const [logoSettings, setLogoSettings] = useState<LogoSettings>(
    cachedLogo || {
      logo_image: '',
      logo_shape: 'circle'
    }
  );
  const [loading, setLoading] = useState(!cachedLogo);

  useEffect(() => {
    const fetchLogoSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_key, setting_value')
          .in('setting_key', ['logo_image', 'logo_shape']);

        if (error) {
          console.warn('Could not fetch logo settings:', error);
          setLoading(false);
          return;
        }

        const settings: LogoSettings = {
          logo_image: '',
          logo_shape: 'circle'
        };

        data?.forEach(setting => {
          if (setting.setting_key === 'logo_image') {
            settings.logo_image = setting.setting_value;
          } else if (setting.setting_key === 'logo_shape') {
            settings.logo_shape = setting.setting_value as 'circle' | 'square';
          }
        });

        // Mettre à jour l'état et le cache
        setLogoSettings(settings);
        setCachedLogo(settings);
      } catch (error) {
        console.warn('Error fetching logo settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogoSettings();
  }, []);

  return { logoSettings, loading };
};
