import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

interface SiteTheme {
  color_primary: string;
  color_background: string;
  color_text_dark: string;
  color_text_light: string;
  color_buttons: string;
  color_company_title: string;
  color_slot_occupied: string;
  color_slot_available: string;
}

const defaultTheme: SiteTheme = {
  color_primary: '#9333ea',        // purple-600 from current site
  color_background: '#ffffff',     // white
  color_text_dark: '#374151',      // gray-700
  color_text_light: '#ffffff',     // white
  color_buttons: '#a855f7',        // purple-500 from current site
  color_company_title: '#1f2937',  // gray-800
  color_slot_occupied: '#fca5a5',  // red-300
  color_slot_available: '#93c5fd', // blue-300
};

export const useSiteTheme = () => {
  const [theme, setTheme] = useState<SiteTheme>(defaultTheme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .eq('setting_type', 'color');

      if (error) {
        console.warn('Table site_settings not found, using default theme');
        setTheme(defaultTheme);
        setLoading(false);
        return;
      }

      const customTheme: Partial<SiteTheme> = {};
      
      data?.forEach(setting => {
        if (setting.setting_key in defaultTheme) {
          customTheme[setting.setting_key as keyof SiteTheme] = setting.setting_value;
        }
      });

      setTheme(prev => ({ ...prev, ...customTheme }));
    } catch (error) {
      console.warn('Error fetching theme, using default:', error);
      // Utiliser le thème par défaut en cas d'erreur
      setTheme(defaultTheme);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = () => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      const cssVar = `--${key.replace('color_', '')}`;
      root.style.setProperty(cssVar, value);
    });
  };

  useEffect(() => {
    if (!loading) {
      applyTheme();
    }
  }, [theme, loading]);

  return {
    theme,
    loading,
    applyTheme,
    refetchTheme: fetchTheme
  };
};

export default useSiteTheme;