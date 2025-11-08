import React, { useState } from 'react';
import { Plus, X, Image as ImageIcon, Video, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import ImgBBUploader from './ImgBBUploader';
import CatboxVideoUploader from './CatboxVideoUploader';

interface TempMedia {
  url: string;
  type: 'image' | 'video';
  alt: string;
}

interface TempMediaManagerProps {
  mediaList: TempMedia[];
  onMediaChange: (mediaList: TempMedia[]) => void;
}

const TempMediaManager: React.FC<TempMediaManagerProps> = ({ mediaList, onMediaChange }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImgBBUploader, setShowImgBBUploader] = useState(false);
  const [showCatboxUploader, setShowCatboxUploader] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newAltText, setNewAltText] = useState('');

  const images = mediaList.filter(m => m.type === 'image');
  const videos = mediaList.filter(m => m.type === 'video');

  const canAddMedia = (type: 'image' | 'video') => {
    return type === 'image' ? images.length < 4 : videos.length < 1;
  };

  const handleAddMedia = () => {
    if (!newMediaUrl.trim()) {
      toast.error('Veuillez entrer une URL');
      return;
    }

    if (!canAddMedia(newMediaType)) {
      toast.error(`Limite atteinte: ${newMediaType === 'image' ? '4 images' : '1 vidéo'} maximum`);
      return;
    }

    const newMedia: TempMedia = {
      url: newMediaUrl.trim(),
      type: newMediaType,
      alt: newAltText.trim() || '',
    };

    onMediaChange([...mediaList, newMedia]);
    
    setNewMediaUrl('');
    setNewAltText('');
    setShowAddForm(false);
    toast.success('Média ajouté temporairement');
  };

  const handleDeleteMedia = (index: number) => {
    const newMediaList = mediaList.filter((_, i) => i !== index);
    onMediaChange(newMediaList);
    toast.success('Média supprimé');
  };

  const handleReorderMedia = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= mediaList.length) return;

    const newMediaList = [...mediaList];
    [newMediaList[index], newMediaList[newIndex]] = [newMediaList[newIndex], newMediaList[index]];
    onMediaChange(newMediaList);
  };

  const handleImgBBUploadSuccess = (url: string, altText?: string) => {
    const newMedia: TempMedia = {
      url,
      type: 'image',
      alt: altText || '',
    };
    onMediaChange([...mediaList, newMedia]);
    toast.success('Image uploadée avec succès');
  };

  const handleCatboxUploadSuccess = (url: string, altText?: string) => {
    const newMedia: TempMedia = {
      url,
      type: 'video',
      alt: altText || '',
    };
    onMediaChange([...mediaList, newMedia]);
    toast.success('Vidéo uploadée avec succès');
  };

  return (
    <div className="space-y-6 border border-zinc-200 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-zinc-800">Médias du produit</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowImgBBUploader(true)}
            className="flex items-center space-x-2 bg-site-primary text-white px-3 py-2 rounded-lg hover:bg-opacity-90 transition-colors text-sm"
          >
            <Upload className="h-4 w-4" />
            <span>Upload ImgBB</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter URL</span>
          </button>
        </div>
      </div>

      {/* Images Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-zinc-700">Images ({images.length}/4)</h4>
          <div className="text-xs text-zinc-500">Maximum 4 images</div>
        </div>
        
        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {images.map((media, index) => {
              const globalIndex = mediaList.findIndex(m => m === media);
              return (
                <div key={globalIndex} className="relative group border border-zinc-200 rounded-lg overflow-hidden">
                  <img
                    src={media.url}
                    alt={media.alt || `Image ${index + 1}`}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/300x200/e2e8f0/64748b?text=Image+non+trouvée';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReorderMedia(globalIndex, 'up')}
                        disabled={globalIndex === 0}
                        className="p-1 bg-white rounded-full hover:bg-zinc-100 disabled:opacity-50"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleReorderMedia(globalIndex, 'down')}
                        disabled={globalIndex === mediaList.length - 1}
                        className="p-1 bg-white rounded-full hover:bg-zinc-100 disabled:opacity-50"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(globalIndex)}
                        className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-xs text-zinc-600 truncate">{media.alt || 'Pas de description'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-zinc-300 rounded-lg">
            <ImageIcon className="h-12 w-12 text-zinc-400 mx-auto mb-2" />
            <p className="text-zinc-500">Aucune image ajoutée</p>
          </div>
        )}
      </div>

      {/* Videos Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-zinc-700">Vidéo ({videos.length}/1)</h4>
            <div className="text-xs text-zinc-500">Maximum 1 vidéo</div>
          </div>
          {videos.length < 1 && (
            <button
              type="button"
              onClick={() => setShowCatboxUploader(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Vidéo</span>
            </button>
          )}
        </div>
        
        {videos.length > 0 ? (
          <div className="space-y-3">
            {videos.map((media) => {
              const globalIndex = mediaList.findIndex(m => m === media);
              return (
                <div key={globalIndex} className="border border-zinc-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Video className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="font-medium text-zinc-900">{media.alt || 'Vidéo du produit'}</p>
                        <p className="text-sm text-zinc-500 truncate max-w-md">{media.url}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteMedia(globalIndex)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-zinc-300 rounded-lg">
            <Video className="h-12 w-12 text-zinc-400 mx-auto mb-2" />
            <p className="text-zinc-500">Aucune vidéo ajoutée</p>
          </div>
        )}
      </div>

      {/* Add Media Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-zinc-800">Ajouter un média</h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Type de média
                </label>
                <select
                  value={newMediaType}
                  onChange={(e) => setNewMediaType(e.target.value as 'image' | 'video')}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="image">Image ({images.length}/4)</option>
                  <option value="video" disabled={videos.length >= 1}>
                    Vidéo ({videos.length}/1) {videos.length >= 1 && '- Limite atteinte'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  URL du média *
                </label>
                <input
                  type="url"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://exemple.com/image.jpg"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Description (alt text)
                </label>
                <input
                  type="text"
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  placeholder="Description du média..."
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-zinc-600 hover:text-zinc-800"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleAddMedia}
                  disabled={!canAddMedia(newMediaType)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 Les médias seront sauvegardés une fois le produit créé avec succès.
        </p>
      </div>

      {/* ImgBB Uploader Modal */}
      {showImgBBUploader && (
        <ImgBBUploader
          onUploadSuccess={handleImgBBUploadSuccess}
          onClose={() => setShowImgBBUploader(false)}
          maxImages={4}
          currentImagesCount={images.length}
        />
      )}

      {/* Catbox Video Uploader Modal */}
      {showCatboxUploader && (
        <CatboxVideoUploader
          onUploadSuccess={handleCatboxUploadSuccess}
          onClose={() => setShowCatboxUploader(false)}
        />
      )}
    </div>
  );
};

export default TempMediaManager;