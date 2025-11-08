import React, { useState } from 'react';
import {
  Cloud, ExternalLink, Key, RefreshCw, CheckCircle, XCircle,
  Settings, Zap, ShoppingCart, MapPin, Mail, CloudRain,
  Instagram, Facebook, Camera, Package, Globe, TrendingUp, Calendar
} from 'lucide-react';

interface APIConfig {
  id: string;
  name: string;
  description: string;
  category: 'food' | 'location' | 'weather' | 'social' | 'business' | 'ecommerce';
  icon: any;
  status: 'active' | 'inactive' | 'coming-soon';
  apiKey?: string;
  endpoint?: string;
  documentation?: string;
  features: string[];
}

const APIIntegrations: React.FC = () => {
  const [apis, setApis] = useState<APIConfig[]>([
    {
      id: 'open-food-facts',
      name: 'Open Food Facts',
      description: 'Base de données mondiale de produits alimentaires - Infos nutritionnelles, codes-barres, labels bio',
      category: 'food',
      icon: Package,
      status: 'coming-soon',
      endpoint: 'https://world.openfoodfacts.org/api/v0',
      documentation: 'https://wiki.openfoodfacts.org/API',
      features: [
        'Scan de codes-barres',
        'Informations nutritionnelles',
        'Labels bio et certifications',
        'Allergènes et additifs',
        'Score Nutri-Score',
        'Origine des produits'
      ]
    },
    {
      id: 'spoonacular',
      name: 'Spoonacular',
      description: 'API de recettes et produits alimentaires - Suggestions de recettes avec vos produits',
      category: 'food',
      icon: ShoppingCart,
      status: 'coming-soon',
      endpoint: 'https://api.spoonacular.com',
      documentation: 'https://spoonacular.com/food-api/docs',
      features: [
        'Recherche de recettes',
        'Suggestions par ingrédients',
        'Calcul nutritionnel',
        'Plans de repas',
        'Substitutions d\'ingrédients'
      ]
    },
    {
      id: 'google-maps',
      name: 'Google Maps API',
      description: 'Cartes et itinéraires - Aidez vos clients à trouver votre magasin',
      category: 'location',
      icon: MapPin,
      status: 'coming-soon',
      endpoint: 'https://maps.googleapis.com/maps/api',
      documentation: 'https://developers.google.com/maps/documentation',
      features: [
        'Carte interactive',
        'Itinéraire depuis position actuelle',
        'Estimation du temps de trajet',
        'Street View du magasin',
        'Horaires d\'affluence'
      ]
    },
    {
      id: 'openweathermap',
      name: 'OpenWeatherMap',
      description: 'Données météo en temps réel - Suggérez des produits selon la météo',
      category: 'weather',
      icon: CloudRain,
      status: 'coming-soon',
      endpoint: 'https://api.openweathermap.org/data/2.5',
      documentation: 'https://openweathermap.org/api',
      features: [
        'Météo en temps réel',
        'Prévisions 5 jours',
        'Alertes météo',
        'Suggestions de produits',
        'Température et humidité'
      ]
    },
    {
      id: 'instagram-api',
      name: 'Instagram API',
      description: 'Affichage automatique de vos posts Instagram sur votre site',
      category: 'social',
      icon: Instagram,
      status: 'active',
      documentation: 'https://developers.facebook.com/docs/instagram',
      features: [
        'Flux Instagram automatique',
        'Posts récents',
        'Stories (si disponible)',
        'Statistiques d\'engagement'
      ]
    },
    {
      id: 'facebook-api',
      name: 'Facebook API',
      description: 'Partage automatique de vos promotions sur Facebook',
      category: 'social',
      icon: Facebook,
      status: 'coming-soon',
      documentation: 'https://developers.facebook.com/docs/',
      features: [
        'Publication automatique',
        'Partage de promotions',
        'Statistiques de portée',
        'Gestion des commentaires'
      ]
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Analyse du comportement de vos visiteurs',
      category: 'business',
      icon: TrendingUp,
      status: 'coming-soon',
      endpoint: 'https://analytics.google.com/analytics/web/',
      documentation: 'https://developers.google.com/analytics',
      features: [
        'Nombre de visiteurs',
        'Pages les plus vues',
        'Taux de conversion',
        'Parcours utilisateur',
        'Sources de trafic'
      ]
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Newsletters et emails marketing pour vos promotions',
      category: 'business',
      icon: Mail,
      status: 'coming-soon',
      endpoint: 'https://mailchimp.com/developer/',
      documentation: 'https://mailchimp.com/developer/marketing/',
      features: [
        'Newsletters automatiques',
        'Segmentation clients',
        'Statistiques d\'ouverture',
        'Templates personnalisés',
        'Campagnes programmées'
      ]
    },
    {
      id: 'sendinblue',
      name: 'Sendinblue',
      description: 'Alternative à Mailchimp - Emails transactionnels et marketing',
      category: 'business',
      icon: Mail,
      status: 'coming-soon',
      endpoint: 'https://api.sendinblue.com/v3',
      documentation: 'https://developers.sendinblue.com/',
      features: [
        'Emails de confirmation',
        'Newsletters',
        'SMS marketing',
        'Automatisation',
        'CRM intégré'
      ]
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar API',
      description: 'Gestion des horaires d\'ouverture et événements du magasin',
      category: 'business',
      icon: Calendar,
      status: 'coming-soon',
      endpoint: 'https://www.googleapis.com/calendar/v3',
      documentation: 'https://developers.google.com/calendar',
      features: [
        'Horaires d\'ouverture dynamiques',
        'Événements du magasin',
        'Fermetures exceptionnelles',
        'Synchronisation calendrier',
        'Rappels automatiques'
      ]
    },
    {
      id: 'fixer-io',
      name: 'Fixer.io',
      description: 'Conversion de devises en temps réel pour clients internationaux',
      category: 'ecommerce',
      icon: TrendingUp,
      status: 'coming-soon',
      endpoint: 'https://api.fixer.io',
      documentation: 'https://fixer.io/documentation',
      features: [
        'Taux de change en temps réel',
        'Support de 170+ devises',
        'Conversion automatique',
        'Historique des taux',
        'Affichage multi-devises'
      ]
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Toutes', icon: Globe },
    { id: 'food', name: 'Alimentation', icon: Package },
    { id: 'location', name: 'Localisation', icon: MapPin },
    { id: 'weather', name: 'Météo', icon: CloudRain },
    { id: 'social', name: 'Réseaux Sociaux', icon: Instagram },
    { id: 'business', name: 'Business', icon: TrendingUp }
  ];

  const filteredApis = selectedCategory === 'all'
    ? apis
    : apis.filter(api => api.category === selectedCategory);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Actif
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <XCircle className="w-3 h-3" />
            Inactif
          </span>
        );
      case 'coming-soon':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Zap className="w-3 h-3" />
            Bientôt disponible
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
            <Cloud className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">APIs & Intégrations</h1>
            <p className="text-white/90">
              Connectez votre site à des services externes pour enrichir l'expérience de vos clients
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">APIs Disponibles</p>
              <p className="text-3xl font-bold text-gray-900">{apis.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Cloud className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actives</p>
              <p className="text-3xl font-bold text-green-600">
                {apis.filter(api => api.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En développement</p>
              <p className="text-3xl font-bold text-blue-600">
                {apis.filter(api => api.status === 'coming-soon').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* API Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredApis.map((api) => {
          const Icon = api.icon;
          return (
            <div
              key={api.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{api.name}</h3>
                      <p className="text-sm text-gray-600">{api.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(api.status)}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Fonctionnalités :</h4>
                <ul className="space-y-2 mb-4">
                  {api.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {api.features.length > 4 && (
                    <li className="text-sm text-gray-500 italic">
                      +{api.features.length - 4} autres fonctionnalités
                    </li>
                  )}
                </ul>

                {/* Actions */}
                <div className="flex gap-2">
                  {api.documentation && (
                    <a
                      href={api.documentation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Documentation
                    </a>
                  )}
                  <button
                    disabled={api.status === 'coming-soon'}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      api.status === 'coming-soon'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    {api.status === 'active' ? 'Configurer' : 'Activer'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              Fonctionnalités en développement
            </h3>
            <p className="text-sm text-blue-700">
              Ces intégrations sont en cours de développement et seront disponibles prochainement.
              Elles permettront d'enrichir votre site avec des données en temps réel et d'améliorer
              l'expérience de vos clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIIntegrations;
