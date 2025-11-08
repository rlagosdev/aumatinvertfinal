import { addDays } from 'date-fns';

export interface Holiday {
  date: Date;
  name: string;
  type: 'fixed' | 'easter' | 'variable';
}

// Calcul de Pâques selon l'algorithme de Spencer Jones
const calculateEaster = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month - 1, day);
};

export const getFrenchHolidays = (year: number): Holiday[] => {
  const easter = calculateEaster(year);
  
  const holidays: Holiday[] = [
    // Jours fériés fixes
    {
      date: new Date(year, 0, 1), // 1er janvier
      name: "Jour de l'An",
      type: 'fixed'
    },
    {
      date: new Date(year, 4, 1), // 1er mai
      name: "Fête du Travail",
      type: 'fixed'
    },
    {
      date: new Date(year, 4, 8), // 8 mai
      name: "Fête de la Victoire",
      type: 'fixed'
    },
    {
      date: new Date(year, 6, 14), // 14 juillet
      name: "Fête Nationale",
      type: 'fixed'
    },
    {
      date: new Date(year, 7, 15), // 15 août
      name: "Assomption",
      type: 'fixed'
    },
    {
      date: new Date(year, 10, 1), // 1er novembre
      name: "Toussaint",
      type: 'fixed'
    },
    {
      date: new Date(year, 10, 11), // 11 novembre
      name: "Armistice",
      type: 'fixed'
    },
    {
      date: new Date(year, 11, 25), // 25 décembre
      name: "Noël",
      type: 'fixed'
    },
    
    // Jours fériés liés à Pâques
    {
      date: addDays(easter, 1), // Lundi de Pâques
      name: "Lundi de Pâques",
      type: 'easter'
    },
    {
      date: addDays(easter, 39), // Ascension (39 jours après Pâques)
      name: "Ascension",
      type: 'easter'
    },
    {
      date: addDays(easter, 50), // Lundi de Pentecôte (50 jours après Pâques)
      name: "Lundi de Pentecôte",
      type: 'easter'
    }
  ];

  return holidays.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Jours fériés spéciaux (Alsace-Moselle, DOM-TOM)
export const getAlsaceMoselleHolidays = (year: number): Holiday[] => {
  const easter = calculateEaster(year);
  
  return [
    {
      date: addDays(easter, -2), // Vendredi Saint
      name: "Vendredi Saint",
      type: 'easter'
    },
    {
      date: new Date(year, 11, 26), // 26 décembre
      name: "Saint-Étienne",
      type: 'fixed'
    }
  ];
};

// Vérifier si une date est un jour férié
export const isHoliday = (date: Date, year?: number): Holiday | null => {
  const checkYear = year || date.getFullYear();
  const holidays = getFrenchHolidays(checkYear);
  
  return holidays.find(holiday => 
    holiday.date.getFullYear() === date.getFullYear() &&
    holiday.date.getMonth() === date.getMonth() &&
    holiday.date.getDate() === date.getDate()
  ) || null;
};

// Obtenir tous les jours fériés pour une plage d'années
export const getHolidaysForRange = (startYear: number, endYear: number): Holiday[] => {
  const allHolidays: Holiday[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    allHolidays.push(...getFrenchHolidays(year));
  }
  
  return allHolidays;
};