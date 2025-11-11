import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../supabase/client';

interface EventCategoryCardProps {
  category: {
    id: string;
    nom: string;
    description: string | null;
    image_url: string | null;
  };
  isSelected?: boolean;
}

const EventCategoryCard: React.FC<EventCategoryCardProps> = ({ category, isSelected = false }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(category.image_url);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFirstCarouselImage();
  }, [category.id]);

  const fetchFirstCarouselImage = async () => {
    try {
      const { data, error } = await supabase
        .from('category_carousel_images')
        .select('image_url')
        .eq('category_id', category.id)
        .order('position')
        .limit(1)
        .single();

      if (error) {
        // Si pas d'image dans le carrousel, utiliser l'image principale
        setImageUrl(category.image_url);
      } else if (data) {
        // Utiliser la première image du carrousel
        setImageUrl(data.image_url);
      }
    } catch (error) {
      console.error('Error fetching carousel image:', error);
      setImageUrl(category.image_url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link
      to={`/produits/${encodeURIComponent(category.nom)}`}
      className={`group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isSelected ? 'ring-4 ring-site-primary ring-opacity-50' : ''
      }`}
    >
      {/* Category Image */}
      {imageUrl ? (
        <div className="h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={category.nom}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-site-primary to-site-buttons flex items-center justify-center">
          <span className="text-white text-4xl font-bold">
            {category.nom.charAt(0)}
          </span>
        </div>
      )}

      {/* Category Info */}
      <div className="p-6">
        <h4 className="text-xl font-bold text-site-primary mb-2 group-hover:text-site-buttons transition-colors">
          {category.nom}
        </h4>
        {category.description && (
          <p className="text-gray-600 mb-3 text-sm line-clamp-2">
            {category.description}
          </p>
        )}
        <div className="inline-flex items-center text-site-primary font-semibold group-hover:translate-x-2 transition-transform">
          Découvrir
          <ChevronRight className="h-4 w-4 ml-1" />
        </div>
      </div>
    </Link>
  );
};

export default EventCategoryCard;
