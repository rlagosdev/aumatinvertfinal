import React from 'react';
import {
  Send,
  Mail,
  Ticket,
  TrendingUp,
  Users,
  BarChart3,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Gift,
  MessageSquare,
  Calendar,
  Star,
  QrCode,
  RefreshCw,
  Bell,
  Smartphone,
  ShoppingBag,
  Palette,
  Video,
  CreditCard
} from 'lucide-react';

interface MarketingCard {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  status: 'active' | 'coming-soon';
  action?: {
    label: string;
    onClick: () => void;
  };
  color: string;
  bgColor: string;
}

interface MarketingSuiteProps {
  onNavigate?: (tab: string) => void;
}

const MarketingSuite: React.FC<MarketingSuiteProps> = ({ onNavigate }) => {
  const marketingCards: MarketingCard[] = [
    {
      id: 'social-publisher',
      icon: Send,
      title: 'Publication Réseaux Sociaux',
      description: 'Publiez simultanément sur Facebook, Instagram, LinkedIn, YouTube et X. Génération de contenu IA incluse.',
      status: 'active',
      action: {
        label: 'Gérer les publications',
        onClick: () => onNavigate?.('publisher')
      },
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'email-marketing',
      icon: Mail,
      title: 'Messagerie Email',
      description: 'Envoyez des campagnes email à vos clients. Personnalisez vos messages et suivez les performances.',
      status: 'active',
      action: {
        label: 'Accéder à la messagerie',
        onClick: () => onNavigate?.('email')
      },
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'promo-codes',
      icon: Ticket,
      title: 'Codes Promo & Réductions',
      description: 'Créez des codes promotionnels pour vos campagnes marketing. Suivi en temps réel des utilisations.',
      status: 'active',
      action: {
        label: 'Gérer les codes promo',
        onClick: () => onNavigate?.('promocodes')
      },
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'reviews-management',
      icon: Star,
      title: 'Gestion des Avis Google',
      description: 'Affichez les avis Google sur votre site. Importation automatique et mise en page personnalisable.',
      status: 'active',
      action: {
        label: 'Configurer les avis',
        onClick: () => onNavigate?.('customization')
      },
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 'qr-code',
      icon: QrCode,
      title: 'Code QR du Site',
      description: 'Générez des codes QR pour vos pages (accueil, produits, promotions) à partager facilement.',
      status: 'active',
      action: {
        label: 'Générer des QR codes',
        onClick: () => onNavigate?.('customization')
      },
      color: 'text-gray-700',
      bgColor: 'bg-gray-50'
    },
    {
      id: 'sms-notifications',
      icon: Smartphone,
      title: 'Notifications SMS des Commandes',
      description: 'Informez vos clients par SMS des changements de statut de leur commande : commande passée, prête, annulée, remboursée. Notifications instantanées.',
      status: 'coming-soon',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    },
    {
      id: 'auto-email-notifications',
      icon: Bell,
      title: 'Notifications Email Automatiques',
      description: 'Envoyez automatiquement des emails aux clients pour les changements de statut : commande annulée, prête, remboursée.',
      status: 'coming-soon',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'subscriptions',
      icon: RefreshCw,
      title: 'Abonnements Au Matin Vert',
      description: 'Proposez des abonnements à vos clients : livraisons récurrentes de paniers, produits phares avec réductions.',
      status: 'coming-soon',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'analytics',
      icon: TrendingUp,
      title: 'Analytics & Statistiques',
      description: 'Analysez les performances de vos campagnes marketing et le comportement de vos clients.',
      status: 'coming-soon',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'customer-segments',
      icon: Users,
      title: 'Segmentation Clients',
      description: 'Créez des segments de clients pour des campagnes ciblées (nouveaux clients, fidèles, inactifs).',
      status: 'coming-soon',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      id: 'ab-testing',
      icon: BarChart3,
      title: 'A/B Testing',
      description: 'Testez différentes versions de vos emails et posts pour optimiser vos conversions.',
      status: 'coming-soon',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      id: 'loyalty-program',
      icon: Gift,
      title: 'Programme de Fidélité',
      description: 'Récompensez vos clients fidèles avec des points, badges et réductions exclusives.',
      status: 'coming-soon',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      id: 'auto-reviews',
      icon: MessageSquare,
      title: 'Demandes d\'Avis Automatiques',
      description: 'Envoyez automatiquement des demandes d\'avis après chaque commande pour booster votre réputation.',
      status: 'coming-soon',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'booking-calendar',
      icon: Calendar,
      title: 'Calendrier de Réservations',
      description: 'Permettez à vos clients de réserver des créneaux pour des consultations ou ateliers.',
      status: 'coming-soon',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      id: 'custom-products-shop',
      icon: ShoppingBag,
      title: 'Boutique de Produits Personnalisés',
      description: 'Vendez des produits personnalisés (t-shirts, mugs, coques) avec vos designs. Impression et livraison automatiques.',
      status: 'coming-soon',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
    {
      id: 'graphic-design-studio',
      icon: Palette,
      title: 'Studio de Création Graphique',
      description: 'Créez des visuels professionnels pour vos réseaux sociaux, flyers et supports marketing. Modèles prêts à l\'emploi et éditeur intuitif.',
      status: 'coming-soon',
      color: 'text-fuchsia-600',
      bgColor: 'bg-fuchsia-50'
    },
    {
      id: 'video-editor',
      icon: Video,
      title: 'Éditeur Vidéo Marketing',
      description: 'Montez des vidéos promotionnelles pour vos produits et réseaux sociaux. Templates personnalisables, transitions et effets inclus.',
      status: 'coming-soon',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50'
    },
    {
      id: 'business-finance',
      icon: CreditCard,
      title: 'Gestion Financière Professionnelle',
      description: 'Gérez vos paiements, factures et transactions commerciales. Cartes virtuelles, virements internationaux et suivi des dépenses en temps réel.',
      status: 'coming-soon',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50'
    }
  ];

  const activeTools = marketingCards.filter(card => card.status === 'active');
  const upcomingTools = marketingCards.filter(card => card.status === 'coming-soon');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="h-8 w-8" />
          <h2 className="text-3xl font-bold">Suite Marketing</h2>
        </div>
        <p className="text-lg opacity-90 max-w-3xl">
          Centralisez tous vos outils marketing en un seul endroit. Gérez vos réseaux sociaux, campagnes email, codes promo et bien plus.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-zinc-800">Outils Actifs</h4>
          </div>
          <p className="text-3xl font-bold text-green-600 mb-1">{activeTools.length}</p>
          <p className="text-sm text-zinc-600">Prêts à l'emploi</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-zinc-800">À Venir</h4>
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-1">{upcomingTools.length}</p>
          <p className="text-sm text-zinc-600">En développement</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h4 className="font-semibold text-zinc-800">Total</h4>
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-1">{marketingCards.length}</p>
          <p className="text-sm text-zinc-600">Outils disponibles</p>
        </div>
      </div>

      {/* Active Tools Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-bold text-zinc-800">Outils Actifs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTools.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-white rounded-lg border-2 border-green-200 p-6 hover:shadow-xl hover:border-green-400 transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 ${card.bgColor} rounded-lg group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Actif</span>
                    </div>
                    <h4 className="font-bold text-zinc-800 text-lg group-hover:text-purple-600 transition-colors">
                      {card.title}
                    </h4>
                  </div>
                </div>

                <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
                  {card.description}
                </p>

                {card.action && (
                  <button
                    onClick={card.action.onClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all group-hover:scale-105"
                  >
                    {card.action.label}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-bold text-zinc-800">À Venir</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingTools.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-white rounded-lg border border-zinc-200 p-6 hover:border-purple-300 hover:shadow-lg transition-all group relative overflow-hidden"
              >
                {/* Coming Soon Ribbon */}
                <div className="absolute top-4 -right-12 rotate-45 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold py-1 px-12 shadow-lg">
                  BIENTÔT
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 ${card.bgColor} rounded-lg group-hover:scale-110 transition-transform opacity-60`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-zinc-800 mb-1 group-hover:text-purple-600 transition-colors">
                      {card.title}
                    </h4>
                  </div>
                </div>

                <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
                  {card.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                  En développement
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-zinc-800 mb-2">Votre Hub Marketing Centralisé</h4>
            <p className="text-sm text-zinc-700 mb-3">
              Cette suite regroupe tous vos outils marketing pour une gestion simplifiée. Les outils actifs sont directement accessibles, tandis que les fonctionnalités à venir seront progressivement déployées pour enrichir votre expérience.
            </p>
            <div className="flex items-start gap-2 text-xs text-zinc-600">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Astuce :</strong> Cliquez sur les outils actifs pour accéder directement aux fonctionnalités correspondantes et démarrer vos campagnes marketing dès maintenant !
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingSuite;
