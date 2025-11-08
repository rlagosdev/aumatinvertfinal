import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BotanicalPattern from '../components/BotanicalPattern';
import CelticKnot from '../components/CelticKnot';
import ContactModal from '../components/ContactModal';
import CategoryCard from '../components/CategoryCard';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../supabase/client';
import { Mail } from 'lucide-react';

interface Category {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
  actif: boolean;
  position: number;
  type_categorie: string | null;
}

const Categories: React.FC = () => {
  const { cartItems } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('actif', true)
        .eq('type_categorie', 'epicerie')
        .order('position');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafaf8' }}>
      <Header cartItemsCount={cartItems.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden">
        <BotanicalPattern />

        {/* Page Header */}
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-5xl font-bold text-zinc-800 mb-6 font-display" style={{ letterSpacing: '0.02em' }}>
            Nos produits d'épicerie
          </h1>

          <p className="text-xl text-zinc-700 mb-8 max-w-3xl mx-auto">
            Découvrez notre sélection de produits fins et de qualité
          </p>

          {/* Epicerie Description Section */}
          <div className="rounded-lg p-8 max-w-3xl mx-auto bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 shadow-sm">
            <ul className="space-y-3 text-site-text-dark text-left inline-block">
              <li className="flex items-start">
                <span className="text-site-buttons mr-3 text-xl">•</span>
                <span className="text-lg">Fromages affinés, yaourts et produits laitiers</span>
              </li>
              <li className="flex items-start">
                <span className="text-site-buttons mr-3 text-xl">•</span>
                <span className="text-lg">Fruits & légumes frais du MIN de Nantes</span>
              </li>
              <li className="flex items-start">
                <span className="text-site-buttons mr-3 text-xl">•</span>
                <span className="text-lg">Biscuits apéritifs, chocolats fins, confitures artisanales</span>
              </li>
              <li className="flex items-start">
                <span className="text-site-buttons mr-3 text-xl">•</span>
                <span className="text-lg">Conserves de légumes et de poisson, jus & boissons</span>
              </li>
              <li className="flex items-start">
                <span className="text-site-buttons mr-3 text-xl">•</span>
                <span className="text-lg">Alternatives café et produits d'épicerie fine</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12 relative z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-site-primary mx-auto"></div>
            <p className="mt-4 text-zinc-600">Chargement des catégories...</p>
          </div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 mb-12">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && categories.length === 0 && (
          <div className="text-center py-12 relative z-10">
            <h3 className="text-xl font-semibold text-zinc-800 mb-2">
              Aucune catégorie disponible
            </h3>
            <p className="text-zinc-600">
              Aucune catégorie d'épicerie disponible pour le moment.
            </p>
          </div>
        )}

        {/* Contact Button - Show for both filters */}
        <div className="text-center mb-12 relative z-10">
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="inline-flex items-center justify-center px-8 py-4 bg-site-primary text-white rounded-lg hover:bg-opacity-90 shadow-lg text-lg font-semibold transition-all"
          >
            <Mail className="mr-2 h-5 w-5" />
            Une demande spéciale ? Contactez-nous
          </button>
        </div>

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

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        source="Page Produits"
      />
    </div>
  );
};

export default Categories;
