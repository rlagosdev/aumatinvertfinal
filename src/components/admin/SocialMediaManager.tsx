import React, { useState } from 'react';
import {
  Calendar,
  Link2,
  MessageCircle,
  TrendingUp,
  FileText,
  Target,
  BarChart3,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface SocialMediaTool {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  features: string[];
}

const SocialMediaManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tools'>('overview');

  const tools: SocialMediaTool[] = [
    {
      id: 'planner',
      icon: Calendar,
      title: 'Planificateur de contenu',
      description: 'Planifiez vos posts, optimisez le timing et gérez facilement le contenu.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        'Calendrier éditorial visuel',
        'Programmation automatique',
        'Suggestions de timing optimal',
        'Gestion multi-plateformes'
      ]
    },
    {
      id: 'links',
      icon: Link2,
      title: 'Liens intelligents',
      description: 'Créer des liens personnalisés pour générer du trafic et suivre les résultats.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: [
        'Liens courts personnalisés',
        'Tracking des clics',
        'QR codes dynamiques',
        'Analytics en temps réel'
      ]
    },
    {
      id: 'messages',
      icon: MessageCircle,
      title: 'Commentaires et messages',
      description: 'Gérer toutes les interactions sociales à partir d\'un seul tableau de bord.',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      features: [
        'Boîte de réception unifiée',
        'Réponses automatiques',
        'Modération des commentaires',
        'Notifications en temps réel'
      ]
    },
    {
      id: 'competitor',
      icon: TrendingUp,
      title: 'Analyse des concurrents',
      description: 'Surveillez les stratégies de vos concurrents et gardez une longueur d\'avance.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      features: [
        'Veille concurrentielle',
        'Comparaison de performances',
        'Alertes automatiques',
        'Tendances du marché'
      ]
    },
    {
      id: 'reports',
      icon: FileText,
      title: 'Rapports personnalisés',
      description: 'Créez des rapports simples et visuels pour présenter rapidement vos résultats.',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      features: [
        'Rapports automatisés',
        'Visualisations interactives',
        'Export PDF/Excel',
        'Partage en un clic'
      ]
    },
    {
      id: 'ads',
      icon: Target,
      title: 'Gestion des annonces',
      description: 'Exécuter et optimiser les campagnes publicitaires sur Google Ads, TikTok Ads, Facebook et Instagram Ads.',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      features: [
        'Campagnes multi-plateformes',
        'Optimisation automatique',
        'A/B testing',
        'Budget intelligent'
      ]
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Analyse',
      description: 'Suivez les performances de vos médias sociaux grâce à des données et des informations en temps réel.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      features: [
        'Métriques en temps réel',
        'Tableaux de bord personnalisés',
        'ROI et conversions',
        'Insights actionnables'
      ]
    }
  ];

  const socialPlatforms = [
    { name: 'Facebook', icon: Facebook, color: 'text-blue-600', url: 'https://facebook.com' },
    { name: 'Instagram', icon: Instagram, color: 'text-pink-600', url: 'https://instagram.com' },
    { name: 'Twitter', icon: Twitter, color: 'text-sky-500', url: 'https://twitter.com' },
    { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', url: 'https://linkedin.com' },
    { name: 'YouTube', icon: Youtube, color: 'text-red-600', url: 'https://youtube.com' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-3">Médias sociaux et publicité</h2>
        <p className="text-lg opacity-90 max-w-3xl">
          Un seul outil pour toutes les tâches liées aux médias sociaux : pour tous, quels que soient vos compétences, vos connaissances et vos ressources
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-zinc-600 hover:text-zinc-800'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Vue d'ensemble</span>
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'tools'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-zinc-600 hover:text-zinc-800'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>Outils disponibles</span>
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Social Platforms */}
          <div className="bg-white rounded-lg border border-zinc-200 p-6">
            <h3 className="text-lg font-semibold text-zinc-800 mb-4">Plateformes connectées</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2 p-4 border border-zinc-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all group"
                  >
                    <Icon className={`h-8 w-8 ${platform.color}`} />
                    <span className="text-sm font-medium text-zinc-700 group-hover:text-purple-600 transition-colors">
                      {platform.name}
                    </span>
                    <ExternalLink className="h-3 w-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-zinc-800">Publications</h4>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-1">0</p>
              <p className="text-sm text-zinc-600">posts programmés</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-zinc-800">Interactions</h4>
              </div>
              <p className="text-3xl font-bold text-green-600 mb-1">0</p>
              <p className="text-sm text-zinc-600">messages en attente</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-zinc-800">Campagnes</h4>
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-1">0</p>
              <p className="text-sm text-zinc-600">campagnes actives</p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-zinc-800 mb-2">Section en préparation</h4>
                <p className="text-sm text-zinc-700 mb-3">
                  Cette section vous permettra de gérer tous vos médias sociaux et campagnes publicitaires depuis un seul endroit. Les fonctionnalités seront progressivement activées.
                </p>
                <p className="text-xs text-zinc-600">
                  💡 Pour l'instant, utilisez les liens directs vers vos plateformes sociales ci-dessus.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="bg-white rounded-lg border border-zinc-200 p-6 hover:border-purple-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 ${tool.bgColor} rounded-lg`}>
                    <Icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-zinc-800 mb-1">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-zinc-600">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  {tool.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className={`h-4 w-4 ${tool.color}`} />
                      <span className="text-sm text-zinc-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Coming Soon Badge */}
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                    Bientôt disponible
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SocialMediaManager;
