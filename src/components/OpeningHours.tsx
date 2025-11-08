import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useOpeningHours } from '../hooks/useOpeningHours';

interface OpeningHoursProps {
  showStatus?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

const OpeningHours: React.FC<OpeningHoursProps> = ({ showStatus = false, className = '', theme = 'light' }) => {
  const { getDisplaySchedule, isCurrentlyOpen, loading, error } = useOpeningHours();
  const [currentStatus, setCurrentStatus] = useState<{ isOpen: boolean; nextChange?: string } | null>(null);

  useEffect(() => {
    if (showStatus) {
      const updateStatus = () => {
        setCurrentStatus(isCurrentlyOpen());
      };

      updateStatus();
      // Mettre à jour chaque minute
      const interval = setInterval(updateStatus, 60000);

      return () => clearInterval(interval);
    }
  }, [showStatus, isCurrentlyOpen]);

  if (loading) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="text-red-600 text-sm">
          Erreur lors du chargement des horaires
        </div>
      </div>
    );
  }

  const schedule = getDisplaySchedule();

  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        statusGreen: 'border text-site-text-light',
        statusGreenBg: { backgroundColor: 'rgba(123, 138, 120, 0.3)', borderColor: 'var(--color-primary)' },
        statusRed: 'border text-site-text-light',
        statusRedBg: { backgroundColor: 'rgba(199, 179, 179, 0.3)', borderColor: 'var(--color-slot-occupied)' },
        dayText: 'text-zinc-300',
        dayTextClosed: 'text-zinc-500',
        hoursText: 'text-zinc-400',
        hoursTextClosed: 'text-zinc-500'
      };
    }
    return {
      statusGreen: 'border',
      statusGreenBg: { backgroundColor: 'rgba(123, 138, 120, 0.15)', borderColor: 'var(--color-primary)', color: 'var(--color-text-dark)' },
      statusRed: 'border',
      statusRedBg: { backgroundColor: 'rgba(199, 179, 179, 0.15)', borderColor: 'var(--color-slot-occupied)', color: 'var(--color-text-dark)' },
      dayText: 'text-site-text-dark',
      dayTextClosed: 'text-site-slot-occupied',
      hoursText: 'text-zinc-600',
      hoursTextClosed: 'text-site-slot-occupied'
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={className}>
      {showStatus && currentStatus && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            currentStatus.isOpen
              ? themeClasses.statusGreen
              : themeClasses.statusRed
          }`}
          style={currentStatus.isOpen ? themeClasses.statusGreenBg : themeClasses.statusRedBg}
        >
          <div className="flex items-center">
            <div
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: currentStatus.isOpen ? 'var(--color-primary)' : 'var(--color-slot-occupied)' }}
            ></div>
            <span className="font-medium">
              {currentStatus.isOpen ? '🟢 Ouvert maintenant' : '🔴 Fermé'}
            </span>
          </div>
          {currentStatus.nextChange && (
            <div className="text-sm mt-1 opacity-80">
              {currentStatus.nextChange}
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        {schedule.map((item, index) => (
          <div key={index} className="flex justify-between items-center gap-4">
            <span className={`font-medium flex-shrink-0 ${item.isClosed ? themeClasses.dayTextClosed : themeClasses.dayText}`}>
              {item.day}
            </span>
            <span className={`text-sm text-right ${item.isClosed ? themeClasses.hoursTextClosed : themeClasses.hoursText}`}>
              {item.hours}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpeningHours;