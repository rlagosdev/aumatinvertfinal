import React from 'react';
import { ExternalLink, Package, Info, ShoppingBag, Plus, BarChart3, Settings, AlertCircle } from 'lucide-react';

const PrintifyShopManager: React.FC = () => {
  const quickLinks = [
    {
      title: 'Dashboard',
      description: 'Vue d\'ensemble de votre boutique et des statistiques',
      icon: BarChart3,
      url: 'https://printify.com/app/dashboard',
      color: 'blue'
    },
    {
      title: 'Produits',
      description: 'Gérer votre catalogue de produits',
      icon: Package,
      url: 'https://printify.com/app/products',
      color: 'green'
    },
    {
      title: 'Ajouter un produit',
      description: 'Créer un nouveau produit personnalisé',
      icon: Plus,
      url: 'https://printify.com/app/products/create',
      color: 'purple'
    },
    {
      title: 'Commandes',
      description: 'Voir et gérer vos commandes',
      icon: ShoppingBag,
      url: 'https://printify.com/app/orders',
      color: 'orange'
    },
    {
      title: 'Paramètres',
      description: 'Configurer votre boutique et vos préférences',
      icon: Settings,
      url: 'https://printify.com/app/account/settings',
      color: 'gray'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-site-primary rounded-lg p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Package className="h-8 w-8" />
          <h2 className="text-3xl font-bold">Gestion de la Boutique</h2>
        </div>
        <p className="text-lg opacity-90">
          Gérez votre boutique : ajoutez des produits, suivez les commandes et configurez vos paramètres.
        </p>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-semibold text-yellow-900 mb-1">Accès sécurisé</h4>
            <p className="text-sm text-yellow-800">
              Pour des raisons de sécurité, la plateforme n'autorise pas l'intégration dans un iframe. Utilisez les liens rapides ci-dessous pour accéder directement aux différentes sections de votre dashboard dans un nouvel onglet.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-xl font-bold text-zinc-800 mb-4">Accès rapide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.title}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${colorClasses[link.color as keyof typeof colorClasses]} border-2 rounded-lg p-6 transition-all hover:shadow-lg group`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-lg group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-zinc-800 mb-1 flex items-center gap-2">
                      {link.title}
                      <ExternalLink className="h-4 w-4 opacity-50" />
                    </h4>
                    <p className="text-sm text-zinc-600">
                      {link.description}
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Main Dashboard Link */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-site-primary overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-site-primary/10 rounded-full mb-4">
            <Package className="h-12 w-12 text-site-primary" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-800 mb-2">Dashboard Complet</h3>
          <p className="text-zinc-600 mb-6">
            Accédez à toutes les fonctionnalités de gestion de votre boutique
          </p>
          <a
            href="https://printify.com/app/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-site-primary hover:bg-site-primary/90 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Ouvrir le Dashboard
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">À propos de votre boutique</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Créez et personnalisez vos produits avec des designs uniques</li>
              <li>• Les produits sont imprimés à la demande uniquement lors d'une commande</li>
              <li>• Gérez les commandes et suivez les livraisons depuis le dashboard</li>
              <li>• Configurez les prix, les variantes et les descriptions de produits</li>
              <li>• Connectez votre boutique à votre site web pour une intégration parfaite</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintifyShopManager;
