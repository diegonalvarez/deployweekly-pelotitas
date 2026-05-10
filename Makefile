# Pelotitas dev Makefile — atajos para los comandos comunes.
# Uso:  make help     ← lista todos los targets
#       make up
#       make install-front PKG=lucide-react
#       make migrate NAME=add_users

.PHONY: help up down restart logs ps \
        front-logs back-logs db-logs \
        rebuild rebuild-front rebuild-back nuke \
        install install-front install-back \
        sync sync-front sync-back \
        migrate generate seed \
        shell-front shell-back shell-db \
        ios android open-ios open-android \
        verify

# ─── Help ────────────────────────────────────────────────
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

# ─── Lifecycle ──────────────────────────────────────────
up: ## Levantar todo el stack (postgres + backend + frontend)
	docker compose up -d
	@echo ""
	@echo "  Frontend → http://localhost:3098  (o http://0.0.0.0:3098)"
	@echo "  Backend  → http://localhost:3099  (Swagger: /api/docs)"
	@echo "  Postgres → localhost:5477"
	@echo ""
	@echo "  Logs en vivo:  make logs"

down: ## Bajar todo el stack
	docker compose down

restart: ## Reiniciar frontend + backend (sin rebuild)
	docker compose restart frontend backend

logs: ## Tail de logs de todos los servicios
	docker compose logs -f --tail=100

front-logs: ## Tail de logs del frontend
	docker compose logs -f --tail=100 frontend

back-logs: ## Tail de logs del backend
	docker compose logs -f --tail=100 backend

db-logs: ## Tail de logs de postgres
	docker compose logs -f --tail=100 postgres

ps: ## Estado de los containers
	docker compose ps

# ─── Rebuilds ───────────────────────────────────────────
rebuild: ## Rebuild ambas imágenes y levantar
	docker compose down
	docker compose up -d --build

rebuild-front: ## Rebuild solo frontend (cuando cambia package.json o Dockerfile)
	docker compose up -d --build frontend

rebuild-back: ## Rebuild solo backend
	docker compose up -d --build backend

nuke: ## Borrar todo: containers, volúmenes (incluido DB), imágenes locales. Usá con cuidado.
	docker compose down -v
	@echo "✓ Todo limpio. Próximo `make up` arranca de cero."

# ─── Dependencias ───────────────────────────────────────
# Uso: make install-front PKG="@some/package"
install-front: ## Instalar dependencia en frontend (host + container). Uso: make install-front PKG=name
	@if [ -z "$(PKG)" ]; then echo "✖ Falta PKG. Uso: make install-front PKG=nombre"; exit 1; fi
	cd frontend && npm install $(PKG) --legacy-peer-deps
	docker compose exec frontend npm install $(PKG) --legacy-peer-deps
	docker compose restart frontend
	@echo "✓ $(PKG) instalado en host y container"

install-back: ## Instalar dependencia en backend. Uso: make install-back PKG=name
	@if [ -z "$(PKG)" ]; then echo "✖ Falta PKG. Uso: make install-back PKG=nombre"; exit 1; fi
	cd backend && npm install $(PKG)
	docker compose exec backend npm install $(PKG)
	docker compose restart backend
	@echo "✓ $(PKG) instalado en host y container"

sync-front: ## Sincronizar node_modules del container con package.json (sin rebuild)
	docker compose exec frontend npm install --legacy-peer-deps
	docker compose restart frontend

sync-back: ## Sincronizar node_modules del backend
	docker compose exec backend npm install
	docker compose restart backend

sync: sync-front sync-back ## Sincronizar ambos

install: ## Primer setup: instala deps en host (para tsc/IDE) y arranca con rebuild
	cd frontend && npm install --legacy-peer-deps
	cd backend && npm install
	docker compose up -d --build
	@$(MAKE) verify

# ─── Database ──────────────────────────────────────────
migrate: ## Crear migration. Uso: make migrate NAME=add_users
	@if [ -z "$(NAME)" ]; then echo "✖ Falta NAME. Uso: make migrate NAME=descripcion"; exit 1; fi
	docker compose exec backend npx prisma migrate dev --name $(NAME)
	docker compose exec backend npx prisma generate
	docker compose restart backend

generate: ## Regenerar Prisma client (después de schema change sin migration)
	docker compose exec backend npx prisma generate
	docker compose restart backend

seed: ## Correr seed de la DB (requiere prisma/seed.ts)
	docker compose exec backend npx prisma db seed

# ─── Shells ────────────────────────────────────────────
shell-front: ## Bash dentro del container de frontend
	docker compose exec frontend sh

shell-back: ## Bash dentro del container de backend
	docker compose exec backend sh

shell-db: ## psql conectado a la DB
	docker compose exec postgres psql -U pelotitas -d pelotitas

# ─── Mobile (Capacitor) ────────────────────────────────
ios: ## Generar proyecto iOS (1ra vez)
	cd frontend && npm run mobile:add:ios

android: ## Generar proyecto Android (1ra vez)
	cd frontend && npm run mobile:add:android

mobile-sync: ## Sync Capacitor con últimos plugins/config
	cd frontend && npm run mobile:sync

open-ios: ## Abrir proyecto iOS en Xcode
	cd frontend && npm run mobile:open:ios

open-android: ## Abrir proyecto Android en Android Studio
	cd frontend && npm run mobile:open:android

# ─── Verificación ──────────────────────────────────────
verify: ## Verificar que el stack está saludable
	@echo "─── Containers ───"
	@docker compose ps
	@echo ""
	@echo "─── Health checks ───"
	@curl -s -o /dev/null -w "Frontend  http://localhost:3098 → %{http_code}\n" http://localhost:3098/ || echo "Frontend  unreachable"
	@curl -s -o /dev/null -w "Backend   http://localhost:3099 → %{http_code}\n" http://localhost:3099/api/clubs || echo "Backend   unreachable"
	@echo ""
	@echo "─── Capacitor (frontend container) ───"
	@docker compose exec -T frontend node -e "console.log('@capacitor/core:', require('@capacitor/core/package.json').version)" 2>/dev/null || echo "✖ Capacitor no está en el container — corré: make sync-front"
