import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../../supabase/client';

interface VideoUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  accept?: string;
}

const VideoUploadField: React.FC<VideoUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "/hero-video.mp4, URL YouTube ou https://example.com/video.mp4",
  accept = "video/*"
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier que c'est bien une vidéo
    if (!file.type.startsWith('video/')) {
      toast.error('Veuillez sélectionner un fichier vidéo (MP4, WebM, etc.)');
      return;
    }

    // Vérifier la taille (limite à 50MB pour Supabase)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      toast.error(`La vidéo est trop volumineuse (${sizeMB}MB). Maximum 50MB. Veuillez compresser votre vidéo ou utiliser une URL externe.`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `video-${Date.now()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      toast.info('Upload de la vidéo en cours...');

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('images-produits')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('images-produits')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      onChange(publicUrl);
      toast.success('Vidéo uploadée avec succès !');

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast.error(`Erreur lors de l'upload: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClearUrl = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-700">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />

        <div className="flex gap-2">
          {value && (
            <button
              type="button"
              onClick={handleClearUrl}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap text-sm"
              title="Effacer l'URL"
            >
              <X className="h-4 w-4" />
              <span>Effacer</span>
            </button>
          )}

          <label className="flex items-center justify-center space-x-2 px-4 py-2 bg-site-primary text-white rounded-lg hover:bg-opacity-90 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap text-sm">
            <Upload className="h-4 w-4" />
            <span>
              {uploading ? 'Upload...' : 'Upload Vidéo'}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-site-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>💡 Astuce :</strong> Pour les vidéos volumineuses (&gt; 50MB), il est recommandé de :
        </p>
        <ul className="text-xs text-blue-700 mt-1 ml-4 list-disc">
          <li>Les héberger sur YouTube, Vimeo ou un CDN</li>
          <li>Les compresser avec un outil comme HandBrake</li>
          <li>Les stocker dans un service cloud (Google Drive, Cloudflare R2, etc.) et saisir l'URL directe</li>
        </ul>
      </div>

      {value && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Aperçu de la vidéo:</p>
          {isYouTubeUrl(value) ? (
            <div className="relative w-full max-w-2xl" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(value)}?autoplay=0&mute=1&controls=1`}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                title="YouTube video preview"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              src={value}
              className="w-full max-w-2xl rounded-lg"
              style={{ maxHeight: '300px', objectFit: 'cover' }}
              controls
              muted
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoUploadField;
