import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Settings } from 'lucide-react';
import OpeningHours from './OpeningHours';
import { useSiteLogo } from '../hooks/useSiteLogo';
import { useContactInfo } from '../hooks/useContactInfo';
import { useCompanyInfo } from '../hooks/useCompanyInfo';

const Footer: React.FC = () => {
  const { logoSettings, loading: logoLoading } = useSiteLogo();
  const { contactInfo, loading: contactLoading } = useContactInfo();
  const { companyInfo, loading: companyLoading } = useCompanyInfo();

  return (
    <footer className="bg-zinc-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              {logoSettings.logo_image ? (
                <div className={`w-10 h-10 overflow-hidden flex items-center justify-center ${
                  logoSettings.logo_shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                }`}>
                  <img
                    src={logoSettings.logo_image}
                    alt="Au Matin Vert Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLDivElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-10 h-10 rounded-full hidden items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-buttons))' }}>
                    <span className="text-white font-bold">AM</span>
                  </div>
                </div>
              ) : logoLoading ? (
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-zinc-500 text-xs">...</span>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-buttons))' }}>
                  <span className="text-white font-bold">AM</span>
                </div>
              )}
              <h3 className="text-xl font-bold">{companyInfo.name}</h3>
            </div>
            <p className="text-zinc-300 mb-4 max-w-md">
              Épicerie de quartier située au centre commercial des Thébaudières depuis plus de 20 ans.
              Produits frais et locaux, avec un service personnalisé et des conseils pour chaque client.
            </p>
            <div className="space-y-2">
              {!contactLoading && contactInfo.addresses.length > 0 && contactInfo.addresses.map((addr) => (
                <div key={addr.id} className="flex items-center space-x-2 text-zinc-300">
                  <MapPin className="h-4 w-4 text-site-buttons" />
                  <span>{addr.address}</span>
                </div>
              ))}
              {!contactLoading && contactInfo.phones.length > 0 && contactInfo.phones.map((phone) => (
                <div key={phone.id} className="flex items-center space-x-2 text-zinc-300">
                  <Phone className="h-4 w-4 text-site-buttons" />
                  <span>{phone.phone}</span>
                </div>
              ))}
              <div className="flex items-center space-x-2 text-zinc-300">
                <Mail className="h-4 w-4 text-site-buttons" />
                <span>contact@aumatinvert.fr</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-zinc-300 hover:text-site-buttons transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/produits" className="text-zinc-300 hover:text-site-buttons transition-colors">
                  Nos Produits
                </Link>
              </li>
              <li>
                <Link to="/evenements" className="text-zinc-300 hover:text-site-buttons transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-zinc-300 hover:text-site-buttons transition-colors">
                  Services & Livraison
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-zinc-300 hover:text-site-buttons transition-colors">
                  À Propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-site-buttons" />
              Horaires
            </h4>
            <div className="text-zinc-300 text-sm">
              <OpeningHours showStatus={false} theme="dark" />
            </div>
          </div>

          {/* Social Networks Section */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Instagram className="h-5 w-5 mr-2 text-pink-500" />
              Suivez-nous
            </h4>
            <div className="space-y-3">
              <p className="text-zinc-300 text-sm">
                Découvrez nos réseaux sociaux pour ne rien manquer !
              </p>
              <div className="space-y-2">
                <a
                  href="https://www.instagram.com/au_matin_vert/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-site-primary text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-site-primary transition-all duration-200 text-sm"
                >
                  <Instagram className="h-4 w-4" />
                  <span>@au_matin_vert</span>
                </a>
                <a
                  href="https://m.facebook.com/profile.php?id=61580055506795"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 text-sm"
                >
                  <Facebook className="h-4 w-4" />
                  <span>Au Matin Vert</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-700 mt-8 pt-8">
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <Link to="/privacy-policy" className="text-zinc-400 hover:text-site-buttons text-sm transition-colors">
              Politique de Confidentialité
            </Link>
            <span className="text-zinc-600">•</span>
            <Link to="/terms-of-service" className="text-zinc-400 hover:text-site-buttons text-sm transition-colors">
              CGV
            </Link>
            <span className="text-zinc-600">•</span>
            <Link to="/legal-notice" className="text-zinc-400 hover:text-site-buttons text-sm transition-colors">
              Mentions Légales
            </Link>
          </div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-zinc-400 text-sm">
              © 2025 {companyInfo.name}. Tous droits réservés.
            </div>
            <div className="flex items-center gap-4">
              <div className="text-zinc-400 text-sm">
                Construit avec ❤️ par <a rel="nofollow" target="_blank" href="https://www.rlbx-developpement.com/" className="text-site-buttons hover:text-site-primary transition-colors">Regis</a>
              </div>
              <Link
                to="/admin/login"
                className="p-2 text-zinc-500 hover:text-site-buttons transition-colors"
                aria-label="Administration"
                title="Espace administrateur"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;