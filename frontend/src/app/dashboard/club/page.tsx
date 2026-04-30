'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import RoleGuard from '@/components/RoleGuard';
import ActivateRoleBanner from '@/components/ActivateRoleBanner';

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Cordoba', 'Santa Fe', 'Mendoza', 'Tucuman',
  'Salta', 'Entre Rios', 'Misiones', 'Chaco', 'Corrientes',
  'Santiago del Estero', 'San Juan', 'Jujuy', 'Rio Negro', 'Formosa',
  'Neuquen', 'Chubut', 'San Luis', 'Catamarca', 'La Rioja', 'La Pampa',
  'Santa Cruz', 'Tierra del Fuego',
];

const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'];

const RESERVATION_MODES = [
  { value: 'OPEN', label: 'Abierto', description: 'Cualquier usuario verificado puede reservar' },
  { value: 'CONNECTED_ONLY', label: 'Solo conectados', description: 'Solo usuarios que envian solicitud y son aceptados' },
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
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              i < current
                ? 'bg-brand text-black'
                : i === current
                  ? 'bg-brand/20 text-brand border-2 border-brand'
                  : 'bg-surface-light text-text-muted border border-border-dark'
            }`}
          >
            {i < current ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < total - 1 && (
            <div className={`w-8 h-0.5 rounded-full transition-all duration-300 ${i < current ? 'bg-brand' : 'bg-border-dark'}`} />
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
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [clubs, setClubs] = useState<any[]>([]);
  const [tournamentCount, setTournamentCount] = useState<any>(null);
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [clubForm, setClubForm] = useState<ClubFormData>(INITIAL_FORM);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(0);

  // Auth handled by RoleGuard

  useEffect(() => {
    if (user) {
      api.get('/clubs/mine').then(setClubs).catch(() => {});
      api.get('/tournaments/my-count').then(setTournamentCount).catch(() => {});
    }
  }, [user]);

  const updateForm = (patch: Partial<ClubFormData>) => {
    setClubForm(prev => ({ ...prev, ...patch }));
  };

  const toggleSport = (sport: string) => {
    updateForm({
      sports: clubForm.sports.includes(sport)
        ? clubForm.sports.filter(s => s !== sport)
        : [...clubForm.sports, sport],
    });
  };

  const togglePayment = (method: string) => {
    updateForm({
      paymentMethods: clubForm.paymentMethods.includes(method)
        ? clubForm.paymentMethods.filter(m => m !== method)
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
      if (clubForm.phone.trim()) payload.phone = clubForm.phone;
      if (clubForm.email.trim()) payload.email = clubForm.email;
      if (clubForm.description.trim()) payload.description = clubForm.description;
      if (clubForm.paymentMethods.length > 0) payload.paymentMethods = clubForm.paymentMethods;
      if (clubForm.reservationMode) payload.reservationMode = clubForm.reservationMode;

      await api.post('/clubs', payload);
      toast.success('Complejo creado!');
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

  if (!user) {
    return null; // RoleGuard handles auth
  }

  const renderStep0 = () => (
    <div className="space-y-5 animate-fade-in">
      <div>
        <label className="label">
          Nombre del complejo <span className="text-negative">*</span>
        </label>
        <input
          className="input"
          required
          value={clubForm.name}
          onChange={e => updateForm({ name: e.target.value })}
          placeholder="Club Padel Centro"
          autoFocus
        />
      </div>

      <div>
        <label className="label">
          Deportes <span className="text-negative">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3 mt-1">
          {[
            { key: 'PADEL', label: 'Padel', icon: '🏸', color: 'padel' },
            { key: 'TENNIS', label: 'Tenis', icon: '🎾', color: 'brand' },
          ].map(sport => {
            const isSelected = clubForm.sports.includes(sport.key);
            return (
              <button
                key={sport.key}
                type="button"
                onClick={() => toggleSport(sport.key)}
                className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-300 ${
                  isSelected
                    ? sport.key === 'PADEL'
                      ? 'bg-padel/10 border-padel/40 shadow-glow-blue'
                      : 'bg-brand/10 border-brand/40 shadow-glow-green-sm'
                    : 'bg-surface-light border-border-dark hover:border-border-default'
                }`}
              >
                <span className="text-3xl">{sport.icon}</span>
                <span className={`text-sm font-bold ${isSelected ? (sport.key === 'PADEL' ? 'text-padel' : 'text-brand') : 'text-text-secondary'}`}>
                  {sport.label}
                </span>
                {isSelected && (
                  <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${sport.key === 'PADEL' ? 'bg-padel' : 'bg-brand'}`}>
                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {clubForm.sports.length === 0 && (
          <p className="text-negative text-xs mt-2">Selecciona al menos un deporte</p>
        )}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5 animate-fade-in">
      <div>
        <label className="label">
          Provincia <span className="text-negative">*</span>
        </label>
        <div className="relative">
          <select
            className="input appearance-none pr-10 cursor-pointer"
            value={clubForm.state}
            onChange={e => updateForm({ state: e.target.value })}
            required
          >
            <option value="" disabled>Selecciona una provincia</option>
            {PROVINCES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label className="label">
          Ciudad <span className="text-negative">*</span>
        </label>
        <input
          className="input"
          required
          value={clubForm.city}
          onChange={e => updateForm({ city: e.target.value })}
          placeholder="Capital Federal"
        />
      </div>

      <div>
        <label className="label">Direccion</label>
        <input
          className="input"
          value={clubForm.address}
          onChange={e => updateForm({ address: e.target.value })}
          placeholder="Av. Libertador 5000"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5 animate-fade-in">
      <p className="text-xs text-text-muted -mt-1">Estos campos son opcionales. Podes completarlos ahora o despues.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Telefono</label>
          <input
            className="input"
            type="tel"
            value={clubForm.phone}
            onChange={e => updateForm({ phone: e.target.value })}
            placeholder="+54 11 1234-5678"
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={clubForm.email}
            onChange={e => updateForm({ email: e.target.value })}
            placeholder="contacto@club.com"
          />
        </div>
      </div>

      <div>
        <label className="label">Descripcion</label>
        <textarea
          className="textarea"
          value={clubForm.description}
          onChange={e => updateForm({ description: e.target.value })}
          placeholder="Contanos sobre tu complejo, instalaciones, horarios..."
          rows={3}
        />
      </div>

      <div>
        <label className="label">Formas de pago</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {PAYMENT_METHODS.map(method => {
            const isSelected = clubForm.paymentMethods.includes(method);
            return (
              <button
                key={method}
                type="button"
                onClick={() => togglePayment(method)}
                className={`px-4 py-2 rounded-pill text-sm font-medium transition-all duration-200 border ${
                  isSelected
                    ? 'bg-brand/15 text-brand border-brand/30'
                    : 'bg-surface-light text-text-secondary border-border-dark hover:border-border-default'
                }`}
              >
                {isSelected && (
                  <svg className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {method}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="label">Modo de reserva</label>
        <div className="space-y-2 mt-1">
          {RESERVATION_MODES.map(mode => {
            const isSelected = clubForm.reservationMode === mode.value;
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => updateForm({ reservationMode: mode.value })}
                className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-brand/10 border-brand/30'
                    : 'bg-surface-light border-border-dark hover:border-border-default'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  isSelected ? 'border-brand' : 'border-border-light'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                </div>
                <div>
                  <p className={`text-sm font-bold ${isSelected ? 'text-brand' : 'text-white'}`}>
                    {mode.label}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{mode.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const STEP_TITLES = ['Complejo', 'Ubicacion', 'Detalles'];
  const STEPS = [renderStep0, renderStep1, renderStep2];

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-3xl">🏟️</span>
              Panel de complejo
            </h1>
            <p className="text-text-muted text-sm mt-1">Administra tus clubes, canchas y torneos</p>
          </div>
          <button onClick={() => setShowCreateClub(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo complejo
          </button>
        </div>

        {/* Tournament quota */}
        {tournamentCount && (
          <div className="card-elevated mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                  <span className="text-xl">🏆</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Cuota de torneos</p>
                  <p className="text-xs text-text-muted">Plan gratuito</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-text-secondary">
                    <span className="text-xl font-bold text-brand">{tournamentCount.used}</span>
                    <span className="text-text-muted"> / {tournamentCount.limit}</span>
                  </p>
                </div>
                {/* Progress bar */}
                <div className="w-24 h-2 bg-surface-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full transition-all duration-500"
                    style={{ width: `${(tournamentCount.used / tournamentCount.limit) * 100}%` }}
                  />
                </div>
                {tournamentCount.remaining > 0 && (
                  <span className="badge-green text-xs">{tournamentCount.remaining} restantes</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create club modal */}
        {showCreateClub && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="glass-dark max-w-lg w-full animate-scale-in max-h-[90vh] flex flex-col">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border-dark shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white">Nuevo complejo</h2>
                  <p className="text-xs text-text-muted mt-1">{STEP_TITLES[step]}</p>
                </div>
                <button onClick={closeModal} className="btn-icon-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex justify-center px-6 py-4 shrink-0">
                <StepIndicator current={step} total={3} />
              </div>

              {/* Step content */}
              <div className="px-6 pb-2 overflow-y-auto flex-1 min-h-0">
                {STEPS[step]()}
              </div>

              {/* Modal footer */}
              <div className="flex items-center gap-3 px-6 py-4 border-t border-border-dark shrink-0">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="btn-ghost"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Atras
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
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
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
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creando...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Crear complejo
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Club list */}
        {clubs.length === 0 ? (
          <div className="card-elevated text-center py-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="text-6xl mb-4 opacity-20">🏟️</div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">No tenes complejos registrados</h3>
            <p className="text-text-muted mb-6">Crea tu primer complejo para empezar a gestionar canchas y torneos</p>
            <button onClick={() => setShowCreateClub(true)} className="btn-primary">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Crear mi primer complejo
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {clubs.map((club, i) => (
              <div
                key={club.id}
                className="card-elevated animate-fade-in-up"
                style={{ animationDelay: `${(i + 2) * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-3xl">
                      🏟️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-white">{club.name}</h2>
                        {club.approvalStatus === 'PENDING' && (
                          <span className="badge-yellow">Pendiente</span>
                        )}
                        {club.approvalStatus === 'APPROVED' && (
                          <span className="badge-green">Aprobado</span>
                        )}
                        {club.approvalStatus === 'REJECTED' && (
                          <span className="badge-red">Rechazado</span>
                        )}
                      </div>
                      {club.approvalStatus === 'PENDING' && (
                        <p className="text-xs text-warning mt-1">Tu complejo esta pendiente de aprobacion. Te contactaremos pronto.</p>
                      )}
                      {club.approvalStatus === 'REJECTED' && (
                        <p className="text-xs text-negative mt-1">Tu complejo fue rechazado. {club.rejectionReason || 'Contactanos para mas informacion.'}</p>
                      )}
                      {club.locations?.[0] && (
                        <p className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {club.locations[0].address}, {club.locations[0].city}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {club.sports?.map((s: string) => (
                      <span key={s} className={s === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                        {s === 'PADEL' ? 'Padel' : 'Tenis'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div className="bg-surface-light rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{club._count?.courts || 0}</p>
                    <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Canchas</p>
                  </div>
                  <div className="bg-surface-light rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{club._count?.tournaments || 0}</p>
                    <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Torneos</p>
                  </div>
                  <div className="bg-surface-light rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{club._count?.coachLinks || 0}</p>
                    <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Profesores</p>
                  </div>
                  <div className="bg-surface-light rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{club._count?.reservations || 0}</p>
                    <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Reservas</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border-dark">
                  <Link href={`/clubs/${club.id}`} className="btn-secondary text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver complejo
                  </Link>
                  <Link href={`/dashboard/club/${club.id}/courts`} className="btn-secondary text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                    </svg>
                    Canchas
                  </Link>
                  <Link href={`/dashboard/club/${club.id}/reservations`} className="btn-secondary text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Reservas
                  </Link>
                  <Link href={`/dashboard/club/${club.id}/coaches`} className="btn-secondary text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                    Profesores
                  </Link>
                  <Link href={`/dashboard/club/${club.id}/settings`} className="btn-secondary text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Configuracion
                  </Link>
                  <Link href={`/dashboard/club/${club.id}/tournaments`} className="btn-secondary text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Torneos
                  </Link>
                  <Link href={`/dashboard/club/${club.id}/players`} className="btn-secondary text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Jugadores
                  </Link>
                  <Link href={`/dashboard/club/${club.id}/settings`} className="btn-secondary text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Configuracion
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <ActivateRoleBanner currentRole="CLUB_OWNER" />
      </div>
    </div>
  );
}
