import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface ProductSection {
  id: string;
  product_id: string;
  nom: string;
  description: string | null;
  fraction: number;
  prix: number;
  ordre: number;
  actif: boolean;
}

export const useProductSections = (productId: string) => {
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!productId) {
      setSections([]);
      setLoading(false);
      return;
    }

    const fetchSections = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('product_sections')
          .select('*')
          .eq('product_id', productId)
          .eq('actif', true)
          .order('ordre', { ascending: true });

        if (fetchError) throw fetchError;
        setSections(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching product sections:', err);
        setError(err as Error);
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [productId]);

  return { sections, loading, error };
};

// Fonction helper pour formater la fraction en texte lisible
export const formatFractionDisplay = (fraction: number): string => {
  if (fraction === 0.25) return '1/4';
  if (fraction === 0.5) return '1/2';
  if (fraction === 0.75) return '3/4';
  if (fraction === 1) return 'Entier';
  if (fraction === 2) return 'Double';
  return `${fraction}x`;
};
