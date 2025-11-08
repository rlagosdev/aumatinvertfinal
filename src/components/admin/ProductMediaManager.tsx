import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { Plus, X, Image as ImageIcon, Video, ArrowUp, ArrowDown, ExternalLink, Copy, Upload } from 'lucide-react';
import ImgBBUploader from './ImgBBUploader';
import CatboxVideoUploader from './CatboxVideoUploader';

interface ProductMedia {
  id: string;
  product_id: string;
  media_type: 'image' | 'video';
  media_url: string;
  media_order: number;
  alt_text: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface ProductMediaManagerProps {
  productId: string;
  onMediaChange?: (media: ProductMedia[]) => void;
}

const ProductMediaManager: React.FC<ProductMediaManagerProps> = ({ productId, onMediaChange }) => {
  const [media, setMedia] = useState<ProductMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImgBBUploader, setShowImgBBUploader] = useState(false);
  const [showCatboxUploader, setShowCatboxUploader] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newAltText, setNewAltText] = useState('');

  useEffect(() => {
    if (productId) {
      fetchMedia();
    }
  }, [productId]);

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('product_media')
        .select('*')
        .eq('product_id', productId)
        .order('media_order');

      if (error) throw error;
      
      const mediaData = (data || []).map(item => ({
        ...item,
        media_type: item.media_type as 'image' | 'video'
      }));
      setMedia(mediaData);
      onMediaChange?.(mediaData);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setLoading(false);
    }
  };

  const canAddMedia = (type: 'image' | 'video') => {
    const typeCount = media.filter(m => m.media_type === type).length;
    return type === 'image' ? typeCount < 4 : typeCount < 1;
  };

  const handleAddMedia = async () => {
    if (!newMediaUrl.trim()) {
      toast.error('Veuillez entrer une URL');
      return;
    }

    if (!canAddMedia(newMediaType)) {
      toast.error(`Limite atteinte: ${newMediaType === 'image' ? '4 images' : '1 vidéo'} maximum`);
      return;
    }

    try {
      const newOrder = Math.max(...media.map(m => m.media_order), -1) + 1;
      
      const { data, error } = await supabase
        .from('product_media')
        .insert({
          product_id: productId,
          media_type: newMediaType,
          media_url: newMediaUrl.trim(),
          media_order: newOrder,
          alt_text: newAltText.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      const typedData = { ...data, media_type: data.media_type as 'image' | 'video' };
      const newMedia = [...media, typedData];
      setMedia(newMedia);
      onMediaChange?.(newMedia);
      
      setNewMediaUrl('');
      setNewAltText('');
      setShowAddForm(false);
      toast.success('Média ajouté avec succès');
    } catch (error) {
      console.error('Error adding media:', error);
      toast.error('Erreur lors de l\'ajout du média');
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce média ?')) return;

    try {
      const { error } = await supabase
        .from('product_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;

      const newMedia = media.filter(m => m.id !== mediaId);
      setMedia(newMedia);
      onMediaChange?.(newMedia);
      toast.success('Média supprimé');
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleReorderMedia = async (mediaId: string, direction: 'up' | 'down') => {
    const currentIndex = media.findIndex(m => m.id === mediaId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= media.length) return;

    const reorderedMedia = [...media];
    [reorderedMedia[currentIndex], reorderedMedia[newIndex]] = [reorderedMedia[newIndex], reorderedMedia[currentIndex]];

    // Mettre à jour les ordres dans la base de données
    try {
      const updates = reorderedMedia.map((item, index) => ({
        id: item.id,
        media_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from('product_media')
          .update({ media_order: update.media_order })
          .eq('id', update.id);
      }

      const updatedMedia = reorderedMedia.map((item, index) => ({
        ...item,
        media_order: index,
      }));

      setMedia(updatedMedia);
      onMediaChange?.(updatedMedia);
    } catch (error) {
      console.error('Error reordering media:', error);
      toast.error('Erreur lors du réarrangement');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiée dans le presse-papiers');
  };

  const handleImgBBUploadSuccess = async (url: string, altText?: string) => {
    try {
      const newOrder = Math.max(...media.map(m => m.media_order), -1) + 1;

      const { data, error } = await supabase
        .from('product_media')
        .insert({
          product_id: productId,
          media_type: 'image',
          media_url: url,
          media_order: newOrder,
          alt_text: altText || null,
        })
        .select()
        .single();

      if (error) throw error;

      const typedData = { ...data, media_type: data.media_type as 'image' | 'video' };
      const newMedia = [...media, typedData];
      setMedia(newMedia);
      onMediaChange?.(newMedia);

      toast.success('Image uploadée et ajoutée avec succès');
    } catch (error) {
      console.error('Error adding uploaded media:', error);
      toast.error('Erreur lors de l\'ajout de l\'image');
    }
  };

  const handleCatboxUploadSuccess = async (url: string, altText?: string) => {
    try {
      const newOrder = Math.max(...media.map(m => m.media_order), -1) + 1;

      const { data, error } = await supabase
        .from('product_media')
        .insert({
          product_id: productId,
          media_type: 'video',
          media_url: url,
          media_order: newOrder,
          alt_text: altText || null,
        })
        .select()
        .single();

      if (error) throw error;

      const typedData = { ...data, media_type: data.media_type as 'image' | 'video' };
      const newMedia = [...media, typedData];
      setMedia(newMedia);
      onMediaChange?.(newMedia);

      toast.success('Vidéo uploadée et ajoutée avec succès');
    } catch (error) {
      console.error('Error adding uploaded video:', error);
      toast.error('Erreur lors de l\'ajout de la vidéo');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-sm text-zinc-600">Chargement des médias...</p>
      </div>
    );
  }

  const images = media.filter(m => m.media_type === 'image');
  const videos = media.filter(m => m.media_type === 'video');

  return (
    <div className="space-y-6">
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
            {images.map((item, index) => (
              <div key={item.id} className="relative group border border-zinc-200 rounded-lg overflow-hidden">
                <img
                  src={item.media_url}
                  alt={item.alt_text || `Image ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReorderMedia(item.id, 'up')}
                      disabled={index === 0}
                      className="p-1 bg-white rounded-full hover:bg-zinc-100 disabled:opacity-50"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleReorderMedia(item.id, 'down')}
                      disabled={index === images.length - 1}
                      className="p-1 bg-white rounded-full hover:bg-zinc-100 disabled:opacity-50"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(item.media_url)}
                      className="p-1 bg-white rounded-full hover:bg-zinc-100"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => window.open(item.media_url, '_blank')}
                      className="p-1 bg-white rounded-full hover:bg-zinc-100"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="p-2 bg-white">
                  <p className="text-xs text-zinc-600 truncate">{item.alt_text || 'Pas de description'}</p>
                </div>
              </div>
            ))}
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
            {videos.map((item) => (
              <div key={item.id} className="border border-zinc-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Video className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="font-medium text-zinc-900">{item.alt_text || 'Vidéo du produit'}</p>
                      <p className="text-sm text-zinc-500 truncate max-w-md">{item.media_url}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(item.media_url)}
                      className="p-2 text-zinc-600 hover:text-zinc-800"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => window.open(item.media_url, '_blank')}
                      className="p-2 text-zinc-600 hover:text-zinc-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      className="p-2 text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

export default ProductMediaManager;