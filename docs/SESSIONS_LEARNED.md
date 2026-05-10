# Sessions Learned — Pelotitas

> Bitácora de todo lo construido entre sesiones. Léelo antes de tocar código si te toca trabajar acá sin haber participado.

---

## Stack overview

- **Frontend**: Next.js 14 app router + TypeScript + Tailwind. Single codebase web + Capacitor para iOS/Android (live mode → carga la URL pública).
- **Backend**: NestJS 10 + Prisma 5 + PostgreSQL 16. JWT auth.
- **Infra**: Docker compose. Ports: frontend 3098, backend 3099, db 5477.

---

## Identidad visual (v4)

Reemplazo total del clon Spotify (v1-v3) por una identidad propia "Performance OS":

- **Paleta**: midnight cool `#0A0E14` base. Accent **Court Lime** `#D4FF3F` (reemplaza Spotify green). **Clay** `#FF5C2B` para tenis y torneos (clay courts). **Sky** `#6BA9FF` para padel/info.
- **Tipografía**: Inter + JetBrains Mono. `tabular-nums` activado para listados de fechas/scores.
- **Botones**: `rounded-lg`, sin uppercase, semibold. Salimos del pill+uppercase de Spotify.
- **Tennis es CLAY orange** (no verde). Padel es SKY blue. Decisión visual deliberada.
- **Aliases backwards-compat** en `tailwind.config.js` (`shadow-glow-green` → mapea al nuevo lime) para no romper páginas legacy.

Tokens single-source: `frontend/tailwind.config.js` + `frontend/src/styles/globals.css`. Cambiar valores acá propaga a 30+ páginas automáticamente.

---

## Layout switching

`components/layout/LayoutSwitcher.tsx` decide chrome basado en pathname:
- Marketing routes (`/`, `/login`, `/register`, etc.) → Navbar slim + footer
- Resto → `AppShell` con sidebar + topbar

`AppShell` es **visitor-aware**: si `user === null` muestra solo "Descubrir" + CTA "Crear cuenta" sticky en sidebar. Sin user no se ven secciones privadas.

---

## Geolocation

`lib/location.tsx` provee `LocationProvider` + `useLocation()`. Estados: `off | auto | manual | denied | unsupported | asking`. Reverse-geocode via BigDataCloud (sin API key). Persistencia en localStorage.

`COUNTRIES` exporta 18 países con `{code, name, dial, flag, nsnLen}` — usado en filtros, registro, club creation y `PhoneInput`.

`PhoneInput` (`components/PhoneInput.tsx`) emite **E.164** estricto. Auto-syncs con `value` cuando llega async. Helpers: `parseE164`, `isValidE164`, `findCountryByName`. Plantado en `/register`, `/profile/edit`, `/dashboard/club` (alta), `/dashboard/club/[id]/settings`.

PlayerProfile schema tiene **dos ubicaciones**: `homeCountry/State/City` (origen) + `currentCountry/State/City/Latitude/Longitude/LocationUpdatedAt` (donde está ahora). Casa de uso: "soy de Argentina pero ahora estoy en México por turismo".

ClubLocation ya tenía `country/state/city/address/lat/lng`. El wizard de creación se actualizó para incluir country picker (cascading state) + botón "Usar mi ubicación actual" para capturar lat/lng.

`/clubs` page tiene filter bar con país/provincia/ciudad/sport + toggle "Cerca de mí". Backend `findAll` acepta `lat/lng/radiusKm/sort=nearest` y hace pre-filter por bounding-box + Haversine sort.

---

## Date formatting

**Estándar único**: `09-may-2026`. Helpers en `frontend/src/lib/date.ts`:

```
formatDate(d)              → "09-may-2026"
formatDateShort(d)         → "9-may"
formatDateWithWeekday(d)   → "lun 09-may-2026"
formatDateLong(d)          → "lunes 09-may-2026"
formatTime(d)              → "14:30"
formatDateTime(d)          → "09-may-2026 · 14:30"
formatRelative(d)          → "hace 5 min"
todayString()              → "2026-05-10" (input[type=date])
toDateInputString(d)       → "2026-05-10"
```

Migración: 18 archivos pasaron de `toLocaleDateString('es-AR', ...)` a estos helpers. Resultado: 0 `toLocaleDateString` sueltos en src. **Gotcha**: strings `YYYY-MM-DD` se anclan a noon local para no shiftar día atrás en TZ negativos.

---

## Identidad y registro

**RoleActivator** (`components/RoleActivator.tsx`) — UI única para activar perfiles, modos `full | guard | banner`. Reemplaza 3 componentes anteriores (RoleGuard, ActivateRoleBanner, /activate page) que mostraban distintas opciones según contexto. Ahora siempre se ven los 4 perfiles (Player/Coach/Club/Organizer). El rol bloqueado tiene badge "Recomendado".

`/register` captura: email/pass/name/phone (E.164) + ubicación opcional (collapse "Tu ubicación") con home + toggle "Estoy en otro lugar ahora" para current. Si se da location, pre-crea `PlayerProfile` directo en `auth.service.register`.

---

## Billing (Stripe)

Schema: `Subscription` model + `SubscriptionStatus` enum (mirrors Stripe statuses + INACTIVE). 1-1 con User.

Backend: `BillingModule` con `BillingService` + `BillingController`. Endpoints: `GET /billing/me`, `POST /billing/checkout`, `POST /billing/portal`, `POST /billing/webhook`.

Webhook necesita raw body — `NestFactory.create(AppModule, { rawBody: true })` en main.ts. Verifica firma con `STRIPE_WEBHOOK_SECRET`. En dev (sin secret) acepta unsigned con warn.

Degrada gracefully si no hay `STRIPE_SECRET_KEY`: `isConfigured()` returns false; endpoints lanzan "no configurado". `/billing` page muestra warning.

**Lock real** en `users.service.updatePrivacy`: revisa `BillingService.hasActiveEntitlement(userId)` antes de actualizar privacy. UI gateway en `profile/edit` es solo UX.

Stripe v22 CJS d.ts es complicado — uso `import StripeLib = require('stripe')` + `import type { Stripe as StripeNS } from 'stripe/cjs/stripe.core.js'` para acceder al namespace correcto. `esModuleInterop: true` en tsconfig.

`useSubscription()` hook + `SubscriptionProvider` en root layout. Página `/billing` con Stripe Checkout + Customer Portal.

---

## MatchLog (diario personal)

Schema:
- `MatchLogEntry` — owner, optional `matchId` o `tournamentMatchId` (XOR), sport, date, startTime, city, venue, myScore, opponentScore, result (MatchOutcome enum), notes.
- `MatchLogParticipant` — entryId, userId? OR firstName/lastName (phantom), side (PARTNER|OPPONENT), noteAboutPlayer.

3 sabores en una tabla: standalone / linked-to-Match / linked-to-TournamentMatch. Cuando linked a TournamentMatch, score se setea null en server (verdad oficial vive en TournamentMatchSet).

**Phantoms**: rivales sin cuenta se guardan por nombre. `GET /match-log/phantom-mentions` devuelve menciones donde firstName+lastName del current user matchea phantom records. `POST /match-log/phantom-mentions/claim` backfills userId. Validación defensive doble en backend.

Endpoints: CRUD + `/opponent` (head-to-head con stats) + `/phantom-mentions` (claim).

UI:
- `/matches/log` — lista con filter sport + opponent search. Modal de form con autocomplete de users + opción phantom. Notas privadas (Lock icon).
- `/matches/log/vs?userId=X|firstName=...&lastName=...` — head-to-head (KPIs + lista).
- `/matches/log?tournamentMatchId=X` — auto-abre form vinculado, score disabled.
- `PhantomClaimBanner` en `/profile` — muestra menciones a reclamar.
- Dashboard player tiene widget "Mi historial" con stats.

---

## Anotador (Scoreboard)

Schema:
- `Scoreboard` — settings (scoringMode STANDARD|GOLDEN_POINT, totalSets, gamesPerSet, tieBreakAt, superTieBreak), live state (currentSet, homeSetGames[], awaySetGames[], homePoints/awayPoints, advantage, tiebreak, server, winner). `isOfficial` bool. Linkage opcional a `TournamentMatch` o como mirror de otro scoreboard.
- `ScoreboardEvent` — audit log: cada acción (POINT_HOME/AWAY/UNDO/SETTING_CHANGE/COPY_FROM_OFFICIAL/CREATE) con `authorId` y payload con snapshot `before` para undo.
- Enums: `ScoringMode`, `ScoreboardStatus`, `ScoreboardSide`.
- `@@unique([ownerId, tournamentMatchId])` — un user, un anotador por match de torneo.

Engine: `backend/src/scoreboard/score-engine.ts` — pura, no Prisma. `awardPoint(state, side)` retorna `{state, gameWon, setWon, matchWon}`. Maneja deuce/ventaja, golden point, tiebreak en 6-6, super tiebreak en último set, fin de set/match.

Service: `ScoreboardService` valida permisos (organizador-only para `isOfficial=true`), corre engine, persiste, registra evento, hace `syncToTournament` cuando completa oficial.

`syncToTournament` — al completar el scoreboard oficial, borra `TournamentMatchSet` previos y crea nuevos desde `homeSetGames`/`awaySetGames`. Marca `TournamentMatch` COMPLETED.

UI:
- `/scoreboard/[id]` — full-screen anotador. ScoreboardDisplay con server indicator animado, names, sets per set, big point display (0/15/30/40/Adv/tiebreak count). 2 botones grandes (HOME lime, AWAY sky). Undo. Settings drawer. Audit feed. Notes.
- Cuando es personal con mirror oficial: sidebar derecho con `CompactScoreboard` en **warning yellow** (`bg-warning/5 border-warning`) + botón "Copiar oficial".
- `/scoreboards` — list con secciones "En curso" / "Finalizados" + modal "Nuevo anotador".

Entry points:
- En `/tournaments/[id]/manage` (GroupsTab): botón "🎯 Anotador" por partido — busca/crea oficial y navega.
- En `/matches/log` (cards): botón Activity icon — busca mirror personal o crea uno con labels derivados de participants.

---

## PWA + Mobile

**PWA** ya está activa:
- `frontend/public/manifest.json` — name, theme color, shortcuts, icons (SVG).
- `frontend/public/sw.js` — service worker manual (cache-first para `/_next/static/*` + `/icon.svg` + `/manifest.json`, network-first para HTML, no-cache para `/api/*`).
- `components/PWARegister.tsx` — registra el SW en mount (skip dev).
- iOS-specific meta tags en `app/layout.tsx` (`apple-touch-icon`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`).
- Safe-area utilities en globals.css: `.pt-safe`, `.pb-safe`, `.h-safe-bottom` etc. via `env(safe-area-inset-*)`.
- Tap targets ≥40px en mobile.
- Disabled overscroll en standalone mode.

**Capacitor 8** instalado en `frontend/`:
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`.
- Config: `frontend/capacitor.config.ts` con appId `app.pelotitas`, live mode (carga URL pública). Override con `CAP_DEV_URL` para LAN dev.
- npm scripts: `mobile:add:android`, `mobile:add:ios`, `mobile:sync`, `mobile:android`, `mobile:ios`, `mobile:open:android`, `mobile:open:ios`.
- **No corrí `cap add ios/android`** — requiere Xcode + Android Studio locales. El usuario tiene que correrlos en su máquina cuando esté listo.
- Native helpers en `frontend/src/lib/native.ts`: `hapticLight/Medium/Error`, `share`, `isStandalone`, `isMobileViewport` — APIs web que sirven igual en PWA y en Capacitor.

---

## Convenciones

- Component files: PascalCase. Hooks: `use*.ts` o `use*.tsx`.
- Backend: cada feature es un module Nest con DTO + service + controller.
- Schemas en Prisma — comentarios de bloque NO van con `/* */`, usar `//` línea por línea (Prisma falla validation).
- Toaster: `react-hot-toast` con tema dark, success lime, error rojo.
- Date format único `09-may-2026` vía `lib/date.ts`. Tabular-nums para alinear digitos.
- Phone format único E.164 vía `<PhoneInput />`.
- Tokens de colores: `brand` (lime), `clay` (orange tennis), `sky` (blue padel), `warning` (yellow oficial), nunca hardcodear hex.

---

## Cambios de schema pendientes (que el usuario debe migrar)

Cada vez que toqué `schema.prisma` agregué entidades. Si la DB local quedó atrás:

```bash
docker compose exec backend npx prisma migrate dev --name <name>
docker compose exec backend npx prisma generate
docker compose restart backend
```

Migrations conocidas en orden:
1. `add_player_locations` — homeCountry/currentCountry etc en PlayerProfile
2. `add_subscriptions` — Subscription model + SubscriptionStatus enum
3. `match_log` — MatchLogEntry + MatchLogParticipant + enums
4. `scoreboard` — Scoreboard + ScoreboardEvent + enums

Si nunca migraste, hacé un solo `prisma migrate dev` y aplicará todo.

---

## Cosas que NO están

- Push notifications (Capacitor plugin pendiente)
- Plugin Camera (subir avatar / foto cancha)
- Mapa real con marcadores (sólo lista filtrable por ahora)
- Notificaciones por email completas (templates están pero no todos los flows envían)
- Mobile app icons 1024×1024 nativos — usar `npx @capacitor/assets generate` desde un PNG fuente
- Tests (ni unit ni e2e, build verifica solo TypeScript + Next prerender)

---

## Docker dev — gotcha crítico al instalar paquetes

**El user corre el frontend via `docker compose up -d`, no `npm run dev` local.** El container monta `node_modules` como volumen Docker (`frontend_modules`) que NO se sincroniza con `frontend/node_modules` en el host. Esto significa:

- Si hacés `npm install` en host → el package queda en el host pero el container NO lo ve → la app rompe con `Module not found`.
- `package.json` y `package-lock.json` SÍ están montados (lo agregamos en docker-compose.yml después de un episodio con Capacitor) — así el package.json sí refleja en el container, pero el `node_modules` queda atrás.

**Workflow correcto para agregar dependencias:**

```bash
# 1. Instalar en host (para que tsc/IDE las vea)
cd frontend
npm install <paquete> --legacy-peer-deps

# 2. Sincronizar al container (UNO de los dos)
docker compose exec frontend npm install --legacy-peer-deps   # rápido
# O
docker compose up -d --build frontend                          # rebuild image (más limpio)

# 3. Verificar
docker compose exec frontend node -e "console.log(require('<paquete>/package.json').version)"
```

**Síntoma típico**: error `Module not found: Can't resolve '<paquete>'` en el browser, pero `npm ls` en host muestra el paquete instalado. Ese gap es la pista de que el container está atrás.

**URLs que el user usa**:
- Frontend: `http://0.0.0.0:3098/` (no localhost — el browser conserva el host que escribió)
- Backend: `http://localhost:3099`
- Postgres: `localhost:5477`

El backend acepta cualquier origin local-looking en dev (CORS regex incluye `0.0.0.0`), así que no hay problema mezclando los hosts.

---

## CORS y entornos de dev

Backend `main.ts` en dev acepta cualquier origin local-looking (`localhost`, `0.0.0.0`, `127.0.0.1`, `192.168.x.x`, `10.x.x.x`). En prod usa `CORS_ORIGINS` env var (comma-separated) o `FRONTEND_URL`.

Si la app móvil/Capacitor en dev hace requests al backend, asegurate que el backend permite el origin del WebView (Capacitor ios/android suelen ser `capacitor://localhost` o `http://localhost`).

---

## Estructura de carpetas relevante

```
backend/
  prisma/schema.prisma           ← una sola fuente de verdad para todo el dominio
  src/
    auth/                        register, login, /auth/me con subscription incluido
    users/                       updatePrivacy gated por billing
    clubs/                       Haversine + bounding box para "cerca de mí"
    match-log/                   diario personal del player
    scoreboard/                  + score-engine.ts (lógica pura)
    billing/                     Stripe wrapper + webhook
    ...
frontend/
  src/
    app/
      page.tsx                   landing editorial
      dashboard/{player,club,coach,organizer,admin}/page.tsx
      matches/{,/log,/log/vs}/page.tsx
      scoreboard/[id]/page.tsx   anotador full-screen
      scoreboards/page.tsx       lista de mis anotadores
      tournaments/[id]/manage/page.tsx   con botón Anotador oficial
      billing/page.tsx
      profile/{,/edit}/page.tsx
    components/
      layout/{AppShell,LayoutSwitcher,Navbar,BottomNav,LocationPill}.tsx
      RoleActivator.tsx          única fuente de "activá tu perfil"
      PhoneInput.tsx
      PhantomClaimBanner.tsx
      PWARegister.tsx
    lib/
      auth.tsx
      api.ts
      location.tsx               LocationProvider + countries + helpers
      date.ts                    formatDate y todos los helpers
      subscription.tsx
      native.ts                  hapticLight/Medium/Error, share, isStandalone
  public/
    manifest.json               PWA manifest
    sw.js                       service worker
    icon.svg
  capacitor.config.ts           Capacitor live mode
docs/
  SESSIONS_LEARNED.md           ← este archivo
README.md                       getting started + mobile guide
```

---

## Decisiones que parecieron raras pero tienen razón

- **Tennis = clay orange** (no verde), aunque la mayoría de logos de tennis sean verde. Nuestro brand es lime y necesitábamos diferenciar. Clay además es auténtico (Roland Garros, AR red clay).
- **Capacitor live mode** (carga URL remota) en vez de static export. Mantenemos SSR + RSC funcionando igual en web y mobile. Costo: la app necesita conexión inicial. Beneficio: zero rebuild para cambios de UI.
- **PhoneInput emite E.164 sin separadores** (`+5491145678901`). Es lo que esperan WhatsApp/Twilio/SMS. La display está en el lado del input, formateo visual es responsabilidad del usuario.
- **Score engine en backend, no frontend**. Garantiza consistencia + audit log + hace cumplir reglas. Frontend sólo dispara `POINT_HOME`/`POINT_AWAY` y muestra el state que devuelve.
- **MatchLog es independiente del oficial**. Aunque tengamos `TournamentMatchSet` para torneos, agregamos esta capa porque jugadores quieren su propio cuaderno (notas privadas, contra phantoms, contra rivales que después se registran). Es valioso aunque parezca duplicación.
