import React from 'react';
import { useProductMainImage } from '../hooks/useProductMainImage';

interface CartProductImageProps {
  productId: string;
  productName: string;
  fallbackImageUrl: string | null;
}

const CartProductImage: React.FC<CartProductImageProps> = ({
  productId,
  productName,
  fallbackImageUrl
}) => {
  const { imageUrl, loading } = useProductMainImage(productId, fallbackImageUrl);

  if (loading) {
    return (
      <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-400 text-xs">...</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={productName}
      className="w-20 h-20 object-cover rounded-lg"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop';
      }}
    />
  );
};

export default CartProductImage;
