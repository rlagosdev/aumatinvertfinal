import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase/client';

interface ProductCount {
  count: number;
}

interface CarouselImage {
  url: string;
  alt: string;
}

const HeroCarousel: React.FC = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(40);

  useEffect(() => {
    fetchCarouselImages();
    fetchProductCount();
  }, []);

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000); // Change d'image toutes les 5 secondes

      return () => clearInterval(timer);
    }
  }, [images.length]);

  const fetchProductCount = async () => {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('actif', true);

      if (error) {
        console.warn('Error fetching product count:', error);
        return;
      }

      setProductCount(count || 40);
    } catch (error) {
      console.warn('Error counting products:', error);
    }
  };

  const fetchCarouselImages = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['carousel_image_1', 'carousel_image_2', 'carousel_image_3', 'carousel_image_4'])
        .order('setting_key');

      if (error) {
        console.warn('Table site_settings not found, using default carousel images');
        // Images par défaut
        setImages([
          {
            url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            alt: 'Marché de produits frais'
          },
          {
            url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            alt: 'Légumes biologiques'
          },
          {
            url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            alt: 'Fruits de saison'
          }
        ]);
        setLoading(false);
        return;
      }

      const carouselImages: CarouselImage[] = [];
      
      data?.forEach((setting, index) => {
        if (setting.setting_value && setting.setting_value.trim()) {
          carouselImages.push({
            url: setting.setting_value,
            alt: `Image carrousel ${index + 1}`
          });
        }
      });

      // Images par défaut si aucune n'est configurée
      if (carouselImages.length === 0) {
        carouselImages.push(
          {
            url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            alt: 'Marché de produits frais'
          },
          {
            url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            alt: 'Légumes biologiques'
          },
          {
            url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            alt: 'Fruits de saison'
          }
        );
      }

      setImages(carouselImages);
    } catch (error) {
      console.warn('Error fetching carousel images, using defaults:', error);
      // Images de fallback en cas d'erreur
      setImages([
        {
          url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          alt: 'Marché de produits frais'
        },
        {
          url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          alt: 'Légumes biologiques'
        },
        {
          url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          alt: 'Fruits de saison'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="relative h-96 bg-gradient-to-r from-site-primary to-site-buttons animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="relative h-96 bg-gradient-to-r from-site-primary to-site-buttons">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Au Matin Vert</h2>
            <p className="text-xl">Produits frais et biologiques</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
        {/* Images du carrousel */}
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
                }}
              />
            </div>
          ))}
        </div>

        {/* Contrôles de navigation - seulement si plusieurs images */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Indicateurs */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Floating card */}
      <div className="absolute -bottom-6 -left-6 bg-white text-zinc-800 p-6 rounded-xl shadow-xl">
        <div className="text-2xl font-bold text-site-primary">{productCount}+</div>
        <div className="text-sm font-medium text-site-company-title">Produits locaux</div>
      </div>
    </div>
  );
};

export default HeroCarousel;