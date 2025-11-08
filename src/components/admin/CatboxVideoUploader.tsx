import React, { useState, useRef } from 'react';
import { Video, X, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface CatboxVideoUploaderProps {
  onUploadSuccess: (url: string, altText?: string) => void;
  onClose: () => void;
}

const CatboxVideoUploader: React.FC<CatboxVideoUploaderProps> = ({
  onUploadSuccess,
  onClose,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string, url: string, status: 'uploading' | 'success' | 'error' } | null>(null);
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCatbox = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const url = await response.text();

    if (!url || url.includes('error') || url.includes('failed')) {
      throw new Error('Upload failed');
    }

    return url.trim();
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;

    // Vérifier que c'est une vidéo
    if (!file.type.startsWith('video/')) {
      toast.error('Seules les vidéos sont acceptées');
      return;
    }

    // Vérifier la taille (200 MB max pour Catbox)
    if (file.size > 200 * 1024 * 1024) {
      toast.error('La vidéo doit faire moins de 200 MB');
      return;
    }

    setUploading(true);
    setUploadedFile({ name: file.name, url: '', status: 'uploading' });

    try {
      const url = await uploadToCatbox(file);

      setUploadedFile({ name: file.name, url, status: 'success' });
      toast.success('Vidéo uploadée avec succès');

    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFile({ name: file.name, url: '', status: 'error' });
      toast.error(`Erreur lors de l'upload de ${file.name}`);
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
          <h3 className="text-lg font-semibold text-zinc-800">Upload Vidéo via Catbox</h3>
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
          >
            Parcourir les fichiers
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="text-xs text-zinc-500 mt-4">
            Formats: MP4, MOV, AVI, WebM (max 200 MB)
          </p>
        </div>

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
            💡 Les vidéos sont uploadées sur Catbox.moe (gratuit, permanent) et les liens sont générés instantanément.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CatboxVideoUploader;
