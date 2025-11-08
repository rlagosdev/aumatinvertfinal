import React, { useState, useEffect } from 'react';
    import Header from '../components/Header';
    import Footer from '../components/Footer';
    import DeliveryRates from '../components/DeliveryRates';
    import OpeningHours from '../components/OpeningHours';
    import GoogleMap from '../components/GoogleMap';
    import ContactModal from '../components/ContactModal';
    import DeliveryZoneChecker from '../components/DeliveryZoneChecker';
    import { MapPin, Truck, Users, Building, Phone, Mail } from 'lucide-react';
    import { supabase } from '../supabase/client';
    import { useContactInfo } from '../hooks/useContactInfo';

    const Services: React.FC = () => {
      const [serviceImage, setServiceImage] = useState<string>('');
      const [serviceSeniorsImage, setServiceSeniorsImage] = useState<string>('');
      const [serviceBusinessImage, setServiceBusinessImage] = useState<string>('');
      const [loadingImage, setLoadingImage] = useState(true);
      const [isContactModalOpen, setIsContactModalOpen] = useState(false);
      const { contactInfo, loading: contactLoading } = useContactInfo();

      useEffect(() => {
        fetchServiceImages();
      }, []);

      const fetchServiceImages = async () => {
        try {
          const { data, error } = await supabase
            .from('site_settings')
            .select('setting_key, setting_value')
            .in('setting_key', ['service_page_image', 'service_seniors_image', 'service_business_image']);

          if (error) {
            console.warn('Service images not found in database');
          } else if (data) {
            data.forEach(setting => {
              if (setting.setting_key === 'service_page_image') {
                setServiceImage(setting.setting_value);
              } else if (setting.setting_key === 'service_seniors_image') {
                setServiceSeniorsImage(setting.setting_value);
              } else if (setting.setting_key === 'service_business_image') {
                setServiceBusinessImage(setting.setting_value);
              }
            });
          }
        } catch (error) {
          console.warn('Error fetching service images:', error);
        } finally {
          setLoadingImage(false);
        }
      };
      return (
        <div className="min-h-screen bg-gray-50">
          <Header />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Image */}
            {!loadingImage && serviceImage && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={serviceImage}
                  alt="Services & Livraison"
                  className="w-full h-64 md:h-96 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-zinc-800 mb-4">Services & Livraison</h1>
              <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
                Découvrez nos différents services : retrait en magasin, livraison à domicile,
                et nos offres spéciales pour les seniors et entreprises.
              </p>
            </div>

            {/* Main Services */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Store Pickup */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: 'rgba(123, 138, 120, 0.15)' }}>
                    <MapPin className="h-6 w-6 text-site-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-site-company-title">Retrait en magasin</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-zinc-800 mb-2">📍 Adresse</h3>
                    <p className="text-zinc-600">
                      1 rue du Nil<br />
                      44800 Saint-Herblain
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-zinc-800 mb-2">🕒 Horaires</h3>
                    <OpeningHours showStatus={true} />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-zinc-800 mb-2">✅ Avantages</h3>
                    <ul className="text-zinc-600 space-y-1">
                      <li>• Gratuit</li>
                      <li>• Disponible dans la journée</li>
                      <li>• Conseils personnalisés</li>
                      <li>• Parking gratuit</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: 'rgba(176, 195, 172, 0.15)' }}>
                    <Truck className="h-6 w-6 text-site-buttons" />
                  </div>
                  <h2 className="text-2xl font-bold text-site-company-title">Livraison à domicile</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-zinc-800 mb-2">📍 Zone de livraison</h3>
                    <p className="text-zinc-600">
                      Nous livrons nos clients autour du centre commercial des Thébaudières — à Saint-Herblain et dans un rayon d'environ 3 km.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-zinc-800 mb-2">👥 Nos clients</h3>
                    <p className="text-zinc-600 mb-2">Nos livraisons concernent aussi bien :</p>
                    <ul className="text-zinc-600 space-y-2 ml-4">
                      <li>• Les habitants des foyers logements (Les Noëlles, Espace & Vie)</li>
                      <li>• Les entreprises locales souhaitant recevoir des plateaux ou paniers gourmands</li>
                      <li>• Les particuliers souhaitant éviter les déplacements</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-zinc-800 mb-2">💰 Frais de livraison</h3>
                    <div className="text-zinc-600 space-y-1">
                      <div>• 7 € de frais de livraison</div>
                      <div className="font-medium text-site-buttons">• Gratuite dès 50 € d'achat</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-zinc-800 mb-2">🕒 Délais de préparation</h3>
                    <div className="text-zinc-600 space-y-1">
                      <div>• 3 jours minimum pour les préparations (plateaux, corbeilles, etc.)</div>
                      <div className="text-sm italic">* Sauf périodes de Fêtes de fin d'année et Pâques</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Services */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-site-company-title mb-8 text-center">Services spécialisés</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Senior Service */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ borderColor: 'var(--color-primary)', borderWidth: '2px' }}>
                  {/* Image */}
                  {!loadingImage && serviceSeniorsImage && (
                    <div className="h-64 overflow-hidden">
                      <img
                        src={serviceSeniorsImage}
                        alt="Service Seniors - Livraison avec aide au portage"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: 'rgba(123, 138, 120, 0.15)' }}>
                        <Users className="h-6 w-6 text-site-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-site-company-title">Service seniors</h3>
                    </div>

                    <div className="space-y-3">
                      <p className="text-site-text-dark">
                        Service dédié aux personnes âgées.
                      </p>
                      <ul className="text-zinc-600 space-y-2">
                        <li>• Livraison gratuite</li>
                        <li>• Créneaux prioritaires</li>
                        <li>• Commande par téléphone</li>
                      </ul>
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <div className="flex items-center text-site-primary">
                          <Phone className="h-4 w-4 mr-2" />
                          {!contactLoading && contactInfo?.phones?.length > 0 && (
                            <a
                              href={`tel:${contactInfo.phones[0].phone.replace(/\s/g, '')}`}
                              className="font-medium hover:underline"
                            >
                              {contactInfo.phones[0].phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Service */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ borderColor: 'var(--color-buttons)', borderWidth: '2px' }}>
                  {/* Image */}
                  {!loadingImage && serviceBusinessImage && (
                    <div className="h-64 overflow-hidden">
                      <img
                        src={serviceBusinessImage}
                        alt="Service Entreprises - Livraison professionnelle"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                        }}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: 'rgba(176, 195, 172, 0.15)' }}>
                        <Building className="h-6 w-6 text-site-buttons" />
                      </div>
                      <h3 className="text-xl font-bold text-site-company-title">Service entreprises</h3>
                    </div>

                    <div className="space-y-3">
                      <p className="text-site-text-dark">
                        Solutions sur mesure pour vos événements professionnels.
                      </p>
                      <ul className="text-zinc-600 space-y-2">
                        <li>• Plateaux pour réunions</li>
                        <li>• Livraison en entreprise</li>
                        <li>• Facturation dédiée</li>
                        <li>• Commandes récurrentes</li>
                        <li>• Devis personnalisé</li>
                      </ul>
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <div className="flex items-center text-site-buttons">
                          <Mail className="h-4 w-4 mr-2" />
                          {!contactLoading && contactInfo?.emails?.length > 0 && (
                            <a
                              href={`mailto:${contactInfo.emails[0].email}`}
                              className="font-medium hover:underline"
                            >
                              {contactInfo.emails[0].email}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Zone Checker */}
            <div className="mb-12">
              <DeliveryZoneChecker />
            </div>

            {/* Delivery Map Info */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
              <h2 className="text-2xl font-bold text-site-company-title mb-6 text-center">Zone de livraison</h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Informations textuelles */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold text-site-text-dark mb-4">Communes desservies :</h3>
                  <div className="space-y-2 text-zinc-600">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-3 bg-site-primary"></div>
                      <span>Saint-Herblain</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-3 bg-site-buttons"></div>
                      <span>Nantes (partiellement)</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(176, 195, 172, 0.15)' }}>
                    <div className="flex items-center mb-2">
                      <MapPin className="h-5 w-5 text-site-buttons mr-2" />
                      <span className="font-semibold text-site-company-title">Rayon d'environ 3 km</span>
                    </div>
                    <p className="text-site-text-dark text-sm">
                      Livraison dans un périmètre restreint autour du magasin.
                    </p>
                  </div>

                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(123, 138, 120, 0.15)' }}>
                    <p className="text-site-text-dark text-sm">
                      <strong>💡 Vérification :</strong> Contactez-nous pour confirmer si votre adresse est dans notre zone de livraison.
                    </p>
                    {!contactLoading && contactInfo?.phones?.length > 0 && (
                      <a
                        href={`tel:${contactInfo.phones[0].phone.replace(/\s/g, '')}`}
                        className="inline-flex items-center mt-2 text-site-primary hover:text-site-buttons text-sm font-medium transition-colors"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        {contactInfo.phones[0].phone}
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Carte Google Maps */}
                <div className="lg:col-span-2">
                  <GoogleMap 
                    className="h-96 lg:h-full min-h-[400px]" 
                    showDeliveryZone={true} 
                  />
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="rounded-lg p-8 text-white text-center" style={{ background: 'linear-gradient(to right, var(--color-primary), var(--color-buttons))' }}>
              <h2 className="text-2xl font-bold mb-4">Une question sur nos services ?</h2>
              <p className="text-lg mb-6 text-white/90">
                Notre équipe est là pour vous accompagner et répondre à toutes vos questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!contactLoading && contactInfo?.phones?.length > 0 && (
                  <a
                    href={`tel:${contactInfo.phones[0].phone.replace(/\s/g, '')}`}
                    className="bg-white text-site-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
                  >
                    📞 {contactInfo.phones[0].phone}
                  </a>
                )}
                <button
                  onClick={() => {
                    window.scrollTo(0, 0);
                    setIsContactModalOpen(true);
                  }}
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-site-primary transition-all duration-200"
                >
                  ✉️ Formulaire de contact
                </button>
              </div>
            </div>
          </main>

          <Footer />

          {/* Contact Modal */}
          <ContactModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            source="Page Services & Livraison"
          />
        </div>
      );
    };

    export default Services;