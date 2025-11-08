import React, { useState } from 'react';
import { Upload, Crop } from 'lucide-react';
import ImgBBUploader from './ImgBBUploader';
import ImageCropper from './ImageCropper';
import { toast } from 'react-toastify';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  showPreview?: boolean;
  previewClassName?: string;
  cropAspect?: number;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = "https://exemple.com/image.jpg",
  showPreview = false,
  previewClassName = "aspect-video",
  cropAspect = 16 / 9
}) => {
  const [showImgBBUploader, setShowImgBBUploader] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUploadSuccess = (url: string) => {
    onChange(url);
    setShowImgBBUploader(false);
  };

  const uploadCroppedImageToImgBB = async (blobUrl: string): Promise<string> => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'cropped-image.jpg');

      const imgbbResponse = await fetch(
        'https://api.imgbb.com/1/upload?key=940a158f4a9430a42afa4ed069957804',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await imgbbResponse.json();

      if (data.success) {
        return data.data.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      throw error;
    }
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    setUploading(true);
    try {
      toast.info('Upload de l\'image recadrée...');
      const uploadedUrl = await uploadCroppedImageToImgBB(croppedImageUrl);
      onChange(uploadedUrl);
      toast.success('Image recadrée et uploadée avec succès !');
      // Clean up blob URL
      URL.revokeObjectURL(croppedImageUrl);
    } catch (error) {
      console.error('Error uploading cropped image:', error);
      toast.error('Erreur lors de l\'upload de l\'image recadrée');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <div className="flex space-x-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {value && (
          <button
            type="button"
            onClick={() => setShowCropper(true)}
            disabled={uploading}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
            title="Recadrer l'image"
          >
            <Crop className="h-4 w-4" />
            <span className="hidden sm:inline">Recadrer</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowImgBBUploader(true)}
          disabled={uploading}
          className="flex items-center space-x-2 px-4 py-2 bg-site-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
          title="Upload via ImgBB"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>
      </div>

      {showPreview && value && (
        <div className={`${previewClassName} border border-zinc-200 rounded-lg overflow-hidden`}>
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZTJlOGYwIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTA1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vbiB0cm91dsOpZTwvdGV4dD4KPC9zdmc+';
            }}
          />
        </div>
      )}

      {showImgBBUploader && (
        <ImgBBUploader
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowImgBBUploader(false)}
          maxImages={1}
          currentImagesCount={0}
        />
      )}

      {showCropper && value && (
        <ImageCropper
          imageUrl={value}
          onClose={() => setShowCropper(false)}
          onCropComplete={handleCropComplete}
          aspect={cropAspect}
        />
      )}

      {uploading && (
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-site-primary"></div>
          <span className="ml-2 text-sm text-zinc-600">Upload en cours...</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
