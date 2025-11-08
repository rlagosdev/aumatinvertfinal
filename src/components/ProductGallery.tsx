import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { supabase } from '../supabase/client';

interface ProductMedia {
  id: string;
  media_type: 'image' | 'video';
  media_url: string;
  media_order: number;
  alt_text: string | null;
  created_at?: string | null;
  product_id?: string;
  updated_at?: string | null;
}

interface ProductGalleryProps {
  productId: string;
  fallbackImageUrl?: string | null;
  productName: string;
  className?: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  productId,
  fallbackImageUrl,
  productName,
  className = "aspect-square"
}) => {
  const [media, setMedia] = useState<ProductMedia[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedia();
  }, [productId]);

  const fetchMedia = async () => {
    try {
      // Check if this is a demo product (simple number ID) and skip database query
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId);
      
      if (!isUUID) {
        // For demo products with simple IDs, don't query the database
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('product_media')
        .select('*')
        .eq('product_id', productId)
        .order('media_order', { ascending: true });

      if (error) throw error;
      
      let mediaData = data || [];
      
      // Convertir les types de média
      let typedMediaData = (mediaData || []).map(item => ({
        ...item,
        media_type: item.media_type as 'image' | 'video'
      }));
      
      // Si pas de médias et qu'on a une image de fallback, l'ajouter
      if (typedMediaData.length === 0 && fallbackImageUrl) {
        typedMediaData = [{
          id: 'fallback',
          media_type: 'image' as const,
          media_url: fallbackImageUrl,
          media_order: 0,
          alt_text: productName,
          created_at: null,
          product_id: productId,
          updated_at: null,
        }];
      }
      
      setMedia(typedMediaData);
      
      // Si on était sur un index plus grand que le nombre de médias, revenir au début
      if (currentIndex >= typedMediaData.length) {
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      // En cas d'erreur, utiliser l'image de fallback si disponible
      if (fallbackImageUrl) {
        setMedia([{
          id: 'fallback',
          media_type: 'image',
          media_url: fallbackImageUrl,
          media_order: 0,
          alt_text: productName,
          created_at: null,
          product_id: productId,
          updated_at: null,
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const images = media.filter(m => m.media_type === 'image');
  const videos = media.filter(m => m.media_type === 'video');
  const currentMedia = images[currentIndex];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getVideoThumbnail = (videoUrl: string) => {
    // Pour YouTube
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    
    // Pour Vimeo
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      // Note: Pour Vimeo, il faudrait faire un appel API pour obtenir la thumbnail
      // Pour l'instant, on retourne une image par défaut
      return 'https://via.placeholder.com/400x300/6366f1/white?text=Video';
    }
    
    // Image par défaut pour les autres vidéos
    return 'https://via.placeholder.com/400x300/6366f1/white?text=Video';
  };

  if (loading) {
    return (
      <div className={`${className} bg-zinc-100 animate-pulse rounded-lg flex items-center justify-center`}>
        <div className="text-zinc-400">Chargement...</div>
      </div>
    );
  }

  // Si aucun média disponible
  if (images.length === 0 && videos.length === 0) {
    return (
      <div className={`${className} bg-zinc-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-zinc-400">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">Aucune image</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Image principale */}
      <div className={`${className} relative overflow-hidden rounded-lg bg-zinc-100 border-2 border-site-primary`}>
        {currentMedia ? (
          <>
            <img
              src={currentMedia.media_url}
              alt={currentMedia.alt_text || productName}
              className="w-full h-full object-cover"
            />
            
            {/* Contrôles de navigation - seulement si plusieurs images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {/* Indicateurs */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm">Aucune image</div>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails - seulement si plusieurs images */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === currentIndex ? 'border-purple-600' : 'border-zinc-200'
              }`}
            >
              <img
                src={image.media_url}
                alt={image.alt_text || `${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Section vidéo */}
      {videos.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-700">Vidéo du produit</h4>
          {videos.map((video) => (
            <div key={video.id} className="relative">
              <div className="aspect-video bg-zinc-100 rounded-lg overflow-hidden relative">
                <img
                  src={getVideoThumbnail(video.media_url)}
                  alt={video.alt_text || `Vidéo ${productName}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => window.open(video.media_url, '_blank')}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
                >
                  <div className="bg-white bg-opacity-90 rounded-full p-3">
                    <Play className="h-6 w-6 text-purple-600 ml-1" />
                  </div>
                </button>
              </div>
              {video.alt_text && (
                <p className="text-xs text-zinc-500 mt-1">{video.alt_text}</p>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ProductGallery;