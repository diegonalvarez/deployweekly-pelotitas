import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import OpenStatusBadge from './OpenStatusBadge';

const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';

type Sport = 'PADEL' | 'TENNIS';
type Surface = 'CLAY' | 'HARD' | 'GRASS' | 'SYNTHETIC' | 'CONCRETE' | 'CARPET';
type CourtTypeT = 'INDOOR' | 'OUTDOOR';
type TournamentStatus = 'DRAFT' | 'REGISTRATION' | 'GROUP_STAGE' | 'ELIMINATION' | 'COMPLETED' | 'CANCELLED';

interface ClubLocation {
  id: string;
  name: string | null;
  address: string;
  city: string;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  isMain: boolean;
}

interface Court {
  id: string;
  name: string;
  sport: Sport;
  surface: Surface;
  courtType: CourtTypeT;
  hasLighting: boolean;
  pricePerBlock: number;
  blockDuration: number;
}

interface ClubData {
  id: string;
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logoUrl: string | null;
  imageUrl: string | null;
  galleryUrls: string[];
  videoUrl: string | null;
  amenities: string[];
  hoursWeekday: string | null;
  hoursWeekend: string | null;
  instagramUrl: string | null;
  whatsappPhone: string | null;
  sports: Sport[];
  paymentMethods: string[];
  locations: ClubLocation[];
  courts: Court[];
}

interface TournamentLite {
  id: string;
  name: string;
  sport: Sport;
  status: TournamentStatus;
  startDate: string;
  endDate: string | null;
  maxTeams?: number | null;
  registrationEnd?: string | null;
}

interface ClubPublicResponse {
  club: ClubData;
  upcomingTournaments: TournamentLite[];
  inProgressTournaments: TournamentLite[];
}

async function getClub(id: string): Promise<ClubPublicResponse | null> {
  try {
    const res = await fetch(`${API}/api/public/clubs/${id}`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return (await res.json()) as ClubPublicResponse;
  } catch {
    return null;
  }
}

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = MONTHS_ES[d.getMonth()];
  return `${dd}-${mmm}-${d.getFullYear()}`;
}

const SURFACE_LABEL: Record<Surface, string> = {
  CLAY: 'Polvo de ladrillo',
  HARD: 'Cemento',
  GRASS: 'Césped',
  SYNTHETIC: 'Sintético',
  CONCRETE: 'Hormigón',
  CARPET: 'Carpeta',
};

const STATUS_LABEL: Record<TournamentStatus, string> = {
  DRAFT: 'Borrador',
  REGISTRATION: 'Inscripción abierta',
  GROUP_STAGE: 'Fase de grupos',
  ELIMINATION: 'Eliminación',
  COMPLETED: 'Finalizado',
  CANCELLED: 'Cancelado',
};

function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/[^\d]/g, '')}`;
}

function mapsHref(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getClub(params.id);
  if (!data) return { title: 'Complejo — pelotitas' };
  const { club } = data;
  const city = club.locations.find((l) => l.isMain)?.city ?? club.locations[0]?.city ?? '';
  const desc = club.description?.trim() || `Reservá canchas y conocé los torneos de ${club.name}${city ? ` en ${city}` : ''}.`;
  return {
    title: `${club.name} — pelotitas`,
    description: desc,
    openGraph: {
      title: club.name,
      description: desc,
      type: 'website',
      ...(club.imageUrl ? { images: [{ url: club.imageUrl }] } : {}),
    },
    twitter: { card: 'summary_large_image', title: club.name, description: desc },
  };
}

export default async function PublicClubLanding({ params }: { params: { id: string } }) {
  const data = await getClub(params.id);
  if (!data) notFound();

  const { club, upcomingTournaments, inProgressTournaments } = data;
  const mainLocation = club.locations.find((l) => l.isMain) ?? club.locations[0] ?? null;
  const cityBadge = mainLocation?.city ?? null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--v5-paper)', color: 'var(--v5-ink)' }}>
      {/* Top bar */}
      <header
        className="px-5 sm:px-8 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--v5-paper-2)' }}
      >
        <Link
          href="/"
          className="text-[20px] font-bold tracking-[-0.025em]"
          style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}
        >
          PELOTITAS<span style={{ color: 'var(--v5-orange)' }}>.</span>
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[12px] font-bold uppercase tracking-[0.1em]"
          style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
        >
          Crear cuenta gratis
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-full"
            style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
          >
            →
          </span>
        </Link>
      </header>

      {/* Full-bleed cover image */}
      {club.imageUrl && (
        <section className="relative w-full" style={{ height: 'clamp(280px, 42vw, 520px)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={club.imageUrl}
            alt={`${club.name} portada`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(20,16,11,0) 30%, rgba(20,16,11,0.55) 70%, rgba(20,16,11,0.92) 100%)',
            }}
          />
          <div className="absolute inset-x-0 top-0 px-5 sm:px-8 pt-6 sm:pt-8 max-w-5xl mx-auto flex justify-end">
            <OpenStatusBadge hoursWeekday={club.hoursWeekday} hoursWeekend={club.hoursWeekend} />
          </div>
          <div className="absolute inset-x-0 bottom-0 px-5 sm:px-8 pb-6 sm:pb-10 max-w-5xl mx-auto">
            <p
              className="text-[11px] font-bold uppercase tracking-[0.22em]"
              style={{ color: 'rgba(242,237,222,0.85)', fontFamily: 'var(--font-mono), monospace' }}
            >
              {[cityBadge, club.sports.map((s) => (s === 'PADEL' ? 'Padel' : 'Tenis')).join(' · ')]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <h1
              className="font-bold uppercase tracking-[-0.035em] leading-[0.9] mt-2"
              style={{
                fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                fontSize: 'clamp(40px, 7vw, 88px)',
                color: 'var(--v5-cream)',
                textShadow: '0 2px 24px rgba(0,0,0,0.45)',
              }}
            >
              {club.name}
            </h1>
          </div>
        </section>
      )}

      <div
        className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12"
        style={{ marginTop: club.imageUrl ? -64 : 0, position: 'relative' }}
      >
        {/* Hero brown card */}
        <section className="v5-hero-card relative p-6 sm:p-10 mb-10 overflow-hidden">
          <div className="flex items-start gap-5 sm:gap-7 flex-wrap">
            {club.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={club.logoUrl}
                alt={`${club.name} logo`}
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover flex-none"
                style={{ background: 'var(--v5-cream)' }}
              />
            ) : (
              <div
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center font-bold flex-none"
                style={{
                  background: 'var(--v5-orange)',
                  color: 'var(--v5-ink)',
                  fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                  fontSize: 40,
                }}
              >
                {club.name[0]?.toUpperCase() ?? 'C'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.2em]"
                style={{ color: 'rgba(242,237,222,0.65)', fontFamily: 'var(--font-mono), monospace' }}
              >
                Complejo · perfil público
              </p>
              {!club.imageUrl && (
                <h1
                  className="font-bold uppercase tracking-[-0.03em] leading-[0.92] mt-1"
                  style={{
                    fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                    fontSize: 'clamp(34px, 5vw, 56px)',
                    color: 'var(--v5-cream)',
                  }}
                >
                  {club.name}
                </h1>
              )}
              {cityBadge && !club.imageUrl && (
                <p
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.18em]"
                  style={{
                    background: 'rgba(242,237,222,0.12)',
                    color: 'var(--v5-cream)',
                    fontFamily: 'var(--font-mono), monospace',
                  }}
                >
                  📍 {cityBadge}
                </p>
              )}
              {club.description && (
                <p className={`text-[15px] ${club.imageUrl ? 'mt-2' : 'mt-4'} max-w-2xl leading-relaxed`} style={{ color: 'rgba(242,237,222,0.78)' }}>
                  {club.description}
                </p>
              )}

              {/* Sports row */}
              {club.sports.length > 0 && (
                <div className="mt-5 flex items-center gap-2 flex-wrap">
                  {club.sports.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.18em]"
                      style={{
                        background: s === 'PADEL' ? 'var(--v5-sky)' : 'var(--v5-orange)',
                        color: 'var(--v5-ink)',
                        fontFamily: 'var(--font-mono), monospace',
                      }}
                    >
                      {s === 'PADEL' ? '🎾 Padel' : '🎾 Tenis'}
                    </span>
                  ))}
                </div>
              )}

              {/* CTAs */}
              <div className="mt-7 flex items-center gap-3 flex-wrap">
                <Link
                  href={`/register?next=/clubs/${club.id}`}
                  className="inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
                  style={{ background: 'var(--v5-cream)', color: 'var(--v5-brown)' }}
                >
                  Crear cuenta para reservar
                  <span
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full"
                    style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
                  >
                    →
                  </span>
                </Link>
                {upcomingTournaments.length > 0 && (
                  <Link
                    href={`/tournaments/${upcomingTournaments[0].id}`}
                    className="inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
                    style={{
                      background: 'transparent',
                      color: 'var(--v5-cream)',
                      border: '1.5px solid rgba(242,237,222,0.35)',
                    }}
                  >
                    Anotarme a torneo
                    <span
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full"
                      style={{ background: 'var(--v5-yellow)', color: 'var(--v5-ink)' }}
                    >
                      →
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div
            className="mt-8 pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3"
            style={{ borderTop: '1px solid #5C3320' }}
          >
            {[
              { l: 'Canchas', v: club.courts.length },
              { l: 'Torneos activos', v: upcomingTournaments.length + inProgressTournaments.length },
              { l: 'Deportes', v: club.sports.length },
              { l: 'Sedes', v: club.locations.length },
            ].map((s) => (
              <div key={s.l}>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: 'rgba(242,237,222,0.55)', fontFamily: 'var(--font-mono), monospace' }}
                >
                  {s.l}
                </p>
                <p
                  className="font-bold tabular leading-none mt-1 tracking-[-0.04em]"
                  style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 32, color: 'var(--v5-cream)' }}
                >
                  {s.v}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Location */}
        {club.locations.length > 0 && (
          <Section eyebrow="Ubicación" title="Cómo llegar">
            {/* Embedded map for the main location */}
            {mainLocation?.latitude != null && mainLocation?.longitude != null && (
              <div className="mb-4 overflow-hidden" style={{ borderRadius: 28 }}>
                <iframe
                  title={`Mapa de ${mainLocation.name ?? club.name}`}
                  src={`https://maps.google.com/maps?q=${mainLocation.latitude},${mainLocation.longitude}&z=15&output=embed`}
                  className="w-full"
                  style={{ height: 320, border: 0, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              {club.locations.map((loc) => (
                <div
                  key={loc.id}
                  className="v5-card p-5 flex items-start gap-4 flex-wrap"
                  style={{ borderRadius: 24, background: 'var(--v5-card-bg)' }}
                >
                  <div className="min-w-0 flex-1">
                    {loc.name && (
                      <p
                        className="text-[11px] font-bold uppercase tracking-[0.2em]"
                        style={{
                          color: 'var(--v5-ink-2)',
                          fontFamily: 'var(--font-mono), monospace',
                        }}
                      >
                        {loc.name}{loc.isMain && ' · Sede principal'}
                      </p>
                    )}
                    <p
                      className="font-bold mt-1"
                      style={{
                        fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                        fontSize: 20,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {loc.address}
                    </p>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--v5-ink-2)' }}>
                      {[loc.city, loc.state, loc.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  {loc.latitude != null && loc.longitude != null && (
                    <a
                      href={mapsHref(loc.latitude, loc.longitude)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.15em]"
                      style={{ background: 'var(--v5-ink)', color: 'var(--v5-cream)' }}
                    >
                      Abrir en Maps
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full"
                        style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
                      >
                        →
                      </span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Contact */}
        {(club.whatsappPhone || club.instagramUrl || club.phone || club.email || club.website) && (
          <Section eyebrow="Contacto" title="Escribinos">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {club.whatsappPhone && (
                <ContactRow
                  href={whatsappHref(club.whatsappPhone)}
                  label="WhatsApp"
                  value={club.whatsappPhone}
                  external
                />
              )}
              {club.instagramUrl && (
                <ContactRow
                  href={club.instagramUrl}
                  label="Instagram"
                  value={club.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '')}
                  external
                />
              )}
              {club.phone && (
                <ContactRow href={`tel:${club.phone}`} label="Teléfono" value={club.phone} />
              )}
              {club.email && (
                <ContactRow href={`mailto:${club.email}`} label="Email" value={club.email} />
              )}
              {club.website && (
                <ContactRow href={club.website} label="Web" value={club.website} external />
              )}
            </div>
          </Section>
        )}

        {/* Hours */}
        {(club.hoursWeekday || club.hoursWeekend) && (
          <Section eyebrow="Horarios" title="Cuándo se juega">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {club.hoursWeekday && (
                <div className="v5-card v5-card-lime p-6" style={{ borderRadius: 28 }}>
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.2em]"
                    style={{ fontFamily: 'var(--font-mono), monospace', opacity: 0.7 }}
                  >
                    Lunes a viernes
                  </p>
                  <p
                    className="font-bold mt-1"
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: 26,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {club.hoursWeekday}
                  </p>
                </div>
              )}
              {club.hoursWeekend && (
                <div
                  className="v5-card p-6"
                  style={{
                    borderRadius: 28,
                    background: 'var(--v5-pink)',
                    color: 'var(--v5-brown)',
                    border: 'none',
                  }}
                >
                  <p
                    className="text-[11px] font-bold uppercase tracking-[0.2em]"
                    style={{ fontFamily: 'var(--font-mono), monospace', opacity: 0.7 }}
                  >
                    Sábados y domingos
                  </p>
                  <p
                    className="font-bold mt-1"
                    style={{
                      fontFamily: 'var(--font-mono), monospace',
                      fontSize: 26,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {club.hoursWeekend}
                  </p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Amenities */}
        {club.amenities.length > 0 && (
          <Section eyebrow="Servicios" title="Qué vas a encontrar">
            <div className="flex flex-wrap gap-2">
              {club.amenities.map((a) => (
                <span
                  key={a}
                  className="px-3 py-2 rounded-full text-[12px] font-bold"
                  style={{
                    background: 'var(--v5-cream)',
                    color: 'var(--v5-brown)',
                    border: '1px solid var(--v5-paper-2)',
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Courts */}
        {club.courts.length > 0 && (
          <Section eyebrow={`${club.courts.length} canchas`} title="Las canchas">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {club.courts.map((c) => (
                <div
                  key={c.id}
                  className="v5-card p-5"
                  style={{ borderRadius: 24, background: 'var(--v5-card-bg)' }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
                      style={{
                        background: c.sport === 'PADEL' ? 'var(--v5-sky)' : 'var(--v5-orange)',
                        color: 'var(--v5-ink)',
                        fontFamily: 'var(--font-mono), monospace',
                      }}
                    >
                      {c.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                    </span>
                    {c.hasLighting && (
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
                        style={{
                          background: 'var(--v5-yellow)',
                          color: 'var(--v5-ink)',
                          fontFamily: 'var(--font-mono), monospace',
                        }}
                      >
                        🌙 Luz
                      </span>
                    )}
                  </div>
                  <h3
                    className="font-bold mt-3 leading-tight"
                    style={{
                      fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                      fontSize: 22,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {c.name}
                  </h3>
                  <p
                    className="text-[12px] mt-2"
                    style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
                  >
                    {SURFACE_LABEL[c.surface]} · {c.courtType === 'INDOOR' ? 'Techada' : 'Al aire libre'}
                  </p>
                  <div
                    className="mt-4 pt-4"
                    style={{ borderTop: '1px solid var(--v5-paper-2)' }}
                  >
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
                    >
                      Bloque de {c.blockDuration} min
                    </p>
                    <p
                      className="font-bold mt-1"
                      style={{
                        fontFamily: 'var(--font-mono), monospace',
                        fontSize: 24,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      ${Number(c.pricePerBlock).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Upcoming tournaments */}
        {upcomingTournaments.length > 0 && (
          <Section eyebrow="Torneos próximos" title="Anotate antes que se llene">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingTournaments.map((t) => (
                <Link
                  key={t.id}
                  href={`/tournaments/${t.id}`}
                  className="v5-card v5-card-lime p-6 block"
                  style={{ borderRadius: 28 }}
                >
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{
                        background: 'var(--v5-ink)',
                        color: 'var(--v5-cream)',
                        fontFamily: 'var(--font-mono), monospace',
                      }}
                    >
                      {STATUS_LABEL[t.status]}
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
                      style={{
                        background: 'rgba(46,59,10,0.18)',
                        color: 'var(--v5-lime-ink)',
                        fontFamily: 'var(--font-mono), monospace',
                      }}
                    >
                      {t.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                    </span>
                  </div>
                  <h3
                    className="font-bold leading-tight"
                    style={{
                      fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                      fontSize: 24,
                      letterSpacing: '-0.025em',
                    }}
                  >
                    {t.name}
                  </h3>
                  <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                    <p
                      className="text-[12px] font-bold uppercase tracking-[0.18em]"
                      style={{ fontFamily: 'var(--font-mono), monospace' }}
                    >
                      Arranca {fmtDate(t.startDate)}
                    </p>
                    {t.maxTeams != null && (
                      <p
                        className="text-[11px] font-bold uppercase tracking-[0.18em]"
                        style={{ fontFamily: 'var(--font-mono), monospace', opacity: 0.7 }}
                      >
                        {t.maxTeams} equipos
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* In progress tournaments */}
        {inProgressTournaments.length > 0 && (
          <Section eyebrow="En curso" title="Torneos jugándose ahora">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inProgressTournaments.map((t) => (
                <Link
                  key={t.id}
                  href={`/tournaments/${t.id}`}
                  className="v5-card v5-card-red p-6 block"
                  style={{ borderRadius: 28 }}
                >
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{
                        background: 'rgba(255,255,255,0.18)',
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-mono), monospace',
                      }}
                    >
                      ● {STATUS_LABEL[t.status]}
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
                      style={{
                        background: 'rgba(255,255,255,0.18)',
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-mono), monospace',
                      }}
                    >
                      {t.sport === 'PADEL' ? 'Padel' : 'Tenis'}
                    </span>
                  </div>
                  <h3
                    className="font-bold leading-tight"
                    style={{
                      fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
                      fontSize: 24,
                      letterSpacing: '-0.025em',
                    }}
                  >
                    {t.name}
                  </h3>
                  <p
                    className="text-[12px] font-bold uppercase tracking-[0.18em] mt-4 inline-flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-mono), monospace' }}
                  >
                    Ver fixture
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full"
                      style={{ background: '#FFFFFF', color: 'var(--v5-red)' }}
                    >
                      →
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Gallery — featured + grid */}
        {club.galleryUrls.length > 0 && (
          <Section eyebrow="Galería" title="El complejo en imágenes">
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={club.galleryUrls[0]}
                alt={`${club.name} foto destacada`}
                className="w-full h-full object-cover"
                style={{ borderRadius: 28, background: 'var(--v5-paper-2)', gridRow: 'span 2', minHeight: 320, aspectRatio: '4 / 5' }}
              />
              {club.galleryUrls.slice(1, 5).map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${url}-${i}`}
                  src={url}
                  alt={`${club.name} foto ${i + 2}`}
                  className="w-full aspect-[4/3] object-cover"
                  style={{ borderRadius: 22, background: 'var(--v5-paper-2)' }}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Video */}
        {club.videoUrl && (
          <Section eyebrow="Video" title="Conocé el lugar">
            <video
              controls
              src={club.videoUrl}
              poster={club.imageUrl ?? club.galleryUrls[0]}
              preload="metadata"
              className="w-full"
              style={{ borderRadius: 28, background: 'var(--v5-ink)', maxHeight: 540 }}
            />
          </Section>
        )}

        {/* Footer CTA */}
        <div
          className="mt-12 pt-8 text-center"
          style={{ borderTop: '1px solid var(--v5-paper-2)' }}
        >
          <p
            className="text-[12px] font-bold uppercase tracking-[0.18em]"
            style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
          >
            Tu club, tus torneos, tu juego — en pelotitas
          </p>
          <Link
            href="/register"
            className="mt-4 inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
            style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
          >
            Crear cuenta gratis
            <span
              className="inline-flex items-center justify-center w-9 h-9 rounded-full"
              style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
            >
              →
            </span>
          </Link>
          <div className="mt-6">
            <Link
              href="/"
              className="text-[12px] font-bold uppercase tracking-[0.18em]"
              style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
            >
              ← Volver a pelotitas
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA — leaves desktop alone */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 md:hidden px-3 pt-3 flex items-center gap-2"
        style={{
          background: 'rgba(244,239,230,0.94)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--v5-paper-2)',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        {club.whatsappPhone && (
          <a
            href={whatsappHref(club.whatsappPhone)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center h-12 w-12 rounded-full flex-none"
            style={{ background: '#25D366', color: '#FFFFFF', fontSize: 22 }}
            aria-label="WhatsApp"
          >
            ✉
          </a>
        )}
        <Link
          href={`/register?next=/clubs/${club.id}`}
          className="flex-1 inline-flex items-center justify-between pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
          style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
        >
          Reservar cancha
          <span
            className="inline-flex items-center justify-center w-10 h-10 rounded-full"
            style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
          >
            →
          </span>
        </Link>
      </div>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
        >
          {eyebrow}
        </p>
        <h2
          className="font-bold mt-1"
          style={{
            fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
            fontSize: 'clamp(24px, 3.5vw, 36px)',
            letterSpacing: '-0.025em',
            lineHeight: 1,
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function ContactRow({
  href,
  label,
  value,
  external,
}: {
  href: string;
  label: string;
  value: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className="v5-card p-4 flex items-center justify-between gap-3"
      style={{ borderRadius: 22, background: 'var(--v5-card-bg)' }}
    >
      <div className="min-w-0">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.22em]"
          style={{ color: 'var(--v5-ink-2)', fontFamily: 'var(--font-mono), monospace' }}
        >
          {label}
        </p>
        <p className="text-[14px] font-bold mt-0.5 truncate">{value}</p>
      </div>
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-full flex-none"
        style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
      >
        →
      </span>
    </a>
  );
}
