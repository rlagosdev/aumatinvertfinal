import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Calendar, Users, Utensils, Sparkles, Heart, Award, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase/client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BotanicalPattern from '../components/BotanicalPattern';
import CelticKnot from '../components/CelticKnot';
import ContactModal from '../components/ContactModal';
import { useCart } from '../contexts/CartContext';

interface EventSection {
  id: string;
  section_key: string;
  image_url: string;
  titre: string;
  description: string;
  position: number;
}

interface Category {
  id: string;
  nom: string;
  description: string | null;
  image_url: string | null;
  actif: boolean;
  position: number;
  type_categorie: string | null;
}

const Events: React.FC = () => {
  const { cartItems } = useCart();
  const [sections, setSections] = useState<EventSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    fetchSections();
    fetchCategories();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('evenements_config')
        .select('*')
        .eq('actif', true)
        .order('position');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching event sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('actif', true)
        .eq('type_categorie', 'preparation')
        .order('position');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const heroSection = sections.find(s => s.section_key === 'hero');
  const contentSections = sections.filter(s => s.section_key !== 'hero');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-site-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafaf8' }}>
      <Header cartItemsCount={cartItems.length} />

      <main className="relative overflow-hidden">
        <BotanicalPattern />

      {/* Hero Section */}
      {heroSection && (
        <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden z-10">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src={heroSection.image_url}
              alt={heroSection.titre}
              className="w-full h-full object-cover"
              loading="eager"
              fetchpriority="high"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                {heroSection.titre}
              </h1>
              <div className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed space-y-3">
                {heroSection.description.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph.trim()}</p>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="tel:+33240634931"
                  className="inline-flex items-center justify-center px-8 py-4 bg-site-primary text-white rounded-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg text-lg font-semibold"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Appelez-nous
                </a>
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-site-primary rounded-lg hover:bg-gray-100 shadow-lg text-lg font-semibold"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Contactez-nous
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Introduction Section */}
      <section className="py-20 bg-white bg-opacity-95 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Pour toutes vos occasions
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Des compositions personnalisées pour chaque type d'événement :
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto mb-8">
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                <h3 className="font-bold text-lg text-site-primary mb-3 flex items-center">
                  <Heart className="h-5 w-5 mr-2" />
                  Événements familiaux
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-site-buttons mr-2">•</span>
                    <span>Mariages</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-site-buttons mr-2">•</span>
                    <span>Baptêmes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-site-buttons mr-2">•</span>
                    <span>Anniversaires</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-site-buttons mr-2">•</span>
                    <span>Fêtes familiales</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                <h3 className="font-bold text-lg text-site-primary mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Événements professionnels
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-site-buttons mr-2">•</span>
                    <span>Réceptions d'entreprise</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-site-buttons mr-2">•</span>
                    <span>Séminaires</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-site-buttons mr-2">•</span>
                    <span>Réunions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-site-buttons mr-2">•</span>
                    <span>Départs à la retraite</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                <h3 className="font-bold text-lg text-site-primary mb-3 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Cadeaux d'affaires
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-site-buttons mr-2">•</span>
                    <span>Cadeaux clients</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-site-buttons mr-2">•</span>
                    <span>Cadeaux collaborateurs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-site-buttons mr-2">•</span>
                    <span>Corbeilles gourmandes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-site-buttons mr-2">•</span>
                    <span>Assortiments personnalisés</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-lg text-gray-600 leading-relaxed italic">
              Chaque plateau est une création unique, décorée avec soin pour sublimer visuellement et gustativement votre événement.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow border border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-site-primary rounded-full mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Produits frais</h3>
              <p className="text-gray-600">Fruits, fromages et produits de qualité sélectionnés avec soin</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow border border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-site-primary rounded-full mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Personnalisation</h3>
              <p className="text-gray-600">Plateaux adaptés à votre thème et vos préférences</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow border border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-site-primary rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Décoration soignée</h3>
              <p className="text-gray-600">Présentation visuelle raffinée pour émerveiller vos invités</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow border border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-site-primary rounded-full mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Fraîcheur garantie</h3>
              <p className="text-gray-600">Préparation le jour même pour une qualité optimale</p>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Preparations Section */}
      <section className="py-16 bg-white bg-opacity-95 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-lg p-8 bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Nos préparations à la demande
              </h2>
              <p className="text-lg text-site-text-dark mb-6 font-medium text-center">
                Nous préparons à la demande :
              </p>
              <ul className="space-y-4 text-site-text-dark mb-8 max-w-2xl mx-auto">
                <li className="flex items-start">
                  <span className="text-site-buttons mr-3 text-xl flex-shrink-0">•</span>
                  <span className="text-lg">Corbeilles de fruits frais, prêtes à savourer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-site-buttons mr-3 text-xl flex-shrink-0">•</span>
                  <span className="text-lg">Plateaux apéritifs : fromagers ou mixtes fruits & fromage</span>
                </li>
                <li className="flex items-start">
                  <span className="text-site-buttons mr-3 text-xl flex-shrink-0">•</span>
                  <span className="text-lg">Créations personnalisées pour vos petites occasion, selon vos goûts</span>
                </li>
              </ul>
              <div className="bg-site-primary/10 border-l-4 border-site-primary p-6 rounded-lg">
                <p className="text-site-text-dark font-medium text-lg">
                  ⏰ <strong>Fraîcheur garantie :</strong> Nos produits sont préparés le jour même ! Le délai vous est affiché lorsque vous cliquez sur le calendrier de la fiche produit.
                </p>
              </div>

              {/* Additional Product Categories */}
              <div className="mt-8 pt-8 border-t border-gray-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Autres plateaux & produits événementiels
                </h3>
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/produits/${encodeURIComponent(category.nom)}`}
                      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Category Image */}
                      {category.image_url ? (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={category.image_url}
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
                  ))}
                </div>
              </div>

              {/* Contact CTA */}
              <div className="mt-8 pt-8 border-t border-gray-300 text-center">
                <p className="text-xl font-bold text-gray-900 mb-4">
                  Une demande spéciale ? Contactez-nous
                </p>
                <p className="text-gray-600 mb-6">
                  📍 Retrait en magasin : 1 rue du Nil, 44800 Saint-Herblain • 🚚 Livraison possible dans un rayon de 3km
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="tel:+33240634931"
                    className="inline-flex items-center justify-center px-6 py-3 bg-site-primary text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    02 40 63 49 31
                  </a>
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-site-primary border-2 border-site-primary rounded-lg hover:bg-green-50 transition-colors font-semibold"
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Formulaire de contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections - Alternating Layout */}
      {contentSections.map((section, index) => {
        const isEven = index % 2 === 0;

        return (
          <section
            key={section.id}
            className="py-16 bg-white bg-opacity-95 relative z-10"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
                {/* Image */}
                <div className="lg:w-1/2">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src={section.image_url}
                      alt={section.titre}
                      className="w-full h-[400px] object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="lg:w-1/2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-site-primary rounded-full mb-4">
                    {index % 4 === 0 && <Heart className="h-6 w-6 text-white" />}
                    {index % 4 === 1 && <Calendar className="h-6 w-6 text-white" />}
                    {index % 4 === 2 && <Utensils className="h-6 w-6 text-white" />}
                    {index % 4 === 3 && <Sparkles className="h-6 w-6 text-white" />}
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                    {section.titre}
                  </h2>

                  <div className="text-lg text-gray-600 leading-relaxed space-y-3">
                    {section.description.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph.trim()}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Why Choose Us Section */}
      <section className="py-20 bg-site-primary text-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pourquoi choisir nos plateaux ?
            </h2>
            <p className="text-xl text-white max-w-3xl mx-auto opacity-90">
              Chaque plateau est pensé pour sublimer votre événement, tant visuellement que gustativement
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 rounded-xl p-8 hover:bg-white/20 transition-colors border border-white/20">
              <h3 className="text-2xl font-bold mb-4">Savoir-faire</h3>
              <p className="text-white leading-relaxed opacity-90">
                Plus de 20 ans d'expérience dans la création de plateaux gourmands personnalisés.
                Des centaines de clients satisfaits pour leurs événements marquants.
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-8 hover:bg-white/20 transition-colors border border-white/20">
              <h3 className="text-2xl font-bold mb-4">Sur mesure</h3>
              <p className="text-white leading-relaxed opacity-90">
                Chaque plateau est unique : nous adaptons la composition, la décoration et la présentation à votre thème et vos envies.
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-8 hover:bg-white/20 transition-colors border border-white/20">
              <h3 className="text-2xl font-bold mb-4">Créativité</h3>
              <p className="text-white leading-relaxed opacity-90">
                L'art de la présentation : nos plateaux sont de véritables créations visuelles qui émerveillent vos invités avant même la dégustation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white bg-opacity-95 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Comment commander ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un processus simple pour créer votre plateau gourmand personnalisé
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Contact',
                description: 'Contactez-nous par téléphone ou email pour nous parler de votre événement'
              },
              {
                step: '2',
                title: 'Personnalisation',
                description: 'Nous discutons ensemble de vos envies, du thème et de la composition de votre plateau'
              },
              {
                step: '3',
                title: 'Validation',
                description: 'Nous validons ensemble les détails : composition, décoration, date de retrait'
              },
              {
                step: '4',
                title: 'Préparation',
                description: 'Nous préparons votre plateau le jour même avec soin pour une fraîcheur optimale'
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-site-primary text-white rounded-full text-2xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white bg-opacity-95 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Prêt à commander votre plateau unique ?
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Contactez-nous dès aujourd'hui pour créer ensemble votre plateau gourmand personnalisé.
            Nous sommes à votre écoute pour donner vie à vos envies et sublimer votre événement.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="tel:+33240634931"
              className="inline-flex items-center justify-center px-10 py-5 bg-site-primary text-white rounded-xl hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-xl text-xl font-bold"
            >
              <Phone className="mr-3 h-6 w-6" />
              02 40 63 49 31
            </a>
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                setIsContactModalOpen(true);
              }}
              className="inline-flex items-center justify-center px-10 py-5 bg-white text-site-primary border-2 border-site-primary rounded-xl hover:bg-green-50 shadow-xl text-xl font-bold"
            >
              <Mail className="mr-3 h-6 w-6" />
              Formulaire de contact
            </button>
          </div>

          <p className="mt-8 text-gray-500">
            Réponse garantie sous 24h • Devis gratuit et sans engagement
          </p>
        </div>
      </section>

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
        source="Page Événements"
      />
    </div>
  );
};

export default Events;
