'use client';

/* ─────────────────────────────────────────────────────────────
   Native-feel utilities — work as PWA on phones AND inside the
   Capacitor native shell. When running in Capacitor we use the
   plugin (real native APIs); on the web we fall back to standard
   web APIs. This keeps a single import surface for the app code.
   ───────────────────────────────────────────────────────────── */

import { Capacitor } from '@capacitor/core';

const isNative = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

/* ─── Haptics ─────────────────────────────────────────────────
   On native, uses Apple/Android Taptic engines via @capacitor/haptics.
   On web, uses the Vibration API where available.            */

export async function hapticLight() {
  try {
    if (isNative()) {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      await Haptics.impact({ style: ImpactStyle.Light });
      return;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10);
  } catch { /* ignore */ }
}

export async function hapticMedium() {
  try {
    if (isNative()) {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      await Haptics.impact({ style: ImpactStyle.Medium });
      return;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(24);
  } catch { /* ignore */ }
}

export async function hapticError() {
  try {
    if (isNative()) {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      await Haptics.notification({ type: NotificationType.Error });
      return;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([12, 40, 12]);
  } catch { /* ignore */ }
}

export async function hapticSuccess() {
  try {
    if (isNative()) {
      const { Haptics, NotificationType } = await import('@capacitor/haptics');
      await Haptics.notification({ type: NotificationType.Success });
      return;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate([8, 30, 8]);
  } catch { /* ignore */ }
}

/* ─── Share ───────────────────────────────────────────────── */

export async function share(opts: { title?: string; text?: string; url: string }):
  Promise<'shared' | 'copied' | 'cancelled' | 'unsupported'> {
  try {
    if (isNative()) {
      const { Share } = await import('@capacitor/share');
      await Share.share(opts);
      return 'shared';
    }
    // @ts-ignore — Web Share API
    if (typeof navigator !== 'undefined' && navigator.share) {
      // @ts-ignore
      await navigator.share(opts);
      return 'shared';
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(opts.url);
      return 'copied';
    }
    return 'unsupported';
  } catch (err: any) {
    if (err?.name === 'AbortError' || /canceled/i.test(err?.message || '')) return 'cancelled';
    return 'unsupported';
  }
}

/* ─── Camera ──────────────────────────────────────────────── */

/** Pick a photo from the camera or library. Returns base64 dataUrl
 *  ready to <img src=...> or upload as a blob. Returns null if cancelled. */
export async function pickPhoto(opts: { source?: 'CAMERA' | 'PHOTOS' | 'PROMPT' } = {}):
  Promise<string | null> {
  try {
    if (isNative()) {
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      const sourceMap = {
        CAMERA: CameraSource.Camera,
        PHOTOS: CameraSource.Photos,
        PROMPT: CameraSource.Prompt,
      };
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: sourceMap[opts.source || 'PROMPT'],
      });
      return photo.dataUrl ?? null;
    }
    // Web fallback — use file input
    return await pickPhotoWeb();
  } catch (err: any) {
    if (/cancel/i.test(err?.message || '')) return null;
    throw err;
  }
}

function pickPhotoWeb(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/* ─── Push notifications ──────────────────────────────────── */

export type PushPermission = 'granted' | 'denied' | 'prompt' | 'unsupported';

export async function checkPushPermission(): Promise<PushPermission> {
  if (!isNative()) return 'unsupported';
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const status = await PushNotifications.checkPermissions();
    return status.receive as PushPermission;
  } catch { return 'unsupported'; }
}

/** Ask the OS for push permission and register. Returns the device token
 *  (FCM/APNS) on success; the caller should send it to the backend. */
export async function registerPush(): Promise<string | null> {
  if (!isNative()) return null;
  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== 'granted') return null;

    return new Promise<string | null>(async (resolve) => {
      const tokenSub = await PushNotifications.addListener('registration', (token) => {
        resolve(token.value);
        tokenSub.remove();
      });
      const errSub = await PushNotifications.addListener('registrationError', () => {
        resolve(null);
        errSub.remove();
      });
      await PushNotifications.register();
    });
  } catch { return null; }
}

/* ─── Native preferences (encrypted on iOS Keychain on Android) ─── */

export async function prefSet(key: string, value: string): Promise<void> {
  try {
    if (isNative()) {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({ key, value });
      return;
    }
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch { /* ignore */ }
}

export async function prefGet(key: string): Promise<string | null> {
  try {
    if (isNative()) {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key });
      return value;
    }
    if (typeof window !== 'undefined') return window.localStorage.getItem(key);
    return null;
  } catch { return null; }
}

/* ─── Status bar / splash screen ──────────────────────────── */

export async function styleStatusBarDark(): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0A0E14' });
  } catch { /* ignore */ }
}

export async function hideSplash(): Promise<void> {
  if (!isNative()) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch { /* ignore */ }
}

/* ─── Detection helpers ──────────────────────────────────── */

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (isNative()) return true;
  // @ts-ignore — iOS Safari
  if (window.navigator.standalone === true) return true;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  return false;
}

export function isNativeApp(): boolean {
  return isNative();
}

export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(max-width: 767px)').matches ?? false;
}
