import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Phone, MapPin, Instagram } from 'lucide-react';
import { useOpeningHours } from '../hooks/useOpeningHours';
import { useContactInfo } from '../hooks/useContactInfo';

interface HeroHeaderProps {
  cartItemsCount?: number;
}

const HeroHeader: React.FC<HeroHeaderProps> = ({ cartItemsCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { getShortFormatText } = useOpeningHours();
  const { contactInfo, loading: contactLoading } = useContactInfo();

  const navigation = [
    { name: 'Accueil', href: '/' },
    { name: 'Nos Produits', href: '/produits' },
    { name: 'Vos Événements', href: '/evenements' },
    { name: 'Services & Livraison', href: '/services' },
    { name: 'À Propos', href: '/a-propos' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar with contact info */}
      <div className="bg-[#7b8a78] text-white py-2">
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
                  <a href={`tel:${phone.phone}`}>{phone.phone}</a>
                </div>
              ))}
            </div>
            <div className="text-xs mt-1 sm:mt-0">
              {getShortFormatText()}
            </div>
          </div>
        </div>
      </div>

      {/* Main header with transparency */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/logo-aumatinvert.png"
                alt="Au Matin Vert - Votre épicerie"
                className="h-[60px] w-auto"
                style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))' }}
              />
            </Link>

            {/* Desktop Navigation with glow effect */}
            <nav className="hidden md:flex items-center space-x-8 ml-auto mr-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-white pb-1'
                      : 'text-white hover:transform hover:-translate-y-0.5'
                  }`}
                  style={{
                    textShadow: `
                      0 0 10px rgba(255, 255, 255, 0.8),
                      0 0 20px rgba(255, 255, 255, 0.5),
                      0 0 30px rgba(255, 255, 255, 0.3),
                      2px 2px 4px rgba(0,0,0,0.5)
                    `
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textShadow = `
                      0 0 15px rgba(255, 255, 255, 1),
                      0 0 30px rgba(255, 255, 255, 0.8),
                      0 0 45px rgba(255, 255, 255, 0.6),
                      2px 2px 6px rgba(0,0,0,0.7)
                    `;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textShadow = `
                      0 0 10px rgba(255, 255, 255, 0.8),
                      0 0 20px rgba(255, 255, 255, 0.5),
                      0 0 30px rgba(255, 255, 255, 0.3),
                      2px 2px 4px rgba(0,0,0,0.5)
                    `;
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Cart and Instagram icons with glow */}
            <div className="flex items-center space-x-4">
              <Link
                to="/panier"
                className="relative p-2 text-white transition-all duration-300 hover:transform hover:-translate-y-0.5"
                aria-label="Panier"
                style={{
                  filter: `
                    drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))
                    drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))
                    drop-shadow(2px 2px 4px rgba(0,0,0,0.5))
                  `
                }}
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
                className="relative p-2 text-white hover:text-pink-400 transition-all duration-300 hover:transform hover:-translate-y-0.5"
                aria-label="Instagram"
                style={{
                  filter: `
                    drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))
                    drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))
                    drop-shadow(2px 2px 4px rgba(0,0,0,0.5))
                  `
                }}
              >
                <Instagram className="h-6 w-6" />
              </a>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-white"
                aria-label="Menu"
                style={{
                  filter: `
                    drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))
                    drop-shadow(2px 2px 4px rgba(0,0,0,0.5))
                  `
                }}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-white/20 py-4 bg-black/50 backdrop-blur-md">
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`font-medium transition-colors duration-200 text-white ${
                      isActive(item.href) ? 'text-white' : 'hover:text-gray-300'
                    }`}
                    style={{
                      textShadow: `
                        0 0 10px rgba(255, 255, 255, 0.8),
                        2px 2px 4px rgba(0,0,0,0.5)
                      `
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeroHeader;
