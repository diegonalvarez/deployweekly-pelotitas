'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: (user as any)?.phone || '',
  });

  const [profileForm, setProfileForm] = useState({
    city: user?.playerProfile?.city || '',
    bio: user?.playerProfile?.bio || '',
    hand: user?.playerProfile?.hand || '',
    padelLevel: user?.playerProfile?.padelLevel || '',
    tennisLevel: user?.playerProfile?.tennisLevel || '',
    preferredPosition: user?.playerProfile?.preferredPosition || '',
  });

  const [privacy, setPrivacy] = useState({
    showStats: (user as any)?.privacy?.showStats ?? true,
    showMatchHistory: (user as any)?.privacy?.showMatchHistory ?? true,
    showLevel: (user as any)?.privacy?.showLevel ?? true,
    showCity: (user as any)?.privacy?.showCity ?? true,
    showAvailability: (user as any)?.privacy?.showAvailability ?? true,
    showTournaments: (user as any)?.privacy?.showTournaments ?? true,
  });

  const coachProfile = user?.coachProfile;
  const [coachForm, setCoachForm] = useState({
    bio: coachProfile?.bio || '',
    sports: (coachProfile?.sports as string[]) || [],
    experience: coachProfile?.experience || '',
    certifications: coachProfile?.certifications || '',
    pricePerHour: coachProfile?.pricePerHour || '',
    groupPrice: coachProfile?.groupPrice || '',
  });

  const [saving, setSaving] = useState(false);

  const toggleCoachSport = (sport: string) => {
    setCoachForm(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/users/me', form);
      if (user?.roles.includes('PLAYER')) {
        await api.patch('/users/me/player-profile', {
          ...profileForm,
          padelLevel: profileForm.padelLevel ? parseFloat(profileForm.padelLevel as string) : undefined,
          tennisLevel: profileForm.tennisLevel ? parseFloat(profileForm.tennisLevel as string) : undefined,
          hand: profileForm.hand || undefined,
          sports: [
            ...(profileForm.padelLevel ? ['PADEL'] : []),
            ...(profileForm.tennisLevel ? ['TENNIS'] : []),
          ],
        });
      }
      if (user?.roles.includes('COACH')) {
        await api.patch('/coaches/me', {
          bio: coachForm.bio || undefined,
          sports: coachForm.sports.length > 0 ? coachForm.sports : undefined,
          experience: coachForm.experience || undefined,
          certifications: coachForm.certifications || undefined,
          pricePerHour: coachForm.pricePerHour ? parseFloat(coachForm.pricePerHour as string) : undefined,
          groupPrice: coachForm.groupPrice ? parseFloat(coachForm.groupPrice as string) : undefined,
        });
      }
      await api.patch('/users/me/privacy', privacy);
      await refreshUser();
      toast.success('Perfil actualizado');
      router.push('/profile');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
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

  return (
    <div className="min-h-[calc(100vh-4rem)] relative">
      <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Editar perfil</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal data */}
          <div className="card-elevated animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Datos personales
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  className="input"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="label">Apellido</label>
                <input
                  className="input"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Perez"
                />
              </div>
              <div className="col-span-2">
                <label className="label">Telefono</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+54 11 5555 1234"
                />
              </div>
            </div>
          </div>

          {/* Sports profile */}
          {user.roles.includes('PLAYER') && (
            <div className="card-elevated animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-padel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Perfil deportivo
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Ciudad</label>
                  <input
                    className="input"
                    value={profileForm.city}
                    onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                    placeholder="Buenos Aires"
                  />
                </div>
                <div>
                  <label className="label">Mano habil</label>
                  <select
                    className="input appearance-none cursor-pointer"
                    value={profileForm.hand}
                    onChange={e => setProfileForm({ ...profileForm, hand: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    <option value="RIGHT">Derecha</option>
                    <option value="LEFT">Izquierda</option>
                    <option value="AMBIDEXTROUS">Ambidiestro</option>
                  </select>
                </div>
                <div>
                  <label className="label">
                    Nivel Padel
                    <span className="text-text-muted font-normal ml-1">(1-10)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    className="input"
                    value={profileForm.padelLevel}
                    onChange={e => setProfileForm({ ...profileForm, padelLevel: e.target.value })}
                    placeholder="5.5"
                  />
                </div>
                <div>
                  <label className="label">
                    Nivel Tenis
                    <span className="text-text-muted font-normal ml-1">(1-10)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    className="input"
                    value={profileForm.tennisLevel}
                    onChange={e => setProfileForm({ ...profileForm, tennisLevel: e.target.value })}
                    placeholder="4.0"
                  />
                </div>
                <div>
                  <label className="label">Posicion preferida</label>
                  <input
                    className="input"
                    placeholder="Drive / Reves"
                    value={profileForm.preferredPosition}
                    onChange={e => setProfileForm({ ...profileForm, preferredPosition: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="label">Bio</label>
                  <textarea
                    className="textarea"
                    rows={3}
                    value={profileForm.bio}
                    onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Contanos un poco sobre vos como jugador..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Coach profile */}
          {user.roles.includes('COACH') && (
            <div className="card-elevated animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-padel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Perfil de profesor
              </h2>

              <div className="space-y-4">
                {/* Bio */}
                <div>
                  <label className="label">Bio</label>
                  <textarea
                    className="input w-full resize-none"
                    rows={3}
                    value={coachForm.bio}
                    onChange={e => setCoachForm({ ...coachForm, bio: e.target.value })}
                    placeholder="Contanos sobre tu experiencia como profesor..."
                  />
                </div>

                {/* Sports pill selector */}
                <div>
                  <label className="label">Deportes</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'PADEL', label: 'Padel' },
                      { value: 'TENNIS', label: 'Tenis' },
                    ].map(sport => (
                      <button
                        key={sport.value}
                        type="button"
                        onClick={() => toggleCoachSport(sport.value)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                          coachForm.sports.includes(sport.value)
                            ? sport.value === 'PADEL'
                              ? 'bg-padel text-white shadow-lg shadow-padel/20'
                              : 'bg-brand text-black shadow-lg shadow-brand/20'
                            : 'bg-surface-light text-text-secondary hover:bg-surface-light/80 border border-border-dark'
                        }`}
                      >
                        {sport.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Experience */}
                  <div>
                    <label className="label">Experiencia</label>
                    <input
                      className="input"
                      value={coachForm.experience}
                      onChange={e => setCoachForm({ ...coachForm, experience: e.target.value })}
                      placeholder="5 anos"
                    />
                  </div>

                  {/* Certifications */}
                  <div>
                    <label className="label">Certificaciones</label>
                    <input
                      className="input"
                      value={coachForm.certifications}
                      onChange={e => setCoachForm({ ...coachForm, certifications: e.target.value })}
                      placeholder="AAP, FIT..."
                    />
                  </div>

                  {/* Price per hour */}
                  <div>
                    <label className="label">Precio por hora ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      className="input"
                      value={coachForm.pricePerHour}
                      onChange={e => setCoachForm({ ...coachForm, pricePerHour: e.target.value })}
                      placeholder="5000"
                    />
                  </div>

                  {/* Group price */}
                  <div>
                    <label className="label">Precio grupal ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      className="input"
                      value={coachForm.groupPrice}
                      onChange={e => setCoachForm({ ...coachForm, groupPrice: e.target.value })}
                      placeholder="3000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy controls */}
          <div className="card-elevated animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacidad
            </h2>

            <div className="space-y-4">
              {[
                { key: 'showStats' as const, label: 'Mostrar estadisticas', desc: 'Partidos jugados, ganados y perdidos' },
                { key: 'showMatchHistory' as const, label: 'Mostrar historial de partidos', desc: 'Tu historial completo de partidos' },
                { key: 'showLevel' as const, label: 'Mostrar nivel', desc: 'Tu nivel de padel y tenis' },
                { key: 'showCity' as const, label: 'Mostrar ciudad', desc: 'Tu ciudad en tu perfil publico' },
                { key: 'showAvailability' as const, label: 'Mostrar disponibilidad', desc: 'Tu estado de disponibilidad para jugar' },
                { key: 'showTournaments' as const, label: 'Mostrar torneos', desc: 'Torneos en los que participas' },
              ].map((setting) => (
                <button
                  key={setting.key}
                  type="button"
                  onClick={() => setPrivacy({ ...privacy, [setting.key]: !privacy[setting.key] })}
                  className="flex items-center gap-4 w-full text-left group"
                >
                  <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${privacy[setting.key] ? 'bg-brand' : 'bg-surface-light border border-border-dark'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200 shadow ${privacy[setting.key] ? 'left-[22px] bg-black' : 'left-0.5 bg-text-muted'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-brand transition-colors">{setting.label}</p>
                    <p className="text-xs text-text-muted">{setting.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <button type="submit" className="btn-primary flex-1 sm:flex-none" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar cambios
                </>
              )}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
