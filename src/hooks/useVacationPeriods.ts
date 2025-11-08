import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

export interface VacationPeriod {
  id: string;
  startDate: string;
  endDate: string;
  description: string;
  isActive: boolean;
  postVacationDelayDays?: number; // Nombre de jours après retour (défaut: 4)
}

export const useVacationPeriods = () => {
  const [vacationPeriods, setVacationPeriods] = useState<VacationPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVacationPeriods();
  }, []);

  const fetchVacationPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .like('setting_key', 'vacation_period_%');

      if (error) {
        console.warn('Could not fetch vacation periods from database, using defaults');
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const periods: VacationPeriod[] = [];
        
        data.forEach(setting => {
          const match = setting.setting_key.match(/vacation_period_(.+)/);
          if (match) {
            try {
              const period = JSON.parse(setting.setting_value) as VacationPeriod;
              periods.push(period);
            } catch (e) {
              console.warn(`Failed to parse vacation period ${match[1]}:`, e);
            }
          }
        });
        
        setVacationPeriods(periods.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
      }
    } catch (error) {
      console.warn('Error fetching vacation periods:', error);
      setError('Erreur lors du chargement des périodes de vacances');
    } finally {
      setLoading(false);
    }
  };

  const saveVacationPeriods = async (periods: VacationPeriod[]) => {
    try {
      // Supprimer les anciennes périodes
      const { error: deleteError } = await supabase
        .from('site_settings')
        .delete()
        .like('setting_key', 'vacation_period_%');

      if (deleteError) throw deleteError;

      // Insérer les nouvelles périodes
      const insertData = periods.map(period => ({
        setting_key: `vacation_period_${period.id}`,
        setting_value: JSON.stringify(period),
        setting_type: 'json',
        description: `Période de vacances: ${period.description}`
      }));

      if (insertData.length > 0) {
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      setVacationPeriods(periods);
      return true;
    } catch (error) {
      console.error('Error saving vacation periods:', error);
      setError('Erreur lors de la sauvegarde des périodes de vacances');
      return false;
    }
  };

  const addVacationPeriod = (period: Omit<VacationPeriod, 'id'>) => {
    const newPeriod: VacationPeriod = {
      ...period,
      id: `vacation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      postVacationDelayDays: period.postVacationDelayDays || 4 // Défaut à 4 jours
    };
    
    const updatedPeriods = [...vacationPeriods, newPeriod].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    setVacationPeriods(updatedPeriods);
    return newPeriod;
  };

  const updateVacationPeriod = (id: string, updates: Partial<VacationPeriod>) => {
    const updatedPeriods = vacationPeriods.map(period =>
      period.id === id ? { ...period, ...updates } : period
    ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    setVacationPeriods(updatedPeriods);
  };

  const removeVacationPeriod = (id: string) => {
    setVacationPeriods(vacationPeriods.filter(period => period.id !== id));
  };

  const isDateInVacation = (date: string): VacationPeriod | null => {
    const checkDate = new Date(date);
    
    for (const period of vacationPeriods) {
      if (!period.isActive) continue;
      
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);
      
      if (checkDate >= startDate && checkDate <= endDate) {
        return period;
      }
    }
    
    return null;
  };

  const getEarliestAvailableDate = (requestedDate: string): string => {
    const requested = new Date(requestedDate);
    const today = new Date();
    
    // Commencer à partir d'aujourd'hui si la date demandée est dans le passé
    let checkDate = requested > today ? requested : today;
    
    // Vérifier si la date est en période de vacances
    const vacationPeriod = isDateInVacation(checkDate.toISOString().split('T')[0]);
    
    if (vacationPeriod) {
      // Si en vacances, utiliser le délai configuré ou 4 jours par défaut
      const delayDays = vacationPeriod.postVacationDelayDays || 4;
      const endDate = new Date(vacationPeriod.endDate);
      const availableDate = new Date(endDate);
      availableDate.setDate(availableDate.getDate() + delayDays);
      
      // Vérifier si cette nouvelle date tombe dans une autre période de vacances
      return getEarliestAvailableDate(availableDate.toISOString().split('T')[0]);
    }
    
    return checkDate.toISOString().split('T')[0];
  };

  const getCurrentVacationStatus = (): { 
    isOnVacation: boolean; 
    currentPeriod?: VacationPeriod; 
    nextVacation?: VacationPeriod;
    returnDate?: string;
  } => {
    const today = new Date().toISOString().split('T')[0];
    const currentPeriod = isDateInVacation(today);
    
    if (currentPeriod) {
      const delayDays = currentPeriod.postVacationDelayDays || 4;
      const returnDate = new Date(currentPeriod.endDate);
      returnDate.setDate(returnDate.getDate() + delayDays);
      
      return {
        isOnVacation: true,
        currentPeriod,
        returnDate: returnDate.toISOString().split('T')[0]
      };
    }

    // Trouver la prochaine période de vacances
    const nextVacation = vacationPeriods
      .filter(period => period.isActive && new Date(period.startDate) > new Date(today))
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

    return {
      isOnVacation: false,
      nextVacation
    };
  };

  const getActivePeriods = () => {
    return vacationPeriods.filter(period => period.isActive);
  };

  const formatPeriod = (period: VacationPeriod): string => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    };

    return `Du ${formatDate(start)} au ${formatDate(end)}`;
  };

  return {
    vacationPeriods,
    setVacationPeriods,
    saveVacationPeriods,
    addVacationPeriod,
    updateVacationPeriod,
    removeVacationPeriod,
    isDateInVacation,
    getEarliestAvailableDate,
    getCurrentVacationStatus,
    getActivePeriods,
    formatPeriod,
    loading,
    error
  };
};