import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';

export interface TimeSlot {
  open: string;
  close: string;
}

export interface DaySchedule {
  day: string;
  isOpen: boolean;
  morning?: TimeSlot;
  afternoon?: TimeSlot;
}

export interface OpeningHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const defaultOpeningHours: OpeningHours = {
  monday: { day: 'Lundi', isOpen: false },
  tuesday: { 
    day: 'Mardi', 
    isOpen: true, 
    morning: { open: '08:00', close: '12:45' },
    afternoon: { open: '15:30', close: '19:00' }
  },
  wednesday: { 
    day: 'Mercredi', 
    isOpen: true, 
    morning: { open: '08:00', close: '12:45' },
    afternoon: { open: '15:30', close: '19:00' }
  },
  thursday: { 
    day: 'Jeudi', 
    isOpen: true, 
    morning: { open: '08:00', close: '12:45' },
    afternoon: { open: '15:30', close: '19:00' }
  },
  friday: { 
    day: 'Vendredi', 
    isOpen: true, 
    morning: { open: '08:00', close: '12:45' },
    afternoon: { open: '15:30', close: '19:00' }
  },
  saturday: { 
    day: 'Samedi', 
    isOpen: true, 
    morning: { open: '08:00', close: '13:00' },
    afternoon: { open: '15:30', close: '19:00' }
  },
  sunday: { day: 'Dimanche', isOpen: false }
};

export const useOpeningHours = () => {
  const [openingHours, setOpeningHours] = useState<OpeningHours>(defaultOpeningHours);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOpeningHours();
  }, []);

  const fetchOpeningHours = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .like('setting_key', 'opening_hours_%');

      if (error) {
        console.warn('Could not fetch opening hours from database, using defaults');
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const hours = { ...defaultOpeningHours };
        
        data.forEach(setting => {
          const match = setting.setting_key.match(/opening_hours_(.+)/);
          if (match) {
            const key = match[1];
            try {
              const schedule = JSON.parse(setting.setting_value) as DaySchedule;
              if (key in hours) {
                hours[key as keyof OpeningHours] = schedule;
              }
            } catch (e) {
              console.warn(`Failed to parse opening hours for ${key}:`, e);
            }
          }
        });
        
        setOpeningHours(hours);
      }
    } catch (error) {
      console.warn('Error fetching opening hours:', error);
      setError('Erreur lors du chargement des horaires');
    } finally {
      setLoading(false);
    }
  };

  const saveOpeningHours = async (hours: OpeningHours) => {
    try {
      // Supprimer les anciens horaires
      const { error: deleteError } = await supabase
        .from('site_settings')
        .delete()
        .like('setting_key', 'opening_hours_%');

      if (deleteError) throw deleteError;

      // Insérer les nouveaux horaires
      const insertData = Object.entries(hours).map(([day, schedule]) => ({
        setting_key: `opening_hours_${day}`,
        setting_value: JSON.stringify(schedule),
        setting_type: 'json',
        description: `Horaires d'ouverture pour ${schedule.day}`
      }));

      const { error: insertError } = await supabase
        .from('site_settings')
        .insert(insertData);

      if (insertError) throw insertError;

      setOpeningHours(hours);
      return true;
    } catch (error) {
      console.error('Error saving opening hours:', error);
      setError('Erreur lors de la sauvegarde des horaires');
      return false;
    }
  };

  const isCurrentlyOpen = useCallback((): { isOpen: boolean; nextChange?: string } => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

    // Convertir le jour de la semaine en clé d'objet
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = dayKeys[currentDay] as keyof OpeningHours;
    const today = openingHours[todayKey];

    if (!today.isOpen) {
      // Chercher le prochain jour d'ouverture
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (currentDay + i) % 7;
        const nextDayKey = dayKeys[nextDayIndex] as keyof OpeningHours;
        const nextDay = openingHours[nextDayKey];

        if (nextDay.isOpen && nextDay.morning) {
          return {
            isOpen: false,
            nextChange: `Ouvert ${nextDay.day} à ${nextDay.morning.open}`
          };
        }
      }
      return { isOpen: false };
    }

    // Vérifier si nous sommes dans les heures d'ouverture
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    let isOpen = false;
    let nextChangeTime: string | undefined;

    // Vérifier matin
    if (today.morning) {
      const morningOpen = timeToMinutes(today.morning.open);
      const morningClose = timeToMinutes(today.morning.close);

      if (currentTime >= morningOpen && currentTime < morningClose) {
        isOpen = true;
        nextChangeTime = `Ferme à ${today.morning.close}`;
      } else if (currentTime < morningOpen) {
        nextChangeTime = `Ouvert à ${today.morning.open}`;
      }
    }

    // Vérifier après-midi
    if (today.afternoon) {
      const afternoonOpen = timeToMinutes(today.afternoon.open);
      const afternoonClose = timeToMinutes(today.afternoon.close);

      if (currentTime >= afternoonOpen && currentTime < afternoonClose) {
        isOpen = true;
        nextChangeTime = `Ferme à ${today.afternoon.close}`;
      } else if (currentTime < afternoonOpen && (!today.morning || currentTime >= timeToMinutes(today.morning.close))) {
        nextChangeTime = `Ouvert à ${today.afternoon.open}`;
      }
    }

    // Si fermé, chercher la prochaine ouverture
    if (!isOpen && !nextChangeTime) {
      // Chercher demain
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (currentDay + i) % 7;
        const nextDayKey = dayKeys[nextDayIndex] as keyof OpeningHours;
        const nextDay = openingHours[nextDayKey];

        if (nextDay.isOpen && nextDay.morning) {
          nextChangeTime = `Ouvert ${nextDay.day} à ${nextDay.morning.open}`;
          break;
        }
      }
    }

    return { isOpen, nextChange: nextChangeTime };
  }, [openingHours]);

  const formatSchedule = (schedule: DaySchedule): string => {
    if (!schedule.isOpen) {
      return 'Fermé';
    }

    const parts: string[] = [];
    
    if (schedule.morning) {
      parts.push(`${schedule.morning.open}-${schedule.morning.close}`);
    }
    
    if (schedule.afternoon) {
      parts.push(`${schedule.afternoon.open}-${schedule.afternoon.close}`);
    }

    return parts.join(' / ');
  };

  const getDisplaySchedule = (): Array<{ day: string; hours: string; isClosed: boolean }> => {
    return Object.values(openingHours).map(schedule => ({
      day: schedule.day,
      hours: formatSchedule(schedule),
      isClosed: !schedule.isOpen
    }));
  };

  const getShortFormatText = useCallback((): string => {
    if (!openingHours) return 'Chargement...';

    const days = [
      { key: 'monday' as keyof OpeningHours, short: 'Lun' },
      { key: 'tuesday' as keyof OpeningHours, short: 'Mar' },
      { key: 'wednesday' as keyof OpeningHours, short: 'Mer' },
      { key: 'thursday' as keyof OpeningHours, short: 'Jeu' },
      { key: 'friday' as keyof OpeningHours, short: 'Ven' },
      { key: 'saturday' as keyof OpeningHours, short: 'Sam' },
      { key: 'sunday' as keyof OpeningHours, short: 'Dim' }
    ];

    // Grouper les jours avec les mêmes horaires
    const groups: { days: string[], schedule: string }[] = [];
    
    days.forEach(day => {
      const daySchedule = openingHours[day.key];
      let scheduleText = 'Fermé';
      
      if (daySchedule.isOpen) {
        if (daySchedule.morning && daySchedule.afternoon) {
          scheduleText = `${daySchedule.morning.open}-${daySchedule.morning.close} / ${daySchedule.afternoon.open}-${daySchedule.afternoon.close}`;
        } else if (daySchedule.morning) {
          scheduleText = `${daySchedule.morning.open}-${daySchedule.morning.close}`;
        } else if (daySchedule.afternoon) {
          scheduleText = `${daySchedule.afternoon.open}-${daySchedule.afternoon.close}`;
        }
      }
      
      // Chercher si ce planning existe déjà
      const existingGroup = groups.find(g => g.schedule === scheduleText);
      if (existingGroup) {
        existingGroup.days.push(day.short);
      } else {
        groups.push({ days: [day.short], schedule: scheduleText });
      }
    });

    // Formater les groupes pour l'affichage compact
    const formatted = groups
      .filter(group => group.schedule !== 'Fermé') // Ne montrer que les jours ouverts
      .map(group => {
        const dayRange = group.days.length > 1 && areConsecutive(group.days, days.map(d => d.short))
          ? `${group.days[0]}-${group.days[group.days.length - 1]}`
          : group.days.join(',');
        return `${dayRange}: ${group.schedule}`;
      })
      .join(' • ');

    return formatted || 'Fermé';
  }, [openingHours]);

  // Fonction helper pour vérifier si les jours sont consécutifs
  const areConsecutive = (selectedDays: string[], allDays: string[]): boolean => {
    if (selectedDays.length < 2) return false;
    
    const indices = selectedDays.map(day => allDays.indexOf(day)).sort((a, b) => a - b);
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] + 1) return false;
    }
    return true;
  };

  return {
    openingHours,
    setOpeningHours,
    saveOpeningHours,
    isCurrentlyOpen,
    formatSchedule,
    getDisplaySchedule,
    getShortFormatText,
    loading,
    error
  };
};