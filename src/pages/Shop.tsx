import React, { useEffect } from 'react';
import { Package, AlertCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useShopEnabled } from '../hooks/useShopEnabled';
import { useCart } from '../contexts/CartContext';

const Shop: React.FC = () => {
  const { isEnabled, loading } = useShopEnabled();
  const { cartItems } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Page de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartItemsCount={cartItems.length} />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Si la boutique est désactivée
  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header cartItemsCount={cartItems.length} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mb-6">
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Boutique temporairement indisponible
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Notre boutique en ligne est actuellement fermée pour maintenance.
              Nous reviendrons bientôt avec de nouveaux produits !
            </p>
            <div className="space-y-4">
              <p className="text-gray-600">
                En attendant, vous pouvez :
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors gap-2"
                >
                  <Home className="w-5 h-5" />
                  Retour à l'accueil
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Boutique active
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section with Au Matin Vert colors */}
      <div className="bg-site-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4">
              <Package className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Les Accros du Vert
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-4">
              Pour ceux qui kiffent le naturel et assument leur addiction aux bonnes vibes vertes 🌿✨
            </p>
            <p className="text-lg text-white/80 max-w-3xl mx-auto italic">
              Tee-shirts, mugs, tote bags... Portez fièrement votre amour du frais, du local, du green !
              Parce qu'être accro au vert, c'est tout sauf has-been.
            </p>
          </div>
        </div>
      </div>

      {/* Embedded Printify Store */}
      <div className="w-full bg-white">
        <iframe
          src="https://au-matin-vert.printify.me/"
          className="w-full border-0"
          style={{ minHeight: '100vh', height: '100%' }}
          title="Boutique Au Matin Vert"
          loading="lazy"
        />
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
