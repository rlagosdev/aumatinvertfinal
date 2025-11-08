import React, { useState, useEffect } from 'react';
import { Sparkles, X, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../../supabase/client';

interface AIContentGeneratorProps {
  onClose: () => void;
  onGenerate: (content: string) => void;
  platform: 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'twitter' | '';
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({ onClose, onGenerate, platform }) => {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(true);

  // Charger la clé API Claude depuis la base de données (même clé que le chatbot)
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'chatbot_api_key')
          .maybeSingle();

        if (error) {
          console.warn('Erreur lors du chargement de la clé API:', error);
          toast.error('Clé API non trouvée. Veuillez la configurer dans Paramètres > Chatbot IA');
        } else if (data?.setting_value) {
          setApiKey(data.setting_value);
        } else {
          toast.error('Clé API Claude non configurée. Allez dans Paramètres > Chatbot IA pour la configurer.');
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Erreur lors du chargement de la clé API');
      } finally {
        setIsLoadingApiKey(false);
      }
    };

    fetchApiKey();
  }, []);

  const generateWithAI = async (userPrompt: string): Promise<string> => {
    // Utiliser la Edge Function Supabase (même que le chatbot)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante');
    }

    // Utiliser la même Edge Function que le chatbot (chatbot-assistant)
    const response = await fetch(`${supabaseUrl}/functions/v1/chatbot-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        messages: [],
        userMessage: `Tu es un expert en marketing digital et création de contenu pour les réseaux sociaux. Crée un post ${platform ? `pour ${platform}` : 'engageant'} basé sur cette demande : ${userPrompt}. Le contenu doit être professionnel, engageant et adapté à la plateforme.`,
        apiKey
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la génération');
    }

    const data = await response.json();
    return data.response || '';
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      toast.error('Clé API non configurée. Allez dans Paramètres > Chatbot IA');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Veuillez décrire le contenu que vous souhaitez générer');
      return;
    }

    setIsGenerating(true);

    try {
      const content = await generateWithAI(prompt);
      setGeneratedContent(content);
      toast.success('✨ Contenu généré avec succès !');
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error('Erreur : ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseContent = () => {
    if (generatedContent) {
      onGenerate(generatedContent);
      onClose();
    }
  };

  const platformName =
    platform === 'facebook' ? 'Facebook' :
    platform === 'instagram' ? 'Instagram' :
    platform === 'linkedin' ? 'LinkedIn' :
    platform === 'youtube' ? 'YouTube' :
    platform === 'twitter' ? 'X (Twitter)' :
    'réseaux sociaux';

  // Afficher un loader si la clé est en cours de chargement
  if (isLoadingApiKey) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-zinc-600">Chargement de la configuration IA...</p>
        </div>
      </div>
    );
  }

  // Si pas de clé API, afficher un message d'erreur
  if (!apiKey) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-zinc-800 mb-2">Clé API non configurée</h3>
          <p className="text-zinc-600 mb-6">
            Pour utiliser le générateur de contenu IA, vous devez d'abord configurer votre clé API Claude dans les paramètres.
          </p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Fermer
          </button>
          <p className="mt-4 text-sm text-zinc-500">
            Allez dans <strong>Paramètres → Chatbot IA</strong> pour configurer la clé
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Générateur de Contenu IA</h2>
                <p className="text-purple-100 text-sm">Créez du contenu engageant pour {platformName} avec Claude AI</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Info : Utilisation de la clé Claude */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>✨ IA activée :</strong> Utilise la même clé API Claude que votre chatbot.
              La clé est configurée dans <strong>Paramètres → Chatbot IA</strong>.
            </p>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Description du contenu à générer
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Exemple: "Un post sur les bienfaits du yoga pour la santé mentale, ton inspirant et bienveillant"`}
              rows={4}
              className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
          </div>

          {/* Bouton Générer */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-zinc-300 disabled:to-zinc-300 text-white font-medium rounded-lg transition-colors"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Générer le contenu avec Claude AI
              </>
            )}
          </button>

          {/* Contenu généré */}
          {generatedContent && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-zinc-700">
                Contenu généré
              </label>
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                <p className="text-zinc-800 whitespace-pre-wrap">{generatedContent}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUseContent}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Utiliser ce contenu
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-6 py-3 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium rounded-lg transition-colors"
                >
                  Régénérer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIContentGenerator;
