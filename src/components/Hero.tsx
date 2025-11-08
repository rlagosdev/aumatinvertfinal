import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/client';
import HeroCarousel from './HeroCarousel';

const Hero: React.FC = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [heroType, setHeroType] = useState<'video' | 'carousel'>('video');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroType();
  }, []);

  const fetchHeroType = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'home_hero_type')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setHeroType(data.setting_value as 'video' | 'carousel');
      }
    } catch (error) {
      console.error('Error fetching hero type:', error);
    } finally {
      setLoading(false);
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

  // Si en mode carrousel, afficher le HeroCarousel directement
  if (heroType === 'carousel') {
    return <HeroCarousel />;
  }

  // Sinon afficher la vidéo hero
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
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
          margin-top: 140px;
          margin-right: 0;
          position: relative;
          display: inline-block;
          z-index: 10;
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
          padding: 16px 48px;
          font-size: 18px;
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

      {/* Vidéo d'arrière-plan */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{
          objectFit: 'fill',
          zIndex: 0
        }}
        loop
        playsInline
        preload="auto"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Bouton play si autoplay échoue */}
      {showPlayButton && (
        <div className="play-btn" onClick={handlePlayClick}>
          ▶ Cliquez pour lire la vidéo avec son
        </div>
      )}

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0" style={{ pointerEvents: 'none' }}></div>

      {/* Bouton Spéciale Fêtes */}
      <div className="absolute top-0 right-0 z-10 flex flex-col justify-start items-end text-white px-10 py-0">
        <div className="hero-btn-container">
          <Link to="/evenements" className="hero-btn">
            <span style={{ position: 'relative', zIndex: 10 }}>Spéciale Fêtes</span>
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
