# Arquitectura - Pelotitas

## Stack

| Componente | Tecnología | Justificación |
|-----------|-----------|---------------|
| Backend | NestJS (TypeScript) | Framework robusto, modular, con decoradores, guards, pipes y excelente soporte para APIs REST. Ideal para dominio complejo con múltiples roles y reglas de negocio. |
| Frontend | Next.js 14 (App Router) | SSR/SSG, file-based routing, React 18, excelente DX. Par natural con NestJS por TypeScript compartido. |
| DB | PostgreSQL 16 | Relacional, robusto, excelente para multi-tenancy, arrays nativos (roles), JSON columns, índices avanzados. |
| ORM | Prisma | Type-safe, migraciones declarativas, studio visual, excelente DX con TS. |
| Auth | JWT (access + refresh tokens) | Stateless, escalable, simple. bcrypt para passwords. Passport.js como estrategia. |
| Styling | Tailwind CSS | Utility-first, rápido para prototipar, responsive nativo. |
| Container | Docker Compose | Desarrollo local reproducible: PostgreSQL + API + Frontend. |
| API Docs | Swagger/OpenAPI | Auto-generado desde decoradores de NestJS. |

## Decisiones Clave

### Multi-rol por usuario
Un usuario puede tener múltiples roles (`PLAYER`, `COACH`, `CLUB_OWNER`, `ADMIN`). Se guarda como array PostgreSQL en la tabla `users`. Esto evita tablas intermedias y simplifica queries.

### Perfiles separados
`PlayerProfile`, `CoachProfile` y `ClubProfile` son tablas separadas vinculadas a `User`. Esto permite datos específicos por rol sin contaminar la tabla principal.

### Deportes como Enum
`PADEL` y `TENNIS` son enums, no una tabla separada. Para 2 deportes, un enum es más eficiente. Si se agregan más deportes en el futuro, se puede migrar a tabla.

### Reservas sin pago
Las reservas se confirman directamente. Los campos `price` y `paidAt` están preparados para integración futura de pagos.

### Motor de torneos flexible
- Grupos desparejos nativos (3, 4, o mezcla de equipos por grupo)
- `qualifyCount` por grupo (puede variar entre grupos)
- `manualOverride` en standings para correcciones del owner
- Llaves con byes automáticos
- Brackets con `isLocked` para bloqueo manual
- Tiebreakers configurables por torneo

### Notificaciones preparadas para WhatsApp
- Tabla `notifications` para in-app
- Tabla `whatsapp_notification_logs` con template mapping
- Estados: PENDING, SENT, FAILED, SKIPPED
- Cada evento crea ambos registros
- WhatsApp queda en PENDING hasta conectar la API real

### Feature Flags
Tabla `feature_flags` con key/value para controlar features en runtime:
- `ENABLE_PAYMENTS`
- `ENABLE_WHATSAPP`
- `FREE_TOURNAMENTS_PER_OWNER`

### Límite de torneos gratuitos
Cada owner puede crear hasta 5 torneos free. El sistema cuenta torneos por `createdById` y bloquea la creación si se alcanza el límite.

## Estructura del Proyecto

```
pelotitas/
├── docker-compose.yml
├── .env / .env.example
├── ARCHITECTURE.md
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma      # Modelo de datos completo
│   │   └── seed.ts             # Datos de prueba
│   └── src/
│       ├── main.ts             # Bootstrap + Swagger
│       ├── app.module.ts       # Root module
│       ├── prisma/             # Global Prisma service
│       ├── common/             # Guards, decorators, enums
│       ├── auth/               # JWT auth: register, login, refresh, me
│       ├── users/              # Profiles, search
│       ├── clubs/              # Club CRUD, locations
│       ├── courts/             # Court CRUD, availability, slot generation
│       ├── reservations/       # Booking system
│       ├── coaches/            # Coach profiles, links, availability, bookings
│       ├── matches/            # Open matches, join, results
│       ├── tournaments/        # Full tournament engine
│       ├── notifications/      # In-app + WhatsApp mock
│       └── admin/              # Admin dashboard, users, flags
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── app/                # Next.js App Router pages
        ├── components/         # UI components
        ├── lib/                # API client, auth context
        └── styles/             # Tailwind globals
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registro con rol
- `POST /api/auth/login` - Login con JWT
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Perfil actual

### Users
- `PATCH /api/users/me` - Actualizar datos
- `PATCH /api/users/me/player-profile` - Actualizar perfil deportivo
- `GET /api/users/search` - Buscar jugadores/rivales
- `GET /api/users/:id` - Perfil público

### Clubs
- `POST /api/clubs` - Crear complejo
- `GET /api/clubs` - Listar/buscar complejos
- `GET /api/clubs/mine` - Mis complejos
- `GET /api/clubs/:id` - Detalle
- `PATCH /api/clubs/:id` - Actualizar
- `POST /api/clubs/:id/locations` - Agregar sede

### Courts
- `POST /api/clubs/:clubId/courts` - Crear cancha
- `GET /api/clubs/:clubId/courts` - Listar canchas
- `POST /api/courts/:id/availability` - Configurar horarios
- `GET /api/courts/:id/availability?date=` - Slots disponibles

### Reservations
- `POST /api/reservations` - Reservar turno
- `GET /api/reservations` - Mis reservas
- `GET /api/reservations/club/:clubId` - Reservas del club
- `PATCH /api/reservations/:id/cancel` - Cancelar

### Coaches
- `GET /api/coaches` - Buscar profesores
- `GET /api/coaches/:id` - Detalle
- `PATCH /api/coaches/me` - Actualizar perfil
- `POST /api/coaches/club-link` - Solicitar vinculación
- `POST /api/coaches/invite/:clubId/:coachUserId` - Invitar profe
- `PATCH /api/coaches/link/:linkId` - Aceptar/rechazar
- `POST /api/coaches/availability` - Configurar disponibilidad
- `POST /api/coaches/bookings` - Reservar clase
- `GET /api/coaches/bookings/mine` - Mis clases

### Matches
- `POST /api/matches` - Crear partido abierto
- `GET /api/matches` - Buscar partidos
- `GET /api/matches/mine` - Mis partidos
- `POST /api/matches/:id/join` - Unirse
- `POST /api/matches/:id/results` - Cargar resultado

### Tournaments
- `POST /api/tournaments` - Crear torneo
- `GET /api/tournaments` - Listar
- `GET /api/tournaments/:id` - Detalle completo
- `GET /api/tournaments/my-count` - Torneos consumidos
- `PATCH /api/tournaments/:id/status` - Cambiar estado
- `POST /api/tournaments/:id/categories` - Agregar categoría
- `POST /api/tournaments/:id/teams` - Agregar equipo
- `POST /api/tournaments/:id/groups` - Crear grupo manual
- `POST /api/tournaments/:id/generate-groups` - Auto-generar grupos
- `POST /api/tournaments/:id/matches/:matchId/result` - Cargar resultado
- `GET /api/tournaments/:id/groups/:groupId/standings` - Posiciones
- `PATCH /api/tournaments/:id/groups/:groupId/standings/override` - Corrección manual
- `PATCH /api/tournaments/:id/groups/:groupId/finalize` - Finalizar grupo
- `POST /api/tournaments/:id/brackets/generate` - Generar llaves
- `PATCH /api/tournaments/:id/brackets/:bracketId` - Editar llave

### Notifications
- `GET /api/notifications` - Mis notificaciones
- `GET /api/notifications/unread-count` - Contador no leídas
- `PATCH /api/notifications/:id/read` - Marcar leída
- `PATCH /api/notifications/read-all` - Marcar todas

### Admin
- `GET /api/admin/dashboard` - Stats globales
- `GET /api/admin/users` - Listar usuarios
- `GET /api/admin/clubs` - Listar clubes
- `GET /api/admin/feature-flags` - Feature flags
- `PATCH /api/admin/feature-flags/:key` - Actualizar flag
- `PATCH /api/admin/users/:id/toggle-active` - Activar/desactivar usuario

## Roadmap Sugerido

### Fase 2 - Mejoras Core
- Upload de imágenes (fotos de perfil, clubes, canchas)
- Recuperación de contraseña (email)
- Calendario visual de disponibilidad
- Mapa interactivo de complejos (Google Maps)
- Mejoras UX: filtros avanzados, paginación, loading states

### Fase 3 - Social & Engagement
- Chat entre jugadores
- Ranking/leaderboard por zona
- Historial detallado con gráficos
- Invitaciones a partidos por link
- Sistema de reseñas para complejos y profesores

### Fase 4 - WhatsApp & Notificaciones
- Integración WhatsApp Business API
- Templates aprobados por Meta
- Recordatorios automáticos de turnos
- Notificaciones por email (SendGrid/SES)
- Push notifications (web)

### Fase 5 - Monetización
- Pagos de reservas (MercadoPago / Stripe)
- Suscripción para complejos (planes)
- Torneos premium (más de 5)
- Servicios premium para jugadores
- Reportes avanzados para clubes

### Fase 6 - Mobile
- App nativa (React Native / Expo)
- Deep links
- Geolocalización real-time

## Features Diferidas

| Feature | Estado | Notas |
|---------|--------|-------|
| Pagos/billing | Preparado | Campos price/paidAt, feature flags |
| WhatsApp real | Preparado | Templates, logs, interfaces |
| Email notifications | Preparado | Canal en enum, servicio extensible |
| Upload de imágenes | No implementado | Agregar S3/Cloudinary |
| Recuperación de contraseña | No implementado | Agregar servicio email |
| Geolocalización/mapas | Preparado | lat/lng en locations |
| Chat | No implementado | WebSockets o servicio externo |
| Ranking global | Preparado | Datos en player_profiles |
| Head-to-head tiebreaker | Preparado | En tiebreakers config, implementación parcial |

## Puntos de Monetización

1. **Suscripción de complejos**: planes mensuales para features premium (analytics, branding, prioridad en búsqueda)
2. **Torneos extra**: más de 5 torneos por owner requiere plan pago
3. **Reservas con pago**: comisión por reserva cuando se habiliten pagos
4. **Notificaciones premium**: WhatsApp masivo, recordatorios automáticos
5. **Publicidad**: destacar complejos en búsquedas
6. **Profesores premium**: perfil destacado, más visibilidad
