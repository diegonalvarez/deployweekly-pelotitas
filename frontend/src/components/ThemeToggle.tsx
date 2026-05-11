'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

/** Toggles `html.v5-dark` and persists choice in localStorage. */
export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('v5-dark'));
  }, []);

  const apply = (val: boolean) => {
    setDark(val);
    const root = document.documentElement;
    root.classList.toggle('v5-dark', val);
    try { sessionStorage.setItem('v5-theme', val ? 'dark' : 'light'); } catch {}
  };

  if (!mounted) {
    // Avoid hydration mismatch — render a placeholder same size
    return <span className="inline-flex items-center justify-center w-10 h-10 rounded-full" aria-hidden style={{ border: '1px solid var(--v5-paper-2)' }} />;
  }

  if (compact) {
    return (
      <button
        onClick={() => apply(!dark)}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors"
        style={{ border: '1px solid var(--v5-paper-2)', color: 'var(--v5-ink)', background: 'var(--v5-card-bg)' }}
        aria-label={dark ? 'Modo claro' : 'Modo oscuro'}
        title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={() => apply(!dark)}
      className="inline-flex items-center gap-2 px-3 h-9 rounded-full text-[12px] font-bold uppercase tracking-[0.1em]"
      style={{ border: '1px solid var(--v5-paper-2)', color: 'var(--v5-ink)', background: 'var(--v5-card-bg)' }}
    >
      {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      {dark ? 'Claro' : 'Oscuro'}
    </button>
  );
}
