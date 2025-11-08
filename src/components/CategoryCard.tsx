import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface CategoryCardProps {
  category: {
    id: string;
    nom: string;
    description: string | null;
    image_url: string | null;
  };
}

// Mapping of categories with multiple images
const categoryImages: Record<string, string[]> = {
  'Produits laitiers': [
    '/categories/produits-laitiers.jpeg',
    '/categories/produits-laitiers-2.jpeg',
    '/categories/produits-laitiers-3.jpeg',
    '/categories/produits-laitiers-4.jpeg'
  ],
  'Fruits': [
    '/categories/fruits.jpeg',
    '/categories/fruits-2.jpeg',
    '/categories/fruits-3.jpeg'
  ],
  'Confitures': [
    '/categories/confitures.jpeg',
    '/categories/confitures-2.jpeg'
  ],
  'Biscuits apéritifs': [
    '/categories/biscuits-aperitifs.jpeg',
    '/categories/biscuits-aperitifs-2.jpeg'
  ],
  'Alternatives café': ['/categories/alternatives-cafe.jpeg'],
  'Légumes': ['/categories/legumes.jpeg'],
  'Conserves de légumes': ['/categories/conserves-legumes.jpeg'],
  'Biscuits': ['/categories/biscuits.jpeg'],
  'Chocolats': ['/categories/chocolats.jpeg'],
  'Conserves de poisson': ['/categories/conserves-poisson.jpeg'],
  'Jus & boissons': ['/categories/jus-boissons.jpeg']
};

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const images = categoryImages[category.nom] || (category.image_url ? [category.image_url] : []);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
              src={images[currentImageIndex]}
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
