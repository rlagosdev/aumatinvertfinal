import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface DeliveryRate {
  id: string;
  minAmount: number;
  maxAmount: number | null;
  rate: number;
  description: string;
  order: number;
}

export const useDeliveryRates = () => {
  const [rates, setRates] = useState<DeliveryRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveryRates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les tarifs depuis site_settings
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .like('setting_key', 'delivery_rate_%')
        .order('setting_key');

      if (error) {
        console.warn('Delivery rates not found in database, using defaults');
        // Tarifs par défaut si pas en DB
        setRates([
          {
            id: 'rate_1',
            minAmount: 0,
            maxAmount: 49.99,
            rate: 7,
            description: 'Commande < 50€',
            order: 1
          },
          {
            id: 'rate_2',
            minAmount: 50,
            maxAmount: 99.99,
            rate: 3,
            description: 'Commande ≥ 50€',
            order: 2
          },
          {
            id: 'rate_3',
            minAmount: 100,
            maxAmount: null,
            rate: 0,
            description: 'Commande ≥ 100€',
            order: 3
          }
        ]);
        return;
      }

      // Parser les données depuis site_settings
      const rateMap = new Map<string, Partial<DeliveryRate>>();

      data?.forEach((setting) => {
        const match = setting.setting_key.match(/delivery_rate_(\d+)_(.+)/);
        if (match) {
          const [, rateIndex, property] = match;
          const rateId = `rate_${rateIndex}`;
          
          if (!rateMap.has(rateId)) {
            rateMap.set(rateId, { id: rateId, order: parseInt(rateIndex) });
          }
          
          const rate = rateMap.get(rateId)!;
          
          switch (property) {
            case 'min_amount':
              rate.minAmount = parseFloat(setting.setting_value || '0');
              break;
            case 'max_amount':
              rate.maxAmount = setting.setting_value === 'null' || !setting.setting_value 
                ? null 
                : parseFloat(setting.setting_value);
              break;
            case 'rate':
              rate.rate = parseFloat(setting.setting_value || '0');
              break;
            case 'description':
              rate.description = setting.setting_value || '';
              break;
          }
        }
      });

      // Convertir en array et filtrer les tarifs valides
      const validRates = Array.from(rateMap.values())
        .filter(rate => 
          rate.minAmount !== undefined && 
          rate.rate !== undefined && 
          rate.description
        )
        .sort((a, b) => a.order - b.order) as DeliveryRate[];

      if (validRates.length === 0) {
        // Fallback vers les tarifs par défaut
        setRates([
          {
            id: 'rate_1',
            minAmount: 0,
            maxAmount: 49.99,
            rate: 7,
            description: 'Commande < 50€',
            order: 1
          },
          {
            id: 'rate_2',
            minAmount: 50,
            maxAmount: 99.99,
            rate: 3,
            description: 'Commande ≥ 50€',
            order: 2
          },
          {
            id: 'rate_3',
            minAmount: 100,
            maxAmount: null,
            rate: 0,
            description: 'Commande ≥ 100€',
            order: 3
          }
        ]);
      } else {
        setRates(validRates);
      }

    } catch (err) {
      console.error('Error fetching delivery rates:', err);
      setError('Erreur lors du chargement des tarifs de livraison');
      
      // Fallback vers les tarifs par défaut en cas d'erreur
      setRates([
        {
          id: 'rate_1',
          minAmount: 0,
          maxAmount: 49.99,
          rate: 7,
          description: 'Commande < 50€',
          order: 1
        },
        {
          id: 'rate_2',
          minAmount: 50,
          maxAmount: 99.99,
          rate: 3,
          description: 'Commande ≥ 50€',
          order: 2
        },
        {
          id: 'rate_3',
          minAmount: 100,
          maxAmount: null,
          rate: 0,
          description: 'Commande ≥ 100€',
          order: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryRates();
  }, []);

  // Fonction pour calculer le tarif de livraison selon le montant
  const calculateDeliveryRate = (orderAmount: number): DeliveryRate | null => {
    return rates.find(rate => {
      const minMatch = orderAmount >= rate.minAmount;
      const maxMatch = rate.maxAmount === null || orderAmount <= rate.maxAmount;
      return minMatch && maxMatch;
    }) || null;
  };

  // Fonction pour formater l'affichage du tarif
  const formatRateDisplay = (rate: DeliveryRate): string => {
    if (rate.rate === 0) {
      return `${rate.description} : Gratuit`;
    }
    return `${rate.description} : ${rate.rate}€`;
  };

  return {
    rates,
    loading,
    error,
    calculateDeliveryRate,
    formatRateDisplay,
    refetch: fetchDeliveryRates
  };
};