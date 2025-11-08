import React, { useState, useRef } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface ImgBBUploaderProps {
  onUploadSuccess: (url: string, altText?: string) => void;
  onClose: () => void;
  maxImages?: number;
  currentImagesCount?: number;
}

const ImgBBUploader: React.FC<ImgBBUploaderProps> = ({
  onUploadSuccess,
  onClose,
  maxImages = 4,
  currentImagesCount = 0
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string, url: string, status: 'uploading' | 'success' | 'error' }[]>([]);
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ImgBB API key - À configurer dans les paramètres admin
  const IMGBB_API_KEY = '940a158f4a9430a42afa4ed069957804';

  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return data.data.url;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - currentImagesCount - uploadedFiles.filter(f => f.status === 'success').length;
    if (remainingSlots <= 0) {
      toast.error(`Limite atteinte: ${maxImages} images maximum`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    const invalidFiles = Array.from(files).filter(f => !f.type.startsWith('image/'));

    if (invalidFiles.length > 0) {
      toast.error('Seules les images sont acceptées');
      return;
    }

    setUploading(true);

    for (const file of filesToUpload) {
      const fileEntry = { name: file.name, url: '', status: 'uploading' as const };
      setUploadedFiles(prev => [...prev, fileEntry]);

      try {
        const url = await uploadToImgBB(file);

        setUploadedFiles(prev =>
          prev.map(f =>
            f.name === file.name && f.status === 'uploading'
              ? { ...f, url, status: 'success' }
              : f
          )
        );

      } catch (error) {
        console.error('Upload error:', error);
        setUploadedFiles(prev =>
          prev.map(f =>
            f.name === file.name && f.status === 'uploading'
              ? { ...f, status: 'error' }
              : f
          )
        );
        toast.error(`Erreur lors de l'upload de ${file.name}`);
      }
    }

    setUploading(false);
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
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleAddAllWithAlt = () => {
    const successfulUploads = uploadedFiles.filter(f => f.status === 'success');
    successfulUploads.forEach(file => {
      onUploadSuccess(file.url, altText || file.name);
    });
    onClose();
  };

  const successfulUploads = uploadedFiles.filter(f => f.status === 'success');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Close modal if clicking on backdrop
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
          <h3 className="text-lg font-semibold text-zinc-800">Upload Images via ImgBB</h3>
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
          <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-site-primary' : 'text-zinc-400'}`} />
          <p className="text-zinc-700 font-medium mb-2">
            Glissez-déposez vos images ici
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
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <p className="text-xs text-zinc-500 mt-4">
            {maxImages - currentImagesCount} image(s) restante(s) • Formats: JPG, PNG, GIF, WEBP (max 32 MB)
          </p>
        </div>

        {/* Optional Alt Text */}
        {successfulUploads.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Description (optionnelle, commune à toutes les images)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Description des images..."
              className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
            />
          </div>
        )}

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-medium text-zinc-700 mb-3">Fichiers uploadés:</h4>
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {file.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-site-primary"></div>
                  )}
                  {file.status === 'success' && (
                    <>
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    </>
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">{file.name}</p>
                    {file.status === 'success' && (
                      <p className="text-xs text-zinc-500 truncate">{file.url}</p>
                    )}
                    {file.status === 'error' && (
                      <p className="text-xs text-red-600">Échec de l'upload</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
          {successfulUploads.length > 0 && (
            <button
              type="button"
              onClick={handleAddAllWithAlt}
              disabled={uploading}
              className="px-4 py-2 bg-site-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              Ajouter {successfulUploads.length} image(s)
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            💡 Les images sont uploadées automatiquement sur ImgBB et les liens sont générés instantanément.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImgBBUploader;
