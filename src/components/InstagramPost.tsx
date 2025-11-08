import React, { useEffect } from 'react';
import { useInstagramSettings } from '../hooks/useInstagramSettings';
import { Instagram, ExternalLink } from 'lucide-react';

const InstagramPost: React.FC = () => {
  const { settings, loading } = useInstagramSettings();

  // Debug logs
  useEffect(() => {
    console.log('InstagramPost - Settings:', {
      loading,
      isEnabled: settings.isEnabled,
      postUrl: settings.postUrl,
      embedCode: settings.embedCode ? 'Present' : 'Empty'
    });
  }, [settings, loading]);

  // Charger le script Instagram si nécessaire
  useEffect(() => {
    if (settings.isEnabled && settings.embedCode) {
      // Charger le script d'intégration Instagram officiel
      if (!window.instgrm) {
        const script = document.createElement('script');
        script.src = 'https://www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          if (window.instgrm) {
            window.instgrm.Embeds.process();
          }
        };
      } else {
        // Retraiter les embeds si le script est déjà chargé
        window.instgrm.Embeds.process();
      }
    }
  }, [settings.isEnabled, settings.embedCode]);

  // Ne rien afficher si désactivé ou en cours de chargement
  // Afficher si on a soit une URL soit un code embed
  if (loading || !settings.isEnabled || (!settings.postUrl && !settings.embedCode)) {
    console.log('InstagramPost - Not displaying because:', {
      loading,
      isEnabled: settings.isEnabled,
      hasPostUrl: !!settings.postUrl,
      hasEmbedCode: !!settings.embedCode
    });
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Instagram className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Notre dernière publication</h3>
            <p className="text-sm text-gray-600">Suivez-nous sur Instagram</p>
          </div>
        </div>
        {settings.postUrl && (
          <a
            href={settings.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors"
          >
            <span>Voir sur Instagram</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Contenu de la publication */}
      <div className="relative flex justify-center">
        {/* Embed Instagram - Le script Instagram transformera le blockquote en iframe interactive */}
        {settings.embedCode ? (
          <div
            dangerouslySetInnerHTML={{ __html: settings.embedCode }}
            className="instagram-embed-wrapper w-full flex justify-center"
            style={{ minHeight: '500px' }}
          />
        ) : (
          <div className="w-full max-w-md mx-auto bg-gray-50 rounded-lg p-8 text-center">
            <Instagram className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Publication Instagram non disponible</p>
          </div>
        )}
      </div>

      {/* Lien vers le profil Instagram */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-4">
          <a
            href="https://www.instagram.com/au_matin_vert/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
          >
            <Instagram className="h-4 w-4" />
            <span>Suivre @au_matin_vert</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// Typage pour le script Instagram
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

export default InstagramPost;