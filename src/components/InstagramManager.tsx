import React, { useState } from 'react';
import { useInstagramSettings } from '../hooks/useInstagramSettings';
import { Instagram, Eye, EyeOff, ExternalLink, Save, AlertCircle, CheckCircle } from 'lucide-react';

const InstagramManager: React.FC = () => {
  const { settings, loading, saveSettings, validateInstagramUrl } = useInstagramSettings();
  const [inputMode, setInputMode] = useState<'url' | 'code' | 'profile'>('url');
  const [formData, setFormData] = useState({
    isEnabled: settings.isEnabled,
    postUrl: settings.postUrl,
    customEmbedCode: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  React.useEffect(() => {
    setFormData({
      isEnabled: settings.isEnabled,
      postUrl: settings.postUrl,
      customEmbedCode: settings.embedCode
    });
  }, [settings]);

  const handleSave = async () => {
    // Validation selon le mode
    if (inputMode === 'url') {
      if (!formData.postUrl || !validateInstagramUrl(formData.postUrl)) {
        setMessage({
          type: 'error',
          text: 'URL Instagram invalide. Utilisez une URL de post, reel ou story Instagram.'
        });
        return;
      }
    } else if (inputMode === 'code' || inputMode === 'profile') {
      if (!formData.customEmbedCode || !formData.customEmbedCode.includes('instagram')) {
        setMessage({
          type: 'error',
          text: 'Code embed invalide. Assurez-vous de coller le code complet d\'Instagram.'
        });
        return;
      }
    }

    setSaving(true);
    setMessage(null);

    const success = await saveSettings({
      isEnabled: formData.isEnabled,
      postUrl: inputMode === 'url' ? formData.postUrl : '',
      embedCode: (inputMode === 'code' || inputMode === 'profile') ? formData.customEmbedCode : ''
    });

    if (success) {
      setMessage({
        type: 'success',
        text: 'Paramètres Instagram sauvegardés avec succès !'
      });
    } else {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la sauvegarde des paramètres Instagram.'
      });
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 5000);
  };

  const getUrlPlaceholder = () => {
    return "https://www.instagram.com/p/ABC123... ou https://www.instagram.com/reel/XYZ789...";
  };

  const getUrlHelp = () => {
    return (
      <div className="text-sm text-gray-600 space-y-1">
        <p><strong>Formats d'URL acceptés :</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Post standard : https://www.instagram.com/p/ABC123...</li>
          <li>Reel : https://www.instagram.com/reel/XYZ789...</li>
          <li>Story : https://www.instagram.com/stories/highlights/DEF456...</li>
        </ul>
        <p className="text-blue-600 mt-2">
          💡 Pour obtenir le lien : ouvrez la publication sur Instagram → cliquez "..." → "Copier le lien"
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Instagram className="h-6 w-6 text-pink-600" />
          <h3 className="text-lg font-semibold text-gray-900">Configuration Instagram</h3>
        </div>
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Instagram className="h-6 w-6 text-pink-600" />
        <h3 className="text-lg font-semibold text-gray-900">Configuration Instagram</h3>
      </div>

      <div className="space-y-6">
        {/* Activation/Désactivation */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            {formData.isEnabled ? (
              <Eye className="h-5 w-5 text-green-600" />
            ) : (
              <EyeOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <h4 className="font-medium text-gray-900">
                Affichage sur la page d'accueil
              </h4>
              <p className="text-sm text-gray-600">
                {formData.isEnabled 
                  ? "La publication Instagram est visible sur la page d'accueil" 
                  : "La publication Instagram est masquée"}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isEnabled}
              onChange={(e) => setFormData(prev => ({ ...prev, isEnabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
          </label>
        </div>

        {/* Choix du mode d'entrée */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Méthode d'intégration
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                inputMode === 'url'
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">URL Post</div>
              <div className="text-xs mt-1 opacity-75">Publication unique</div>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('profile')}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                inputMode === 'profile'
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">Profil Feed</div>
              <div className="text-xs mt-1 opacity-75">Flux complet</div>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('code')}
              className={`px-4 py-3 rounded-lg border-2 transition-all ${
                inputMode === 'code'
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="font-medium">Code Custom</div>
              <div className="text-xs mt-1 opacity-75">Code personnalisé</div>
            </button>
          </div>
        </div>

        {/* Mode URL */}
        {inputMode === 'url' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de la publication Instagram
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="url"
                    value={formData.postUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, postUrl: e.target.value }))}
                    placeholder={getUrlPlaceholder()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-10"
                  />
                  {formData.postUrl && (
                    <a
                      href={formData.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-pink-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                {getUrlHelp()}
              </div>
            </div>

            {/* Validation de l'URL */}
            {formData.postUrl && (
              <div className={`p-3 rounded-lg flex items-start space-x-2 ${
                validateInstagramUrl(formData.postUrl)
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}>
                {validateInstagramUrl(formData.postUrl) ? (
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <span className="text-sm">
                  {validateInstagramUrl(formData.postUrl)
                    ? 'URL Instagram valide'
                    : 'URL Instagram invalide - veuillez vérifier le format'}
                </span>
              </div>
            )}
          </>
        )}

        {/* Mode Profil Feed */}
        {inputMode === 'profile' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code embed du profil Instagram
            </label>
            <textarea
              value={formData.customEmbedCode}
              onChange={(e) => setFormData(prev => ({ ...prev, customEmbedCode: e.target.value }))}
              placeholder='Collez le code embed de votre profil Instagram ici...'
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-xs"
            />
            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <p>💡 <strong>Comment obtenir le code :</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Allez sur un générateur d'embed (ex: poper.ai/tools/embed-instagram-feed)</li>
                <li>Entrez votre nom d'utilisateur : <span className="font-mono bg-gray-100 px-1">au_matin_vert</span></li>
                <li>Copiez le code généré et collez-le ci-dessus</li>
              </ol>
              <p className="text-pink-600 font-medium mt-2">✨ Ce mode affiche votre flux Instagram complet sur la page d'accueil</p>
            </div>
          </div>
        )}

        {/* Mode Code Embed */}
        {inputMode === 'code' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code embed personnalisé
            </label>
            <textarea
              value={formData.customEmbedCode}
              onChange={(e) => setFormData(prev => ({ ...prev, customEmbedCode: e.target.value }))}
              placeholder='Collez n&#39;importe quel code embed Instagram ici...'
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent font-mono text-xs"
            />
            <p className="text-sm text-gray-600 mt-2">
              💡 <strong>Pour une publication :</strong> Ouvrez sur Instagram →
              "..." → "Intégrer" → copiez le code
            </p>
          </div>
        )}

        {/* Aperçu */}
        {formData.isEnabled && (
          (inputMode === 'url' && formData.postUrl && validateInstagramUrl(formData.postUrl)) ||
          ((inputMode === 'code' || inputMode === 'profile') && formData.customEmbedCode)
        ) && (
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-900 mb-3">Aperçu sur la page d'accueil</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="max-w-sm mx-auto">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <span className="font-medium text-gray-900">
                      {inputMode === 'profile' ? 'Notre profil Instagram' : 'Notre dernière publication'}
                    </span>
                  </div>
                  <div className="bg-gray-100 h-48 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      {inputMode === 'url' && 'Publication générée automatiquement'}
                      {inputMode === 'profile' && 'Flux Instagram complet'}
                      {inputMode === 'code' && 'Code embed personnalisé'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message de statut */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstagramManager;