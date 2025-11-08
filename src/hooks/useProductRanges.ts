import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface ProductRange {
  id: string;
  product_id: string;
  nom: string;
  description?: string | null;
  prix_par_personne: number;
  nb_personnes_min: number;
  nb_personnes_max: number | null;
  ordre: number;
  actif: boolean;
}

export const useProductRanges = (productId: string) => {
  const [ranges, setRanges] = useState<ProductRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!productId) {
      setRanges([]);
      setLoading(false);
      return;
    }

    const fetchRanges = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('product_ranges')
          .select('*')
          .eq('product_id', productId)
          .eq('actif', true)
          .order('ordre', { ascending: true });

        if (fetchError) throw fetchError;
        setRanges(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching product ranges:', err);
        setError(err as Error);
        setRanges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRanges();
  }, [productId]);

  return { ranges, loading, error };
};
