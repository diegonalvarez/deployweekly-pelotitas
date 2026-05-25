'use client';

import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function LeadForm() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [clubName, setClubName] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMsg(null);
    try {
      const res = await fetch(`${API}/api/public/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim() || undefined,
          fullName: fullName.trim() || undefined,
          clubName: clubName.trim() || undefined,
          comment: comment.trim() || undefined,
          source: 'brochure',
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || `Error ${res.status}`);
      }
      setStatus('sent');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'No pudimos guardar tus datos. Probá de nuevo.');
    }
  };

  if (status === 'sent') {
    return (
      <div
        className="p-8 sm:p-10 text-center"
        style={{
          background: 'var(--v5-card-bg)',
          border: '1px solid var(--v5-paper-2)',
          borderRadius: 28,
        }}
      >
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl"
          style={{ background: 'var(--v5-lime)', color: 'var(--v5-lime-ink)' }}
        >
          ✓
        </div>
        <h3
          className="font-bold mb-2"
          style={{
            fontFamily: 'var(--font-display), Space Grotesk, sans-serif',
            fontSize: 26,
            letterSpacing: '-0.02em',
          }}
        >
          ¡Recibido!
        </h3>
        <p className="text-[14px] mb-6 max-w-md mx-auto" style={{ color: 'var(--v5-ink-2)' }}>
          Te vamos a contactar en menos de 24hs hábiles para coordinar una demo personalizada.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
          style={{ background: 'var(--v5-brown)', color: 'var(--v5-cream)' }}
        >
          Conocer la app
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-full"
            style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
          >
            →
          </span>
        </Link>
      </div>
    );
  }

  const labelClass =
    'text-[10px] font-bold uppercase tracking-[0.22em] mb-1.5 inline-block';
  const labelStyle: React.CSSProperties = {
    color: 'var(--v5-ink-2)',
    fontFamily: 'var(--font-mono), monospace',
  };
  const fieldClass = 'w-full px-4 py-3 outline-none text-[14px]';
  const fieldStyle: React.CSSProperties = {
    background: 'var(--v5-paper)',
    color: 'var(--v5-ink)',
    border: '1px solid var(--v5-paper-2)',
    borderRadius: 16,
    fontFamily: 'var(--font-sans), Inter, sans-serif',
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8"
      style={{
        background: 'var(--v5-card-bg)',
        border: '1px solid var(--v5-paper-2)',
        borderRadius: 28,
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={labelStyle}>
            Nombre
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={fieldClass}
            style={fieldStyle}
            placeholder="Diego Álvarez"
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>
            Club / Complejo
          </label>
          <input
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            className={fieldClass}
            style={fieldStyle}
            placeholder="Club Norte Padel"
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>
            Email <span style={{ color: 'var(--v5-red)' }}>*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            style={fieldStyle}
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>
            Teléfono / WhatsApp
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldClass}
            style={fieldStyle}
            placeholder="+54 9 11 1234 5678"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className={labelClass} style={labelStyle}>
          ¿Hay alguna funcionalidad que te gustaría que sumemos?
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className={fieldClass}
          style={{ ...fieldStyle, resize: 'vertical', minHeight: 110 }}
          placeholder="Contanos qué necesitás — pagos, integraciones, reportes…"
        />
      </div>

      {errorMsg && (
        <p
          className="mt-4 text-[12px] font-bold"
          style={{ color: 'var(--v5-red)', fontFamily: 'var(--font-mono), monospace' }}
        >
          {errorMsg}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3 flex-wrap">
        <p
          className="text-[11px] tracking-[0.05em] max-w-xs"
          style={{ color: 'var(--v5-ink-2)' }}
        >
          No spameamos. Te llamamos / escribimos por WhatsApp para coordinar una demo.
        </p>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center gap-2 pl-5 pr-1 py-1 rounded-full text-[13px] font-bold uppercase tracking-[0.1em]"
          style={{
            background: 'var(--v5-brown)',
            color: 'var(--v5-cream)',
            opacity: status === 'sending' ? 0.6 : 1,
          }}
        >
          {status === 'sending' ? 'Enviando…' : 'Quiero la demo'}
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-full"
            style={{ background: 'var(--v5-orange)', color: 'var(--v5-ink)' }}
          >
            →
          </span>
        </button>
      </div>
    </form>
  );
}
