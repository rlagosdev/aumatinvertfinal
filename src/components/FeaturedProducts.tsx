import React from 'react';
    import { Link } from 'react-router-dom';
    import ProductCard from './ProductCard';
    import { ArrowRight, Loader2 } from 'lucide-react';
    import { useFeaturedProducts } from '../hooks/useFeaturedProducts';

    const FeaturedProducts: React.FC = () => {
      const { getFeaturedProducts, loading, error } = useFeaturedProducts();
      const featuredProducts = getFeaturedProducts();

      // Ne pas afficher la section si aucun produit n'est configuré ou si elle est désactivée
      if (!featuredProducts || featuredProducts.length === 0) {
        return null;
      }

      if (loading) {
        return (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-site-primary" />
              </div>
            </div>
          </section>
        );
      }

      if (error) {
        return (
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-8">
                <p className="text-red-600">Erreur lors du chargement des produits phares</p>
              </div>
            </div>
          </section>
        );
      }

      return (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-zinc-800 mb-4">
                Nos produits phares
              </h2>
              <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                Découvrez une sélection de nos meilleurs produits locaux et artisanaux, 
                soigneusement choisis pour leur qualité exceptionnelle.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
            
            <div className="text-center">
              <Link
                to="/produits"
                className="inline-flex items-center space-x-2 bg-site-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-site-buttons transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>Voir tous nos produits</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      );
    };

    export default FeaturedProducts;