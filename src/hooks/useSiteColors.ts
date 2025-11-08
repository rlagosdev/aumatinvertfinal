import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface SiteColors {
  primary: string;
  background: string;
  textDark: string;
  textLight: string;
  buttons: string;
  companyTitle: string;
  slotOccupied: string;
  slotAvailable: string;
}

export const useSiteColors = () => {
  const [colors, setColors] = useState<SiteColors>({
    primary: '#9333ea',
    background: '#ffffff',
    textDark: '#374151',
    textLight: '#ffffff',
    buttons: '#a855f7',
    companyTitle: '#1f2937',
    slotOccupied: '#fca5a5',
    slotAvailable: '#93c5fd',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchColors();
  }, []);

  const fetchColors = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .eq('setting_type', 'color');

      if (error) {
        console.warn('Could not fetch colors:', error);
        applyColors(colors);
        setLoading(false);
        return;
      }

      console.log('📊 Couleurs récupérées de la base:', data);

      const colorMap: Partial<SiteColors> = {};

      data?.forEach(setting => {
        const key = setting.setting_key.replace('color_', '');
        switch (key) {
          case 'primary':
            colorMap.primary = setting.setting_value;
            break;
          case 'background':
            colorMap.background = setting.setting_value;
            break;
          case 'text_dark':
            colorMap.textDark = setting.setting_value;
            break;
          case 'text_light':
            colorMap.textLight = setting.setting_value;
            break;
          case 'buttons':
            colorMap.buttons = setting.setting_value;
            break;
          case 'company_title':
            colorMap.companyTitle = setting.setting_value;
            break;
          case 'slot_occupied':
            colorMap.slotOccupied = setting.setting_value;
            break;
          case 'slot_available':
            colorMap.slotAvailable = setting.setting_value;
            break;
        }
      });

      const updatedColors = { ...colors, ...colorMap };
      console.log('🎨 Couleurs à appliquer:', updatedColors);
      setColors(updatedColors);
      applyColors(updatedColors);
    } catch (error) {
      console.warn('Error fetching colors:', error);
      applyColors(colors);
    } finally {
      setLoading(false);
    }
  };

  const applyColors = (colorScheme: SiteColors) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', colorScheme.primary);
    root.style.setProperty('--color-background', colorScheme.background);
    root.style.setProperty('--color-text-dark', colorScheme.textDark);
    root.style.setProperty('--color-text-light', colorScheme.textLight);
    root.style.setProperty('--color-buttons', colorScheme.buttons);
    root.style.setProperty('--color-company-title', colorScheme.companyTitle);
    root.style.setProperty('--color-slot-occupied', colorScheme.slotOccupied);
    root.style.setProperty('--color-slot-available', colorScheme.slotAvailable);
    console.log('✅ Variables CSS appliquées:', {
      '--color-primary': root.style.getPropertyValue('--color-primary'),
      '--color-background': root.style.getPropertyValue('--color-background'),
      '--color-text-dark': root.style.getPropertyValue('--color-text-dark'),
    });
  };

  return { colors, loading, refetch: fetchColors };
};
