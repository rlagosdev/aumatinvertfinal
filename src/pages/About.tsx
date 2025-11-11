import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../supabase/client';
import { Heart, Store, Users, Award, Info } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface AboutSection {
  id: string;
  section_key: string;
  image_url: string;
  titre: string;
  description: string;
  icon: string;
  position: number;
  actif: boolean;
}

const ICON_MAP: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'Store': Store,
  'Heart': Heart,
  'Users': Users,
  'Award': Award,
  'Info': Info
};

const About: React.FC = () => {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { cartItems } = useCart();

  useEffect(() => {
    fetchAboutSections();
  }, []);

  const fetchAboutSections = async () => {
    try {
      const { data, error } = await supabase
        .from('a_propos_config')
        .select('*')
        .eq('actif', true)
        .order('position');

      if (error) {
        console.warn('About sections not found in database:', error);
      } else if (data) {
        setSections(data);
      }
    } catch (error) {
      console.warn('Error fetching about sections:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartItemsCount={cartItems.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-800 mb-6">À propos du magasin</h1>
          <div className="w-24 h-1 bg-site-primary mx-auto rounded-full"></div>
        </div>

        {/* Main Content - Dynamic Sections */}
        <div className="space-y-16 mb-20">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-site-primary"></div>
              <span className="ml-2 text-zinc-600">Chargement...</span>
            </div>
          )}

          {!loading && sections.map((section, index) => {
            const IconComponent = ICON_MAP[section.icon] || Info;
            const isEven = index % 2 === 0;
            const borderColor = isEven ? 'border-site-primary' : 'border-site-buttons';
            const iconColor = isEven ? 'text-site-primary' : 'text-site-buttons';

            return (
              <div key={section.id} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <div
                  className={`bg-white rounded-lg shadow-sm p-8 border-l-4 ${borderColor} ${
                    isEven ? 'order-1' : 'order-1 lg:order-2'
                  }`}
                >
                  <div className="flex items-center mb-6">
                    <IconComponent className={`h-7 w-7 ${iconColor} mr-4`} />
                    <h2 className="text-2xl md:text-3xl font-bold text-site-company-title">{section.titre}</h2>
                  </div>
                  <div className="text-zinc-700 text-base md:text-lg leading-relaxed space-y-4">
                    {section.description.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph.trim()}</p>
                    ))}
                  </div>
                </div>

                {/* Image */}
                {section.image_url && (
                  <div
                    className={`rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ${
                      isEven ? 'order-2' : 'order-2 lg:order-1'
                    }`}
                  >
                    <img
                      src={section.image_url}
                      alt={section.titre}
                      className="w-full h-80 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-lg shadow-sm p-10 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-site-company-title mb-12 text-center">Nos valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(123, 138, 120, 0.15)' }}>
                <Store className="h-9 w-9 text-site-primary" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-800 mb-3">Local & Régional</h3>
              <p className="text-zinc-600 text-base">Privilégier les producteurs locaux et régionaux</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(176, 195, 172, 0.15)' }}>
                <Heart className="h-9 w-9 text-site-buttons" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-800 mb-3">Qualité</h3>
              <p className="text-zinc-600 text-base">Sélection rigoureuse de chaque produit</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(123, 138, 120, 0.15)' }}>
                <Users className="h-9 w-9 text-site-primary" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-800 mb-3">Proximité</h3>
              <p className="text-zinc-600 text-base">Service personnalisé et conseil</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="rounded-lg p-10 text-white text-center" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-buttons))' }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Venez nous rencontrer !</h2>
          <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Découvrez notre magasin et laissez-vous guider par nos conseils avisés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="bg-white text-site-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Nos services
            </Link>
            <Link
              to="/produits"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-site-primary transition-all duration-200"
            >
              Nos produits
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
