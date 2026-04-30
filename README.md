# Pelotitas

Plataforma gratuita para clubes de padel y tenis. Reservas, torneos, profesores y descubrimiento de rivales.

## Quick Start

### Requisitos
- Docker y Docker Compose
- Node.js 20+ (para desarrollo local sin Docker)

### Con Docker Compose (recomendado)

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Levantar todo
docker compose up --build

# 3. Acceder
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
# API Docs: http://localhost:3001/api/docs
```

### Desarrollo local (sin Docker)

```bash
# 1. Copiar variables de entorno
cp .env.example .env

# 2. Levantar PostgreSQL (necesitas tenerlo instalado o usar Docker solo para DB)
docker compose up postgres -d

# 3. Backend
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run seed
npm run start:dev

# 4. Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

### URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api/docs
- **Prisma Studio**: `cd backend && npx prisma studio` (port 5555)

## Cuentas de prueba

Todas con password: `password123`

| Rol | Email | Descripción |
|-----|-------|-------------|
| Admin | admin@pelotitas.com | Panel de administración |
| Club Owner | club@pelotitas.com | Dueño de "Club Deportivo Norte" |
| Coach | profe@pelotitas.com | Profesor de padel y tenis |
| Player | juan.perez@test.com | Jugador de ejemplo |

## Datos de seed

- 1 complejo con 5 canchas (3 padel, 2 tenis)
- 1 profesor vinculado al complejo
- 12 jugadores con perfiles deportivos
- 5 reservas de ejemplo
- 1 partido abierto
- 1 torneo con 10 equipos en 3 zonas desparejas (4/3/3)
- Feature flags configurados

## Estructura del proyecto

```
pelotitas/
├── backend/          # NestJS API
│   ├── prisma/       # Schema + migrations + seeds
│   └── src/          # Modules: auth, clubs, courts, tournaments, etc.
├── frontend/         # Next.js 14 web app
│   └── src/          # App Router pages + components
├── docker-compose.yml
├── ARCHITECTURE.md   # Decisiones técnicas y roadmap
└── README.md
```

## Stack

- **Backend**: NestJS + Prisma + PostgreSQL
- **Frontend**: Next.js 14 + Tailwind CSS
- **Auth**: JWT (access + refresh tokens)
- **Docs**: Swagger auto-generado

## Funcionalidades implementadas

- [x] Auth: registro, login, JWT, roles múltiples
- [x] Complejos: CRUD, sedes, búsqueda
- [x] Canchas: CRUD, disponibilidad por día, generación de slots
- [x] Reservas: crear, confirmar, cancelar, historial
- [x] Profesores: perfil, vinculación con clubs, disponibilidad, clases
- [x] Partidos abiertos: crear, buscar, unirse, cargar resultados
- [x] Torneos: crear, grupos desparejos, standings, brackets con byes
- [x] Override manual de clasificaciones y llaves
- [x] Notificaciones in-app + WhatsApp mock
- [x] Feature flags + límite de torneos free
- [x] Búsqueda de jugadores/rivales
- [x] Panel admin básico
- [x] Seeds completos
- [x] Docker Compose
- [x] Swagger API docs

## Preparado para fase 2

- [ ] Pagos (MercadoPago/Stripe) - campos preparados
- [ ] WhatsApp Business API - templates y logs preparados
- [ ] Email notifications - canal en enum
- [ ] Upload de imágenes
- [ ] Geolocalización con mapas
- [ ] Ranking/leaderboard
