import React, { useEffect, useState } from 'react';
import { Star, ExternalLink, Quote } from 'lucide-react';
import { supabase } from '../supabase/client';

interface GoogleReview {
  id: string;
  author_name: string;
  author_photo_url?: string;
  rating: number;
  review_text: string;
  review_date: string;
  display_order: number;
}

interface GoogleReviewsConfig {
  place_id: string;
  business_name: string;
  show_on_homepage: boolean;
  direct_link?: string;
}

const GoogleReviewsDisplay: React.FC = () => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [config, setConfig] = useState<GoogleReviewsConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch configuration
      const { data: configData, error: configError } = await supabase
        .from('google_reviews_config')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (configError) {
        console.warn('Google reviews config not found');
      } else if (configData && configData.show_on_homepage) {
        setConfig(configData);
      }

      // Fetch active reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('google_reviews')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: false })
        .order('review_date', { ascending: false })
        .limit(6);

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
      } else if (reviewsData) {
        setReviews(reviewsData);
      }
    } catch (error) {
      console.error('Error fetching google reviews data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !config || reviews.length === 0) {
    return null;
  }

  // Create Google Maps search URL - use direct link if available, otherwise use place_id
  const googleMapsUrl = config.direct_link ||
    (config.place_id ? `https://search.google.com/local/reviews?placeid=${config.place_id}` :
    'https://www.google.com/search?q=Au+Matin+Vert+Avis');

  // Fixed average rating to 4.6
  const averageRating = '4.6';

  // Fixed total reviews count to 25
  const totalReviews = 25;

  // Render stars for a given rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-zinc-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Format date - Only month and year
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long'
    }).format(date);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <img
              src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
              alt="Google"
              className="h-8"
            />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-zinc-800">
            Ce que disent nos clients
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl font-bold text-site-primary">{averageRating}</span>
            <div>
              <div className="flex gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(parseFloat(averageRating))
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-zinc-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-zinc-600">
                Basé sur {totalReviews} avis Google
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 border border-zinc-100"
            >
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-4">
                {review.author_photo_url ? (
                  <img
                    src={review.author_photo_url}
                    alt={review.author_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-site-primary to-site-buttons flex items-center justify-center text-white font-bold text-lg">
                    {review.author_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-zinc-800">{review.author_name}</h4>
                  <p className="text-xs text-zinc-500">{formatDate(review.review_date)}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-3">
                {renderStars(review.rating)}
              </div>

              {/* Review Text */}
              <div className="relative">
                <Quote className="absolute -top-1 -left-1 w-6 h-6 text-site-primary/20" />
                <p className="text-zinc-700 text-sm leading-relaxed pl-6">
                  {review.review_text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-site-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-site-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>Voir tous les avis sur Google</span>
            <ExternalLink className="w-5 h-5" />
          </a>
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

export default GoogleReviewsDisplay;
