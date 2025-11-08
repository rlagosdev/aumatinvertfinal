import { useCallback } from 'react';
import { useOpeningHours } from './useOpeningHours';

// Marge de temps en minutes avant la fermeture (1h30 = 90 minutes)
const LATE_ORDER_THRESHOLD_MINUTES = 90;

export const useLateOrderCheck = () => {
  const { openingHours } = useOpeningHours();

  /**
   * Vérifie si une commande est passée moins de 1h30 avant la fermeture
   * @returns boolean - true si la commande est tardive (< 1h30 avant fermeture)
   */
  const isLateOrder = useCallback((): boolean => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes(); // Minutes depuis minuit

    // Convertir le jour de la semaine en clé d'objet
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayKeys[currentDay] as keyof typeof openingHours;
    const today = openingHours[todayKey];

    // Si on est entre minuit et l'ouverture du magasin, c'est une commande tardive
    // (considérée comme passée la veille après fermeture)
    if (today.isOpen && today.morning) {
      const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      const openingTimeMinutes = timeToMinutes(today.morning.open);
      if (currentTimeMinutes < openingTimeMinutes) {
        return true; // Entre minuit et l'ouverture = commande tardive
      }
    }

    // Si le magasin est fermé aujourd'hui, pas de problème de commande tardive
    if (!today.isOpen) {
      return false;
    }

    // Fonction pour convertir une heure "HH:MM" en minutes depuis minuit
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // Déterminer l'heure de fermeture du jour
    let closingTimeMinutes: number | null = null;

    // Si on a un horaire d'après-midi, c'est la fermeture du jour
    if (today.afternoon) {
      closingTimeMinutes = timeToMinutes(today.afternoon.close);
    }
    // Sinon si on a seulement un horaire du matin
    else if (today.morning) {
      closingTimeMinutes = timeToMinutes(today.morning.close);
    }

    // Si pas d'horaire de fermeture trouvé, retourner false
    if (closingTimeMinutes === null) {
      return false;
    }

    // Calculer le temps avant la fermeture en minutes
    const minutesUntilClosing = closingTimeMinutes - currentTimeMinutes;

    // Calculer l'heure limite (1h30 avant la fermeture)
    const lateOrderThresholdTime = closingTimeMinutes - LATE_ORDER_THRESHOLD_MINUTES;

    // Si on est après l'heure limite (1h30 avant fermeture) OU après la fermeture
    // alors c'est une commande tardive
    return currentTimeMinutes >= lateOrderThresholdTime;
  }, [openingHours]);

  /**
   * Calcule l'heure de retrait disponible pour les produits immédiats
   * @returns string - texte indiquant quand le retrait est possible
   */
  const getImmediatePickupTime = useCallback((): string => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayKeys[currentDay] as keyof typeof openingHours;
    const today = openingHours[todayKey];

    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const minutesToTime = (minutes: number): string => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `dès ${hours.toString().padStart(2, '0')}h${mins > 0 ? mins.toString().padStart(2, '0') : ''}`;
    };

    // Si magasin fermé aujourd'hui
    if (!today.isOpen) {
      return "dès demain à partir de 10h";
    }

    // Si entre minuit et l'ouverture
    if (today.morning) {
      const openingTimeMinutes = timeToMinutes(today.morning.open);
      if (currentTimeMinutes < openingTimeMinutes) {
        return "dès aujourd'hui à partir de 10h";
      }
    }

    // Horaires de fermeture
    let morningCloseMinutes = 0;
    let afternoonOpenMinutes = 0;
    let closingTimeMinutes = 0;

    if (today.morning) {
      morningCloseMinutes = timeToMinutes(today.morning.close);
    }
    if (today.afternoon) {
      afternoonOpenMinutes = timeToMinutes(today.afternoon.open);
      closingTimeMinutes = timeToMinutes(today.afternoon.close);
    }

    // Calculer 1h après maintenant
    const pickupTimeMinutes = currentTimeMinutes + 60;

    // Si on est le matin
    if (today.morning && currentTimeMinutes < morningCloseMinutes) {
      // Si 1h après dépasse la fermeture du midi
      if (pickupTimeMinutes >= morningCloseMinutes) {
        // Retrait après-midi à la réouverture
        return `aujourd'hui ${minutesToTime(afternoonOpenMinutes)}`;
      }
      // Sinon 1h après
      return `aujourd'hui ${minutesToTime(pickupTimeMinutes)}`;
    }

    // Si on est l'après-midi
    if (today.afternoon && currentTimeMinutes >= afternoonOpenMinutes && currentTimeMinutes < closingTimeMinutes) {
      // Calculer l'heure limite (1h30 avant fermeture)
      const lateOrderThresholdTime = closingTimeMinutes - LATE_ORDER_THRESHOLD_MINUTES;

      // Si on est dans les 1h30 avant fermeture ou après
      if (currentTimeMinutes >= lateOrderThresholdTime) {
        return "dès demain à partir de 10h";
      }

      // Si 1h après dépasse la fermeture
      if (pickupTimeMinutes >= closingTimeMinutes) {
        return "dès demain à partir de 10h";
      }

      // Sinon 1h après
      return `aujourd'hui ${minutesToTime(pickupTimeMinutes)}`;
    }

    // Par défaut (fermé, entre deux services, etc.)
    return "dès demain à partir de 10h";
  }, [openingHours]);

  /**
   * Vérifie si on est entre minuit et l'ouverture du magasin
   * @returns boolean - true si entre minuit et l'ouverture
   */
  const isBetweenMidnightAndOpening = useCallback((): boolean => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayKeys[currentDay] as keyof typeof openingHours;
    const today = openingHours[todayKey];

    if (today.isOpen && today.morning) {
      const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      const openingTimeMinutes = timeToMinutes(today.morning.open);
      return currentTimeMinutes < openingTimeMinutes;
    }

    return false;
  }, [openingHours]);

  /**
   * Retourne le texte approprié : "aujourd'hui" ou "demain"
   * @returns string - "aujourd'hui" si entre minuit et ouverture, sinon "demain"
   */
  const getPickupDayText = useCallback((): string => {
    return isBetweenMidnightAndOpening() ? "aujourd'hui" : "demain";
  }, [isBetweenMidnightAndOpening]);

  /**
   * Retourne le lendemain comme date de retrait disponible
   * @returns Date - la date du lendemain
   */
  const getNextDayPickup = useCallback((): Date => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }, []);

  /**
   * Retourne un message informatif pour les commandes tardives
   * @returns string - message à afficher au client
   */
  const getLateOrderMessage = useCallback((): string => {
    if (!isLateOrder()) {
      return '';
    }

    const dayText = getPickupDayText();
    const nextDay = getNextDayPickup();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = nextDay.toLocaleDateString('fr-FR', options);

    return `Commande tardive : Les produits en disponibilité immédiate ne pourront être retirés qu'à partir de ${dayText} à 10h.`;
  }, [isLateOrder, getPickupDayText, getNextDayPickup]);

  /**
   * Retourne un message formaté pour informer le client du délai de retrait
   * @returns string - message complet
   */
  const getPickupMessage = useCallback((): string => {
    const pickupTime = getImmediatePickupTime();
    return `Les produits seront disponibles ${pickupTime}.`;
  }, [getImmediatePickupTime]);

  return {
    isLateOrder,
    isBetweenMidnightAndOpening,
    getPickupDayText,
    getNextDayPickup,
    getLateOrderMessage,
    getImmediatePickupTime,
    getPickupMessage
  };
};
