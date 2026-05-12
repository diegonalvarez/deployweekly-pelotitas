'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { formatDate, formatDateLong } from '@/lib/date';
import toast from 'react-hot-toast';

type ConnectionStatus = 'none' | 'pending' | 'accepted' | 'rejected' | 'loading';

interface AvailabilitySlot {
  time: string;
  endTime: string;
  available: boolean;
}

interface CourtAvailability {
  courtId: string;
  courtName: string;
  sport: string;
  slots: AvailabilitySlot[];
  loading: boolean;
}

interface AlternativeSlot {
  time: string;
  endTime: string;
}

interface OtherCourtAlternative {
  courtId: string;
  courtName: string;
  sport: string;
  time: string;
  endTime: string;
}

interface AlternativesData {
  sameCourtAlternatives: AlternativeSlot[];
  otherCourtAlternatives: OtherCourtAlternative[];
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function SmallSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function generateWeekDays(startDate: Date, count: number) {
  const days: { date: Date; label: string; dateStr: string }[] = [];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  for (let i = 0; i < count; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push({
      date: d,
      label: `${dayNames[d.getDay()]} ${d.getDate()}`,
      dateStr: d.toISOString().split('T')[0],
    });
  }
  return days;
}

export default function ClubDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [club, setClub] = useState<any>(null);
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(true);

  /* Route gate:
     - not logged in            → /c/[id]   (public landing)
     - logged in + owner        → /dashboard/club/[id]
     - logged in + non-owner    → render the reservation UI below
  */
  useEffect(() => {
    if (authLoading || !id || typeof id !== 'string') return;
    if (!user) {
      router.replace(`/c/${id}`);
      return;
    }
    let cancelled = false;
    const isAdmin = (user as any).roles?.includes('ADMIN');
    if (isAdmin) {
      router.replace(`/dashboard/club/${id}`);
      return;
    }
    api
      .get<any[]>('/clubs/mine')
      .then((mine) => {
        if (cancelled) return;
        const isOwner = Array.isArray(mine) && mine.some((c) => c.id === id);
        if (isOwner) router.replace(`/dashboard/club/${id}`);
        else setRedirecting(false);
      })
      .catch(() => {
        if (!cancelled) setRedirecting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, id, router]);

  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('loading');
  const [connectLoading, setConnectLoading] = useState(false);

  // Reservation modal state
  const [reserveModal, setReserveModal] = useState<{ open: boolean; court: any | null }>({ open: false, court: null });
  const [reserveDate, setReserveDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [reserving, setReserving] = useState(false);

  // Availability calendar state
  const weekDays = useMemo(() => generateWeekDays(new Date(), 7), []);
  const [selectedDay, setSelectedDay] = useState(weekDays[0].dateStr);
  const [courtAvailability, setCourtAvailability] = useState<CourtAvailability[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const slotsContainerRef = useRef<HTMLDivElement>(null);

  // Confirm quick-reserve modal
  const [quickReserve, setQuickReserve] = useState<{
    open: boolean;
    court: any | null;
    slot: AvailabilitySlot | null;
    date: string;
  }>({ open: false, court: null, slot: null, date: '' });
  const [quickReserving, setQuickReserving] = useState(false);

  // Waitlist state
  const [waitlistLoading, setWaitlistLoading] = useState<string | null>(null); // slot key as loading indicator

  // Alternatives modal state
  const [alternativesModal, setAlternativesModal] = useState<{
    open: boolean;
    courtId: string;
    courtName: string;
    date: string;
    startTime: string;
    sport: string;
    data: AlternativesData | null;
    loading: boolean;
  }>({ open: false, courtId: '', courtName: '', date: '', startTime: '', sport: '', data: null, loading: false });

  // Recurring reservation toggle (in reservation modal)
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringEndDate, setRecurringEndDate] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/clubs/${id}`),
      api.get(`/clubs/${id}/courts`),
    ]).then(([clubData, courtsData]) => {
      setClub(clubData);
      setCourts(courtsData);
    }).finally(() => setLoading(false));
  }, [id]);

  const checkConnection = useCallback(async () => {
    if (!user || !club?.owner?.id) {
      setConnectionStatus('none');
      return;
    }
    try {
      const res = await api.get(`/connections/check/${club.owner.id}?type=PLAYER_CLUB&entityId=${club.id}`);
      if (res.connected) {
        setConnectionStatus('accepted');
      } else if (res.pending) {
        setConnectionStatus('pending');
      } else {
        setConnectionStatus('none');
      }
    } catch {
      setConnectionStatus('none');
    }
  }, [user, club]);

  useEffect(() => {
    if (club && user) {
      checkConnection();
    } else if (!user) {
      setConnectionStatus('none');
    }
  }, [club, user, checkConnection]);

  // Fetch availability for ALL courts when selectedDay changes
  useEffect(() => {
    if (courts.length === 0 || !selectedDay) return;

    setAvailabilityLoading(true);
    const initialState: CourtAvailability[] = courts.map(c => ({
      courtId: c.id,
      courtName: c.name,
      sport: c.sport || 'PADEL',
      slots: [],
      loading: true,
    }));
    setCourtAvailability(initialState);

    Promise.all(
      courts.map(court =>
        api.get(`/courts/${court.id}/availability?date=${selectedDay}`)
          .then(res => ({
            courtId: court.id,
            courtName: court.name,
            sport: court.sport || 'PADEL',
            slots: (res.slots || []) as AvailabilitySlot[],
            loading: false,
          }))
          .catch(() => ({
            courtId: court.id,
            courtName: court.name,
            sport: court.sport || 'PADEL',
            slots: [] as AvailabilitySlot[],
            loading: false,
          }))
      )
    ).then(results => {
      setCourtAvailability(results);
      setAvailabilityLoading(false);
    });
  }, [courts, selectedDay]);

  // Fetch availability slots when date or court changes (for the reservation modal)
  useEffect(() => {
    if (reserveModal.court && reserveDate) {
      setSlotsLoading(true);
      setSelectedSlot(null);
      api.get(`/courts/${reserveModal.court.id}/availability?date=${reserveDate}`)
        .then(res => setAvailableSlots(res.slots || []))
        .catch(() => {
          setAvailableSlots([]);
          toast.error('Error al cargar horarios disponibles');
        })
        .finally(() => setSlotsLoading(false));
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [reserveModal.court?.id, reserveDate]);

  const handleConnect = async () => {
    if (!user) {
      toast.error('Inicia sesion para conectarte');
      return;
    }
    if (!club?.owner?.id) {
      toast.error('No se puede conectar con este club');
      return;
    }
    setConnectLoading(true);
    try {
      await api.post('/connections', {
        toUserId: club.owner.id,
        type: 'PLAYER_CLUB',
        clubId: club.id,
      });
      toast.success('Solicitud de conexion enviada');
      setConnectionStatus('pending');
    } catch (err: any) {
      toast.error(err.message || 'Error al conectar');
    } finally {
      setConnectLoading(false);
    }
  };

  // Join waitlist for an unavailable slot
  const handleJoinWaitlist = async (courtId: string, date: string, startTime: string, sport: string) => {
    if (!user) {
      toast.error('Inicia sesion para unirte a la lista de espera');
      return;
    }
    const key = `${courtId}-${date}-${startTime}`;
    setWaitlistLoading(key);
    try {
      await api.post('/reservations/waitlist', { courtId, date, startTime, sport });
      toast.success('Te avisaremos si se libera este turno');
    } catch (err: any) {
      if (err.message?.includes('Ya estas')) {
        toast.error('Ya estas en la lista de espera para este turno');
      } else {
        toast.error(err.message || 'Error al unirte a la lista de espera');
      }
    } finally {
      setWaitlistLoading(null);
    }
  };

  // Fetch and show alternatives for a taken slot
  const showAlternatives = async (courtId: string, courtName: string, date: string, startTime: string, sport: string) => {
    setAlternativesModal({
      open: true, courtId, courtName, date, startTime, sport, data: null, loading: true,
    });
    try {
      const data = await api.get(
        `/reservations/alternatives?courtId=${courtId}&date=${date}&startTime=${startTime}&sport=${sport}`
      );
      setAlternativesModal(prev => ({ ...prev, data, loading: false }));
    } catch {
      setAlternativesModal(prev => ({ ...prev, loading: false }));
      toast.error('Error al buscar alternativas');
    }
  };

  const openReserveModal = (court: any) => {
    if (!user) {
      toast.error('Inicia sesion para reservar');
      return;
    }
    if (club?.reservationMode === 'CONNECTED_ONLY' && connectionStatus !== 'accepted') {
      toast.error('Debes estar conectado con el club para reservar. Envia una solicitud de conexion primero.');
      return;
    }
    // Auto-fill today's date so slots load immediately — saves a click.
    // The slot fetch effect (deps: [reserveModal.court, reserveDate]) will
    // fire and populate availableSlots without further user action.
    const today = new Date();
    const todayInput = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setReserveDate(todayInput);
    setAvailableSlots([]);
    setSelectedSlot(null);
    setReserveModal({ open: true, court });
  };

  const closeReserveModal = () => {
    setReserveModal({ open: false, court: null });
    setReserveDate('');
    setAvailableSlots([]);
    setSelectedSlot(null);
    setIsRecurring(false);
    setRecurringEndDate('');
  };

  const handleReserve = async () => {
    if (!reserveModal.court || !reserveDate || !selectedSlot) {
      toast.error('Selecciona fecha y horario');
      return;
    }
    setReserving(true);
    try {
      if (isRecurring) {
        // Create recurring reservation
        const dateObj = new Date(reserveDate + 'T12:00:00');
        await api.post('/reservations/recurring', {
          courtId: reserveModal.court.id,
          dayOfWeek: dateObj.getDay(),
          startTime: selectedSlot.time,
          endTime: selectedSlot.endTime,
          sport: reserveModal.court.sport || 'PADEL',
          startDate: reserveDate,
          endDate: recurringEndDate || undefined,
        });
        toast.success('Reserva semanal creada! Se generaron las proximas 4 semanas.');
      } else {
        await api.post('/reservations', {
          courtId: reserveModal.court.id,
          date: reserveDate,
          startTime: selectedSlot.time,
          endTime: selectedSlot.endTime,
          sport: reserveModal.court.sport || 'PADEL',
        });
        toast.success('Reserva confirmada!');
      }
      closeReserveModal();
    } catch (err: any) {
      // On conflict, show alternatives
      if (err.message?.includes('already reserved') || err.message?.includes('Time slot')) {
        closeReserveModal();
        showAlternatives(
          reserveModal.court.id,
          reserveModal.court.name,
          reserveDate,
          selectedSlot.time,
          reserveModal.court.sport || 'PADEL',
        );
      } else {
        toast.error(err.message || 'Error al reservar');
      }
    } finally {
      setReserving(false);
    }
  };

  // Quick reserve from availability grid
  const handleSlotClick = (court: any, slot: AvailabilitySlot) => {
    if (!slot.available) return;

    if (!user) {
      toast('Inicia sesion para reservar', { icon: '🔒' });
      router.push('/login');
      return;
    }

    if (club?.reservationMode === 'CONNECTED_ONLY' && connectionStatus !== 'accepted') {
      if (connectionStatus === 'pending') {
        toast('Tu solicitud de conexion esta pendiente', { icon: '⏳' });
      } else {
        toast('Debes conectarte con el club para reservar', { icon: '🔗' });
      }
      return;
    }

    setQuickReserve({ open: true, court, slot, date: selectedDay });
  };

  const handleQuickReserve = async () => {
    if (!quickReserve.court || !quickReserve.slot || !quickReserve.date) return;
    setQuickReserving(true);
    try {
      await api.post('/reservations', {
        courtId: quickReserve.court.id,
        date: quickReserve.date,
        startTime: quickReserve.slot.time,
        endTime: quickReserve.slot.endTime,
        sport: quickReserve.court.sport || 'PADEL',
      });
      toast.success('Reserva confirmada!');
      setQuickReserve({ open: false, court: null, slot: null, date: '' });
      // Refresh availability
      setCourtAvailability(prev =>
        prev.map(ca => {
          if (ca.courtId === quickReserve.court?.id) {
            return {
              ...ca,
              slots: ca.slots.map(s =>
                s.time === quickReserve.slot?.time ? { ...s, available: false } : s
              ),
            };
          }
          return ca;
        })
      );
    } catch (err: any) {
      if (err.message?.includes('already reserved') || err.message?.includes('Time slot')) {
        setQuickReserve({ open: false, court: null, slot: null, date: '' });
        showAlternatives(
          quickReserve.court!.id,
          quickReserve.court!.name,
          quickReserve.date,
          quickReserve.slot!.time,
          quickReserve.court!.sport || 'PADEL',
        );
      } else {
        toast.error(err.message || 'Error al reservar');
      }
    } finally {
      setQuickReserving(false);
    }
  };

  const getConnectionButton = () => {
    if (!user) return null;

    if (connectionStatus === 'loading') {
      return (
        <button className="btn-outline shrink-0 opacity-50 cursor-wait" disabled>
          <SmallSpinner />
          Cargando...
        </button>
      );
    }

    if (connectionStatus === 'accepted') {
      return (
        <span className="btn-primary shrink-0 cursor-default pointer-events-none">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Conectado
        </span>
      );
    }

    if (connectionStatus === 'pending') {
      return (
        <span className="btn-outline shrink-0 cursor-default pointer-events-none text-warning border-warning/30">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pendiente
        </span>
      );
    }

    return (
      <button
        onClick={handleConnect}
        disabled={connectLoading}
        className="btn-outline shrink-0 hover:border-brand hover:text-brand transition-all disabled:opacity-50"
      >
        {connectLoading ? <SmallSpinner /> : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )}
        Conectar
      </button>
    );
  };

  if (redirecting || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Spinner />
          Cargando complejo...
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="text-6xl mb-4 opacity-20">🏟️</div>
        <h2 className="text-xl font-bold text-text-secondary mb-2">Complejo no encontrado</h2>
        <Link href="/clubs" className="btn-secondary mt-4">Volver a complejos</Link>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const selectedDayObj = weekDays.find(d => d.dateStr === selectedDay);
  const selectedDayLabel = selectedDayObj ? formatDateLong(selectedDayObj.date) : '';

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10">
        {/* Hero section */}
        <div className="bg-surface border-b border-border-dark">
          <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
            <div className="animate-fade-in-up">
              {/* Breadcrumb */}
              <Link href="/clubs" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand transition-colors mb-6">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Complejos
              </Link>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{club.name}</h1>
                  {club.locations?.[0] && (
                    <p className="flex items-center gap-2 text-text-secondary text-lg mb-4">
                      <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {club.locations[0].address}, {club.locations[0].city}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {club.sports?.map((s: string) => (
                      <span key={s} className={s === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                        {s === 'PADEL' ? 'Padel' : 'Tenis'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Connection button */}
                {getConnectionButton()}
              </div>

              {club.description && (
                <p className="text-text-secondary mt-5 max-w-2xl leading-relaxed">{club.description}</p>
              )}

              {/* Connection required warning */}
              {club.reservationMode === 'CONNECTED_ONLY' && connectionStatus !== 'accepted' && user && (
                <div className="mt-4 flex items-center gap-2 text-sm text-warning bg-warning/10 border border-warning/20 rounded-lg px-4 py-2.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Este club requiere conexion para reservar. {connectionStatus === 'pending' ? 'Tu solicitud esta pendiente.' : 'Conectate primero.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
          {/* Courts */}
          <section className="animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold">Canchas</h2>
              <span className="badge-neutral">{courts.length}</span>
            </div>

            {courts.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3 opacity-20">🏸</div>
                <p className="text-text-muted">No hay canchas publicadas</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courts.map((court: any, i: number) => (
                  <div
                    key={court.id}
                    className="card-glow group animate-fade-in-up"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white text-lg">{court.name}</h3>
                      <span className={court.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                        {court.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {court.surface && <span className="badge-neutral">{court.surface}</span>}
                      {court.courtType && <span className="badge-neutral">{court.courtType}</span>}
                      {court.hasLighting && (
                        <span className="badge-yellow">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                          Luz
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-text-muted mb-4">
                      Bloques de {court.blockDuration} minutos
                    </p>

                    <button
                      onClick={() => openReserveModal(court)}
                      className="btn-primary w-full text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Reservar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ===== AVAILABILITY CALENDAR ===== */}
          {courts.length > 0 && (
            <section className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold">Disponibilidad</h2>
                <span className="badge-brand">En vivo</span>
              </div>

              {/* Day picker pills */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
                {weekDays.map(day => {
                  const isToday = day.dateStr === todayStr;
                  const isSelected = day.dateStr === selectedDay;
                  return (
                    <button
                      key={day.dateStr}
                      onClick={() => setSelectedDay(day.dateStr)}
                      className={`flex flex-col items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 shrink-0 border ${
                        isSelected
                          ? 'bg-brand text-black border-brand shadow-lg shadow-brand/20'
                          : 'bg-surface-light text-text-secondary border-border-dark hover:border-border-default hover:text-white'
                      }`}
                    >
                      <span className={`text-xs uppercase tracking-wider ${isSelected ? 'text-black/70' : 'text-text-muted'}`}>
                        {day.label.split(' ')[0]}
                      </span>
                      <span className="text-lg font-bold mt-0.5">{day.date.getDate()}</span>
                      {isToday && !isSelected && (
                        <div className="w-1 h-1 rounded-full bg-brand mt-1" />
                      )}
                      {isToday && isSelected && (
                        <div className="w-1 h-1 rounded-full bg-black/40 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected day label */}
              <p className="text-sm text-text-muted mb-4 capitalize">{selectedDayLabel}</p>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-5 text-xs text-text-muted">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-brand/80" />
                  <span>Disponible</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-surface-light border border-border-dark" />
                  <span>Ocupado</span>
                </div>
              </div>

              {/* Availability grid */}
              <div className="space-y-3" ref={slotsContainerRef}>
                {courtAvailability.map(ca => {
                  const court = courts.find(c => c.id === ca.courtId);
                  return (
                    <div
                      key={ca.courtId}
                      className="bg-surface rounded-2xl border border-border-dark overflow-hidden"
                    >
                      {/* Court row header */}
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-border-dark bg-surface-light/30">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${ca.sport === 'PADEL' ? 'bg-padel' : 'bg-brand'}`} />
                        <h4 className="text-sm font-bold text-white truncate">{ca.courtName}</h4>
                        <span className={`text-2xs uppercase tracking-wider ${ca.sport === 'PADEL' ? 'text-padel' : 'text-brand'}`}>
                          {ca.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                        </span>
                      </div>

                      {/* Slots row - horizontal scroll */}
                      <div className="overflow-x-auto scrollbar-none">
                        <div className="flex gap-1.5 p-3 min-w-max">
                          {ca.loading ? (
                            <div className="flex items-center gap-2 px-4 py-3 text-text-muted text-xs">
                              <SmallSpinner />
                              <span>Cargando...</span>
                            </div>
                          ) : ca.slots.length === 0 ? (
                            <div className="px-4 py-3 text-text-muted text-xs">
                              Sin horarios configurados
                            </div>
                          ) : (
                            ca.slots.map(slot => {
                              const isAvailable = slot.available;
                              const waitlistKey = `${ca.courtId}-${selectedDay}-${slot.time}`;
                              const isWaitlistLoading = waitlistLoading === waitlistKey;
                              return (
                                <div key={slot.time} className="flex flex-col items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => isAvailable && court && handleSlotClick(court, slot)}
                                    disabled={!isAvailable}
                                    className={`relative px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 w-full ${
                                      isAvailable
                                        ? 'bg-brand/15 text-brand border border-brand/20 hover:bg-brand/25 hover:border-brand/40 hover:shadow-glow-green-sm cursor-pointer active:scale-95'
                                        : 'bg-surface-light/60 text-text-faint border border-transparent cursor-not-allowed'
                                    }`}
                                    title={
                                      isAvailable
                                        ? `Reservar ${slot.time} - ${slot.endTime}`
                                        : `Ocupado ${slot.time} - ${slot.endTime}`
                                    }
                                  >
                                    {slot.time}
                                    {!isAvailable && (
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full h-px bg-text-faint/30 rotate-[-15deg]" />
                                      </div>
                                    )}
                                  </button>
                                  {!isAvailable && user && (
                                    <button
                                      onClick={() => handleJoinWaitlist(ca.courtId, selectedDay, slot.time, ca.sport)}
                                      disabled={isWaitlistLoading}
                                      className="text-2xs text-warning hover:text-yellow-300 transition-colors whitespace-nowrap disabled:opacity-50"
                                      title="Unirme a lista de espera"
                                    >
                                      {isWaitlistLoading ? <SmallSpinner /> : 'Espera'}
                                    </button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {availabilityLoading && courtAvailability.every(ca => ca.loading) && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-text-muted text-sm">
                      <Spinner />
                      Cargando disponibilidad...
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Coaches */}
          {club.coachLinks?.length > 0 && (
            <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold">Profesores</h2>
                <span className="badge-neutral">{club.coachLinks.length}</span>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {club.coachLinks.map((link: any) => (
                  <Link key={link.id} href={`/coaches/${link.coach?.id}`} className="card-glow group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-padel/15 text-padel flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                        {link.coach.user.firstName[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-brand transition-colors">
                          {link.coach.user.firstName} {link.coach.user.lastName}
                        </h3>
                        <div className="flex gap-1.5 mt-1">
                          {link.coach.sports?.map((s: string) => (
                            <span key={s} className={`text-xs ${s === 'PADEL' ? 'text-padel' : 'text-brand'}`}>
                              {s === 'PADEL' ? 'Padel' : 'Tenis'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tournaments */}
          {club.tournaments?.length > 0 && (
            <section className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold">Torneos activos</h2>
                <span className="badge-neutral">{club.tournaments.length}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {club.tournaments.map((t: any) => (
                  <Link key={t.id} href={`/tournaments/${t.id}`} className="card-interactive group">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-white text-lg group-hover:text-brand transition-colors">{t.name}</h3>
                      <span className="badge-yellow">{t.status}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={t.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                        {t.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* ===== Quick Reserve Confirmation Modal ===== */}
      {quickReserve.open && quickReserve.court && quickReserve.slot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !quickReserving && setQuickReserve({ open: false, court: null, slot: null, date: '' })}
          />

          <div className="relative glass-dark w-full max-w-sm animate-scale-in">
            <div className="p-6">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <h3 className="text-lg font-bold text-white text-center mb-1">Confirmar reserva</h3>
              <p className="text-sm text-text-muted text-center mb-5">
                Vas a reservar la siguiente cancha
              </p>

              {/* Details card */}
              <div className="bg-surface-light rounded-xl p-4 space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted uppercase tracking-wider">Cancha</span>
                  <span className="text-sm font-bold text-white">{quickReserve.court.name}</span>
                </div>
                <div className="h-px bg-border-dark" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted uppercase tracking-wider">Fecha</span>
                  <span className="text-sm font-medium text-text-secondary tabular">
                    {formatDate(quickReserve.date)}
                  </span>
                </div>
                <div className="h-px bg-border-dark" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted uppercase tracking-wider">Horario</span>
                  <span className="text-sm font-bold text-brand">
                    {quickReserve.slot.time} - {quickReserve.slot.endTime}
                  </span>
                </div>
                <div className="h-px bg-border-dark" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted uppercase tracking-wider">Deporte</span>
                  <span className={quickReserve.court.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                    {quickReserve.court.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setQuickReserve({ open: false, court: null, slot: null, date: '' })}
                  disabled={quickReserving}
                  className="btn-ghost flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleQuickReserve}
                  disabled={quickReserving}
                  className="btn-primary flex-1 justify-center"
                >
                  {quickReserving ? (
                    <>
                      <SmallSpinner />
                      Reservando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Full Reservation Modal (from court cards) ===== */}
      {reserveModal.open && reserveModal.court && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeReserveModal}
          />

          {/* Modal */}
          <div className="relative bg-surface border border-border-dark rounded-2xl w-full max-w-lg animate-scale-in shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark">
              <div>
                <h3 className="text-lg font-bold text-white">Reservar cancha</h3>
                <p className="text-sm text-text-muted mt-0.5">{reserveModal.court.name}</p>
              </div>
              <button
                onClick={closeReserveModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-light transition-colors text-text-muted hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Court info badges */}
              <div className="flex flex-wrap gap-2">
                <span className={reserveModal.court.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                  {reserveModal.court.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                </span>
                {reserveModal.court.surface && <span className="badge-neutral">{reserveModal.court.surface}</span>}
                {reserveModal.court.courtType && <span className="badge-neutral">{reserveModal.court.courtType}</span>}
                {reserveModal.court.hasLighting && (
                  <span className="badge-yellow">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Luz
                  </span>
                )}
              </div>

              {/* Date picker */}
              <div>
                <label className="label">Selecciona una fecha</label>
                <input
                  type="date"
                  className="input w-full"
                  min={todayStr}
                  value={reserveDate}
                  onChange={e => setReserveDate(e.target.value)}
                />
              </div>

              {/* Available time slots from API */}
              {reserveDate && (
                <div>
                  <label className="label">Horarios disponibles</label>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3 text-text-muted text-sm">
                        <SmallSpinner />
                        Cargando horarios...
                      </div>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-text-muted text-sm">No hay horarios disponibles para esta fecha</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlot?.time === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot)}
                            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              !slot.available
                                ? 'bg-surface-light/50 text-text-muted cursor-not-allowed line-through opacity-50'
                                : isSelected
                                  ? 'bg-brand text-black shadow-lg shadow-brand/20 ring-2 ring-brand/40'
                                  : 'bg-surface-light text-text-secondary hover:bg-brand/10 hover:text-brand border border-border-dark hover:border-brand/30'
                            }`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Selected slot summary */}
              {selectedSlot && (
                <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-brand/5 border border-brand/20">
                  <div className="text-sm">
                    <p className="text-text-secondary">Horario seleccionado</p>
                    <p className="text-white font-semibold mt-0.5">
                      {selectedSlot.time} - {selectedSlot.endTime}
                    </p>
                  </div>
                  <span className={reserveModal.court.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                    {reserveModal.court.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                  </span>
                </div>
              )}

              {/* Recurring reservation toggle */}
              {selectedSlot && (
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={e => setIsRecurring(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-surface-light rounded-full border border-border-dark peer-checked:bg-brand/20 peer-checked:border-brand/40 transition-all" />
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-text-muted rounded-full transition-all peer-checked:translate-x-5 peer-checked:bg-brand" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-white group-hover:text-brand transition-colors">
                        Reservar todas las semanas
                      </span>
                      <p className="text-xs text-text-muted">Se crearan reservas para las proximas 4 semanas</p>
                    </div>
                  </label>

                  {isRecurring && (
                    <div className="pl-13">
                      <label className="label text-xs">Fecha fin (opcional)</label>
                      <input
                        type="date"
                        className="input w-full text-sm"
                        min={reserveDate}
                        value={recurringEndDate}
                        onChange={e => setRecurringEndDate(e.target.value)}
                        placeholder="Sin fecha fin"
                      />
                      <p className="text-xs text-text-muted mt-1">
                        Deja vacio para reservar indefinidamente
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-border-dark bg-surface-light/30">
              <button
                onClick={closeReserveModal}
                className="btn-ghost flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleReserve}
                disabled={!selectedSlot || reserving}
                className="btn-primary flex-1 justify-center disabled:opacity-50"
              >
                {reserving ? (
                  <>
                    <SmallSpinner />
                    Reservando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {isRecurring ? 'Confirmar semanal' : 'Confirmar reserva'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Alternatives Modal ===== */}
      {alternativesModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !alternativesModal.loading && setAlternativesModal(prev => ({ ...prev, open: false }))}
          />

          <div className="relative glass-dark w-full max-w-md animate-scale-in max-h-[80vh] flex flex-col">
            <div className="p-6 pb-0">
              <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h3 className="text-lg font-bold text-white text-center mb-1">Este horario no esta disponible</h3>
              <p className="text-sm text-text-muted text-center mb-4">
                {alternativesModal.courtName} - {alternativesModal.startTime} el {alternativesModal.date}
              </p>
            </div>

            <div className="px-6 pb-6 overflow-y-auto space-y-4">
              {alternativesModal.loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-text-muted text-sm">
                    <Spinner />
                    Buscando alternativas...
                  </div>
                </div>
              ) : (
                <>
                  {/* Same court alternatives */}
                  {alternativesModal.data && alternativesModal.data.sameCourtAlternatives.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-text-muted mb-2">
                        Otros horarios en {alternativesModal.courtName}
                      </h4>
                      <div className="grid grid-cols-3 gap-1.5">
                        {alternativesModal.data.sameCourtAlternatives.slice(0, 9).map(alt => (
                          <button
                            key={alt.time}
                            onClick={async () => {
                              try {
                                await api.post('/reservations', {
                                  courtId: alternativesModal.courtId,
                                  date: alternativesModal.date,
                                  startTime: alt.time,
                                  endTime: alt.endTime,
                                  sport: alternativesModal.sport,
                                });
                                toast.success('Reserva confirmada!');
                                setAlternativesModal(prev => ({ ...prev, open: false }));
                                // Refresh availability
                                setSelectedDay(prev => prev);
                              } catch (err: any) {
                                toast.error(err.message || 'Error al reservar');
                              }
                            }}
                            className="px-2 py-2 rounded-lg text-xs font-medium bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 hover:border-brand/40 transition-all"
                          >
                            {alt.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other court alternatives */}
                  {alternativesModal.data && alternativesModal.data.otherCourtAlternatives.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-text-muted mb-2">
                        Misma hora en otra cancha
                      </h4>
                      <div className="space-y-1.5">
                        {alternativesModal.data.otherCourtAlternatives.map(alt => (
                          <button
                            key={alt.courtId}
                            onClick={async () => {
                              try {
                                await api.post('/reservations', {
                                  courtId: alt.courtId,
                                  date: alternativesModal.date,
                                  startTime: alt.time,
                                  endTime: alt.endTime,
                                  sport: alt.sport,
                                });
                                toast.success('Reserva confirmada!');
                                setAlternativesModal(prev => ({ ...prev, open: false }));
                                setSelectedDay(prev => prev);
                              } catch (err: any) {
                                toast.error(err.message || 'Error al reservar');
                              }
                            }}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-light border border-border-dark hover:border-brand/30 hover:bg-brand/5 transition-all group"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${alt.sport === 'PADEL' ? 'bg-padel' : 'bg-brand'}`} />
                              <span className="text-sm font-medium text-white group-hover:text-brand transition-colors">{alt.courtName}</span>
                            </div>
                            <span className="text-xs text-text-muted">{alt.time} - {alt.endTime}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No alternatives */}
                  {alternativesModal.data &&
                    alternativesModal.data.sameCourtAlternatives.length === 0 &&
                    alternativesModal.data.otherCourtAlternatives.length === 0 && (
                      <p className="text-sm text-text-muted text-center py-4">
                        No hay alternativas disponibles por ahora.
                      </p>
                    )}

                  {/* Waitlist option */}
                  <div className="pt-2 border-t border-border-dark">
                    <button
                      onClick={() => {
                        handleJoinWaitlist(
                          alternativesModal.courtId,
                          alternativesModal.date,
                          alternativesModal.startTime,
                          alternativesModal.sport,
                        );
                        setAlternativesModal(prev => ({ ...prev, open: false }));
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-warning/10 text-warning border border-warning/20 hover:bg-warning/15 transition-all text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      Unirme a lista de espera
                    </button>
                    <p className="text-xs text-text-muted text-center mt-2">
                      Te avisaremos si se libera el turno original
                    </p>
                  </div>
                </>
              )}

              {/* Close button */}
              <button
                onClick={() => setAlternativesModal(prev => ({ ...prev, open: false }))}
                className="btn-ghost w-full mt-2"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
