import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export function useShopEnabled() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkShopStatus();

    // Écouter les changements en temps réel
    const subscription = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'setting_key=eq.shop_enabled'
        },
        (payload) => {
          if (payload.new && 'setting_value' in payload.new) {
            setIsEnabled(payload.new.setting_value as boolean);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkShopStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'shop_enabled')
        .single();

      if (error) throw error;

      setIsEnabled(data?.setting_value ?? true);
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de la boutique:', error);
      // En cas d'erreur, on active par défaut
      setIsEnabled(true);
    } finally {
      setLoading(false);
    }
  };

  return { isEnabled, loading, refresh: checkShopStatus };
}
