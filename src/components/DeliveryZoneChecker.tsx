import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle, XCircle, Loader } from 'lucide-react';
import { toast } from 'react-toastify';

interface DeliveryZoneCheckerProps {
  onZoneVerified?: (inZone: boolean, distance: number) => void;
}

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
  };
}

const DeliveryZoneChecker: React.FC<DeliveryZoneCheckerProps> = ({ onZoneVerified }) => {
  const [address, setAddress] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ inZone: boolean; distance: number } | null>(null);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string>('');

  // Coordonnées du magasin Au Matin Vert
  const STORE_LAT = 47.2416108;  // 1 rue du Nil, Saint-Herblain
  const STORE_LNG = -1.6080428;
  const MAX_DELIVERY_DISTANCE_KM = 3;

  // Calculer la distance à vol d'oiseau (formule de Haversine)
  const calculateCrowDistance = (lat: number, lng: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat - STORE_LAT) * Math.PI / 180;
    const dLng = (lng - STORE_LNG) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(STORE_LAT * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calculer la distance routière en utilisant OSRM (Open Source Routing Machine)
  const calculateRoadDistance = async (lat: number, lng: number): Promise<number> => {
    try {
      console.log('📍 Position magasin:', STORE_LAT, STORE_LNG);
      console.log('📍 Position utilisateur:', lat, lng);

      // Calculer d'abord la distance à vol d'oiseau
      const crowDistance = calculateCrowDistance(lat, lng);
      console.log('🦅 Distance à vol d\'oiseau:', crowDistance.toFixed(2), 'km');

      // Si la distance à vol d'oiseau est anormalement grande (>50km), quelque chose ne va pas
      if (crowDistance > 50) {
        console.warn('⚠️ Distance à vol d\'oiseau anormalement grande:', crowDistance, 'km');
        console.warn('⚠️ Coordonnées possiblement incorrectes');
        // Retourner quand même une estimation routière
        return Math.round(crowDistance * 1.3 * 10) / 10;
      }

      // Utiliser l'API OSRM pour calculer la distance routière
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${STORE_LNG},${STORE_LAT};${lng},${lat}?overview=false`,
        {
          headers: {
            'User-Agent': 'AuMatinVert-DeliveryChecker/1.0'
          }
        }
      );

      if (!response.ok) {
        console.warn('⚠️ OSRM API erreur, utilisation distance à vol d\'oiseau');
        return Math.round(crowDistance * 1.3 * 10) / 10; // +30% pour simuler la route
      }

      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        // La distance est en mètres, on la convertit en km
        const distanceInKm = data.routes[0].distance / 1000;
        console.log('🚗 Distance routière OSRM:', distanceInKm.toFixed(2), 'km');

        // Vérifier que la distance routière est cohérente (max 3x la distance à vol d'oiseau)
        if (distanceInKm > crowDistance * 3) {
          console.warn('⚠️ Distance routière incohérente, utilisation distance à vol d\'oiseau +30%');
          return Math.round(crowDistance * 1.3 * 10) / 10;
        }

        return Math.round(distanceInKm * 10) / 10; // Arrondir à 1 décimale
      } else {
        console.warn('⚠️ Aucun itinéraire trouvé, utilisation distance à vol d\'oiseau');
        return Math.round(crowDistance * 1.3 * 10) / 10;
      }
    } catch (error) {
      console.error('Erreur calcul distance routière:', error);
      // En cas d'erreur, utiliser la distance à vol d'oiseau +30%
      const crowDistance = calculateCrowDistance(lat, lng);
      return Math.round(crowDistance * 1.3 * 10) / 10;
    }
  };

  // Formater une adresse de manière simplifiée
  const formatSimpleAddress = (suggestion: AddressSuggestion): string => {
    const addr = suggestion.address;
    if (!addr) return suggestion.display_name;

    const parts: string[] = [];

    // Numéro et rue
    if (addr.house_number) parts.push(addr.house_number);
    if (addr.road) parts.push(addr.road);

    // Commune
    const commune = addr.city || addr.town || addr.village || addr.suburb;
    if (commune) parts.push(commune);

    // Code postal
    if (addr.postcode) parts.push(addr.postcode);

    return parts.length > 0 ? parts.join(', ') : suggestion.display_name;
  };

  // Rechercher des suggestions d'adresses
  const searchAddressSuggestions = async (searchText: string) => {
    if (searchText.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&countrycodes=fr&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AuMatinVert-DeliveryChecker/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Gérer le changement de l'adresse avec debounce
  const handleAddressChange = (value: string) => {
    setAddress(value);

    // Debounce la recherche
    const timer = setTimeout(() => {
      searchAddressSuggestions(value);
    }, 300);

    return () => clearTimeout(timer);
  };

  // Sélectionner une suggestion
  const selectSuggestion = async (suggestion: AddressSuggestion) => {
    const simpleAddress = formatSimpleAddress(suggestion);
    setAddress(simpleAddress);

    // Masquer immédiatement les suggestions
    setShowSuggestions(false);
    setSuggestions([]);

    // Réinitialiser l'erreur
    setError('');

    // Vérifier automatiquement la zone
    setChecking(true);
    try {
      const lat = parseFloat(suggestion.lat);
      const lng = parseFloat(suggestion.lon);
      const distance = await calculateRoadDistance(lat, lng);
      const inZone = distance <= MAX_DELIVERY_DISTANCE_KM;

      setResult({ inZone, distance });
      setChecking(false);

      if (onZoneVerified) {
        onZoneVerified(inZone, distance);
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
      setChecking(false);
      setError('Erreur lors du calcul de la distance. Veuillez réessayer.');
    }
  };

  const checkByGeolocation = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setError(''); // Réinitialiser l'erreur

    setChecking(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const distance = await calculateRoadDistance(
            position.coords.latitude,
            position.coords.longitude
          );

          const inZone = distance <= MAX_DELIVERY_DISTANCE_KM;
          setResult({ inZone, distance });
          setChecking(false);

          if (onZoneVerified) {
            onZoneVerified(inZone, distance);
          }
        } catch (error) {
          console.error('Distance calculation error:', error);
          setChecking(false);
          setError('Erreur lors du calcul de la distance. Veuillez réessayer.');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setChecking(false);
        setError('Impossible d\'obtenir votre position. Veuillez saisir votre adresse manuellement.');
      }
    );
  };

  const checkByAddress = async () => {
    if (!address.trim()) {
      setError('Veuillez saisir une adresse');
      return;
    }

    setError(''); // Réinitialiser l'erreur
    setChecking(true);

    try {
      // Utiliser l'API de géocodage de Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=fr&limit=1`,
        {
          headers: {
            'User-Agent': 'AuMatinVert-DeliveryChecker/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la géolocalisation');
      }

      const data = await response.json();

      if (data.length === 0) {
        setError('Adresse introuvable. Vérifiez votre saisie.');
        setChecking(false);
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      // Calculer la distance routière
      const distance = await calculateRoadDistance(lat, lng);
      const inZone = distance <= MAX_DELIVERY_DISTANCE_KM;

      setResult({ inZone, distance });
      setChecking(false);

      if (onZoneVerified) {
        onZoneVerified(inZone, distance);
      }
    } catch (error) {
      console.error('Address check error:', error);
      setChecking(false);
      setError('Erreur lors de la vérification de l\'adresse');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-zinc-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-50 rounded-lg">
          <MapPin className="w-6 h-6 text-site-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-zinc-800">Vérifier votre zone de livraison</h3>
          <p className="text-sm text-zinc-600">Êtes-vous dans notre rayon de {MAX_DELIVERY_DISTANCE_KM} km ?</p>
        </div>
      </div>

      {/* Vérification par géolocalisation */}
      <div className="mb-4">
        <button
          onClick={checkByGeolocation}
          disabled={checking}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-site-primary text-white rounded-lg hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {checking ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Vérification en cours...
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5" />
              Utiliser ma position actuelle
            </>
          )}
        </button>
        <p className="text-xs text-zinc-500 mt-2 text-center">
          Votre navigateur vous demandera l'autorisation d'accéder à votre position
        </p>
      </div>

      {/* Séparateur */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-zinc-500">ou</span>
        </div>
      </div>

      {/* Vérification par adresse */}
      <div className="space-y-3 relative">
        <label className="block text-sm font-medium text-zinc-700">
          Saisir votre adresse manuellement
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkByAddress()}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => {
                // Délai pour permettre le clic sur une suggestion
                setTimeout(() => {
                  setShowSuggestions(false);
                }, 150);
              }}
              placeholder="Ex: 8 rue des Cochardières, 44800"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-site-primary focus:border-transparent"
              disabled={checking}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                {loadingSuggestions && (
                  <div className="px-4 py-2 text-sm text-zinc-500">
                    Recherche d'adresses...
                  </div>
                )}
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-purple-50 border-b border-zinc-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-site-primary mt-1 flex-shrink-0" />
                      <span className="text-sm text-zinc-700">{formatSimpleAddress(suggestion)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={checkByAddress}
            disabled={checking || !address.trim()}
            className="px-4 py-2 bg-site-primary text-white rounded-lg hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Vérifier
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </p>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className={`mt-6 p-4 rounded-lg ${result.inZone ? 'bg-purple-50 border border-site-primary' : 'bg-amber-50 border border-amber-200'}`}>
          <div className="flex items-center gap-3">
            {result.inZone ? (
              <CheckCircle className="w-6 h-6 text-site-primary flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <p className={`font-semibold ${result.inZone ? 'text-site-primary' : 'text-amber-800'}`}>
                {result.inZone
                  ? '✅ Vous êtes dans notre zone de livraison !'
                  : '⚠️ Vous êtes hors de notre zone de livraison'}
              </p>
              <p className={`text-sm mt-1 ${result.inZone ? 'text-purple-700' : 'text-amber-700'}`}>
                Distance : <strong>{result.distance} km en voiture</strong> du magasin
                {result.inZone && ' — Livraison disponible'}
                {!result.inZone && ' — Veuillez nous contacter pour les options possibles'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info supplémentaire */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Bon à savoir :</strong> Nous livrons dans un rayon de {MAX_DELIVERY_DISTANCE_KM} km autour du centre commercial des Thébaudières à Saint-Herblain (44800).
        </p>
      </div>
    </div>
  );
};

export default DeliveryZoneChecker;
