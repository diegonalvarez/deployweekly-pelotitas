# Pelotitas — Padel & Tenis OS

Plataforma para padel y tenis: reservas, torneos, anotador en vivo, ranking, comunidad. **Single codebase web + iOS + Android**.

```
backend/    NestJS + Prisma + PostgreSQL
frontend/   Next.js 14 + Tailwind + Capacitor (web → iOS/Android)
docs/       knowledge base — leer antes de tocar código
docker-compose.yml   stack de dev
Makefile    atajos comunes
```

---

## Tabla de contenidos

- [1. Setup local (primera vez)](#1-setup-local-primera-vez)
- [2. Día a día — atajos `make`](#2-día-a-día--atajos-make)
- [3. Probar en el teléfono fácil](#3-probar-en-el-teléfono-fácil)
- [4. App nativa (Capacitor)](#4-app-nativa-capacitor)
- [5. Publicar en Play Store](#5-publicar-en-play-store)
- [6. Publicar en App Store](#6-publicar-en-app-store)
- [7. Producción web (deploy)](#7-producción-web-deploy)
- [8. Troubleshooting](#8-troubleshooting)

---

## 1. Setup local (primera vez)

Necesitás:
- Docker Desktop
- Node 20+ (sólo para correr Capacitor CLI; el frontend corre en Docker)
- (Opcional Mobile) Xcode 15+ para iOS, Android Studio para Android

```bash
git clone <tu-repo> pelotitas
cd pelotitas

# Setup completo en un comando: instala deps en host + container, levanta stack
make install

# Si no tenés Make:
docker compose up -d --build
cd frontend && npm install --legacy-peer-deps && cd ..
cd backend  && npm install                       && cd ..
```

URLs después de levantar:
- **Frontend** → http://localhost:3098 (también `http://0.0.0.0:3098`)
- **Backend** → http://localhost:3099 — Swagger docs en `/api/docs`
- **Postgres** → `localhost:5477` (user/pass `pelotitas`/`pelotitas`)

Verificación:

```bash
make verify
# Debe mostrar:
#   Frontend  http://localhost:3098 → 200
#   Backend   http://localhost:3099 → 200
#   @capacitor/core: 7.6.4
```

### Variables de entorno

Creá `.env` en la raíz del proyecto si querés override:

```bash
# Mínimo
POSTGRES_USER=pelotitas
POSTGRES_PASSWORD=pelotitas
POSTGRES_DB=pelotitas
JWT_SECRET=dev-jwt-secret-change-me
JWT_REFRESH_SECRET=dev-refresh-secret-change-me

# Stripe (si querés activar billing — sin esto el resto sigue funcionando)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3098
```

### Primera migración de DB

```bash
make migrate NAME=initial
# o manual:
docker compose exec backend npx prisma migrate dev --name initial
```

---

## 2. Día a día — atajos `make`

```bash
make help                # listar todos los atajos

# Lifecycle
make up                  # levantar stack
make down                # bajar stack
make restart             # reiniciar sin rebuild
make logs                # tail logs todos
make front-logs          # tail solo frontend
make back-logs           # tail solo backend

# Dependencias (instala en host Y container)
make install-front PKG=lucide-react
make install-back  PKG=@nestjs/cache-manager

# Sólo sincronizar (cuando ya hiciste npm install en host)
make sync-front
make sync-back

# Rebuilds
make rebuild             # rebuild ambas imágenes
make rebuild-front       # solo frontend
make nuke                # borra TODO incluido DB (cuidado)

# Database
make migrate NAME=add_users     # nueva migration
make generate                   # regenerar prisma client
make seed                       # correr seeders

# Shells
make shell-front         # bash en container frontend
make shell-back
make shell-db            # psql

# Health check
make verify              # confirma stack saludable
```

### Por qué un Makefile (lección aprendida)

Docker monta `node_modules` como **volumen separado** del host (mac arm64 ≠ container linux). Si hacés `npm install` sólo en host, el container queda atrás y rompe el build con `Module not found`. Los targets `install-front` / `install-back` instalan en ambos lugares en una sola línea.

---

## 3. Probar en el teléfono fácil

Tres caminos, de menos a más nativo:

### A. PWA en tu celular (cero setup, vive ya)

1. Asegurate que tu celular y compu estén en la **misma red WiFi**
2. Conseguí tu LAN IP: `ipconfig getifaddr en0` (mac) → algo como `192.168.1.42`
3. En el celular, abrí Safari (iOS) o Chrome (Android) → `http://192.168.1.42:3098`
4. Instalar:
   - **iOS**: Compartir → "Agregar a inicio"
   - **Android**: menú ⋮ → "Instalar app"

La app abre standalone (sin chrome del browser), tiene icono propio, splash, shortcuts. Soporta offline para el shell. Es indistinguible de una app nativa para el 95% de los usos.

### B. Mobile preview en Chrome DevTools (sin celular)

```bash
# Abrí http://localhost:3098 en Chrome
# DevTools (⌘+Option+I)
# Click "Toggle device toolbar" (⌘+Shift+M)
# Elegí "iPhone 14 Pro" o "Pixel 7"
```

Para probar PWA install:
- DevTools → Application → Manifest → "Install"
- Application → Service Workers → "Offline" checkbox para simular sin red

### C. App nativa real en simulator (Capacitor)

Ver sección [4. App nativa (Capacitor)](#4-app-nativa-capacitor).

---

## 4. App nativa (Capacitor)

Capacitor envuelve Next.js en shells nativos iOS/Android. Usamos **live mode**: la app móvil carga la URL pública (`https://app.pelotitas.com` en prod, tu LAN IP en dev). **Mismo codebase, cero duplicación**.

### Prerrequisitos

| Plataforma | Necesitás |
|---|---|
| Android | [Android Studio](https://developer.android.com/studio) + JDK 17 + variable `ANDROID_SDK_ROOT` |
| iOS | macOS + **Xcode 15+** (no sólo Command Line Tools) + CocoaPods (`brew install cocoapods`) |

**Xcode**: si tenés error `xcode-select: tool 'xcodebuild' requires Xcode`, te falta el Xcode completo (no sólo CLI tools):
```bash
# Instalar Xcode desde App Store (~15 GB), después:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

**CocoaPods**: usá Homebrew, NO el Ruby del sistema (crashea en Apple Silicon):
```bash
brew install cocoapods
export PATH="/opt/homebrew/bin:$PATH"   # asegurar que se usa el de brew
which pod   # debe ser /opt/homebrew/bin/pod
```

### Generar proyectos nativos (1ra vez por plataforma)

```bash
# Apuntar la app a tu dev server local
export CAP_DEV_URL=http://$(ipconfig getifaddr en0):3098

cd frontend
make ios       # genera frontend/ios/
make android   # genera frontend/android/
```

Si Capacitor te dice que `webDir` no existe o algún warning: el `frontend/public/` ya está creado, no es bloqueante.

### Correr en simulator/emulator

```bash
make open-ios       # abre Xcode → click ▶ Run
make open-android   # abre Android Studio → click ▶ Run
```

**iOS Xcode**: top bar → seleccioná un simulator (ej. iPhone 15 Pro) → ▶. Si te pide "Sign team": Xcode → Settings → Accounts → agregá tu Apple ID. Luego en target App → Signing & Capabilities → elegí tu team.

**Android Studio**: Tools → Device Manager → Create Device → Pixel 7 + API 34 → ▶ Run.

### Cuando agregás plugins de Capacitor

```bash
make install-front PKG=@capacitor/geolocation
make mobile-sync                  # sincroniza al proyecto nativo
make open-ios / open-android      # rebuild en Xcode/Studio
```

---

## 5. Publicar en Play Store

**Costo**: $25 una vez en [Google Play Console](https://play.google.com/console)
**Tiempo de review**: 1-3 días

### Checklist

- [ ] Cuenta Play Console creada y verificada
- [ ] App registrada con `applicationId = app.pelotitas` (en `frontend/android/app/build.gradle`)
- [ ] Iconos generados (1024×1024 PNG fuente):
      ```bash
      mkdir -p frontend/assets
      # poné frontend/assets/icon.png (1024×1024)
      # poné frontend/assets/splash.png (2732×2732 cuadrado)
      cd frontend && npx @capacitor/assets generate \
        --iconBackgroundColor "#0A0E14" \
        --splashBackgroundColor "#0A0E14"
      ```
- [ ] Versión bumpeada en `frontend/android/app/build.gradle`: `versionCode` (entero) y `versionName` ("1.0.0")
- [ ] Keystore para firmar:
      ```bash
      cd frontend/android/app
      keytool -genkey -v -keystore pelotitas-release.keystore \
        -alias pelotitas -keyalg RSA -keysize 2048 -validity 10000
      ```
      ⚠️ Guardá ese `.keystore` y la pass en lugar seguro — sin él no podés actualizar la app.
- [ ] Build firmado:
      ```bash
      cd frontend/android
      ./gradlew bundleRelease
      # output: app/build/outputs/bundle/release/app-release.aab
      ```
- [ ] En Play Console:
  - **App information**: nombre, descripción corta, descripción larga, categoría "Sports"
  - **Graphic assets**: ícono 512×512, feature graphic 1024×500, screenshots phone (mín 2)
  - **Privacy policy URL**: `https://app.pelotitas.com/privacy` (ya creada)
  - **Data safety**: declarar que recolectás email/teléfono/ubicación
  - **Content rating**: completar cuestionario
  - **Target audience**: 18+ generalmente
- [ ] Subir `.aab` en "Production" → "Create new release"
- [ ] Submit para review

---

## 6. Publicar en App Store

**Costo**: $99/año en [Apple Developer Program](https://developer.apple.com/programs/)
**Tiempo de review**: 3-10 días (más estricto que Play Store)

### Gotcha crítico: Apple guideline 4.2 (Minimum Functionality)

Apple **rechaza** apps que son "sólo wrappers de website". Capacitor live mode puede sonar así. Para pasar review tenés que demostrar uso de APIs nativas:

✅ Pelotitas YA cumple con: Haptics, Camera, Push Notifications, Share, StatusBar, SplashScreen — todos plugins de Capacitor instalados y wireados en `lib/native.ts`.

### Gotcha crítico: Stripe NO se puede usar para suscripciones DENTRO de la app iOS

Apple obliga a usar **In-App Purchase** (IAP) para suscripciones digitales. Stripe directo en iOS = rechazo automático.

**Solución (Spotify-style)**:
- En la app iOS, NO mostrar "Suscribirse" ni precios. Mostrar "Gestioná tu suscripción en pelotitas.com"
- El user paga en la web (Stripe), la app refleja el estado vía `/billing/me`
- Esto está PERMITIDO según Apple si nunca incentivás la compra desde la app

**Alternativa**: integrar IAP de Apple sólo para iOS (RevenueCat lo simplifica). Mantener Stripe para web/Android.

### Checklist iOS

- [ ] Apple Developer Program activo ($99/año, verificación de identidad puede tomar 1-3 días)
- [ ] Bundle ID `app.pelotitas` registrado en developer.apple.com → Certificates, IDs & Profiles
- [ ] Iconos generados (mismo comando que Android arriba)
- [ ] Versión bumpeada en Xcode: target App → General → Version y Build
- [ ] Privacy policy URL: `https://app.pelotitas.com/privacy` ✅ (ya creada)
- [ ] Terms URL: `https://app.pelotitas.com/terms` ✅ (ya creada)
- [ ] **Info.plist permission strings** (críticos — sin estos te rechazan):
      Editar `frontend/ios/App/App/Info.plist`:
      ```xml
      <key>NSCameraUsageDescription</key>
      <string>Para subir tu foto de perfil y de canchas.</string>
      <key>NSPhotoLibraryUsageDescription</key>
      <string>Para elegir tu foto de perfil desde tus fotos.</string>
      <key>NSLocationWhenInUseUsageDescription</key>
      <string>Para mostrarte clubes y torneos cerca tuyo.</string>
      ```
- [ ] Push notifications: agregar capability "Push Notifications" en Xcode → Signing & Capabilities → "+ Capability"
- [ ] Build → Archive desde Xcode (Product → Archive)
- [ ] Distribute App → App Store Connect → Upload
- [ ] En [App Store Connect](https://appstoreconnect.apple.com):
  - Crear app con Bundle ID `app.pelotitas`
  - **Información del app**: nombre, subtítulo, categoría "Sports"
  - **Screenshots**: 6.7" (iPhone 15 Pro Max), 5.5" (iPhone 8 Plus). Algunas reviews piden iPad 12.9".
  - **Descripción**: en español; mencioná las funciones reales (reservas, torneos, anotador)
  - **Keywords**: separadas por coma — "padel,tenis,torneos,anotador,reservas"
  - **Privacy URL**, **Terms URL**
  - **App Privacy** (declaración): qué datos recolectás y para qué
  - **Build**: seleccionar la versión que subiste
- [ ] Submit for review

### Después de aprobado

Cada update va a review otra vez. Capacitor live mode permite hot-update del UI (cambiás web, todos los users ven el cambio sin update de app), pero cualquier cambio a permisos / plugins nativos requiere submit.

---

## 7. Producción web (deploy)

Cualquier hosting que corra Docker o Node sirve. Opciones recomendadas:

### Frontend → Vercel (más fácil)

```bash
cd frontend
npm install -g vercel
vercel
# seguir prompts; vinculá el repo de GitHub para auto-deploy en push
```

Setear env vars en Vercel: `NEXT_PUBLIC_API_URL=https://api.pelotitas.com` (apunta al backend prod).

### Backend → Railway / Fly.io / VPS con Docker

Ejemplo Railway:
- Conectar repo
- Servicio "backend" con Dockerfile en `backend/`
- Servicio Postgres añadido (Railway lo provee)
- Env vars: `DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, etc.

### Update de Capacitor para apuntar a prod

Cuando ya tenés tu dominio:

```typescript
// frontend/capacitor.config.ts
server: {
  url: 'https://app.pelotitas.com',   // producción
  cleartext: false,
}
```

```bash
make mobile-sync   # propaga al proyecto nativo
# después rebuild + submit
```

### Stripe webhook prod

```bash
# En Stripe Dashboard → Webhooks → Add endpoint:
URL: https://api.pelotitas.com/api/billing/webhook
Events: checkout.session.completed, customer.subscription.{created,updated,deleted}
```

Copiá el `whsec_...` y meté como `STRIPE_WEBHOOK_SECRET` en el env del backend prod.

---

## 8. Troubleshooting

### `Module not found: Can't resolve '@capacitor/core'` en el container

Volumen viejo de `node_modules`. Fix:
```bash
docker compose down -v        # borra volumen
docker compose up -d --build  # reinstala desde package.json
```

### `pod install` crashea con "ffi 1.15.5"

Ruby del sistema (2.6) crashea en Apple Silicon. Usar Ruby de Homebrew:
```bash
brew install cocoapods
export PATH="/opt/homebrew/bin:$PATH"
which pod   # debe ser /opt/homebrew/bin/pod
```

### `xcodebuild requires Xcode`

Tenés sólo Command Line Tools. Instalá Xcode completo del App Store, después:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### CORS bloquea el frontend

Backend en dev acepta `localhost`, `0.0.0.0`, `127.0.0.1`, LAN IPs. En prod setear `CORS_ORIGINS` env (comma-separated) o `FRONTEND_URL`.

### Capacitor v8 pide Node 22+

Estamos en v7.6.4 (compatible Node 20). Si querés v8, instalá Node 22:
```bash
nvm install 22 && nvm use 22
# después actualizar package.json a @capacitor/*@^8
```

### Reset completo (DB + containers + volúmenes)

```bash
make nuke
make install
```

---

## Stack

- **Frontend**: Next.js 14 (app router) + TypeScript + Tailwind + Capacitor 7
- **Backend**: NestJS 10 + Prisma 5 + PostgreSQL 16, JWT auth
- **Infra**: Docker compose (postgres + backend + frontend)
- **Mobile**: PWA + Capacitor live mode (single codebase web + iOS + Android)
- **Pagos**: Stripe (Subscriptions + Customer Portal + Webhook)

Detalle completo de arquitectura, decisiones de diseño, schema, y bitácora por sesión: [`docs/SESSIONS_LEARNED.md`](docs/SESSIONS_LEARNED.md).

---

## Features

- **Identidad multi-rol**: Player / Coach / Club Owner / Tournament Organizer
- **Geolocation**: filtros por país/ciudad/cercanía con Haversine
- **Phone E.164**: 18 países con dial code, único `<PhoneInput />` reutilizable
- **Reservas**: calendario, slots, modos OPEN/CONNECTED_ONLY
- **Torneos**: groups, brackets, sets oficiales con auto-sync desde anotador
- **Match Log**: diario personal con phantoms (rivales sin cuenta), head-to-head
- **Anotador**: scoreboard live punto-a-punto, deuce/golden, super tiebreak, audit completo, oficial vs personal con copy-from-official
- **Billing**: Stripe Pro plan, gateway en privacy controls
- **PWA + Mobile**: install to home screen, service worker offline, app nativa via Capacitor

---

## Próximos pasos (roadmap natural)

- [ ] Push notifications wired al backend (`PushNotifications` plugin + FCM/APNS)
- [ ] Camera plugin para avatar/foto canchas
- [ ] IAP iOS (RevenueCat) para suscripciones in-app sin violar 4.2
- [ ] Mapa con marcadores en `/clubs`
- [ ] App icons 1024×1024 production-ready (`@capacitor/assets generate`)
- [ ] Tests (Vitest + Playwright)
- [ ] Deploy automatizado (CI/CD)

---

## Documentación interna

- [`docs/SESSIONS_LEARNED.md`](docs/SESSIONS_LEARNED.md) — bitácora completa, **lectura obligada antes de tocar código**
- [`Makefile`](Makefile) — `make help` lista todos los atajos
- [`docker-compose.yml`](docker-compose.yml) — stack de dev

Cualquier cambio importante (schema, feature grande, decisión arquitectónica) → agregalo a `SESSIONS_LEARNED.md` para que la próxima sesión tenga el contexto.
