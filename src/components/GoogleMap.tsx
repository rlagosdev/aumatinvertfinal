import React from 'react';
import { useContactInfo } from '../hooks/useContactInfo';
import { useCompanyInfo } from '../hooks/useCompanyInfo';

interface GoogleMapProps {
  className?: string;
  showDeliveryZone?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ className = '', showDeliveryZone = false }) => {
  const { contactInfo, loading: contactLoading } = useContactInfo();
  const { companyInfo, loading: companyLoading } = useCompanyInfo();

  // Utiliser l'adresse depuis la base de données ou valeur par défaut
  const storeAddress = !contactLoading && contactInfo.addresses.length > 0
    ? contactInfo.addresses[0].address
    : "1 rue du Nil, 44800 Saint-Herblain";
  const encodedAddress = encodeURIComponent(storeAddress);

  return (
    <div className={`relative ${className}`}>
      {/* Carte Google Maps intégrée */}
      <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={`https://www.google.com/maps?q=${encodedAddress}&output=embed&z=15`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Localisation d'Au Matin Vert"
        />
      </div>

      {/* Informations en superposition */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 bg-site-primary rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm">🌿</span>
          </div>
          <div>
            <h3 className="font-semibold text-site-company-title text-sm">{companyInfo.name}</h3>
            <p className="text-xs text-zinc-600">{companyInfo.description}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-site-text-dark">
          <div className="flex items-start">
            <span className="mr-2">📍</span>
            <span>{storeAddress}</span>
          </div>
          {!contactLoading && contactInfo.phones.length > 0 && (
            <div className="flex items-center">
              <span className="mr-2">📞</span>
              <a
                href={`tel:${contactInfo.phones[0].phone.replace(/\s/g, '')}`}
                className="text-site-primary hover:text-site-buttons hover:underline transition-colors"
              >
                {contactInfo.phones[0].phone}
              </a>
            </div>
          )}
          {showDeliveryZone && (
            <div className="flex items-center pt-2 border-t border-gray-200">
              <span className="mr-2">🚚</span>
              <span>Zone de livraison : 3 km</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2 mt-3">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-site-primary text-white text-xs px-3 py-2 rounded text-center hover:bg-site-buttons transition-colors"
          >
            Itinéraire
          </a>
          <a
            href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=47.2205,-1.6492`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-site-company-title text-white text-xs px-3 py-2 rounded text-center hover:bg-site-buttons transition-colors"
          >
            Street View
          </a>
        </div>
      </div>

      {/* Zone de livraison - indicateur visuel */}
      {showDeliveryZone && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center text-sm">
            <div className="w-4 h-4 border-2 border-dashed rounded-full mr-2 flex-shrink-0" style={{ borderColor: 'var(--color-primary)' }}></div>
            <span className="text-site-text-dark">Zone de livraison 3 km</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Saint-Herblain et communes limitrophes
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;