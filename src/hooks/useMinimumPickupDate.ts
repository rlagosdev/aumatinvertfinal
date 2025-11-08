import { useVacationPeriods } from './useVacationPeriods';

export const useMinimumPickupDate = () => {
  const { getEarliestAvailableDate } = useVacationPeriods();

  // Fonction pour vérifier si une date est un dimanche (0) ou lundi (1)
  const isSundayOrMonday = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 1; // 0 = dimanche, 1 = lundi
  };

  // Fonction pour passer au prochain jour valide (pas dimanche ni lundi)
  const getNextValidDay = (date: Date): Date => {
    const newDate = new Date(date);
    while (isSundayOrMonday(newDate)) {
      newDate.setDate(newDate.getDate() + 1);
    }
    return newDate;
  };

  const getMinimumPickupDate = (baseDelayDays: number = 4): string => {
    // Calculer la date de base (aujourd'hui + délai normal)
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + baseDelayDays);

    // Sauter les dimanches et lundis
    const validBaseDate = getNextValidDay(baseDate);
    const baseDateString = validBaseDate.toISOString().split('T')[0];

    // Vérifier si cette date tombe en période de vacances et ajuster si nécessaire
    const earliestAvailableDate = getEarliestAvailableDate(baseDateString);

    // S'assurer que la date finale n'est pas un dimanche ou lundi
    const finalDate = new Date(earliestAvailableDate);
    const validFinalDate = getNextValidDay(finalDate);

    return validFinalDate.toISOString().split('T')[0];
  };

  const getPickupDateWithVacationAdjustment = (requestedDate: string): string => {
    return getEarliestAvailableDate(requestedDate);
  };

  const isDateAvailable = (dateString: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    const requestedDate = new Date(dateString);
    const todayDate = new Date(today);

    // Vérifier si la date n'est pas dans le passé
    if (requestedDate < todayDate) {
      return false;
    }

    // Vérifier si la date est un dimanche ou lundi
    if (isSundayOrMonday(requestedDate)) {
      return false;
    }

    // Vérifier si la date est au moins égale à la date minimum calculée
    const minimumDate = new Date(getMinimumPickupDate());
    return requestedDate >= minimumDate;
  };

  return {
    getMinimumPickupDate,
    getPickupDateWithVacationAdjustment,
    isDateAvailable
  };
};