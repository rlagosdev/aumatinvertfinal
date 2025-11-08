import React from 'react';
    import HeroHeader from '../components/HeroHeader';
    import Footer from '../components/Footer';
    import Hero from '../components/Hero';
    import FeaturedProducts from '../components/FeaturedProducts';
    import Values from '../components/Values';
    import InstagramPost from '../components/InstagramPost';
    import GoogleReviewsDisplay from '../components/GoogleReviewsDisplay';
    import { useCart } from '../contexts/CartContext';

    const Home: React.FC = () => {
      const { cartItems } = useCart();

      return (
        <div className="min-h-screen bg-white">
          <HeroHeader cartItemsCount={cartItems.length} />

          <main>
            <Hero />
            <Values />
            <FeaturedProducts />

            {/* Google Reviews Section */}
            <GoogleReviewsDisplay />

            {/* Instagram Section */}
            <section className="py-16 bg-gray-50">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <InstagramPost />
              </div>
            </section>
            
            {/* CTA Section */}
            <section className="py-16 relative overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-buttons))' }}></div>
              <div className="absolute inset-0 bg-black/20"></div>

              <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white drop-shadow-lg">
                  Envie de découvrir nos produits ?
                </h2>
                <p className="text-xl mb-8 text-white drop-shadow-md">
                  Explorez notre sélection de produits frais et locaux, ou composez votre plateau gourmand personnalisé.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/evenements"
                    className="bg-white text-site-text-dark px-8 py-4 rounded-lg font-semibold hover:bg-site-background transition-colors duration-200 shadow-lg"
                  >
                    Commander un plateau
                  </a>
                  <a
                    href="/produits"
                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-site-text-dark transition-all duration-200 shadow-lg"
                  >
                    Voir nos produits
                  </a>
                </div>
              </div>
            </section>
          </main>

          <Footer />
        </div>
      );
    };

    export default Home;