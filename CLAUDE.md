# Pelotitas — guía principal para agentes

> **Lee esto antes de tocar nada.** Es la fuente de verdad sobre arquitectura, convenciones y qué se construyó. `AGENTS.md` es un symlink a este archivo — editás uno, se actualizan los dos.

## 📜 Update protocol (regla #1)

**Cuando un agente cambie comportamiento del sistema, actualizá este archivo en el mismo commit.**

- ¿Nueva ruta pública? Sumala a "Public funnel".
- ¿Nuevo endpoint? Sumalo a "Where to find things".
- ¿Convención nueva (naming, layout, design token)? "Conventions".
- ¿Gotcha que te mordió? "Known gotchas".
- ¿Cambio en deploy / env / Docker? "Deploy to production".

Borrá entradas obsoletas — un doc desactualizado es peor que ninguno.

Memorias de sesión (Engram MCP, scope `deployweekly-pelotitas`) capturan
contexto efímero y solo las lee Claude. **Esto es lo único que lee Codex / Cursor / etc.**

---

## 🎾 Qué es

Pelotitas — plataforma SaaS para clubes de padel y tenis. Reservas online, torneos, anotador en
vivo, ranking ELO, landing pública por club, app mobile (PWA + Capacitor) y notificaciones por
WhatsApp. Multi-tenant (un dueño → varios complejos), multi-rol (PLAYER / COACH / CLUB_OWNER /
TOURNAMENT_ORGANIZER / ADMIN), bilingüe ES.

## 🧱 Stack

- **Backend**: NestJS 10 + Prisma 5 + PostgreSQL 16
- **Frontend**: Next.js 14 (App Router) + Tailwind + TypeScript
- **Auth**: JWT en localStorage (access + refresh)
- **Mobile**: PWA + Capacitor (iOS/Android wrappers)
- **Pagos**: Stripe (opt-in para features premium)
- **WhatsApp**: WhatsApp Cloud API (opt-in)

## 🏃 Running locally

```bash
docker compose up -d
# web   → http://localhost:3098
# api   → http://localhost:3099
# db    → localhost:5477  (user/pass/db = pelotitas)
```

**No corras `npm run dev` local.** El container del web tiene su propio `node_modules` como
named volume (`frontend_modules`) — separado del `frontend/node_modules` del host por
diferencia de arch (host arm64 vs container linux).

```bash
# Cambios en schema.prisma:
docker compose exec backend npx prisma db push
docker compose exec backend npx prisma generate
docker compose restart backend

# Seed:
docker compose exec backend npm run seed
```

## 📁 Repo layout

```
pelotitas/
├── backend/                  NestJS API
│   ├── src/
│   │   ├── <module>/         auth, clubs, courts, tournaments, leads, etc.
│   │   │   ├── *.controller.ts
│   │   │   ├── *-public.controller.ts   # @Controller('public/...') = sin auth
│   │   │   ├── *.service.ts
│   │   │   ├── *.module.ts
│   │   │   └── dto/
│   │   ├── prisma/           PrismaService wrapper
│   │   ├── common/           guards, decorators (CurrentUser, Roles)
│   │   ├── health.controller.ts   /api/health
│   │   └── main.ts           bootstrap (ValidationPipe whitelist:true, CORS)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── Dockerfile            dev
│   └── Dockerfile.prod       multi-stage prod
├── frontend/                 Next.js 14
│   ├── src/
│   │   ├── app/
│   │   │   ├── v5/page.tsx           landing principal (servida también en /)
│   │   │   ├── c/                    público chromeless: /c (discover), /c/[id] (club)
│   │   │   ├── brochure/             /brochure — sales brochure + LeadForm
│   │   │   ├── clubs/[id]/           slot picker (redirect gate arriba)
│   │   │   ├── dashboard/club/       gestión (owner/admin)
│   │   │   ├── login/, register/     ?next= preservado
│   │   │   └── layout.tsx            root, monta LocationProvider + AuthProvider
│   │   ├── components/
│   │   │   ├── layout/LayoutSwitcher.tsx   NAKED_PREFIXES, NAKED_EXACT
│   │   │   ├── public/PublicAuthAware.tsx  topbar/CTAs auth-aware compartidos
│   │   │   └── ThemeToggle.tsx
│   │   ├── lib/
│   │   │   ├── auth.tsx              AuthProvider + useAuth
│   │   │   ├── api.ts                fetch wrapper con bearer auto
│   │   │   ├── location.tsx          LocationProvider + STATES_BY_COUNTRY
│   │   │   └── countries.ts          COUNTRIES + helpers (server-safe)
│   │   └── styles/globals.css        tokens v5 + html.v5-dark
│   ├── Dockerfile            dev
│   └── Dockerfile.prod       multi-stage prod
├── scripts/deploy.sh         ssh + git pull + docker compose up
├── docker-compose.yml        dev
├── docker-compose.prod.yml   prod (sin postgres local)
└── .env.production.example   template
```

## 🎨 Conventions

### v5 design system (paleta liviana cream/brown)

Definida en `frontend/src/styles/globals.css` como CSS vars + helper classes:

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--v5-paper` | `#F4EFE6` | `#14100B` | bg general |
| `--v5-paper-2` | `#EBE4D5` | `#221912` | borders, separators |
| `--v5-ink` | `#1A1208` | `#F2EDDE` | texto |
| `--v5-ink-2` | `#4F3924` | `#B5A892` | texto secundario |
| `--v5-brown` | `#3B1F0F` | `#2A1408` | hero cards, pills primarias |
| `--v5-cream` | `#F2EDDE` | `#F2EDDE` | cream (no cambia) |
| `--v5-orange` | `#FF7A3D` | `#FF7A3D` | accent CTA |
| `--v5-yellow` | `#FFD23F` | `#FFD23F` | accent secundario |
| `--v5-lime` | `#DCEC9D` | `#6F8A2C` | accent positivo |
| `--v5-red` | `#E04A3C` | `#E04A3C` | en curso / urgente |
| `--v5-pink` | `#EFD2D2` | `#4C2A2A` | accent suave |
| `--v5-sky` | `#A6D4F2` | `#A6D4F2` | padel sport |

Helper classes: `.v5-hero-card` (brown), `.v5-card`, `.v5-card-lime`, `.v5-card-red`,
`.v5-card-pink`, `.v5-btn-primary`, `.v5-chip`. Notch corners 22–28px en cards.

**Fonts**: Space Grotesk (`--font-display`) para títulos chunky uppercase, JetBrains Mono
(`--font-mono`) para eyebrows + números, Inter (`--font-sans`) para body.

**Orange-ball CTA pattern**: pill cream + circular naranja con `→` a la derecha.

### Dark mode

- Default = light. Toggle vía `ThemeToggle` (compact icon) → graba en `sessionStorage` con key `v5-theme`.
- El bootstrap script en `app/layout.tsx` SOLO honra `sessionStorage` explícito. No sigue OS preference (lo sacamos a propósito).
- ⚠️ En dark, `--v5-ink === --v5-cream === #F2EDDE`. Cualquier `bg:ink + color:cream` queda invisible. Para pills primarias usar `bg: var(--v5-brown), color: var(--v5-cream)`.

### Naked routes (chromeless, sin AppShell)

`frontend/src/components/layout/LayoutSwitcher.tsx`:

```ts
NAKED_PREFIXES = ['/m/', '/h2h/', '/u/', '/c/', '/brochure', '/v1', '/v5']
NAKED_EXACT    = ['/', '/c']
```

Cualquier nueva landing pública chromeless → sumar acá.

### Server vs client API URL

**Patrón obligatorio** para server components que hacen fetch:
```ts
const API = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099';
```

Razón: en Docker, el frontend container resuelve `localhost:3099` como sí mismo, no como el backend. `INTERNAL_API_URL=http://backend:3099` está seteado en `docker-compose.yml`. Browser usa `NEXT_PUBLIC_API_URL` (host port).

Aplica a: `/u/[id]`, `/m/[id]`, `/h2h/[a]/vs/[b]`, `/c/[id]` y sus `opengraph-image.tsx`.

### DTO + ValidationPipe

`main.ts` corre `new ValidationPipe({ whitelist: true })`. **Strip silente** de cualquier campo no declarado en el DTO. Si agregás campos a un model Prisma y no los declarás en el DTO, los PATCH silenciosamente los descartan.

Convención: `Update*Dto` debe espejar todos los campos editables.

### Auth-aware UI

`frontend/src/components/public/PublicAuthAware.tsx` exporta:
- `PublicTopBar` — topbar con login/signup vs "Mi panel"
- `HeroReserveCTA` — CTA de reserva (auth-flips)
- `FooterSignupCTA` — footer con tagline opcional
- `StickyReserveLink` — sticky mobile bar

Reusalos en cualquier landing pública nueva.

### `?next=` preserve

Cualquier redirect a `/login` debe preservar el origen:
```ts
router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
```

`/login` y `/register` leen `?next=` y redirigen ahí post-success (con validación `safeNext` para evitar open-redirect — solo paths same-origin).

---

## 🔐 Auth & roles

- `lib/auth.tsx` → `AuthProvider` lee JWT de `localStorage` y llama `/api/auth/me` al mount.
- `useAuth()` expone `{ user, loading, login, register, logout, refreshUser }`.
- `user.roles: string[]` puede contener `PLAYER`, `COACH`, `CLUB_OWNER`, `TOURNAMENT_ORGANIZER`, `ADMIN`.
- Backend `JwtAuthGuard` + `RolesGuard` + `@Roles('ADMIN')` decorator.
- `@CurrentUser()` decorator devuelve el user completo; `@CurrentUser('id')` solo el id.

**Admin bypass**: `clubsService.update / addLocation / getMyClubs` aceptan flag `isAdmin`. El controller lo deriva con `user.roles?.includes('ADMIN')`. Admin ve todos los clubes en `/dashboard/club`. `/clubs/[id]` redirige admin a `/dashboard/club/[id]`.

---

## 🌐 Public funnel

```
/ (= /v5)                landing principal
  ↓
/c                       discover de complejos con filtros
  ↓
/c/[id]                  landing pública del club (cover, gallery, video, hours, courts, tournaments, contact, map)
  ↓
/register?next=/clubs/X?court=Y    o /login?next=
  ↓
/clubs/[id]?court=Y      slot picker con scroll automático a la cancha
```

- `/c/[id]` es **server component**. Form/CTA islands son client.
- "Reservar" en una cancha → `/clubs/[clubId]?court=[courtId]` → la página scrollea + highlightea esa fila.
- `/register` honra `?next=` saltando `/activate` si lo trae (vamos directo al destino).
- Owners/admins en `/clubs/[id]` se redirigen a `/dashboard/club/[clubId]`.
- Logged-in non-owner ve el slot picker tal cual.

## 🏢 Dashboard (owner/admin)

```
/dashboard/club                              lista de mis clubes (admin → todos)
  /[clubId]                                  overview con 6 tiles
    /settings                                edición completa: imágenes, video, gallery, horarios, IG, WhatsApp, amenities, etc.
    /reservations                            gestionar reservas
    /courts                                  CRUD canchas
    /tournaments                             crear/gestionar torneos
    /coaches                                 vincular profesores
    /players                                 jugadores conectados
```

Settings edita los 8 campos "landing-only" de `ClubProfile` (galleryUrls, videoUrl, amenities, hoursWeekday/Weekend, instagramUrl, whatsappPhone, logoUrl + el ya existente imageUrl). El `revalidate: 30` del fetch público hace que `/c/[id]` refleje cambios en <30s.

---

## 📋 Brochure + leads (sales)

`/brochure` — landing comercial chromeless que el equipo manda por WhatsApp.

Secciones: hero ("TU CLUB, EN AUTOMÁTICO.") → WhatsApp spotlight con mockup de chat → features grid (12) → testimonials → how-it-works → "todo incluido" → FAQ → LeadForm → footer.

**Endpoints**:
- `POST /api/public/leads` — público, throttle 6/min. Body: `{email, phone?, fullName?, clubName?, comment?, source?}`. Devuelve `{id, createdAt}`.
- `GET /api/admin/leads?status=&page=&limit=` — protegido (ADMIN)
- `GET /api/admin/leads/stats` — counts por status
- `PATCH /api/admin/leads/:id` — actualizar `status` / `notes`. Al pasar a `CONTACTED` graba `contactedAt + contactedById`.

Modelo `BrochureLead` con enum pipeline: `NEW → CONTACTED → QUALIFIED → CONVERTED` (o `DEAD`).

Para producción: apuntar `brochure.pelotitas.com` al mismo EC2 vía DNS + regla reverse-proxy (nginx/ALB) que rewriteé host a `/brochure`. Alternativa: Next.js middleware que detecte subdomain.

---

## 🚀 Deploy to production

```bash
# Local — una sola vez (~/.zshrc):
export EC2_HOST=ec2-X-X-X-X.compute-1.amazonaws.com
export EC2_USER=ubuntu
export EC2_KEY=~/.ssh/pelotitas.pem
export EC2_PATH=/home/ubuntu/pelotitas

# Cada deploy:
./scripts/deploy.sh           # git pull + docker compose build + up
./scripts/deploy.sh --logs    # idem + tail
./scripts/deploy.sh --no-build
BRANCH=staging ./scripts/deploy.sh
```

**EC2 setup inicial** (una vez):
1. `sudo apt install -y docker.io docker-compose-plugin git`
2. `sudo usermod -aG docker $USER` + relogin
3. `git clone <repo> pelotitas && cd pelotitas`
4. `cp .env.production.example .env.production && nano .env.production`
   - `DATABASE_URL` apunta al RDS con `?sslmode=require`
   - `JWT_SECRET` y `JWT_REFRESH_SECRET` con `openssl rand -base64 48`
   - `NEXT_PUBLIC_API_URL` con el dominio público de la API
   - `CORS_ORIGINS` lista de dominios separados por coma

**Lo que hace el script en cada deploy**:
1. SSH único, `git fetch + reset --hard origin/$BRANCH`
2. Falla si falta `.env.production` en el server
3. `docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build --remove-orphans`
4. Backend hace `prisma migrate deploy` antes de bootear (multi-stage Dockerfile.prod)

**Healthcheck**: `GET /api/health` → `{status, db, uptime, timestamp}`. Usado por compose healthcheck y futuras ALB target groups.

---

## ⚠️ Known gotchas

1. **DTO whitelist:true silencioso** — campos no declarados se descartan sin error. Si un PATCH parece "no guardar", revisar el DTO antes que el service.
2. **`INTERNAL_API_URL` obligatorio para SSR** — sin esto, server components hacen fetch a `localhost:3099` desde el container del frontend y caen en `notFound()`.
3. **Dark mode `ink === cream`** — no usar `bg:ink + color:cream` para botones. Usar `brown + cream` (siempre legible).
4. **`/clubs/[id]` no es la landing pública** — esa es `/c/[id]`. La de `/clubs` es el slot picker (reserva real) y redirige a `/dashboard/club/[id]` para owner/admin.
5. **`NEXT_PUBLIC_*` se inlinea en build time** — cambiar `NEXT_PUBLIC_API_URL` requiere rebuild del frontend Docker image.
6. **Frontend `node_modules` es volume nombrado** — `npm install` en el host NO afecta al container. Hay que `docker compose build frontend` para nuevas deps.
7. **Prisma generate después de schema change** — `db push --skip-generate` deja el cliente TS sin los nuevos models. Correr `prisma generate` + `docker compose restart backend`.
8. **Unsplash photo IDs son timestamp** — probar con `curl -I` antes de hardcodear, muchos 404.

---

## 📍 Where to find things — cheat sheet

| Cosa | Archivo |
|---|---|
| Schema Prisma | `backend/prisma/schema.prisma` |
| App module (Nest) | `backend/src/app.module.ts` |
| Auth context (React) | `frontend/src/lib/auth.tsx` |
| API fetch wrapper | `frontend/src/lib/api.ts` |
| Country list (server-safe) | `frontend/src/lib/countries.ts` |
| v5 tokens + helpers | `frontend/src/styles/globals.css` |
| Chrome / naked routing | `frontend/src/components/layout/LayoutSwitcher.tsx` |
| Auth-aware shared UI | `frontend/src/components/public/PublicAuthAware.tsx` |
| Public club landing | `frontend/src/app/c/[id]/page.tsx` |
| Public discover | `frontend/src/app/c/page.tsx` |
| Slot picker | `frontend/src/app/clubs/[id]/page.tsx` |
| Dashboard club overview | `frontend/src/app/dashboard/club/[clubId]/page.tsx` |
| Club settings (admin) | `frontend/src/app/dashboard/club/[clubId]/settings/page.tsx` |
| Brochure | `frontend/src/app/brochure/page.tsx` |
| Lead form (client) | `frontend/src/app/brochure/LeadForm.tsx` |
| WhatsApp mockup | `frontend/src/app/brochure/WhatsAppMockup.tsx` |
| Deploy script | `scripts/deploy.sh` |
| Prod compose | `docker-compose.prod.yml` |
| Prod env template | `.env.production.example` |

---

## 🗒 Engram memories (Claude only)

Sesión a sesión salvamos contexto en Engram MCP bajo project `deployweekly-pelotitas` (el git origin, no `pelotitas`). Solo accesible para Claude con el MCP de Engram habilitado. Codex / Cursor / agentes sin MCP no lo ven — para ellos este archivo + git log son la única memoria.

Si encontrás algo importante que falta acá, **agregalo y commiteá**. No esperes a la próxima sesión.
