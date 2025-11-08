import React, { useState, useEffect } from 'react';
import { Phone, Mail, Calendar, Users, Utensils, Sparkles, Heart, Award, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../supabase/client';

interface EventSection {
  id: string;
  section_key: string;
  image_url: string;
  titre: string;
  description: string;
  position: number;
}

const Evenements: React.FC = () => {
  const [sections, setSections] = useState<EventSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      {heroSection && (
        <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img
              src={heroSection.image_url}
              alt={heroSection.titre}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
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
                  href="tel:+33123456789"
                  className="inline-flex items-center justify-center px-8 py-4 bg-site-primary text-white rounded-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg text-lg font-semibold"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Appelez-nous
                </a>
                <a
                  href="mailto:contact@aumatinvert.fr"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-site-primary rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg text-lg font-semibold"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Contactez-nous
                </a>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white rounded-full"></div>
            </div>
          </div>
        </section>
      )}

      {/* Introduction Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Créons ensemble votre événement d'exception
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Depuis plus de 10 ans, nous mettons notre savoir-faire et notre passion au service de vos moments les plus précieux.
              Chaque événement est unique, et nous nous engageons à créer une expérience sur mesure qui dépassera vos attentes.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-white shadow-md hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-site-primary rounded-full mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Qualité premium</h3>
              <p className="text-gray-600">Produits frais et locaux sélectionnés avec soin</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-white shadow-md hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-site-primary rounded-full mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Service personnalisé</h3>
              <p className="text-gray-600">Une équipe dédiée à la réussite de votre événement</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-white shadow-md hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-site-primary rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Créativité</h3>
              <p className="text-gray-600">Des créations originales adaptées à votre thème</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-white shadow-md hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-site-primary rounded-full mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Ponctualité</h3>
              <p className="text-gray-600">Service impeccable et livraison à l'heure</p>
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
            className={`py-16 ${isEven ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
                {/* Image */}
                <div className="lg:w-1/2">
                  <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                    <img
                      src={section.image_url}
                      alt={section.titre}
                      className="w-full h-[400px] object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

                  <div className="text-lg text-gray-600 leading-relaxed mb-6 space-y-3">
                    {section.description.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph.trim()}</p>
                    ))}
                  </div>

                  {/* Additional descriptive text based on section */}
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-site-primary mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">
                        Menu personnalisé selon vos préférences et contraintes alimentaires
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-site-primary mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">
                        Service professionnel et discret pour un événement sans stress
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-site-primary mr-3 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">
                        Matériel et décoration inclus pour une présentation soignée
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-r from-site-primary to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Notre engagement est de faire de votre événement un moment inoubliable, où chaque détail compte
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-colors">
              <h3 className="text-2xl font-bold mb-4">Expérience</h3>
              <p className="text-green-100 leading-relaxed">
                Plus de 10 ans d'expertise dans l'organisation d'événements de toutes tailles.
                Des centaines de clients satisfaits nous font confiance pour leurs moments les plus importants.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-colors">
              <h3 className="text-2xl font-bold mb-4">Flexibilité</h3>
              <p className="text-green-100 leading-relaxed">
                Nous nous adaptons à tous vos besoins : budget, thème, nombre d'invités, contraintes particulières.
                Votre satisfaction est notre priorité absolue.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 hover:bg-white/20 transition-colors">
              <h3 className="text-2xl font-bold mb-4">Passion</h3>
              <p className="text-green-100 leading-relaxed">
                Chaque événement est traité avec le même soin et la même attention aux détails.
                Notre équipe passionnée met tout son cœur dans la réussite de votre projet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un processus simple et transparent pour organiser votre événement en toute sérénité
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Contact',
                description: 'Contactez-nous par téléphone ou email pour nous parler de votre projet'
              },
              {
                step: '2',
                title: 'Devis',
                description: 'Nous élaborons un devis personnalisé adapté à vos besoins et votre budget'
              },
              {
                step: '3',
                title: 'Planification',
                description: 'Nous organisons ensemble les détails : menu, service, timing, décoration'
              },
              {
                step: '4',
                title: 'Réalisation',
                description: 'Le jour J, notre équipe s\'occupe de tout pour que vous profitiez pleinement'
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
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Prêt à créer votre événement de rêve ?
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            N'attendez plus ! Contactez-nous dès aujourd'hui pour discuter de votre projet.
            Notre équipe est à votre écoute pour transformer vos idées en réalité et créer un événement qui marquera les esprits.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="tel:+33123456789"
              className="inline-flex items-center justify-center px-10 py-5 bg-site-primary text-white rounded-xl hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-xl text-xl font-bold"
            >
              <Phone className="mr-3 h-6 w-6" />
              01 23 45 67 89
            </a>
            <a
              href="mailto:contact@aumatinvert.fr"
              className="inline-flex items-center justify-center px-10 py-5 bg-white text-site-primary border-2 border-site-primary rounded-xl hover:bg-green-50 transition-all transform hover:scale-105 shadow-xl text-xl font-bold"
            >
              <Mail className="mr-3 h-6 w-6" />
              contact@aumatinvert.fr
            </a>
          </div>

          <p className="mt-8 text-gray-500">
            Réponse garantie sous 24h • Devis gratuit et sans engagement
          </p>
        </div>
      </section>
    </div>
  );
};

export default Evenements;
