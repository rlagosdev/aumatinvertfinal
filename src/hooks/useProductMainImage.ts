import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

interface ProductMedia {
  id: string;
  media_type: 'image' | 'video';
  media_url: string;
  media_order: number;
  alt_text: string | null;
}

export const useProductMainImage = (productId: string, fallbackUrl: string | null) => {
  const [imageUrl, setImageUrl] = useState<string>(fallbackUrl || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMainImage = async () => {
      try {
        // Check if this is a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId);

        if (!isUUID) {
          // For demo products, use fallback
          setImageUrl(fallbackUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop');
          setLoading(false);
          return;
        }

        // Fetch first image from product_media
        const { data, error } = await supabase
          .from('product_media')
          .select('*')
          .eq('product_id', productId)
          .eq('media_type', 'image')
          .order('media_order', { ascending: true })
          .limit(1)
          .single();

        if (error) {
          // No media found, use fallback
          setImageUrl(fallbackUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop');
        } else if (data) {
          setImageUrl(data.media_url);
        }
      } catch (error) {
        console.error('Error fetching product main image:', error);
        setImageUrl(fallbackUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop');
      } finally {
        setLoading(false);
      }
    };

    fetchMainImage();
  }, [productId, fallbackUrl]);

  return { imageUrl, loading };
};
