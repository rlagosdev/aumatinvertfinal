import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/client';

interface CarouselImage {
  url: string;
  alt: string;
}

interface HeroButton {
  text: string;
  url: string;
}

const HeroCarouselWithButtons: React.FC = () => {
  const [images, setImages] = useState<CarouselImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [specialButton, setSpecialButton] = useState<HeroButton>({ text: 'Spéciale Fêtes', url: '/evenements' });

  useEffect(() => {
    fetchCarouselImages();
    fetchButtonConfig();
  }, []);

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [images.length]);

  const fetchButtonConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['hero_special_button_text', 'hero_special_button_url']);

      if (error) {
        console.warn('Error fetching button config:', error);
        return;
      }

      const buttonText = data?.find(s => s.setting_key === 'hero_special_button_text')?.setting_value;
      const buttonUrl = data?.find(s => s.setting_key === 'hero_special_button_url')?.setting_value;

      setSpecialButton({
        text: buttonText || 'Spéciale Fêtes',
        url: buttonUrl || '/evenements'
      });
    } catch (error) {
      console.warn('Error fetching button config:', error);
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
        setImages(getDefaultImages());
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

      if (carouselImages.length === 0) {
        carouselImages.push(...getDefaultImages());
      }

      setImages(carouselImages);
    } catch (error) {
      console.warn('Error fetching carousel images, using defaults:', error);
      setImages(getDefaultImages());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultImages = (): CarouselImage[] => [
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
  ];

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
      <div className="relative h-screen bg-gradient-to-r from-site-primary to-site-buttons animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Styles intégrés - Mêmes animations que Hero vidéo */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sparkleAnim {
          0%, 100% {
            box-shadow: 0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3), 0 0 30px rgba(255,255,255,0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3);
          }
        }

        @keyframes glowAnim {
          0%, 100% {
            box-shadow: 0 0 20px 5px rgba(255,255,255,0.4), 0 0 40px 10px rgba(255,255,255,0.3);
          }
          50% {
            box-shadow: 0 0 35px 10px rgba(255,255,255,0.8), 0 0 70px 20px rgba(255,255,255,0.5), 0 0 100px 30px rgba(255,255,255,0.3);
          }
        }

        @keyframes fadeInUpAnim {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bounceAnim {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-10px); }
          60% { transform: translateX(-50%) translateY(-5px); }
        }

        @keyframes scrollDownAnim {
          0% { opacity: 1; transform: translateX(-50%) translateY(0); }
          50% { opacity: 0.5; transform: translateX(-50%) translateY(12px); }
          100% { opacity: 0; transform: translateX(-50%) translateY(12px); }
        }

        .hero-btn-container {
          margin-top: 20px;
          margin-right: 0;
          position: relative;
          display: inline-block;
        }

        @media (min-width: 768px) {
          .hero-btn-container {
            margin-top: 140px;
          }
        }

        .hero-btn {
          display: inline-block;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 700;
          text-decoration: none;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: white;
          border: 2px solid rgba(255,255,255,0.4);
          border-radius: 50px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.2);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .hero-btn {
            padding: 18px 50px;
            font-size: 22px;
          }
        }

        .hero-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          pointer-events: none;
        }

        .hero-btn:hover {
          background: white !important;
          color: #333 !important;
          transform: translateY(-5px);
          animation: sparkleAnim 0.5s infinite, glowAnim 1.5s infinite;
        }

        .hero-scroll {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          opacity: 0;
          animation: fadeInUpAnim 1s ease forwards, bounceAnim 2s infinite;
          animation-delay: 1.5s;
        }

        .hero-mouse {
          display: block;
          width: 24px;
          height: 40px;
          border: 2px solid white;
          border-radius: 12px;
          position: relative;
        }

        .hero-mouse::before {
          content: '';
          position: absolute;
          top: 8px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 8px;
          background: white;
          border-radius: 2px;
          animation: scrollDownAnim 2s infinite;
        }
      `}} />

      {/* Images du carrousel */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
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

      {/* Overlay sombre */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30" style={{ pointerEvents: 'none' }}></div>

      {/* Contrôles de navigation - seulement si plusieurs images */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10 hover:scale-110"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10 hover:scale-110"
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          {/* Indicateurs */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? 'bg-white w-8' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Bouton Spécial (configurable) */}
      <div className="absolute top-32 md:top-0 right-0 z-10 flex flex-col justify-start items-end text-white px-4 md:px-10 py-0">
        <div className="hero-btn-container">
          <Link to={specialButton.url} className="hero-btn">
            <span style={{ position: 'relative', zIndex: 10 }}>{specialButton.text}</span>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll">
        <span className="hero-mouse"></span>
      </div>
    </section>
  );
};

export default HeroCarouselWithButtons;
