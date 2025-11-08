import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import BotanicalPattern from '../components/BotanicalPattern';
import CelticKnot from '../components/CelticKnot';
import { Search, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../supabase/client';

interface Product {
  id: string;
  nom: string;
  prix: number;
  categorie: string;
  retrait_planifie: boolean | null;
  image_url: string | null;
  actif: boolean | null;
  delai_retrait_valeur?: number | null;
  delai_retrait_unite?: string | null;
  description?: string | null;
  promotion_active?: boolean | null;
  prix_promotionnel?: number | null;
  promotion_date_debut?: string | null;
  promotion_date_fin?: string | null;
  use_price_tiers?: boolean | null;
  vendu_au_poids?: boolean | null;
  prix_par_100g?: number | null;
  unite_poids?: string | null;
  prix_par_personne?: boolean | null;
  prix_unitaire_personne?: number | null;
  nb_personnes_min?: number | null;
  nb_personnes_max?: number | null;
  prix_par_gamme?: boolean | null;
  prix_par_section?: boolean | null;
}

const CategoryProducts: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const { cartItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryType, setCategoryType] = useState<string>('');

  const decodedCategoryName = decodeURIComponent(categoryName || '');

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [categoryName]);

  const fetchCategoryAndProducts = async () => {
    try {
      // Récupérer le type de catégorie depuis la table categories
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('type_categorie')
        .eq('nom', decodedCategoryName)
        .single();

      if (categoryError) {
        console.error('Error fetching category:', categoryError);
      } else if (categoryData) {
        setCategoryType(categoryData.type_categorie || '');
      }

      // Récupérer les produits
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('actif', true)
        .eq('categorie', decodedCategoryName)
        .order('nom');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafaf8' }}>
      <Header cartItemsCount={cartItems.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
        <BotanicalPattern />

        {/* Back Button */}
        <Link
          to="/produits"
          state={{ filterType: categoryType }}
          className="inline-flex items-center text-site-primary hover:text-site-buttons transition-colors mb-6 relative z-10"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="font-medium">Retour aux catégories</span>
        </Link>

        {/* Page Header */}
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-5xl font-bold text-zinc-800 mb-4 font-display" style={{ letterSpacing: '0.02em' }}>
            {decodedCategoryName}
          </h1>
          <div className="w-24 h-1 bg-site-primary mx-auto rounded-full"></div>
        </div>

        {/* Search */}
        <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm p-6 mb-8 relative z-10">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 relative z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-site-primary mx-auto"></div>
            <p className="mt-4 text-zinc-600">Chargement des produits...</p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12 relative z-10">
            <div className="text-zinc-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-800 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-zinc-600">
              {searchTerm
                ? 'Essayez de modifier votre recherche.'
                : 'Aucun produit disponible dans cette catégorie pour le moment.'}
            </p>
          </div>
        )}

        {/* Store Info */}
        <div className="mt-12 rounded-lg p-6 bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 shadow-sm relative z-10">
          <p className="text-site-text-dark text-center">
            📍 Retrait en magasin : 1 rue du Nil, 44800 Saint-Herblain • 🚚 Livraison possible dans un rayon de 3km
          </p>
        </div>

        {/* Celtic Knot Ornament */}
        <div className="relative z-10">
          <CelticKnot />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryProducts;
