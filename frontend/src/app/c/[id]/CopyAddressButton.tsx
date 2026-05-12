'use client';

import { useState } from 'react';

export default function CopyAddressButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for older browsers / non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = address;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 pl-4 pr-1 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.15em]"
      style={{
        background: copied ? 'var(--v5-lime)' : 'var(--v5-cream)',
        color: copied ? 'var(--v5-lime-ink)' : 'var(--v5-brown)',
        border: '1px solid var(--v5-paper-2)',
      }}
    >
      {copied ? '¡Copiada!' : 'Copiar dirección'}
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-full"
        style={{
          background: copied ? 'var(--v5-lime-ink)' : 'var(--v5-brown)',
          color: copied ? 'var(--v5-lime)' : 'var(--v5-cream)',
        }}
      >
        {copied ? '✓' : '⧉'}
      </span>
    </button>
  );
}
