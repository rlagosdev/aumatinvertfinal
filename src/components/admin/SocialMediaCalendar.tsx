import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Facebook, Instagram, Clock, CheckCircle, XCircle } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface ScheduledPost {
  id: string;
  social_account_id: string;
  platform: 'facebook' | 'instagram';
  content: string;
  media_urls: string[];
  status: 'scheduled' | 'published' | 'failed' | 'draft';
  scheduled_at?: string;
  published_at?: string;
  platform_post_url?: string;
  error_message?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ScheduledPost;
}

interface SocialMediaCalendarProps {
  posts: ScheduledPost[];
  onSelectPost: (post: ScheduledPost) => void;
}

const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
  getDay,
  locales,
});

const SocialMediaCalendar: React.FC<SocialMediaCalendarProps> = ({ posts, onSelectPost }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<View>('month');

  // Convertir les posts en événements de calendrier
  const events: CalendarEvent[] = useMemo(() => {
    return posts
      .filter(post => post.scheduled_at || post.published_at)
      .map(post => {
        const date = new Date(post.scheduled_at || post.published_at!);
        return {
          id: post.id,
          title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
          start: date,
          end: date,
          resource: post,
        };
      });
  }, [posts]);

  // Style personnalisé pour les événements
  const eventStyleGetter = (event: CalendarEvent) => {
    const post = event.resource;
    let backgroundColor = '#6b7280'; // gray

    switch (post.status) {
      case 'scheduled':
        backgroundColor = '#3b82f6'; // blue
        break;
      case 'published':
        backgroundColor = '#10b981'; // green
        break;
      case 'failed':
        backgroundColor = '#ef4444'; // red
        break;
      case 'draft':
        backgroundColor = '#6b7280'; // gray
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        padding: '2px 4px',
      },
    };
  };

  // Composant personnalisé pour afficher un événement
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const post = event.resource;
    const Icon = post.platform === 'facebook' ? Facebook : Instagram;

    return (
      <div className="flex items-center gap-1 text-xs truncate">
        <Icon className="h-3 w-3 flex-shrink-0" />
        <span className="truncate">{event.title}</span>
      </div>
    );
  };

  // Navigation personnalisée
  const CustomToolbar = () => {
    const goToBack = () => {
      setCurrentDate(subMonths(currentDate, 1));
    };

    const goToNext = () => {
      setCurrentDate(addMonths(currentDate, 1));
    };

    const goToToday = () => {
      setCurrentDate(new Date());
    };

    return (
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <button
            onClick={goToBack}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 hover:bg-zinc-100 rounded-lg transition-colors font-medium text-sm"
          >
            Aujourd'hui
          </button>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-zinc-800 ml-4">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              view === 'month'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              view === 'week'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setView('day')}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              view === 'day'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            Jour
          </button>
        </div>
      </div>
    );
  };

  // Légende des statuts
  const StatusLegend = () => (
    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-zinc-200">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-600" />
        <span className="text-sm text-zinc-600">Planifié</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-sm text-zinc-600">Publié</span>
      </div>
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-red-600" />
        <span className="text-sm text-zinc-600">Échec</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6">
      <CustomToolbar />

      <div className="social-media-calendar">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          onView={setView}
          date={currentDate}
          onNavigate={setCurrentDate}
          culture="fr"
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
            toolbar: () => null, // On utilise notre toolbar personnalisé
          }}
          onSelectEvent={(event) => onSelectPost(event.resource)}
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
            date: "Date",
            time: "Heure",
            event: "Événement",
            noEventsInRange: "Aucun post planifié pour cette période",
            showMore: (total) => `+ ${total} de plus`,
          }}
        />
      </div>

      <StatusLegend />

      <style>{`
        .social-media-calendar .rbc-calendar {
          font-family: inherit;
        }

        .social-media-calendar .rbc-header {
          padding: 12px 8px;
          font-weight: 600;
          color: #3f3f46;
          border-bottom: 2px solid #e4e4e7;
          background-color: #fafafa;
        }

        .social-media-calendar .rbc-today {
          background-color: #f0f9ff;
        }

        .social-media-calendar .rbc-off-range-bg {
          background-color: #fafafa;
        }

        .social-media-calendar .rbc-date-cell {
          padding: 8px;
          text-align: right;
        }

        .social-media-calendar .rbc-event {
          padding: 2px 4px;
          cursor: pointer;
        }

        .social-media-calendar .rbc-event:hover {
          opacity: 1 !important;
        }

        .social-media-calendar .rbc-month-view {
          border: 1px solid #e4e4e7;
          border-radius: 8px;
          overflow: hidden;
        }

        .social-media-calendar .rbc-day-bg {
          border-left: 1px solid #e4e4e7;
        }

        .social-media-calendar .rbc-month-row {
          border-top: 1px solid #e4e4e7;
          min-height: 100px;
        }

        .social-media-calendar .rbc-day-slot {
          border-top: 1px solid #e4e4e7;
        }

        .social-media-calendar .rbc-time-slot {
          border-top: 1px solid #f4f4f5;
        }

        .social-media-calendar .rbc-current-time-indicator {
          background-color: #dc2626;
          height: 2px;
        }
      `}</style>
    </div>
  );
};

export default SocialMediaCalendar;
