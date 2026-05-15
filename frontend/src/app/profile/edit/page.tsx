'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PhoneInput from '@/components/PhoneInput';
import { isValidE164 } from '@/lib/location';
import { useSubscription } from '@/lib/subscription';
import {
  ArrowLeft,
  User as UserIcon,
  GraduationCap,
  Activity,
  Lock,
  Save,
  Loader2,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Outer page — auth gate. The form lives in EditProfileForm
   which only mounts once `user` is loaded, so useState captures
   real data instead of empty strings.
   ───────────────────────────────────────────────────────────── */
export default function EditProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <FullPageSpinner />;
  }

  if (!user) {
    if (typeof window !== 'undefined') router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    return <FullPageSpinner />;
  }

  return <EditProfileForm user={user} />;
}

function FullPageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex items-center gap-3 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando…
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Form
   ───────────────────────────────────────────────────────────── */
function EditProfileForm({ user }: { user: any }) {
  const { refreshUser } = useAuth();
  const { isActive: subActive, configured: subConfigured } = useSubscription();
  const router = useRouter();

  const pp = user.playerProfile;
  const cp = user.coachProfile;

  const [form, setForm] = useState({
    firstName: user.firstName || '',
    lastName:  user.lastName  || '',
    phone:     user.phone     || '',
  });

  const [profileForm, setProfileForm] = useState({
    city:              pp?.city              || pp?.homeCity || '',
    bio:               pp?.bio               || '',
    hand:              pp?.hand              || '',
    padelLevel:        pp?.padelLevel != null ? String(pp.padelLevel) : '',
    tennisLevel:       pp?.tennisLevel != null ? String(pp.tennisLevel) : '',
    preferredPosition: pp?.preferredPosition || '',
  });

  // Privacy lives on PlayerProfile (showStats, showLevel, …). Defaults true.
  const [privacy, setPrivacy] = useState({
    showStats:        pp?.showStats        ?? true,
    showMatchHistory: pp?.showMatchHistory ?? true,
    showLevel:        pp?.showLevel        ?? true,
    showCity:         pp?.showCity         ?? true,
    showAvailability: pp?.showAvailability ?? true,
    showTournaments:  pp?.showTournaments  ?? true,
  });

  const [coachForm, setCoachForm] = useState({
    bio:            cp?.bio             || '',
    sports:         (cp?.sports as string[]) || [],
    experience:     cp?.experience      || '',
    certifications: cp?.certifications  || '',
    pricePerHour:   cp?.pricePerHour != null ? String(cp.pricePerHour) : '',
    groupPrice:     cp?.groupPrice   != null ? String(cp.groupPrice)   : '',
  });

  const [saving, setSaving] = useState(false);

  const toggleCoachSport = (sport: string) => {
    setCoachForm((prev) => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter((s) => s !== sport)
        : [...prev.sports, sport],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phone && !isValidE164(form.phone)) {
      toast.error('Revisá el celular');
      return;
    }
    setSaving(true);
    try {
      await api.patch('/users/me', form);

      if (user.roles?.includes('PLAYER')) {
        await api.patch('/users/me/player-profile', {
          city: profileForm.city || undefined,
          bio:  profileForm.bio  || undefined,
          hand: profileForm.hand || undefined,
          padelLevel:  profileForm.padelLevel  ? parseFloat(profileForm.padelLevel)  : undefined,
          tennisLevel: profileForm.tennisLevel ? parseFloat(profileForm.tennisLevel) : undefined,
          preferredPosition: profileForm.preferredPosition || undefined,
          sports: [
            ...(profileForm.padelLevel  ? ['PADEL']  : []),
            ...(profileForm.tennisLevel ? ['TENNIS'] : []),
          ],
        });
      }

      if (user.roles?.includes('COACH')) {
        await api.patch('/coaches/me', {
          bio:            coachForm.bio || undefined,
          sports:         coachForm.sports.length > 0 ? coachForm.sports : undefined,
          experience:     coachForm.experience || undefined,
          certifications: coachForm.certifications || undefined,
          pricePerHour: coachForm.pricePerHour ? parseFloat(coachForm.pricePerHour) : undefined,
          groupPrice:   coachForm.groupPrice   ? parseFloat(coachForm.groupPrice)   : undefined,
        });
      }

      // Privacy is gated by subscription. Backend enforces; we just avoid
      // sending if we know it would be rejected.
      if (subActive) {
        await api.patch('/users/me/privacy', privacy);
      }

      await refreshUser();
      toast.success('Perfil actualizado');
      router.push('/profile');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const isPlayer = user.roles?.includes('PLAYER');
  const isCoach  = user.roles?.includes('COACH');

  return (
    <div className="bg-base">
      {/* Page header */}
      <div className="border-b border-border-dark bg-base sticky top-14 z-30 lg:top-0 lg:relative">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1 text-2xs text-text-muted hover:text-text-primary mb-1.5 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Volver
            </button>
            <p className="eyebrow text-text-muted">Perfil</p>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight-2 mt-1">
              Editar perfil
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Personal data */}
          <SectionCard title="Datos personales" icon={<UserIcon className="w-4 h-4 text-brand" />}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre">
                <input
                  className="input"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Juan"
                />
              </Field>
              <Field label="Apellido">
                <input
                  className="input"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Pérez"
                />
              </Field>
              <div className="col-span-2">
                <Field label="Celular">
                  <PhoneInput
                    value={form.phone}
                    onChange={(e164) => setForm({ ...form, phone: e164 })}
                    defaultCountryName={
                      pp?.homeCountry || pp?.currentCountry || 'Argentina'
                    }
                    placeholder="11 5555 1234"
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* Player profile */}
          {isPlayer && (
            <SectionCard title="Perfil deportivo" icon={<Activity className="w-4 h-4 text-sky" />}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ciudad">
                  <input
                    className="input"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    placeholder="Buenos Aires"
                  />
                </Field>
                <Field label="Mano hábil">
                  <select
                    className="input cursor-pointer"
                    value={profileForm.hand}
                    onChange={(e) => setProfileForm({ ...profileForm, hand: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    <option value="RIGHT">Derecha</option>
                    <option value="LEFT">Izquierda</option>
                    <option value="AMBIDEXTROUS">Ambidiestro</option>
                  </select>
                </Field>
                <Field label="Nivel padel" hint="1–10">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    className="input"
                    value={profileForm.padelLevel}
                    onChange={(e) => setProfileForm({ ...profileForm, padelLevel: e.target.value })}
                    placeholder="5.5"
                  />
                </Field>
                <Field label="Nivel tenis" hint="1–10">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    className="input"
                    value={profileForm.tennisLevel}
                    onChange={(e) => setProfileForm({ ...profileForm, tennisLevel: e.target.value })}
                    placeholder="4.0"
                  />
                </Field>
                <Field label="Posición preferida">
                  <input
                    className="input"
                    value={profileForm.preferredPosition}
                    onChange={(e) => setProfileForm({ ...profileForm, preferredPosition: e.target.value })}
                    placeholder="Drive / Revés"
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="Bio">
                    <textarea
                      className="textarea"
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Contanos un poco sobre vos como jugador…"
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Coach profile */}
          {isCoach && (
            <SectionCard title="Perfil de profesor" icon={<GraduationCap className="w-4 h-4 text-clay" />}>
              <div className="space-y-4">
                <Field label="Bio">
                  <textarea
                    className="textarea"
                    rows={3}
                    value={coachForm.bio}
                    onChange={(e) => setCoachForm({ ...coachForm, bio: e.target.value })}
                    placeholder="Contanos sobre tu experiencia como profesor…"
                  />
                </Field>

                <Field label="Deportes">
                  <div className="flex gap-2">
                    {[{ v: 'PADEL', l: 'Padel', cls: 'bg-sky text-white' },
                      { v: 'TENNIS', l: 'Tenis', cls: 'bg-clay text-white' }].map((s) => {
                      const active = coachForm.sports.includes(s.v);
                      return (
                        <button
                          key={s.v}
                          type="button"
                          onClick={() => toggleCoachSport(s.v)}
                          className={`px-4 h-9 rounded-lg text-xs font-medium transition-all border ${
                            active
                              ? `${s.cls} border-transparent`
                              : 'bg-surface-light text-text-secondary border-border-dark hover:border-border-default'
                          }`}
                        >
                          {active && <Check className="w-3 h-3 inline -mt-0.5 mr-1" strokeWidth={3} />}
                          {s.l}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Experiencia">
                    <input
                      className="input"
                      value={coachForm.experience}
                      onChange={(e) => setCoachForm({ ...coachForm, experience: e.target.value })}
                      placeholder="5 años"
                    />
                  </Field>
                  <Field label="Certificaciones">
                    <input
                      className="input"
                      value={coachForm.certifications}
                      onChange={(e) => setCoachForm({ ...coachForm, certifications: e.target.value })}
                      placeholder="AAP, FIT…"
                    />
                  </Field>
                  <Field label="Precio por hora ($)">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      className="input"
                      value={coachForm.pricePerHour}
                      onChange={(e) => setCoachForm({ ...coachForm, pricePerHour: e.target.value })}
                      placeholder="5000"
                    />
                  </Field>
                  <Field label="Precio grupal ($)">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      className="input"
                      value={coachForm.groupPrice}
                      onChange={(e) => setCoachForm({ ...coachForm, groupPrice: e.target.value })}
                      placeholder="3000"
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Privacy — gated behind active subscription. */}
          {isPlayer && (
            <PrivacySection
              isActive={subActive}
              configured={subConfigured}
              privacy={privacy}
              setPrivacy={setPrivacy}
            />
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando…</>
                : <><Save className="w-3.5 h-3.5" /> Guardar cambios</>}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-ghost">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Local primitives
   ───────────────────────────────────────────────────────────── */
function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card-elevated">
      <header className="flex items-center gap-2.5 mb-5">
        {icon}
        <h2 className="text-sm font-semibold text-text-primary tracking-tight">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}
        {hint && <span className="text-text-faint font-normal ml-1 normal-case tracking-normal">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Privacy section — gated behind active subscription. UI is the
   first fence; backend rejects unauthorised PATCH /users/me/privacy
   even if a determined user bypasses the disabled state.
   ───────────────────────────────────────────────────────────── */
function PrivacySection({
  isActive,
  configured,
  privacy,
  setPrivacy,
}: {
  isActive: boolean;
  configured: boolean;
  privacy: any;
  setPrivacy: (p: any) => void;
}) {
  const items = [
    { key: 'showStats',        label: 'Mostrar estadísticas',     desc: 'Partidos jugados, ganados y perdidos' },
    { key: 'showMatchHistory', label: 'Mostrar historial',        desc: 'Tu historial completo de partidos' },
    { key: 'showLevel',        label: 'Mostrar nivel',            desc: 'Tu nivel de padel y tenis' },
    { key: 'showCity',         label: 'Mostrar ciudad',           desc: 'Tu ciudad en el perfil público' },
    { key: 'showAvailability', label: 'Mostrar disponibilidad',   desc: 'Estado "disponible para jugar"' },
    { key: 'showTournaments',  label: 'Mostrar torneos',          desc: 'Torneos en los que participás' },
  ] as const;

  return (
    <section className="card-elevated relative overflow-hidden">
      <header className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2.5">
          <Lock className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-text-muted'}`} />
          <h2 className="text-sm font-semibold text-text-primary tracking-tight">
            Privacidad
          </h2>
          <span className="badge-brand">Pro</span>
        </div>
        {!isActive && (
          <a href="/billing" className="btn-primary text-xs h-8">
            Activar suscripción
          </a>
        )}
      </header>

      {!isActive && (
        <div className="rounded-lg border border-brand/20 bg-brand/5 p-3.5 mb-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-brand/15 text-brand flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">Función Pro</p>
            <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
              Los controles de privacidad son parte de{' '}
              <span className="text-brand font-semibold">pelotitas Pro</span>.
              Tu perfil se muestra completo por defecto. Suscribite para
              decidir qué información mostrar y a quién.
            </p>
            {!configured && (
              <p className="text-2xs text-warning mt-2">
                ⚠ La integración con Stripe no está configurada en este servidor.
                Contactá al admin.
              </p>
            )}
          </div>
        </div>
      )}

      <div className={`space-y-3 transition-opacity ${isActive ? '' : 'opacity-50 pointer-events-none select-none'}`}>
        {items.map((it) => {
          const val = privacy[it.key];
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => setPrivacy({ ...privacy, [it.key]: !val })}
              className="flex items-center gap-3 w-full text-left group"
              disabled={!isActive}
            >
              <div className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${
                val ? 'bg-brand' : 'bg-surface-light border border-border-dark'
              }`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all shadow ${
                  val ? 'left-[18px] bg-brand-ink' : 'left-0.5 bg-text-muted'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{it.label}</p>
                <p className="text-2xs text-text-muted">{it.desc}</p>
              </div>
              {val
                ? <Check className="w-3.5 h-3.5 text-brand shrink-0" strokeWidth={3} />
                : <X     className="w-3.5 h-3.5 text-text-muted shrink-0" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
