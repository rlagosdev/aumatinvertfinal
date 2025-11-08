import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { X, Upload, Link, Copy, ExternalLink } from 'lucide-react';

interface ImageUploaderProps {
  onClose: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onClose }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);

  const validateImageUrl = async (url: string) => {
    if (!url) {
      setIsValidUrl(false);
      return;
    }

    try {
      // Vérifier si c'est une URL valide
      new URL(url);
      
      // Vérifier si l'image se charge
      const img = new Image();
      img.onload = () => setIsValidUrl(true);
      img.onerror = () => setIsValidUrl(false);
      img.src = url;
    } catch {
      setIsValidUrl(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    validateImageUrl(url);
  };

  const copyUrl = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl);
      toast.success('URL copiée dans le presse-papiers');
    }
  };

  const openImgBB = () => {
    window.open('https://imgbb.com/', '_blank');
  };

  const openImgur = () => {
    window.open('https://imgur.com/upload', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-800">
              Ajouter une Image
            </h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Services d'upload gratuits */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Services d'upload gratuits recommandés
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openImgBB}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>ImgBB</span>
                </button>
                <button
                  onClick={openImgur}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Imgur</span>
                </button>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                1. Cliquez sur un service pour ouvrir le site
                2. Uploadez votre image
                3. Copiez l'URL directe de l'image
                4. Collez l'URL ci-dessous
              </p>
            </div>

            {/* Champ URL */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                URL de l'image
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  className="w-full pl-10 pr-12 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://exemple.com/image.jpg"
                />
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                {imageUrl && (
                  <button
                    onClick={copyUrl}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    title="Copier l'URL"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {imageUrl && !isValidUrl && (
                <p className="mt-2 text-sm text-red-600">
                  Cette URL ne semble pas être une image valide
                </p>
              )}
            </div>

            {/* Prévisualisation */}
            {imageUrl && isValidUrl && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium mb-3">Aperçu de l'image</p>
                <img
                  src={imageUrl}
                  alt="Aperçu"
                  className="w-full max-w-md h-48 object-cover rounded-lg mx-auto"
                  onError={() => setIsValidUrl(false)}
                />
                <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-medium">URL prête à utiliser :</span>
                    <button
                      onClick={copyUrl}
                      className="text-green-600 hover:text-green-800 underline text-xs"
                    >
                      Copier
                    </button>
                  </div>
                  <p className="text-green-600 break-all mt-1">{imageUrl}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
              <h4 className="font-medium text-zinc-800 mb-2">Comment obtenir une URL d'image :</h4>
              <ol className="text-sm text-zinc-600 space-y-1 list-decimal list-inside">
                <li>Allez sur ImgBB ou Imgur (boutons ci-dessus)</li>
                <li>Uploadez votre image</li>
                <li>Copiez le lien "Direct Link" ou "Image URL"</li>
                <li>Collez-le dans le champ ci-dessus</li>
                <li>L'image apparaîtra en aperçu</li>
                <li>Copiez l'URL pour l'utiliser dans vos produits</li>
              </ol>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;