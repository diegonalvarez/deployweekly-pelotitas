'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import RoleGuard from '@/components/RoleGuard';
import ActivateRoleBanner from '@/components/ActivateRoleBanner';
import {
  Plus,
  Building2,
  MapPin,
  Eye,
  Settings,
  Users,
  GraduationCap,
  Trophy,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Activity,
  Lock,
  Unlock,
  ArrowUpRight,
} from 'lucide-react';

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Cordoba', 'Santa Fe', 'Mendoza', 'Tucuman',
  'Salta', 'Entre Rios', 'Misiones', 'Chaco', 'Corrientes',
  'Santiago del Estero', 'San Juan', 'Jujuy', 'Rio Negro', 'Formosa',
  'Neuquen', 'Chubut', 'San Luis', 'Catamarca', 'La Rioja', 'La Pampa',
  'Santa Cruz', 'Tierra del Fuego',
];

const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'];

const RESERVATION_MODES = [
  { value: 'OPEN',            label: 'Abierto',          description: 'Cualquier usuario verificado puede reservar', icon: <Unlock className="w-4 h-4" /> },
  { value: 'CONNECTED_ONLY',  label: 'Solo conectados', description: 'Solo usuarios que envían solicitud y son aceptados', icon: <Lock className="w-4 h-4" /> },
];

type ClubFormData = {
  name: string;
  sports: string[];
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  description: string;
  paymentMethods: string[];
  reservationMode: string;
};

const INITIAL_FORM: ClubFormData = {
  name: '',
  sports: ['PADEL'],
  address: '',
  city: '',
  state: '',
  phone: '',
  email: '',
  description: '',
  paymentMethods: [],
  reservationMode: 'OPEN',
};

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < current
                ? 'bg-brand text-brand-ink'
                : i === current
                  ? 'bg-brand/15 text-brand border border-brand/40'
                  : 'bg-surface-light text-text-muted border border-border-dark'
            }`}
          >
            {i < current ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-6 h-px transition-all duration-300 ${i < current ? 'bg-brand' : 'bg-border-dark'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ClubDashboardPage() {
  return (
    <RoleGuard role="CLUB_OWNER">
      <ClubDashboard />
    </RoleGuard>
  );
}

function ClubDashboard() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [tournamentCount, setTournamentCount] = useState<any>(null);
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [clubForm, setClubForm] = useState<ClubFormData>(INITIAL_FORM);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/clubs/mine').then(setClubs).catch(() => {});
      api.get('/tournaments/my-count').then(setTournamentCount).catch(() => {});
    }
  }, [user]);

  const updateForm = (patch: Partial<ClubFormData>) => setClubForm((prev) => ({ ...prev, ...patch }));

  const toggleSport = (sport: string) => {
    updateForm({
      sports: clubForm.sports.includes(sport)
        ? clubForm.sports.filter((s) => s !== sport)
        : [...clubForm.sports, sport],
    });
  };

  const togglePayment = (method: string) => {
    updateForm({
      paymentMethods: clubForm.paymentMethods.includes(method)
        ? clubForm.paymentMethods.filter((m) => m !== method)
        : [...clubForm.paymentMethods, method],
    });
  };

  const canAdvanceStep = (): boolean => {
    if (step === 0) return clubForm.name.trim().length > 0 && clubForm.sports.length > 0;
    if (step === 1) return clubForm.state.trim().length > 0 && clubForm.city.trim().length > 0;
    return true;
  };

  const handleCreateClub = async () => {
    setCreating(true);
    try {
      const payload: any = {
        name: clubForm.name,
        sports: clubForm.sports,
        address: clubForm.address,
        city: clubForm.city,
        state: clubForm.state,
      };
      if (clubForm.phone.trim())       payload.phone = clubForm.phone;
      if (clubForm.email.trim())       payload.email = clubForm.email;
      if (clubForm.description.trim()) payload.description = clubForm.description;
      if (clubForm.paymentMethods.length > 0) payload.paymentMethods = clubForm.paymentMethods;
      if (clubForm.reservationMode)    payload.reservationMode = clubForm.reservationMode;

      await api.post('/clubs', payload);
      toast.success('Complejo creado');
      setShowCreateClub(false);
      setClubForm(INITIAL_FORM);
      setStep(0);
      api.get('/clubs/mine').then(setClubs);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const closeModal = () => {
    setShowCreateClub(false);
    setClubForm(INITIAL_FORM);
    setStep(0);
  };

  if (!user) return null;

  const renderStep0 = () => (
    <div className="space-y-5 animate-fade-in">
      <div>
        <label className="label">Nombre del complejo *</label>
        <input
          className="input"
          required
          value={clubForm.name}
          onChange={(e) => updateForm({ name: e.target.value })}
          placeholder="Club Padel Centro"
          autoFocus
        />
      </div>

      <div>
        <label className="label">Deportes *</label>
        <div className="grid grid-cols-2 gap-3 mt-1">
          {[
            { key: 'PADEL',  label: 'Padel',  color: 'sky'  },
            { key: 'TENNIS', label: 'Tenis',  color: 'clay' },
          ].map((sport) => {
            const isSelected = clubForm.sports.includes(sport.key);
            return (
              <button
                key={sport.key}
                type="button"
                onClick={() => toggleSport(sport.key)}
                className={`relative flex flex-col items-start gap-1 p-4 rounded-lg border transition-all duration-200 text-left ${
                  isSelected
                    ? sport.color === 'sky'
                      ? 'bg-sky/10 border-sky/40'
                      : 'bg-clay/10 border-clay/40'
                    : 'bg-surface-light border-border-dark hover:border-border-default'
                }`}
              >
                <span className={`text-2xs font-semibold uppercase tracking-widest ${
                  isSelected ? (sport.color === 'sky' ? 'text-sky' : 'text-clay') : 'text-text-muted'
                }`} style={{ letterSpacing: '0.12em' }}>
                  {isSelected ? '● Activo' : '○ Disponible'}
                </span>
                <span className={`text-base font-semibold ${
                  isSelected ? 'text-text-primary' : 'text-text-secondary'
                }`}>
                  {sport.label}
                </span>
                {isSelected && (
                  <div className={`absolute top-3 right-3 w-4 h-4 rounded-md flex items-center justify-center ${
                    sport.color === 'sky' ? 'bg-sky text-white' : 'bg-clay text-white'
                  }`}>
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {clubForm.sports.length === 0 && (
          <p className="text-negative text-2xs mt-2">Seleccioná al menos un deporte</p>
        )}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5 animate-fade-in">
      <div>
        <label className="label">Provincia *</label>
        <div className="relative">
          <select
            className="input appearance-none pr-10 cursor-pointer"
            value={clubForm.state}
            onChange={(e) => updateForm({ state: e.target.value })}
            required
          >
            <option value="" disabled>Seleccioná una provincia</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 w-3.5 h-3.5 text-text-muted" />
        </div>
      </div>

      <div>
        <label className="label">Ciudad *</label>
        <input
          className="input"
          required
          value={clubForm.city}
          onChange={(e) => updateForm({ city: e.target.value })}
          placeholder="Capital Federal"
        />
      </div>

      <div>
        <label className="label">Dirección</label>
        <input
          className="input"
          value={clubForm.address}
          onChange={(e) => updateForm({ address: e.target.value })}
          placeholder="Av. Libertador 5000"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5 animate-fade-in">
      <p className="text-2xs text-text-muted -mt-1">
        Estos campos son opcionales. Podés completarlos después.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Teléfono</label>
          <input
            className="input"
            type="tel"
            value={clubForm.phone}
            onChange={(e) => updateForm({ phone: e.target.value })}
            placeholder="+54 11 1234-5678"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={clubForm.email}
            onChange={(e) => updateForm({ email: e.target.value })}
            placeholder="contacto@club.com"
          />
        </div>
      </div>

      <div>
        <label className="label">Descripción</label>
        <textarea
          className="textarea"
          value={clubForm.description}
          onChange={(e) => updateForm({ description: e.target.value })}
          placeholder="Contanos sobre tu complejo, instalaciones, horarios…"
          rows={3}
        />
      </div>

      <div>
        <label className="label">Formas de pago</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = clubForm.paymentMethods.includes(method);
            return (
              <button
                key={method}
                type="button"
                onClick={() => togglePayment(method)}
                className={`chip ${isSelected ? 'is-active' : ''}`}
              >
                {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                {method}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="label">Modo de reserva</label>
        <div className="space-y-2 mt-1">
          {RESERVATION_MODES.map((mode) => {
            const isSelected = clubForm.reservationMode === mode.value;
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => updateForm({ reservationMode: mode.value })}
                className={`w-full flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-brand/8 border-brand/40'
                    : 'bg-surface-light border-border-dark hover:border-border-default'
                }`}
              >
                <div className={`mt-0.5 w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-brand text-brand-ink' : 'bg-surface text-text-muted'
                }`}>
                  {mode.icon}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isSelected ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {mode.label}
                  </p>
                  <p className="text-2xs text-text-muted mt-0.5">{mode.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const STEP_TITLES = ['Información', 'Ubicación', 'Detalles'];
  const STEPS = [renderStep0, renderStep1, renderStep2];

  return (
    <div className="bg-base">
      {/* ── Page header ─────────────────────── */}
      <div className="border-b border-border-dark bg-base sticky top-14 z-30 lg:top-0 lg:relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-text-muted">Operación</p>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight-2 mt-1">
              Panel del complejo
            </h1>
          </div>
          <button onClick={() => setShowCreateClub(true)} className="btn-primary text-sm h-9">
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo complejo</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

        {/* ── Tournament quota ─────────────────────── */}
        {tournamentCount && (
          <div className="card-elevated">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-clay/10 border border-clay/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-clay" />
                </div>
                <div>
                  <p className="eyebrow text-text-muted">Cuota torneos · Plan gratuito</p>
                  <p className="text-sm font-semibold text-text-primary mt-1">
                    <span className="tabular text-text-primary">{tournamentCount.used}</span>
                    <span className="text-text-muted"> / {tournamentCount.limit}</span>
                    <span className="text-text-muted ml-3 font-normal">
                      torneos creados este mes
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:flex-row-reverse">
                {tournamentCount.remaining > 0 ? (
                  <span className="badge-green">{tournamentCount.remaining} disponibles</span>
                ) : (
                  <span className="badge-yellow">Cuota completa</span>
                )}
                <div className="w-32 h-1.5 bg-surface-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-brand rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (tournamentCount.used / tournamentCount.limit) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Create club modal ─────────────────────── */}
        {showCreateClub && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[80] p-4 animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <div className="glass-dark max-w-lg w-full animate-scale-in max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-dark shrink-0">
                <div>
                  <p className="eyebrow text-text-muted">{STEP_TITLES[step]}</p>
                  <h2 className="text-lg font-bold text-text-primary tracking-tight-2 mt-1">Nuevo complejo</h2>
                </div>
                <button onClick={closeModal} className="btn-icon-sm" aria-label="Cerrar">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-center px-6 py-4 shrink-0">
                <StepIndicator current={step} total={3} />
              </div>

              <div className="px-6 pb-2 overflow-y-auto flex-1 min-h-0">{STEPS[step]()}</div>

              <div className="flex items-center gap-3 px-6 py-4 border-t border-border-dark shrink-0">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep(step - 1)} className="btn-ghost">
                    <ChevronLeft className="w-3.5 h-3.5" /> Atrás
                  </button>
                ) : (
                  <button type="button" onClick={closeModal} className="btn-ghost">
                    Cancelar
                  </button>
                )}

                <div className="flex-1" />

                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={!canAdvanceStep()}
                    className="btn-primary"
                  >
                    Siguiente
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateClub}
                    disabled={creating || !canAdvanceStep()}
                    className="btn-primary"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Creando…
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        Crear complejo
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Club list ─────────────────────── */}
        {clubs.length === 0 ? (
          <div className="card-elevated text-center py-16">
            <div className="w-12 h-12 rounded-lg bg-surface-light text-text-muted mx-auto mb-4 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">No tenés complejos registrados</h3>
            <p className="text-sm text-text-muted mb-6 max-w-sm mx-auto">
              Creá tu primer complejo para empezar a gestionar canchas, reservas y torneos.
            </p>
            <button onClick={() => setShowCreateClub(true)} className="btn-primary">
              <Plus className="w-3.5 h-3.5" /> Crear mi primer complejo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        )}

        <ActivateRoleBanner currentRole="CLUB_OWNER" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Club card
   ───────────────────────────────────────────────────────────── */
function ClubCard({ club }: { club: any }) {
  const approvalBadge = (() => {
    switch (club.approvalStatus) {
      case 'APPROVED':  return { cls: 'badge-green',  label: 'Aprobado' };
      case 'PENDING':   return { cls: 'badge-yellow', label: 'Pendiente' };
      case 'REJECTED':  return { cls: 'badge-red',    label: 'Rechazado' };
      default:          return null;
    }
  })();

  const stats = [
    { label: 'Canchas',     value: club._count?.courts || 0 },
    { label: 'Reservas',    value: club._count?.reservations || 0 },
    { label: 'Torneos',     value: club._count?.tournaments || 0 },
    { label: 'Profesores',  value: club._count?.coachLinks || 0 },
  ];

  const actions = [
    { label: 'Ver',          href: `/clubs/${club.id}`,                  icon: <Eye className="w-3.5 h-3.5" /> },
    { label: 'Canchas',      href: `/dashboard/club/${club.id}/courts`,  icon: <Activity className="w-3.5 h-3.5" /> },
    { label: 'Reservas',     href: `/dashboard/club/${club.id}/reservations`, icon: <CalendarCheck className="w-3.5 h-3.5" /> },
    { label: 'Torneos',      href: `/dashboard/club/${club.id}/tournaments`,  icon: <Trophy className="w-3.5 h-3.5" /> },
    { label: 'Profesores',   href: `/dashboard/club/${club.id}/coaches`,  icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { label: 'Jugadores',    href: `/dashboard/club/${club.id}/players`,  icon: <Users className="w-3.5 h-3.5" /> },
    { label: 'Configuración',href: `/dashboard/club/${club.id}/settings`, icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="card-elevated">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-brand/25 to-brand/5 border border-brand/20 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-brand" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight-2 truncate">
                {club.name}
              </h2>
              {approvalBadge && <span className={approvalBadge.cls}>{approvalBadge.label}</span>}
            </div>
            {club.locations?.[0] && (
              <p className="text-2xs text-text-muted mt-1 inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {club.locations[0].address}, {club.locations[0].city}
              </p>
            )}
            {club.approvalStatus === 'PENDING' && (
              <p className="text-2xs text-warning mt-1.5 inline-flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Pendiente de aprobación. Te contactamos pronto.
              </p>
            )}
            {club.approvalStatus === 'REJECTED' && (
              <p className="text-2xs text-negative mt-1.5">
                Rechazado: {club.rejectionReason || 'Contactanos para más información.'}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 shrink-0">
          {club.sports?.map((s: string) => (
            <span key={s} className={s === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
              {s === 'PADEL' ? 'Padel' : 'Tenis'}
            </span>
          ))}
        </div>
      </div>

      {/* Stats row — divider grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-dark border border-border-dark rounded-lg overflow-hidden mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface px-4 py-3.5">
            <p className="kpi-label">{s.label}</p>
            <p className="text-2xl font-bold text-text-primary tabular tracking-tight-2 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-border-dark">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md bg-surface-light border border-border-dark text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-default transition-all"
          >
            {a.icon}
            {a.label}
          </Link>
        ))}
        <Link
          href={`/clubs/${club.id}`}
          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-semibold text-brand hover:bg-brand/10 transition-all ml-auto"
        >
          Vista pública
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
