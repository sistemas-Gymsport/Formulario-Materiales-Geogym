#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/geogym-materiales
APP_USER=geogym
RUN="sudo -u $APP_USER -H"

cd "$APP_DIR"
if [[ "${1:-}" != "--seed" && -d "$APP_DIR/.git" ]]; then
  $RUN git pull --ff-only
fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

ENV_FILE="$APP_DIR/backend/.env"
MIGRATION_URL=$(grep -E '^MIGRATION_DATABASE_URL=' "$ENV_FILE" | cut -d= -f2- || true)
[[ -n "$MIGRATION_URL" ]] || MIGRATION_URL=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2-)

cd "$APP_DIR/backend"
$RUN npm ci --include=dev
$RUN env DATABASE_URL="$MIGRATION_URL" npx prisma migrate deploy
$RUN npx prisma generate

if [[ "${1:-}" == "--seed" ]]; then
  $RUN npm run db:seed
fi

cd "$APP_DIR/frontend"
$RUN npm ci --include=dev
$RUN npm run build

systemctl restart geogym-backend
for attempt in $(seq 1 15); do
  if curl -fsS http://127.0.0.1:4000/api/health >/dev/null 2>&1; then
    echo "Backend en línea."
    exit 0
  fi
  sleep 2
done
echo "El backend no respondió. Revisa: journalctl -u geogym-backend -n 80" >&2
exit 1
