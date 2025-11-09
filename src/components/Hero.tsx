import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/client';
import HeroCarouselWithButtons from './HeroCarouselWithButtons';

interface HeroButton {
  text: string;
  url: string;
}

const Hero: React.FC = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [heroType, setHeroType] = useState<'video' | 'carousel'>('video');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [specialButton, setSpecialButton] = useState<HeroButton>({
    text: 'Spéciale Fêtes',
    url: '/evenements'
  });
  const [videoUrl, setVideoUrl] = useState<string>('/hero-video.mp4');
  const [carouselImages, setCarouselImages] = useState<string[]>([]);

  // Fonction pour extraire l'ID YouTube depuis différents formats d'URL
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null;

    // Format: youtube.com/shorts/ID
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return shortsMatch[1];

    // Format: youtube.com/watch?v=ID
    const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) return watchMatch[1];

    // Format: youtu.be/ID
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) return shortMatch[1];

    // Format: youtube.com/embed/ID
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) return embedMatch[1];

    return null;
  };

  const isYouTubeUrl = (url: string): boolean => {
    return getYouTubeId(url) !== null;
  };

  // Détecter si l'utilisateur est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchHeroType();
    fetchButtonConfig();
    fetchVideoUrl();
    fetchCarouselImages();
  }, [isMobile]);

  const fetchHeroType = async () => {
    try {
      // Récupérer les paramètres selon l'appareil
      const settingKey = isMobile ? 'home_hero_type_mobile' : 'home_hero_type_desktop';

      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', settingKey)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Si le paramètre spécifique n'existe pas, utiliser le paramètre général
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'home_hero_type')
          .single();

        if (fallbackError && fallbackError.code !== 'PGRST116') throw fallbackError;

        if (fallbackData) {
          setHeroType(fallbackData.setting_value as 'video' | 'carousel');
        }
      } else if (data) {
        setHeroType(data.setting_value as 'video' | 'carousel');
      }
    } catch (error) {
      console.error('Error fetching hero type:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchVideoUrl = async () => {
    try {
      // Récupérer l'URL vidéo spécifique à l'appareil
      const settingKey = isMobile ? 'hero_video_url_mobile' : 'hero_video_url_desktop';

      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', settingKey)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Si pas de paramètre spécifique, essayer le paramètre général
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'hero_video_url')
          .single();

        if (fallbackError && fallbackError.code !== 'PGRST116') {
          console.warn('Error fetching video URL:', fallbackError);
          return;
        }

        if (fallbackData?.setting_value) {
          setVideoUrl(fallbackData.setting_value);
        }
      } else if (data?.setting_value) {
        setVideoUrl(data.setting_value);
      }
    } catch (error) {
      console.warn('Error fetching video URL:', error);
    }
  };

  const fetchCarouselImages = async () => {
    try {
      // Récupérer les images spécifiques à l'appareil
      const device = isMobile ? 'mobile' : 'desktop';
      const keys = [
        `carousel_image_${device}_1`,
        `carousel_image_${device}_2`,
        `carousel_image_${device}_3`,
        `carousel_image_${device}_4`
      ];

      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', keys)
        .order('setting_key');

      if (error && error.code !== 'PGRST116') {
        // Fallback vers les images générales
        const fallbackKeys = ['carousel_image_1', 'carousel_image_2', 'carousel_image_3', 'carousel_image_4'];
        const { data: fallbackData } = await supabase
          .from('site_settings')
          .select('setting_key, setting_value')
          .in('setting_key', fallbackKeys)
          .order('setting_key');

        if (fallbackData) {
          const images = fallbackData.map(item => item.setting_value).filter(Boolean);
          setCarouselImages(images);
        }
        return;
      }

      if (data) {
        const images = data.map(item => item.setting_value).filter(Boolean);
        setCarouselImages(images);
      }
    } catch (error) {
      console.warn('Error fetching carousel images:', error);
    }
  };

  React.useEffect(() => {
    if (heroType === 'video') {
      const video = videoRef.current;
      if (video) {
        // Ne rien faire - attendre que l'utilisateur clique sur play
        // Le bouton play sera affiché par défaut (showPlayButton = true)
      }
    }
  }, [heroType]);

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      console.log('Avant clic - muted:', video.muted, 'volume:', video.volume);
      video.muted = false; // Activer le son
      video.volume = 1.0; // Volume au maximum
      video.currentTime = 0; // Redémarrer depuis le début
      video.play().then(() => {
        console.log('Après play - muted:', video.muted, 'volume:', video.volume);
        setShowPlayButton(false); // Cacher le bouton
      }).catch((err) => {
        console.error('Erreur play:', err);
      });
    }
  };

  // Si en mode carrousel, afficher le HeroCarouselWithButtons directement
  if (heroType === 'carousel') {
    return <HeroCarouselWithButtons carouselImages={carouselImages} />;
  }

  // Sinon afficher la vidéo hero
  return (
    <section
      className="relative w-full h-screen overflow-hidden bg-black"
      style={{
        paddingTop: isMobile ? '220px' : '0'
      }}
    >
      {/* Styles intégrés */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sparkleAnim {
          0%, 100% {
            box-shadow: 0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3), 0 0 30px rgba(255,255,255,0.2);
          }
          50% {
            box-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.3);
          }
        }

        @keyframes shineAnim {
          0% { transform: translate(-50%, -50%) rotate(45deg); }
          100% { transform: translate(150%, 150%) rotate(45deg); }
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
          z-index: 10;
        }

        @media (min-width: 768px) {
          .hero-btn-container {
            margin-top: 140px;
          }
        }

        .hero-btn-container::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 4px);
          height: calc(100% - 4px);
          border-radius: 50px;
          background: transparent;
          animation: glowAnim 2s ease-in-out infinite !important;
          pointer-events: none;
          z-index: 0;
        }

        .hero-btn {
          display: inline-block;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background: transparent;
          border: 2px solid white;
          border-radius: 50px;
          text-decoration: none;
          cursor: pointer;
          position: relative;
          overflow: visible;
          z-index: 1;
          box-sizing: border-box;
        }

        @media (min-width: 768px) {
          .hero-btn {
            padding: 16px 48px;
            font-size: 18px;
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

        .play-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255,255,255,0.9);
          padding: 20px 40px;
          border-radius: 50px;
          font-size: 18px;
          font-weight: 600;
          color: #333;
          cursor: pointer;
          z-index: 100;
          box-shadow: 0 5px 20px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }

        .play-btn:hover {
          transform: translate(-50%, -50%) scale(1.05);
        }
      `}} />

      {/* Vidéo d'arrière-plan - YouTube ou HTML5 */}
      {isYouTubeUrl(videoUrl) ? (
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          style={{
            objectFit: 'cover',
            zIndex: 0,
            border: 'none'
          }}
          src={`https://www.youtube.com/embed/${getYouTubeId(videoUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(videoUrl)}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
          title="YouTube video background"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            objectFit: isMobile ? 'cover' : 'fill',
            objectPosition: isMobile ? 'center top' : 'center center',
            zIndex: 0
          }}
          loop
          playsInline
          preload="auto"
          key={videoUrl}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Bouton play si autoplay échoue - seulement pour vidéos non-YouTube */}
      {showPlayButton && !isYouTubeUrl(videoUrl) && (
        <div className="play-btn" onClick={handlePlayClick}>
          ▶ Cliquez pour lire la vidéo avec son
        </div>
      )}

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0" style={{ pointerEvents: 'none' }}></div>

      {/* Bouton Spécial (configurable) */}
      <div className="absolute top-40 md:top-0 right-0 z-10 flex flex-col justify-start items-end text-white px-4 md:px-10 py-0">
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

export default Hero;
