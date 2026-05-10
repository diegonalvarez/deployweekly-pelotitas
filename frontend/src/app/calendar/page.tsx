'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDateLong, formatMonthYear, toDateInputString } from '@/lib/date';

interface CalendarEvent {
  id: string;
  type: 'RESERVATION' | 'CLASS' | 'MATCH' | 'TOURNAMENT';
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  sport?: string;
  location?: string;
  status?: string;
}

const EVENT_STYLES: Record<string, { bg: string; border: string; text: string; dot: string; label: string }> = {
  RESERVATION: { bg: 'bg-padel/15', border: 'border-padel/30', text: 'text-padel', dot: 'bg-padel', label: 'Reserva' },
  CLASS:       { bg: 'bg-brand/15', border: 'border-brand/30', text: 'text-brand', dot: 'bg-brand', label: 'Clase' },
  MATCH:       { bg: 'bg-warning/15', border: 'border-warning/30', text: 'text-warning', dot: 'bg-warning', label: 'Partido' },
  TOURNAMENT:  { bg: 'bg-negative/15', border: 'border-negative/30', text: 'text-negative', dot: 'bg-negative', label: 'Torneo' },
};

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const DAY_NAMES = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [notAvailable, setNotAvailable] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const from = toDateInputString(weekStart);
  const to = toDateInputString(addDays(weekStart, 6));

  const loadEvents = () => {
    setLoading(true);
    api
      .get(`/users/me/calendar?from=${from}&to=${to}`)
      .then((res) => {
        if (Array.isArray(res.events) || Array.isArray(res)) {
          setEvents(Array.isArray(res) ? res : res.events);
          setNotAvailable(false);
        } else {
          setEvents([]);
          setNotAvailable(true);
        }
      })
      .catch(() => {
        setEvents([]);
        setNotAvailable(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) loadEvents();
  }, [user, from]);

  const prevWeek = () => setWeekStart(addDays(weekStart, -7));
  const nextWeek = () => setWeekStart(addDays(weekStart, 7));
  const goToday = () => setWeekStart(getMonday(new Date()));

  const getEventsForDay = (day: Date) =>
    events.filter((e) => {
      const eventDate = new Date(e.date);
      return isSameDay(eventDate, day);
    });

  const monthLabel = (() => {
    const lastDay = addDays(weekStart, 6);
    const first = formatMonthYear(weekStart);
    const last = formatMonthYear(lastDay);
    return first === last ? first : `${first.split(' ')[0]} – ${last}`;
  })();

  // Auth guard
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] relative">
        <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="text-6xl mb-4 opacity-20">📅</div>
          <h2 className="text-2xl font-bold text-white mb-2">Inicia sesion</h2>
          <p className="text-text-muted mb-6">Necesitas una cuenta para ver tu calendario</p>
          <a href="/login" className="btn-primary">Ingresar</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="section-header mb-2">Mi calendario</h1>
            <p className="text-text-secondary text-lg">{monthLabel}</p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={prevWeek} className="btn-ghost">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={goToday} className="btn-secondary text-sm">
              Hoy
            </button>
            <button onClick={nextWeek} className="btn-ghost">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {Object.entries(EVENT_STYLES).map(([key, style]) => (
            <div key={key} className="flex items-center gap-2 text-sm text-text-secondary">
              <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
              {style.label}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-text-muted">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cargando calendario...
            </div>
          </div>
        ) : notAvailable ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-20">📅</div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">Proximamente</h3>
            <p className="text-text-muted">El calendario unificado estara disponible pronto</p>
          </div>
        ) : (
          <div className="card-elevated overflow-hidden animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border-dark">
              {weekDays.map((day, idx) => {
                const isToday = isSameDay(day, today);
                return (
                  <div
                    key={idx}
                    className={`text-center py-3 border-r last:border-r-0 border-border-dark/50 ${
                      isToday ? 'bg-brand/10' : ''
                    }`}
                  >
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${
                      isToday ? 'text-brand' : 'text-text-muted'
                    }`}>
                      {DAY_NAMES[idx]}
                    </p>
                    <p className={`text-lg font-bold ${isToday ? 'text-brand' : 'text-white'}`}>
                      {day.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Day columns with events */}
            <div className="grid grid-cols-7 min-h-[400px]">
              {weekDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isToday = isSameDay(day, today);
                return (
                  <div
                    key={idx}
                    className={`border-r last:border-r-0 border-border-dark/50 p-2 ${
                      isToday ? 'bg-brand/5' : ''
                    }`}
                  >
                    {dayEvents.length === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <span className="text-text-muted/30 text-xs">-</span>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {dayEvents.map((evt) => {
                        const style = EVENT_STYLES[evt.type] || EVENT_STYLES.MATCH;
                        return (
                          <button
                            key={evt.id}
                            onClick={() => setSelectedEvent(evt)}
                            className={`w-full text-left ${style.bg} border ${style.border} rounded-lg p-2 transition-all hover:scale-[1.02] hover:brightness-110 cursor-pointer`}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
                              <span className={`text-2xs font-semibold ${style.text} truncate`}>
                                {style.label}
                              </span>
                            </div>
                            <p className="text-xs text-white font-medium truncate">{evt.title}</p>
                            <p className="text-2xs text-text-muted">{evt.startTime}{evt.endTime ? ` - ${evt.endTime}` : ''}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty week message */}
        {!loading && !notAvailable && events.length === 0 && (
          <div className="text-center py-10 animate-fade-in-up">
            <p className="text-text-muted">No tenes eventos esta semana</p>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          />

          <div className="relative bg-surface border border-border-dark rounded-2xl w-full max-w-sm p-6 animate-scale-in shadow-xl">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {(() => {
              const style = EVENT_STYLES[selectedEvent.type] || EVENT_STYLES.MATCH;
              return (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-10 h-10 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center`}>
                      <span className={`w-3 h-3 rounded-full ${style.dot}`} />
                    </div>
                    <div>
                      <span className={`text-xs font-semibold ${style.text} uppercase tracking-wider`}>
                        {style.label}
                      </span>
                      <h3 className="font-bold text-white text-lg">{selectedEvent.title}</h3>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-text-secondary tabular">
                        {formatDateLong(selectedEvent.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-text-secondary">
                        {selectedEvent.startTime}
                        {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                      </span>
                    </div>

                    {selectedEvent.location && (
                      <div className="flex items-center gap-3 text-sm">
                        <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="text-text-secondary">{selectedEvent.location}</span>
                      </div>
                    )}

                    {selectedEvent.sport && (
                      <div className="flex items-center gap-3 text-sm">
                        <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        <span className={selectedEvent.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                          {selectedEvent.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedEvent.description && (
                    <p className="text-sm text-text-secondary mb-6 bg-surface-light/50 rounded-xl p-3">
                      {selectedEvent.description}
                    </p>
                  )}

                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="btn-secondary w-full"
                  >
                    Cerrar
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
