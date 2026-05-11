'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { registerPush, isNativeApp } from '@/lib/native';

/**
 * Mounts inside the auth provider tree. Once a user is logged in AND
 * we're running inside the Capacitor native shell, asks for push
 * permission and reports the resulting APNs/FCM token to the backend.
 *
 * No-op on plain web (Web Push is not handled yet — fall through).
 */
export default function PushRegistrar() {
  const { user } = useAuth();
  const triedRef = useRef(false);

  useEffect(() => {
    if (!user || triedRef.current || !isNativeApp()) return;
    triedRef.current = true;

    (async () => {
      try {
        const token = await registerPush();
        if (!token) return;
        const platform =
          typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
            ? 'ANDROID'
            : 'IOS';
        await api.post('/push/register', { platform, token });
      } catch {
        /* silently fail — push is non-critical */
      }
    })();
  }, [user]);

  return null;
}
