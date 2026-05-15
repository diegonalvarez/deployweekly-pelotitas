#!/usr/bin/env bash
# ╭───────────────────────────────────────────────────────────────────╮
# │ Deploy pelotitas to the EC2 instance.                            │
# │                                                                   │
# │ Requires these env vars in your shell (export them in ~/.zshrc): │
# │   EC2_HOST   the host or public DNS  (e.g. ec2-1-2-3-4.compute…)  │
# │   EC2_USER   ssh user                (e.g. ubuntu | ec2-user)     │
# │   EC2_KEY    path to the .pem        (e.g. ~/.ssh/pelotitas.pem)  │
# │   EC2_PATH   project dir on server   (e.g. /home/ubuntu/pelotitas)│
# │                                                                   │
# │ Optional:                                                         │
# │   BRANCH     git branch to pull      (default: main)              │
# │                                                                   │
# │ Usage:                                                            │
# │   ./scripts/deploy.sh           # build + restart                 │
# │   ./scripts/deploy.sh --logs    # tail logs after deploy          │
# │   ./scripts/deploy.sh --no-build # skip rebuild (just pull + up)  │
# ╰───────────────────────────────────────────────────────────────────╯
set -euo pipefail

# ─── Validate env ───────────────────────────────────────────────────
missing=()
[[ -z "${EC2_HOST:-}" ]] && missing+=("EC2_HOST")
[[ -z "${EC2_USER:-}" ]] && missing+=("EC2_USER")
[[ -z "${EC2_KEY:-}"  ]] && missing+=("EC2_KEY")
[[ -z "${EC2_PATH:-}" ]] && missing+=("EC2_PATH")
if (( ${#missing[@]} > 0 )); then
  echo "❌ Missing env vars: ${missing[*]}"
  echo
  echo "Add them to your shell rc, e.g.:"
  echo "  export EC2_HOST=ec2-1-2-3-4.compute-1.amazonaws.com"
  echo "  export EC2_USER=ubuntu"
  echo "  export EC2_KEY=~/.ssh/pelotitas.pem"
  echo "  export EC2_PATH=/home/ubuntu/pelotitas"
  exit 1
fi

# Expand ~ in EC2_KEY since ssh doesn't.
EC2_KEY="${EC2_KEY/#\~/$HOME}"
if [[ ! -f "$EC2_KEY" ]]; then
  echo "❌ SSH key not found at $EC2_KEY"; exit 1
fi

BRANCH="${BRANCH:-main}"
DO_BUILD=1
TAIL_LOGS=0
for arg in "$@"; do
  case "$arg" in
    --no-build) DO_BUILD=0 ;;
    --logs)     TAIL_LOGS=1 ;;
    *) echo "Unknown flag: $arg"; exit 1 ;;
  esac
done

BUILD_FLAG=$([[ $DO_BUILD -eq 1 ]] && echo "--build" || echo "")

echo "▶ Deploying to $EC2_USER@$EC2_HOST:$EC2_PATH (branch=$BRANCH, build=$DO_BUILD)"

# ─── Run remote commands ────────────────────────────────────────────
# Single SSH session so we don't pay handshake cost 4 times. `set -e`
# ensures the remote shell aborts on first failure.
ssh -o StrictHostKeyChecking=accept-new -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" \
  BRANCH="$BRANCH" EC2_PATH="$EC2_PATH" BUILD_FLAG="$BUILD_FLAG" bash <<'REMOTE'
set -euo pipefail
cd "$EC2_PATH"

echo "▶ git fetch + reset to origin/$BRANCH"
git fetch --prune origin
git checkout "$BRANCH"
# Hard reset so untracked-but-tracked changes on the server don't block pull.
git reset --hard "origin/$BRANCH"

if [[ ! -f .env.production ]]; then
  echo "❌ .env.production missing on server. Copy .env.production.example, fill it in, then re-run."
  exit 1
fi

echo "▶ docker compose up -d $BUILD_FLAG"
# --remove-orphans drops the dev-only `postgres` service if it lingers.
docker compose -f docker-compose.prod.yml --env-file .env.production \
  up -d $BUILD_FLAG --remove-orphans

echo "▶ Status"
docker compose -f docker-compose.prod.yml ps
REMOTE

echo "✅ Deploy finished"

if [[ $TAIL_LOGS -eq 1 ]]; then
  echo "▶ Tailing logs (Ctrl-C to exit)"
  ssh -t -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" \
    "cd $EC2_PATH && docker compose -f docker-compose.prod.yml logs -f --tail=80"
fi
