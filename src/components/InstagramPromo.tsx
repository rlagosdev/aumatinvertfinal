import React from 'react';
import { Instagram, ArrowRight, Facebook } from 'lucide-react';

interface InstagramPromoProps {
  className?: string;
  variant?: 'default' | 'compact' | 'hero';
}

const InstagramPromo: React.FC<InstagramPromoProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  const baseClasses = {
    default: "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl p-8 text-center",
    compact: "bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg p-6 text-center",
    hero: "bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl p-8 text-center text-white"
  };

  const titleSizes = {
    default: "text-2xl font-bold mb-4",
    compact: "text-xl font-bold mb-3",
    hero: "text-3xl font-bold mb-4"
  };

  const buttonClasses = {
    default: "inline-flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200",
    compact: "inline-flex items-center space-x-2 bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 text-sm",
    hero: "inline-flex items-center space-x-2 bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-all duration-200"
  };

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      <div className="flex items-center justify-center space-x-4 mb-4">
        <Instagram className="h-12 w-12 text-pink-200" />
        <Facebook className="h-12 w-12 text-blue-200" />
      </div>
      
      <h3 className={titleSizes[variant]}>
        Suivez-nous sur nos réseaux sociaux !
      </h3>
      
      <p className="mb-6 opacity-90">
        Découvrez en exclusivité nos nouveaux produits, les coulisses de notre épicerie,
        et nos conseils pour bien manger local.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <a
          href="https://www.instagram.com/au_matin_vert/"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses[variant]}
        >
          <Instagram className="h-5 w-5" />
          <span>@au_matin_vert</span>
          <ArrowRight className="h-4 w-4" />
        </a>
        
        <a
          href="https://m.facebook.com/profile.php?id=61580055506795"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses[variant].replace('text-purple-600', 'text-blue-600').replace('bg-pink-500', 'bg-blue-500').replace('hover:bg-pink-600', 'hover:bg-blue-600')}
        >
          <Facebook className="h-5 w-5" />
          <span>Au Matin Vert</span>
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
      
      <div className="mt-4 text-sm opacity-75">
        ✨ Stories quotidiennes • 📸 Produits en avant-première • 🥬 Astuces culinaires
      </div>
    </div>
  );
};

export default InstagramPromo;