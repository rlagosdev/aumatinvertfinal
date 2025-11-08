import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { supabase } from '../supabase/client';
import { Link, useNavigate } from 'react-router-dom';

interface AnnonceButton {
  text: string;
  url: string;
  isExternal: boolean;
  enabled: boolean;
}

interface AnnonceConfig {
  title: string;
  description: string;
  imageUrl: string;
  buttons: AnnonceButton[];
  backgroundColor: string;
  textColor: string;
}

const Annonces: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<AnnonceConfig>({
    title: 'Annonce Spéciale',
    description: 'Découvrez nos offres exclusives !',
    imageUrl: '',
    buttons: [],
    backgroundColor: '#ffffff',
    textColor: '#000000'
  });
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    fetchAnnonceConfig();
  }, []);

  const fetchAnnonceConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'annonce_title',
          'annonce_description',
          'annonce_image',
          'annonce_buttons',
          'annonce_bg_color',
          'annonce_text_color'
        ]);

      if (error) {
        console.error('Error fetching annonce config:', error);
        setLoading(false);
        return;
      }

      const newConfig: AnnonceConfig = {
        title: data?.find(s => s.setting_key === 'annonce_title')?.setting_value || 'Annonce Spéciale',
        description: data?.find(s => s.setting_key === 'annonce_description')?.setting_value || 'Découvrez nos offres exclusives !',
        imageUrl: data?.find(s => s.setting_key === 'annonce_image')?.setting_value || '',
        backgroundColor: data?.find(s => s.setting_key === 'annonce_bg_color')?.setting_value || '#ffffff',
        textColor: data?.find(s => s.setting_key === 'annonce_text_color')?.setting_value || '#000000',
        buttons: []
      };

      const buttonsData = data?.find(s => s.setting_key === 'annonce_buttons')?.setting_value;
      if (buttonsData) {
        try {
          newConfig.buttons = JSON.parse(buttonsData);
        } catch (e) {
          console.error('Error parsing buttons:', e);
        }
      }

      setConfig(newConfig);
    } catch (error) {
      console.error('Error fetching annonce config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-site-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div
            className="relative max-w-4xl w-full rounded-2xl shadow-2xl overflow-hidden animate-scaleIn"
            style={{ backgroundColor: config.backgroundColor, color: config.textColor }}
          >
            {/* Bouton fermer */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all hover:scale-110"
              aria-label="Fermer"
            >
              <X className="h-6 w-6 text-gray-800" />
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Image */}
              {config.imageUrl && (
                <div className="md:w-1/2 h-64 md:h-auto">
                  <img
                    src={config.imageUrl}
                    alt={config.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Contenu */}
              <div className={`${config.imageUrl ? 'md:w-1/2' : 'w-full'} p-8 md:p-12 flex flex-col justify-center`}>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {config.title}
                </h1>

                <div
                  className="text-lg md:text-xl mb-8 whitespace-pre-wrap"
                  style={{ opacity: 0.9 }}
                >
                  {config.description}
                </div>

                {/* Boutons */}
                {config.buttons.filter(b => b.enabled).length > 0 && (
                  <div className="space-y-3">
                    {config.buttons.filter(b => b.enabled).map((button, index) => (
                      button.isExternal ? (
                        <a
                          key={index}
                          href={button.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-site-primary hover:bg-site-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-all hover:scale-105 hover:shadow-lg"
                        >
                          {button.text}
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      ) : (
                        <Link
                          key={index}
                          to={button.url}
                          onClick={handleClose}
                          className="block text-center w-full bg-site-primary hover:bg-site-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-all hover:scale-105 hover:shadow-lg"
                        >
                          {button.text}
                        </Link>
                      )
                    ))}
                  </div>
                )}

                {config.buttons.filter(b => b.enabled).length === 0 && (
                  <button
                    onClick={handleClose}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all"
                  >
                    Fermer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `}} />
    </div>
  );
};

export default Annonces;
