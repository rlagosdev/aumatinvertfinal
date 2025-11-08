import React, { useState } from 'react';
import { Home, ShoppingBag, PartyPopper, Info, Truck } from 'lucide-react';
import HomeConfigManager from './HomeConfigManager';
import ProductsPageManager from './ProductsPageManager';
import ServicesPageManager from './ServicesPageManager';
import EventsConfigManager from './EventsConfigManager';
import AboutConfigManager from './AboutConfigManager';

type PageTab = 'home' | 'products' | 'services' | 'events' | 'about';

const SiteAppearance: React.FC = () => {
  const [activePage, setActivePage] = useState<PageTab>('home');

  const pages = [
    {
      id: 'home' as PageTab,
      name: 'Accueil',
      icon: Home,
      description: 'Bannière, titre, description et boutons'
    },
    {
      id: 'products' as PageTab,
      name: 'Produits',
      icon: ShoppingBag,
      description: 'Titre, commandes personnalisées et infos magasin'
    },
    {
      id: 'services' as PageTab,
      name: 'Services',
      icon: Truck,
      description: 'Services Seniors et Entreprises'
    },
    {
      id: 'events' as PageTab,
      name: 'Événements',
      icon: PartyPopper,
      description: 'Titre, description et contenu des événements'
    },
    {
      id: 'about' as PageTab,
      name: 'À Propos',
      icon: Info,
      description: 'Titre, histoire et valeurs de l\'entreprise'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-200 rounded-lg p-6">
        <h1 className="text-3xl font-bold text-zinc-800 mb-2">Apparence du Site</h1>
        <p className="text-zinc-600">
          Gérez le contenu et l'apparence de toutes les pages de votre site web
        </p>
      </div>

      {/* Page Selector */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-zinc-800 mb-4">Sélectionnez une page à modifier</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {pages.map((page) => {
            const Icon = page.icon;
            const isActive = activePage === page.id;

            return (
              <button
                key={page.id}
                onClick={() => setActivePage(page.id)}
                className={`relative p-6 rounded-lg border-2 transition-all duration-200 ${
                  isActive
                    ? 'border-site-primary bg-gradient-to-br from-site-primary/5 to-cyan-50 shadow-md'
                    : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-site-primary rounded-full animate-pulse"></div>
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  <div
                    className={`p-4 rounded-full mb-3 ${
                      isActive
                        ? 'bg-site-primary/10'
                        : 'bg-zinc-100'
                    }`}
                  >
                    <Icon
                      className={`h-8 w-8 ${
                        isActive ? 'text-site-primary' : 'text-zinc-600'
                      }`}
                    />
                  </div>

                  <h3
                    className={`font-semibold mb-1 ${
                      isActive ? 'text-site-primary' : 'text-zinc-800'
                    }`}
                  >
                    {page.name}
                  </h3>

                  <p className="text-xs text-zinc-500">
                    {page.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-200">
          {(() => {
            const CurrentIcon = pages.find(p => p.id === activePage)?.icon || Home;
            const currentPageName = pages.find(p => p.id === activePage)?.name;
            return (
              <>
                <div className="p-2 bg-site-primary/10 rounded-lg">
                  <CurrentIcon className="h-6 w-6 text-site-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-800">
                    Configuration : {currentPageName}
                  </h2>
                  <p className="text-sm text-zinc-500">
                    Personnalisez le contenu de la page {currentPageName?.toLowerCase()}
                  </p>
                </div>
              </>
            );
          })()}
        </div>

        {/* Dynamic Content Based on Active Page */}
        <div>
          {activePage === 'home' && <HomeConfigManager />}
          {activePage === 'products' && <ProductsPageManager />}
          {activePage === 'services' && <ServicesPageManager />}
          {activePage === 'events' && <EventsConfigManager />}
          {activePage === 'about' && <AboutConfigManager />}
        </div>
      </div>
    </div>
  );
};

export default SiteAppearance;
