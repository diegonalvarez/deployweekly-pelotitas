'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

/* ─── Types ────────────────────────────────────────────────── */

interface Club {
  id: string;
  name: string;
  sports: string[];
}

interface Court {
  id: string;
  name: string;
  sport: 'PADEL' | 'TENNIS';
  surface: string;
  courtType: 'INDOOR' | 'OUTDOOR';
  hasLighting: boolean;
  blockDuration: number;
  pricePerBlock?: number;
  availability?: Availability[];
}

interface Availability {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

type Sport = 'PADEL' | 'TENNIS';
type Surface = 'CLAY' | 'HARD' | 'GRASS' | 'SYNTHETIC' | 'CONCRETE' | 'CARPET';
type CourtType = 'INDOOR' | 'OUTDOOR';

const SURFACES: { value: Surface; label: string }[] = [
  { value: 'CLAY', label: 'Polvo de ladrillo' },
  { value: 'HARD', label: 'Cemento pulido' },
  { value: 'GRASS', label: 'Cesped' },
  { value: 'SYNTHETIC', label: 'Sintetico' },
  { value: 'CONCRETE', label: 'Hormigon' },
  { value: 'CARPET', label: 'Alfombra' },
];

const BLOCK_DURATIONS = [
  { value: 60, label: '60 minutos' },
  { value: 90, label: '90 minutos' },
  { value: 120, label: '120 minutos' },
];

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

function surfaceLabel(surface: string): string {
  return SURFACES.find((s) => s.value === surface)?.label || surface;
}

/* ─── Spinner ──────────────────────────────────────────────── */

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ─── Toggle Switch ────────────────────────────────────────── */

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base focus:ring-brand/50 ${
          checked ? 'bg-brand' : 'bg-surface-light border border-border-dark'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
            checked ? 'translate-x-6 bg-black' : 'translate-x-1 bg-text-muted'
          }`}
        />
      </button>
      <span className="text-sm text-text-secondary group-hover:text-white transition-colors">{label}</span>
    </label>
  );
}

/* ─── Pill Selector ────────────────────────────────────────── */

function PillSelector<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-5 py-2 rounded-pill text-sm font-semibold transition-all duration-200 border ${
            value === opt.value
              ? 'bg-brand/15 border-brand/40 text-brand shadow-glow-green-sm'
              : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default hover:text-white'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   ADD COURT MODAL
   ═════════════════════════════════════════════════════════════ */

function AddCourtModal({
  clubId,
  onClose,
  onCreated,
}: {
  clubId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [sport, setSport] = useState<Sport>('PADEL');
  const [surface, setSurface] = useState<Surface>('SYNTHETIC');
  const [courtType, setCourtType] = useState<CourtType>('OUTDOOR');
  const [hasLighting, setHasLighting] = useState(true);
  const [blockDuration, setBlockDuration] = useState(90);
  const [pricePerBlock, setPricePerBlock] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Ingresa un nombre para la cancha');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/clubs/${clubId}/courts`, {
        name: name.trim(),
        sport,
        surface,
        courtType,
        hasLighting,
        blockDuration,
        ...(pricePerBlock ? { pricePerBlock: Number(pricePerBlock) } : {}),
      });
      toast.success('Cancha creada!');
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear la cancha');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-dark max-w-lg w-full p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Agregar cancha</h2>
          <button onClick={onClose} className="btn-icon-sm" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="label">Nombre</label>
            <input
              className="input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cancha 1"
            />
          </div>

          {/* Sport */}
          <div>
            <label className="label">Deporte</label>
            <PillSelector
              options={[
                { value: 'PADEL' as Sport, label: 'Padel' },
                { value: 'TENNIS' as Sport, label: 'Tenis' },
              ]}
              value={sport}
              onChange={setSport}
            />
          </div>

          {/* Surface */}
          <div>
            <label className="label">Superficie</label>
            <select
              className="input appearance-none cursor-pointer"
              value={surface}
              onChange={(e) => setSurface(e.target.value as Surface)}
            >
              {SURFACES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Court type */}
          <div>
            <label className="label">Tipo</label>
            <PillSelector
              options={[
                { value: 'INDOOR' as CourtType, label: 'Indoor' },
                { value: 'OUTDOOR' as CourtType, label: 'Outdoor' },
              ]}
              value={courtType}
              onChange={setCourtType}
            />
          </div>

          {/* Lighting */}
          <div>
            <label className="label mb-2">Iluminacion</label>
            <Toggle checked={hasLighting} onChange={setHasLighting} label={hasLighting ? 'Con iluminacion' : 'Sin iluminacion'} />
          </div>

          {/* Block duration */}
          <div>
            <label className="label">Duracion del turno</label>
            <select
              className="input appearance-none cursor-pointer"
              value={blockDuration}
              onChange={(e) => setBlockDuration(Number(e.target.value))}
            >
              {BLOCK_DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="label">Precio por turno (opcional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
              <input
                className="input pl-8"
                type="number"
                min="0"
                step="100"
                value={pricePerBlock}
                onChange={(e) => setPricePerBlock(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner /> Creando...
                </>
              ) : (
                'Crear cancha'
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   AVAILABILITY MODAL
   ═════════════════════════════════════════════════════════════ */

function AvailabilityModal({
  court,
  onClose,
  onSaved,
}: {
  court: Court;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('22:00');
  const [submitting, setSubmitting] = useState(false);
  const [existingAvailability, setExistingAvailability] = useState<Availability[]>(court.availability || []);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      toast.error('Selecciona al menos un dia');
      return;
    }
    if (openTime >= closeTime) {
      toast.error('La hora de apertura debe ser anterior al cierre');
      return;
    }
    setSubmitting(true);
    try {
      const promises = selectedDays.map((dayOfWeek) =>
        api.post(`/courts/${court.id}/availability`, {
          dayOfWeek,
          openTime,
          closeTime,
        })
      );
      const results = await Promise.all(promises);
      toast.success(`Horarios configurados para ${selectedDays.length} dia${selectedDays.length > 1 ? 's' : ''}`);

      // Update local state with the new availability
      const newAvailability = selectedDays.map((dayOfWeek, i) => ({
        id: results[i]?.id || `temp-${dayOfWeek}`,
        dayOfWeek,
        openTime,
        closeTime,
      }));

      // Merge: replace days that were re-configured, keep others
      const updatedDays = new Set(selectedDays);
      const kept = existingAvailability.filter((a) => !updatedDays.has(a.dayOfWeek));
      setExistingAvailability([...kept, ...newAvailability].sort((a, b) => a.dayOfWeek - b.dayOfWeek));

      onSaved();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar horarios');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-dark max-w-lg w-full p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Configurar horarios</h2>
            <p className="text-sm text-text-muted mt-1">{court.name}</p>
          </div>
          <button onClick={onClose} className="btn-icon-sm" aria-label="Cerrar">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Existing availability */}
        {existingAvailability.length > 0 && (
          <div className="mb-6 p-4 bg-surface-light rounded-xl border border-border-dark">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Horarios actuales</p>
            <div className="flex flex-wrap gap-2">
              {existingAvailability.map((a) => (
                <span key={a.id} className="badge-neutral text-xs">
                  {DAY_NAMES[a.dayOfWeek]} {a.openTime}-{a.closeTime}
                </span>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Day selector */}
          <div>
            <label className="label">Dias de la semana</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {DAY_NAMES.map((name, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`w-12 h-10 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                    selectedDays.includes(i)
                      ? 'bg-brand/15 border-brand/40 text-brand shadow-glow-green-sm'
                      : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default hover:text-white'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
            {selectedDays.length > 0 && (
              <p className="text-xs text-text-muted mt-2">
                {selectedDays.map((d) => DAY_NAMES_FULL[d]).join(', ')}
              </p>
            )}
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Hora apertura</label>
              <input
                type="time"
                className="input"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Hora cierre</label>
              <input
                type="time"
                className="input"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-xs text-text-muted mb-2">Presets rapidos</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setSelectedDays([1, 2, 3, 4, 5]); setOpenTime('08:00'); setCloseTime('22:00'); }}
                className="badge-neutral hover:text-white transition-colors cursor-pointer"
              >
                Lun-Vie 8-22
              </button>
              <button
                type="button"
                onClick={() => { setSelectedDays([0, 6]); setOpenTime('09:00'); setCloseTime('20:00'); }}
                className="badge-neutral hover:text-white transition-colors cursor-pointer"
              >
                Fin de semana 9-20
              </button>
              <button
                type="button"
                onClick={() => { setSelectedDays([0, 1, 2, 3, 4, 5, 6]); setOpenTime('08:00'); setCloseTime('23:00'); }}
                className="badge-neutral hover:text-white transition-colors cursor-pointer"
              >
                Todos los dias 8-23
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner /> Guardando...
                </>
              ) : (
                'Guardar horarios'
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   COURT CARD
   ═════════════════════════════════════════════════════════════ */

function CourtCard({
  court,
  onConfigureAvailability,
}: {
  court: Court;
  onConfigureAvailability: (court: Court) => void;
}) {
  const sportBadge = court.sport === 'PADEL' ? 'badge-padel' : 'badge-tennis';
  const sportLabel = court.sport === 'PADEL' ? 'Padel' : 'Tenis';

  return (
    <div className="card-elevated animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        {/* Left: court info */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-2xl flex-shrink-0">
            {court.sport === 'PADEL' ? (
              <svg className="w-6 h-6 text-padel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 2c-2 4-2 8 0 10s2 6 0 10" />
                <path strokeLinecap="round" d="M2 12h20" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{court.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={sportBadge}>{sportLabel}</span>
              <span className="badge-neutral">{surfaceLabel(court.surface)}</span>
              <span className="badge-neutral">{court.courtType === 'INDOOR' ? 'Indoor' : 'Outdoor'}</span>
            </div>
          </div>
        </div>

        {/* Right: quick details */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Lighting */}
          <div className="flex items-center gap-1.5" title={court.hasLighting ? 'Con iluminacion' : 'Sin iluminacion'}>
            <svg
              className={`w-4 h-4 ${court.hasLighting ? 'text-warning' : 'text-text-muted'}`}
              fill={court.hasLighting ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-xs text-text-muted">{court.hasLighting ? 'Luz' : 'Sin luz'}</span>
          </div>

          {/* Block duration */}
          <div className="flex items-center gap-1.5" title="Duracion del turno">
            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-text-muted">{court.blockDuration} min</span>
          </div>

          {/* Price */}
          {court.pricePerBlock != null && court.pricePerBlock > 0 && (
            <div className="flex items-center gap-1.5" title="Precio por turno">
              <span className="text-xs font-semibold text-brand">${court.pricePerBlock.toLocaleString('es-AR')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Availability summary */}
      {court.availability && court.availability.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-dark">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Horarios</p>
          <div className="flex flex-wrap gap-2">
            {court.availability
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
              .map((a) => (
                <span key={a.id} className="badge-neutral text-xs">
                  {DAY_NAMES[a.dayOfWeek]} {a.openTime}-{a.closeTime}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-border-dark flex flex-wrap gap-2">
        <button
          onClick={() => onConfigureAvailability(court)}
          className="btn-secondary text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Configurar horarios
        </button>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   MAIN PAGE
   ═════════════════════════════════════════════════════════════ */

export default function CourtsPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [club, setClub] = useState<Club | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourt, setShowAddCourt] = useState(false);
  const [availabilityCourt, setAvailabilityCourt] = useState<Court | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  }, [user, authLoading, router]);

  // Fetch club & courts
  const fetchData = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const [clubData, courtsData] = await Promise.all([
        api.get<Club>(`/clubs/${clubId}`),
        api.get<Court[]>(`/clubs/${clubId}/courts`),
      ]);
      setClub(clubData);
      setCourts(courtsData);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (user && clubId) fetchData();
  }, [user, clubId, fetchData]);

  // Loading state
  if (authLoading || !user || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Spinner />
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Back link */}
        <Link
          href="/dashboard/club"
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al panel
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Canchas
            </h1>
            {club && (
              <p className="text-text-muted text-sm mt-1">{club.name}</p>
            )}
          </div>
          <button onClick={() => setShowAddCourt(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Agregar cancha
          </button>
        </div>

        {/* Courts list */}
        {courts.length === 0 ? (
          <div className="card-elevated text-center py-16 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-text-muted opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No tenes canchas</h3>
            <p className="text-text-muted mb-6 max-w-md mx-auto">
              Agrega tu primera cancha para empezar a recibir reservas.
            </p>
            <button onClick={() => setShowAddCourt(true)} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Agregar mi primera cancha
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {courts.map((court, i) => (
              <div key={court.id} style={{ animationDelay: `${i * 80}ms` }}>
                <CourtCard
                  court={court}
                  onConfigureAvailability={setAvailabilityCourt}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add court modal */}
      {showAddCourt && (
        <AddCourtModal
          clubId={clubId}
          onClose={() => setShowAddCourt(false)}
          onCreated={fetchData}
        />
      )}

      {/* Availability modal */}
      {availabilityCourt && (
        <AvailabilityModal
          court={availabilityCourt}
          onClose={() => setAvailabilityCourt(null)}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
