'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import PhoneInput from '@/components/PhoneInput';
import { isValidE164 } from '@/lib/location';

const PAYMENT_METHODS = ['Efectivo', 'Transferencia', 'MercadoPago', 'Tarjeta'];

const RESERVATION_MODES = [
  { value: 'OPEN', label: 'Abierto', description: 'Cualquier usuario verificado puede reservar' },
  { value: 'CONNECTED_ONLY', label: 'Solo conectados', description: 'Solo usuarios que envian solicitud y son aceptados' },
];

const COMMON_AMENITIES = [
  'Estacionamiento gratuito',
  'Vestuarios + duchas',
  'Bar / cantina',
  'Pro shop',
  'WiFi gratuita',
  'Iluminación LED',
  'Alquiler de palas',
  'Profesores certificados',
  'Cordaje de raquetas',
  'Zona kids',
  'Pileta',
  'SUM / eventos',
  'Acceso para discapacitados',
];

interface ClubData {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  sports: string[];
  paymentMethods: string[];
  reservationMode: string;
  isActive: boolean;
}

export default function ClubSettingsPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [reservationMode, setReservationMode] = useState('OPEN');
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  // Landing fields
  const [logoUrl, setLogoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryDraft, setGalleryDraft] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityDraft, setAmenityDraft] = useState('');
  const [hoursWeekday, setHoursWeekday] = useState('');
  const [hoursWeekend, setHoursWeekend] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  // Country of the club's main location — used so PhoneInput defaults
  // to the right dial code when the user hasn't yet entered a phone.
  const [clubCountry, setClubCountry] = useState<string>('Argentina');

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  }, [user, authLoading, router]);

  // Fetch club data
  const fetchClub = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const data = await api.get<any>(`/clubs/${clubId}`);
      setClub(data);
      setName(data.name || '');
      setDescription(data.description || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setWebsite(data.website || '');
      setReservationMode(data.reservationMode || 'OPEN');
      setPaymentMethods(data.paymentMethods || []);
      setSports(data.sports || []);
      setLogoUrl(data.logoUrl || '');
      setImageUrl(data.imageUrl || '');
      setGalleryUrls(data.galleryUrls || []);
      setVideoUrl(data.videoUrl || '');
      setAmenities(data.amenities || []);
      setHoursWeekday(data.hoursWeekday || '');
      setHoursWeekend(data.hoursWeekend || '');
      setInstagramUrl(data.instagramUrl || '');
      setWhatsappPhone(data.whatsappPhone || '');
      const mainLoc = data.locations?.find((l: any) => l.isMain) || data.locations?.[0];
      if (mainLoc?.country) setClubCountry(mainLoc.country);
    } catch (err: any) {
      toast.error(err.message || 'Error al cargar datos del complejo');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (user && clubId) fetchClub();
  }, [user, clubId, fetchClub]);

  const togglePayment = (method: string) => {
    setPaymentMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

  const toggleSport = (sport: string) => {
    setSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (sports.length === 0) {
      toast.error('Selecciona al menos un deporte');
      return;
    }
    if (phone && !isValidE164(phone)) {
      toast.error('Revisá el celular del complejo');
      return;
    }

    if (whatsappPhone && !isValidE164(whatsappPhone)) {
      toast.error('Revisá el número de WhatsApp');
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/clubs/${clubId}`, {
        name: name.trim(),
        description: description.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        reservationMode,
        paymentMethods,
        sports,
        logoUrl: logoUrl.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        galleryUrls: galleryUrls.filter((u) => u.trim()),
        videoUrl: videoUrl.trim() || undefined,
        amenities,
        hoursWeekday: hoursWeekday.trim() || undefined,
        hoursWeekend: hoursWeekend.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        whatsappPhone: whatsappPhone.trim() || undefined,
      });
      toast.success('Configuracion guardada');
      fetchClub();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const addGalleryUrl = () => {
    const v = galleryDraft.trim();
    if (!v) return;
    setGalleryUrls((prev) => [...prev, v]);
    setGalleryDraft('');
  };
  const removeGalleryAt = (i: number) =>
    setGalleryUrls((prev) => prev.filter((_, idx) => idx !== i));
  const toggleAmenity = (a: string) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  const addCustomAmenity = () => {
    const v = amenityDraft.trim();
    if (!v || amenities.includes(v)) return;
    setAmenities((prev) => [...prev, v]);
    setAmenityDraft('');
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await api.patch(`/clubs/${clubId}`, { isActive: false });
      toast.success('Complejo marcado como inactivo');
      setShowDeactivateConfirm(false);
      router.push('/dashboard/club');
    } catch (err: any) {
      toast.error(err.message || 'Error al desactivar');
    } finally {
      setDeactivating(false);
    }
  };

  // Loading state
  if (authLoading || !user || loading) {
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

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-10">
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
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <svg className="w-8 h-8 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuracion
          </h1>
          {club && (
            <p className="text-text-muted text-sm mt-1">{club.name}</p>
          )}
        </div>

        {/* General info */}
        <div className="card-elevated mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informacion general
          </h2>

          <div className="space-y-5">
            <div>
              <label className="label">
                Nombre del complejo <span className="text-negative">*</span>
              </label>
              <input
                className="input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Club Padel Centro"
              />
            </div>

            <div>
              <label className="label">Descripcion</label>
              <textarea
                className="input min-h-[100px] resize-y"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Contanos sobre tu complejo, instalaciones, horarios..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Celular</label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  defaultCountryName={clubCountry}
                  placeholder="11 1234 5678"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contacto@club.com"
                />
              </div>
            </div>

            <div>
              <label className="label">Sitio web</label>
              <input
                className="input"
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://miclub.com"
              />
            </div>
          </div>
        </div>

        {/* Imágenes y multimedia */}
        <div className="card-elevated mb-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Imágenes y video
          </h2>
          <p className="text-text-muted text-xs mb-5">
            Pegá URLs de imágenes (Unsplash, tu CDN, etc.) y un video opcional. Se ven en la landing pública del complejo.
          </p>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Logo (URL)</label>
                <input
                  className="input"
                  type="url"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                />
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo preview" className="mt-2 w-20 h-20 rounded-xl object-cover border border-border-dark" />
                )}
              </div>
              <div>
                <label className="label">Foto principal / portada (URL)</label>
                <input
                  className="input"
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Hero preview" className="mt-2 w-full aspect-[16/9] rounded-xl object-cover border border-border-dark" />
                )}
              </div>
            </div>

            <div>
              <label className="label">Galería (URLs)</label>
              <div className="flex gap-2 mb-3">
                <input
                  className="input flex-1"
                  type="url"
                  value={galleryDraft}
                  onChange={e => setGalleryDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGalleryUrl(); } }}
                  placeholder="https://..."
                />
                <button type="button" onClick={addGalleryUrl} className="btn-secondary shrink-0">
                  Agregar
                </button>
              </div>
              {galleryUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {galleryUrls.map((url, i) => (
                    <div key={`${url}-${i}`} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Galería ${i + 1}`} className="w-full aspect-square rounded-lg object-cover border border-border-dark" />
                      <button
                        type="button"
                        onClick={() => removeGalleryAt(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-negative/90 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label">Video (URL MP4)</label>
              <input
                className="input"
                type="url"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://.../video.mp4"
              />
              {videoUrl && (
                <video src={videoUrl} controls className="mt-2 w-full max-h-60 rounded-xl bg-black" />
              )}
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="card-elevated mb-6 animate-fade-in-up" style={{ animationDelay: '175ms' }}>
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Horarios
          </h2>
          <p className="text-text-muted text-xs mb-5">Formato libre, por ejemplo <code>08:00 — 23:30</code></p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Lunes a viernes</label>
              <input
                className="input"
                value={hoursWeekday}
                onChange={e => setHoursWeekday(e.target.value)}
                placeholder="08:00 — 23:30"
              />
            </div>
            <div>
              <label className="label">Sábados y domingos</label>
              <input
                className="input"
                value={hoursWeekend}
                onChange={e => setHoursWeekend(e.target.value)}
                placeholder="08:00 — 22:00"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="card-elevated mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-padel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Servicios y amenidades
          </h2>
          <p className="text-text-muted text-xs mb-5">Tocá para activar/desactivar. Sumá los tuyos abajo.</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from(new Set([...COMMON_AMENITIES, ...amenities])).map((a) => {
              const isSelected = amenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-4 py-2 rounded-full text-sm transition-all border ${
                    isSelected
                      ? 'bg-brand/15 text-brand border-brand/30'
                      : 'bg-surface-light text-text-secondary border-border-dark hover:border-border-default'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {a}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={amenityDraft}
              onChange={e => setAmenityDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity(); } }}
              placeholder="Agregar otro servicio…"
            />
            <button type="button" onClick={addCustomAmenity} className="btn-secondary shrink-0">
              Agregar
            </button>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="card-elevated mb-6 animate-fade-in-up" style={{ animationDelay: '225ms' }}>
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Redes y WhatsApp
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="label">Instagram (URL)</label>
              <input
                className="input"
                type="url"
                value={instagramUrl}
                onChange={e => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/tuclub"
              />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <PhoneInput
                value={whatsappPhone}
                onChange={setWhatsappPhone}
                defaultCountryName={clubCountry}
                placeholder="11 1234 5678"
              />
            </div>
          </div>
        </div>

        {/* Reservation mode */}
        <div className="card-elevated mb-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-padel" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Modo de reserva
          </h2>

          <div className="space-y-3">
            {RESERVATION_MODES.map(mode => {
              const isSelected = reservationMode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setReservationMode(mode.value)}
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

        {/* Payment methods */}
        <div className="card-elevated mb-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Formas de pago
          </h2>

          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map(method => {
              const isSelected = paymentMethods.includes(method);
              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => togglePayment(method)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border ${
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
          {paymentMethods.length === 0 && (
            <p className="text-xs text-text-muted mt-3">No seleccionaste ninguna forma de pago</p>
          )}
        </div>

        {/* Sports */}
        <div className="card-elevated mb-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
            </svg>
            Deportes
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'PADEL', label: 'Padel', icon: '🏸', color: 'padel' },
              { key: 'TENNIS', label: 'Tenis', icon: '🎾', color: 'brand' },
            ].map(sport => {
              const isSelected = sports.includes(sport.key);
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
          {sports.length === 0 && (
            <p className="text-negative text-xs mt-3">Selecciona al menos un deporte</p>
          )}
        </div>

        {/* Save button */}
        <div className="flex justify-end mb-12 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Guardar cambios
              </>
            )}
          </button>
        </div>

        {/* Danger zone */}
        <div className="card-elevated border border-negative/20 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <h2 className="text-lg font-bold text-negative mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Zona peligrosa
          </h2>
          <p className="text-text-muted text-sm mb-4">
            Las acciones en esta seccion son irreversibles. Procede con cuidado.
          </p>

          {!showDeactivateConfirm ? (
            <button
              onClick={() => setShowDeactivateConfirm(true)}
              className="btn-danger text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Marcar como inactivo
            </button>
          ) : (
            <div className="p-4 bg-negative/5 rounded-xl border border-negative/20">
              <p className="text-sm text-white font-medium mb-1">
                Estas seguro que queres desactivar este complejo?
              </p>
              <p className="text-xs text-text-muted mb-4">
                El complejo dejara de ser visible y no se podran hacer nuevas reservas.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeactivate}
                  disabled={deactivating}
                  className="btn-danger text-sm"
                >
                  {deactivating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Desactivando...
                    </>
                  ) : (
                    'Si, desactivar'
                  )}
                </button>
                <button
                  onClick={() => setShowDeactivateConfirm(false)}
                  className="btn-ghost text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
