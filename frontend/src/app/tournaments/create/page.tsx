'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/date';
import toast from 'react-hot-toast';
import RoleGuard from '@/components/RoleGuard';

/* ─── Types ────────────────────────────────────────────────── */

interface Club {
  id: string;
  name: string;
  sports: string[];
}

type Sport = 'PADEL' | 'TENNIS';

/* ─── Helpers ──────────────────────────────────────────────── */

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function StepIndicator({ currentStep, steps }: { currentStep: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        return (
          <div key={step} className="flex items-center gap-2">
            {i > 0 && (
              <div className={`h-px w-8 sm:w-12 transition-colors ${isCompleted ? 'bg-brand' : 'bg-border-dark'}`} />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-brand text-black shadow-glow-green-sm'
                    : isCompleted
                    ? 'bg-brand/20 text-brand'
                    : 'bg-surface-light text-text-muted border border-border-dark'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  isActive ? 'text-white' : isCompleted ? 'text-brand' : 'text-text-muted'
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   CREATE TOURNAMENT FORM
   ═════════════════════════════════════════════════════════════ */

function CreateTournamentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClubId = searchParams.get('clubId') || '';

  const [step, setStep] = useState(1);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [clubId, setClubId] = useState(preselectedClubId);
  const [name, setName] = useState('');
  const [sport, setSport] = useState<Sport>('PADEL');
  const [description, setDescription] = useState('');

  // Step 2
  const [maxTeams, setMaxTeams] = useState('16');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationEnd, setRegistrationEnd] = useState('');
  const [pointsPerWin, setPointsPerWin] = useState('3');
  const [pointsPerLoss, setPointsPerLoss] = useState('0');
  const [rules, setRules] = useState('');

  useEffect(() => {
    api.get<Club[]>('/clubs/mine')
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setClubs(list);
        if (preselectedClubId) {
          setClubId(preselectedClubId);
        } else if (list.length === 1) {
          setClubId(list[0].id);
        }
      })
      .catch(() => toast.error('Error al cargar tus clubs'))
      .finally(() => setLoadingClubs(false));
  }, [preselectedClubId]);

  const validateStep1 = () => {
    if (!clubId) { toast.error('Selecciona un club'); return false; }
    if (!name.trim()) { toast.error('Ingresa un nombre para el torneo'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: any = {
        clubId,
        name: name.trim(),
        sport,
      };
      if (description.trim()) payload.description = description.trim();
      if (maxTeams) payload.maxTeams = parseInt(maxTeams);
      if (startDate) payload.startDate = new Date(startDate).toISOString();
      if (endDate) payload.endDate = new Date(endDate).toISOString();
      if (registrationEnd) payload.registrationEnd = new Date(registrationEnd).toISOString();
      if (pointsPerWin) payload.pointsPerWin = parseInt(pointsPerWin);
      if (pointsPerLoss) payload.pointsPerLoss = parseInt(pointsPerLoss);
      if (rules.trim()) payload.rules = rules.trim();

      const result = await api.post('/tournaments', payload);
      toast.success('Torneo creado correctamente!');
      router.push(`/tournaments/${result.id}/manage`);
    } catch (err: any) {
      toast.error(err.message || 'Error al crear el torneo');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClub = clubs.find(c => c.id === clubId);

  if (loadingClubs) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Spinner />
          Cargando clubs...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* Back link */}
        <Link
          href={preselectedClubId ? `/dashboard/club/${preselectedClubId}/tournaments` : '/tournaments'}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Crear torneo
          </h1>
          <p className="text-text-muted text-sm mt-1">Configura tu nuevo torneo paso a paso</p>
        </div>

        {/* Step indicator */}
        <div className="animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <StepIndicator currentStep={step} steps={['Datos basicos', 'Configuracion', 'Confirmar']} />
        </div>

        <div className="card-elevated animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          {/* ─── STEP 1: Basic data ─── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-white mb-4">Datos basicos</h2>

              {/* Club selector */}
              <div>
                <label className="label">Club</label>
                {clubs.length === 0 ? (
                  <div className="p-4 bg-surface-light rounded-xl border border-border-dark text-center">
                    <p className="text-text-muted text-sm mb-3">No tenes clubs registrados</p>
                    <Link href="/dashboard/club" className="btn-secondary text-sm">Registrar club</Link>
                  </div>
                ) : (
                  <select
                    className="input appearance-none cursor-pointer"
                    value={clubId}
                    onChange={(e) => setClubId(e.target.value)}
                  >
                    <option value="">Selecciona un club</option>
                    {clubs.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="label">Nombre del torneo</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Torneo Apertura 2026"
                />
              </div>

              {/* Sport */}
              <div>
                <label className="label">Deporte</label>
                <div className="flex gap-2">
                  {(['PADEL', 'TENNIS'] as Sport[]).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSport(s)}
                      className={`px-6 py-2.5 rounded-pill text-sm font-semibold transition-all duration-200 border ${
                        sport === s
                          ? s === 'PADEL'
                            ? 'bg-[#539df5]/15 border-[#539df5]/40 text-[#539df5] shadow-[0_0_12px_rgba(83,157,245,0.15)]'
                            : 'bg-brand/15 border-brand/40 text-brand shadow-glow-green-sm'
                          : 'bg-surface-light border-border-dark text-text-secondary hover:border-border-default hover:text-white'
                      }`}
                    >
                      {s === 'PADEL' ? 'Padel' : 'Tenis'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label">Descripcion (opcional)</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripcion del torneo, reglas generales, etc."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => validateStep1() && setStep(2)}
                  className="btn-primary"
                >
                  Siguiente
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 2: Configuration ─── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-white mb-4">Configuracion</h2>

              {/* Max teams */}
              <div>
                <label className="label">Maximo de equipos</label>
                <input
                  className="input"
                  type="number"
                  min="2"
                  value={maxTeams}
                  onChange={(e) => setMaxTeams(e.target.value)}
                  placeholder="16"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha de inicio</label>
                  <input
                    className="input"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Fecha de fin</label>
                  <input
                    className="input"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label">Cierre de inscripcion</label>
                <input
                  className="input"
                  type="date"
                  value={registrationEnd}
                  onChange={(e) => setRegistrationEnd(e.target.value)}
                />
              </div>

              {/* Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Puntos por victoria</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={pointsPerWin}
                    onChange={(e) => setPointsPerWin(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Puntos por derrota</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={pointsPerLoss}
                    onChange={(e) => setPointsPerLoss(e.target.value)}
                  />
                </div>
              </div>

              {/* Rules */}
              <div>
                <label className="label">Reglas (opcional)</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="Reglas especificas del torneo"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="btn-ghost">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Atras
                </button>
                <button
                  onClick={() => validateStep2() && setStep(3)}
                  className="btn-primary"
                >
                  Siguiente
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: Review & Create ─── */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white mb-4">Confirmar torneo</h2>

              {/* Review card */}
              <div className="space-y-4">
                <div className="p-4 bg-surface-light rounded-xl border border-border-dark space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">Club</span>
                    <span className="text-white font-medium">{selectedClub?.name || '-'}</span>
                  </div>
                  <div className="h-px bg-border-dark" />
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">Nombre</span>
                    <span className="text-white font-medium">{name}</span>
                  </div>
                  <div className="h-px bg-border-dark" />
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">Deporte</span>
                    <span className={sport === 'PADEL' ? 'badge-padel' : 'badge-tennis'}>
                      {sport === 'PADEL' ? 'Padel' : 'Tenis'}
                    </span>
                  </div>
                  {description && (
                    <>
                      <div className="h-px bg-border-dark" />
                      <div>
                        <span className="text-text-muted text-sm block mb-1">Descripcion</span>
                        <span className="text-text-secondary text-sm">{description}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4 bg-surface-light rounded-xl border border-border-dark space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">Max equipos</span>
                    <span className="text-white font-medium">{maxTeams || 'Sin limite'}</span>
                  </div>
                  <div className="h-px bg-border-dark" />
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">Puntos victoria / derrota</span>
                    <span className="text-white font-medium">{pointsPerWin} / {pointsPerLoss}</span>
                  </div>
                  {startDate && (
                    <>
                      <div className="h-px bg-border-dark" />
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted text-sm">Inicio</span>
                        <span className="text-white font-medium">
                          <span className="tabular">{formatDate(startDate)}</span>
                        </span>
                      </div>
                    </>
                  )}
                  {endDate && (
                    <>
                      <div className="h-px bg-border-dark" />
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted text-sm">Fin</span>
                        <span className="text-white font-medium">
                          <span className="tabular">{formatDate(endDate)}</span>
                        </span>
                      </div>
                    </>
                  )}
                  {registrationEnd && (
                    <>
                      <div className="h-px bg-border-dark" />
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted text-sm">Cierre inscripcion</span>
                        <span className="text-white font-medium">
                          <span className="tabular">{formatDate(registrationEnd)}</span>
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className="btn-ghost">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Atras
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Spinner />
                      Creando...
                    </span>
                  ) : (
                    <>
                      Crear torneo
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   PAGE WRAPPER WITH ROLE GUARD
   ═════════════════════════════════════════════════════════════ */

export default function CreateTournamentPage() {
  return (
    <RoleGuard role="CLUB_OWNER">
      <CreateTournamentForm />
    </RoleGuard>
  );
}
