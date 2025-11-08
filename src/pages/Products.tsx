import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import BotanicalPattern from '../components/BotanicalPattern';
import CelticKnot from '../components/CelticKnot';
import { Search, Filter } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../supabase/client';
import GiftBasketIcon from '../components/icons/GiftBasketIcon';
import CheeseIcon from '../components/icons/CheeseIcon';
import PartyPlatterIcon from '../components/icons/PartyPlatterIcon';

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

const Products: React.FC = () => {
  const { cartItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Toutes les catégories');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('actif', true)
        .order('nom');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Toutes les catégories', ...Array.from(new Set(products.map(p => p.categorie)))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.nom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Toutes les catégories' || product.categorie === selectedCategory;
      return matchesSearch && matchesCategory && product.actif;
    });
  }, [searchTerm, selectedCategory, products]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafaf8' }}>
      <Header cartItemsCount={cartItems.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
        <BotanicalPattern />
        {/* Page Header */}
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-5xl font-bold text-zinc-800 mb-6 font-display" style={{ letterSpacing: '0.02em' }}>Nos produits</h1>

          {/* Custom Orders Section */}
          <div className="rounded-lg p-8 max-w-3xl mx-auto bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-site-company-title mb-4">
              Besoin d'une idée cadeau ou d'un buffet gourmand ?
            </h2>
            <p className="text-lg text-site-text-dark mb-4 font-medium">
              Nous préparons sur commande :
            </p>
            <ul className="space-y-3 text-site-text-dark text-left inline-block">
              <li className="flex items-start">
                <span className="text-site-buttons mr-3 text-xl">•</span>
                <span className="text-lg">Corbeilles de fruits frais</span>
              </li>
              <li className="flex items-start">
                <span className="text-site-buttons mr-3 text-xl">•</span>
                <span className="text-lg">Plateaux apéritifs ou fromagers</span>
              </li>
              <li className="flex items-start">
                <span className="text-site-buttons mr-3 text-xl">•</span>
                <span className="text-lg">Assortiments sur mesure selon vos envies</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent bg-white min-w-48"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
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
              Essayez de modifier vos critères de recherche ou de filtrage.
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

export default Products;