import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { supabase } from '../supabase/client';

interface CategoryCardProps {
  category: {
    id: string;
    nom: string;
    description: string | null;
    image_url: string | null;
    updated_at?: string | null;
  };
}

interface CarouselImage {
  id: string;
  image_url: string;
  position: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCarouselImages();
  }, [category.id]);

  const fetchCarouselImages = async () => {
    try {
      const { data, error } = await supabase
        .from('category_carousel_images')
        .select('image_url')
        .eq('category_id', category.id)
        .order('position');

      if (error) throw error;

      if (data && data.length > 0) {
        // Use images from database
        setCarouselImages(data.map(img => img.image_url));
      } else {
        // Fallback to category main image if no carousel images
        const fallbackImages = category.image_url ? [category.image_url] : [];
        setCarouselImages(fallbackImages);
      }
    } catch (error) {
      console.error('Error fetching carousel images:', error);
      // Fallback to category main image
      const fallbackImages = category.image_url ? [category.image_url] : [];
      setCarouselImages(fallbackImages);
    } finally {
      setLoading(false);
    }
  };

  const images = carouselImages;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link
      to={`/produits/${encodeURIComponent(category.nom)}`}
      className="group bg-white bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
    >
      {/* Category Image with Carousel */}
      <div className="relative h-64 overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={`${images[currentImageIndex]}?t=${category.updated_at || Date.now()}`}
              alt={category.nom}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />

            {/* Carousel Controls - Only show if multiple images */}
            {images.length > 1 && (
              <>
                {/* Previous Button */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-zinc-800 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Next Button */}
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-zinc-800 rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-6'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Aller à l'image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="h-64 bg-gradient-to-br from-site-primary to-site-buttons flex items-center justify-center">
            <span className="text-white text-4xl font-bold">
              {category.nom.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Category Info */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-site-company-title mb-2 group-hover:text-site-primary transition-colors">
          {category.nom}
        </h3>
        {category.description && (
          <p className="text-zinc-600 mb-4 line-clamp-2">
            {category.description}
          </p>
        )}
        <div className="flex items-center text-site-primary font-semibold group-hover:translate-x-2 transition-transform">
          <span>Découvrir</span>
          <ChevronRight className="h-5 w-5 ml-1" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
