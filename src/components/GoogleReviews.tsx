import React, { useEffect, useState } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { supabase } from '../supabase/client';

interface GoogleReviewsConfig {
  place_id: string;
  business_name: string;
  show_on_homepage: boolean;
  direct_link?: string;
}

const GoogleReviews: React.FC = () => {
  const [config, setConfig] = useState<GoogleReviewsConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('google_reviews_config')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        console.warn('Google reviews config not found');
      } else if (data && data.show_on_homepage) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching google reviews config:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !config) {
    return null;
  }

  // Create Google Maps search URL - use direct link if available, otherwise use place_id
  const googleMapsUrl = config.direct_link ||
    (config.place_id ? `https://search.google.com/local/reviews?placeid=${config.place_id}` :
    'https://www.google.com/search?q=Au+Matin+Vert+Avis');

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-zinc-800">
            Ce que disent nos clients
          </h2>
          <p className="text-lg text-zinc-600">
            Découvrez les avis de nos clients sur Google
          </p>
        </div>

        {/* Google Reviews Embed Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-site-primary/20">
          <div className="p-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <img
                src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
                alt="Google"
                className="h-8"
              />
            </div>

            <h3 className="text-2xl font-bold text-zinc-800 mb-3">
              {config.business_name}
            </h3>

            {/* Star Rating Display */}
            <div className="flex items-center justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-8 h-8 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>

            <p className="text-zinc-600 mb-8 text-lg">
              Consultez tous nos avis clients vérifiés sur Google
            </p>

            {/* CTA Button */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-site-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-site-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span>Voir tous les avis Google</span>
              <ExternalLink className="w-5 h-5" />
            </a>

            <div className="mt-6 pt-6 border-t border-zinc-200">
              <p className="text-sm text-zinc-500">
                Avis clients 100% authentiques et vérifiés par Google
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-6 mt-12 text-center">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-site-primary mb-2">100%</div>
            <div className="text-sm text-zinc-600">Avis vérifiés</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-site-primary mb-2">
              <Star className="w-8 h-8 fill-yellow-400 text-yellow-400 mx-auto" />
            </div>
            <div className="text-sm text-zinc-600">Excellent service</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-site-primary mb-2">Local</div>
            <div className="text-sm text-zinc-600">Produits frais</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
