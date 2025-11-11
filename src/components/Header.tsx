import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Phone, MapPin, Instagram } from 'lucide-react';
import { useOpeningHours } from '../hooks/useOpeningHours';
import { useSiteLogo } from '../hooks/useSiteLogo';
import { useContactInfo } from '../hooks/useContactInfo';
import { useCompanyInfo } from '../hooks/useCompanyInfo';

interface HeaderProps {
  cartItemsCount?: number;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { getShortFormatText } = useOpeningHours();
  const { logoSettings, loading: logoLoading } = useSiteLogo();
  const { contactInfo, loading: contactLoading } = useContactInfo();
  const { companyInfo, loading: companyLoading } = useCompanyInfo();

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Nos Produits', href: '/produits' },
    { name: 'Vos Événements', href: '/evenements' },
    { name: 'Services & Livraison', href: '/services' },
    { name: 'À Propos', href: '/a-propos' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top bar with contact info */}
      <div className="bg-site-primary text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
              {!contactLoading && contactInfo.addresses.length > 0 && contactInfo.addresses.map((addr) => (
                <div key={addr.id} className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{addr.address}</span>
                </div>
              ))}
              {!contactLoading && contactInfo.phones.length > 0 && contactInfo.phones.map((phone) => (
                <div key={phone.id} className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{phone.phone}</span>
                </div>
              ))}
            </div>
            <div className="text-xs mt-1 sm:mt-0">
              {getShortFormatText()}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            {logoSettings.logo_image ? (
              <div className={`w-12 h-12 overflow-hidden flex items-center justify-center ${
                logoSettings.logo_shape === 'circle' ? 'rounded-full' : 'rounded-lg'
              }`}>
                <img
                  src={logoSettings.logo_image}
                  alt="Au Matin Vert Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback vers le logo par défaut en cas d'erreur de chargement
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLDivElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-12 h-12 bg-gradient-to-br from-site-primary to-cyan-500 rounded-full hidden items-center justify-center">
                  <span className="text-white font-bold text-xl">AM</span>
                </div>
              </div>
            ) : logoLoading ? (
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-gray-400 text-xs">...</span>
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-site-primary to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">AM</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-site-company-title">{companyInfo.name}</h1>
              <p className="text-sm text-site-text-dark">{companyInfo.description}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 ml-auto mr-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link-aligned ${
                  isActive(item.href)
                    ? 'text-site-primary'
                    : 'text-zinc-700 hover:text-site-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Cart and Admin and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link
              to="/panier"
              className="relative p-2 text-zinc-700 hover:text-site-primary transition-colors"
              aria-label="Panier"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-site-buttons text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Instagram Link */}
            <a
              href="https://www.instagram.com/au_matin_vert/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative p-2 text-zinc-700 hover:text-pink-500 transition-colors z-10"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-zinc-700 hover:text-site-primary"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 py-4">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-site-primary'
                      : 'text-zinc-700 hover:text-site-primary'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;