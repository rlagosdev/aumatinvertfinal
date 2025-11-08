import React, { useState, useRef } from 'react';
import { Video, X, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../../supabase/client';

interface SupabaseVideoUploaderProps {
  onUploadSuccess: (url: string, altText?: string) => void;
  onClose: () => void;
}

const SupabaseVideoUploader: React.FC<SupabaseVideoUploaderProps> = ({
  onUploadSuccess,
  onClose,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string, url: string, status: 'uploading' | 'success' | 'error' } | null>(null);
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToSupabase = async (file: File): Promise<string> => {
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split('.').pop();
    const fileName = `video_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = `social-media/${fileName}`;

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('videos') // Nom du bucket
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(error.message);
    }

    // Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    if (!urlData.publicUrl) {
      throw new Error('Impossible d\'obtenir l\'URL publique');
    }

    return urlData.publicUrl;
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;

    // Vérifier que c'est une vidéo
    if (!file.type.startsWith('video/')) {
      toast.error('Seules les vidéos sont acceptées');
      return;
    }

    // Vérifier la taille (100 MB max pour Supabase Storage gratuit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('La vidéo doit faire moins de 100 MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadedFile({ name: file.name, url: '', status: 'uploading' });

    try {
      // Simuler la progression (Supabase ne fournit pas de progression en temps réel)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const url = await uploadToSupabase(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedFile({ name: file.name, url, status: 'success' });
      toast.success('Vidéo uploadée avec succès');

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadedFile({ name: file.name, url: '', status: 'error' });
      toast.error(`Erreur lors de l'upload : ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file || null);
  };

  const handleAddWithAlt = () => {
    if (uploadedFile?.status === 'success') {
      onUploadSuccess(uploadedFile.url, altText || uploadedFile.name);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-zinc-800">Upload Vidéo via Supabase Storage</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-site-primary bg-purple-50'
              : 'border-zinc-300 bg-zinc-50'
          }`}
        >
          <Video className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-site-primary' : 'text-zinc-400'}`} />
          <p className="text-zinc-700 font-medium mb-2">
            Glissez-déposez votre vidéo ici
          </p>
          <p className="text-sm text-zinc-500 mb-4">
            ou
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-site-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            disabled={uploading}
          >
            Parcourir les fichiers
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={uploading}
          />
          <p className="text-xs text-zinc-500 mt-4">
            Formats: MP4, MOV, AVI, WebM (max 100 MB)
          </p>
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-zinc-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-zinc-600 text-center mt-2">
              Upload en cours... {uploadProgress}%
            </p>
          </div>
        )}

        {/* Optional Alt Text */}
        {uploadedFile?.status === 'success' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Description (optionnelle)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Description de la vidéo..."
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
            />
          </div>
        )}

        {/* Uploaded File Status */}
        {uploadedFile && (
          <div className="mt-6">
            <h4 className="font-medium text-zinc-700 mb-3">Statut de l'upload:</h4>
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {uploadedFile.status === 'uploading' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-site-primary"></div>
                )}
                {uploadedFile.status === 'success' && (
                  <>
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <Video className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  </>
                )}
                {uploadedFile.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 truncate">{uploadedFile.name}</p>
                  {uploadedFile.status === 'success' && (
                    <p className="text-xs text-zinc-500 truncate">{uploadedFile.url}</p>
                  )}
                  {uploadedFile.status === 'error' && (
                    <p className="text-xs text-red-600">Échec de l'upload</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-zinc-600 hover:text-zinc-800"
            disabled={uploading}
          >
            Annuler
          </button>
          {uploadedFile?.status === 'success' && (
            <button
              type="button"
              onClick={handleAddWithAlt}
              disabled={uploading}
              className="px-4 py-2 bg-site-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              Ajouter la vidéo
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 Les vidéos sont stockées sur Supabase Storage (gratuit jusqu'à 1GB). Taille max: 100MB par vidéo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseVideoUploader;
