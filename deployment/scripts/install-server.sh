#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/geogym-materiales
APP_USER=geogym
DB_NAME=geogym
DB_OWNER=geogym_owner
DB_APP=geogym_app

if [[ $EUID -ne 0 ]]; then
  echo "Ejecuta este script con sudo." >&2
  exit 1
fi

read -rp "Dominio (ej. materiales.geogym.mx): " DOMAIN
read -rp "Correo para Let's Encrypt: " EMAIL
read -rp "URL del repositorio Git (vacío si ya subiste el código a /opt/geogym-materiales): " REPO_URL

apt-get update
apt-get install -y ca-certificates curl gnupg git nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw

if ! command -v node >/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

id -u "$APP_USER" >/dev/null 2>&1 || useradd --system --create-home --home-dir /var/lib/geogym --shell /usr/sbin/nologin "$APP_USER"

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

PG_CONF=$(cd /tmp && sudo -u postgres psql -tAc "SHOW config_file")
sed -i "s/^#\?listen_addresses.*/listen_addresses = 'localhost'/" "$PG_CONF"
systemctl restart postgresql

OWNER_PASS=$(openssl rand -hex 24)
APP_PASS=$(openssl rand -hex 24)
ENV_FILE="$APP_DIR/backend/.env"
SET_PASSWORDS=$([[ -f "$ENV_FILE" ]] && echo false || echo true)

cd /tmp
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_OWNER}') THEN CREATE ROLE ${DB_OWNER} LOGIN PASSWORD '${OWNER_PASS}'; ELSIF ${SET_PASSWORDS} THEN ALTER ROLE ${DB_OWNER} PASSWORD '${OWNER_PASS}'; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_APP}') THEN CREATE ROLE ${DB_APP} LOGIN PASSWORD '${APP_PASS}'; ELSIF ${SET_PASSWORDS} THEN ALTER ROLE ${DB_APP} PASSWORD '${APP_PASS}'; END IF;
END \$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_OWNER}' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec
REVOKE ALL ON DATABASE ${DB_NAME} FROM PUBLIC;
GRANT CONNECT ON DATABASE ${DB_NAME} TO ${DB_APP};
SQL

sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$DB_NAME" <<SQL
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO ${DB_APP};
ALTER DEFAULT PRIVILEGES FOR ROLE ${DB_OWNER} IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${DB_APP};
ALTER DEFAULT PRIVILEGES FOR ROLE ${DB_OWNER} IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${DB_APP};
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${DB_APP};
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${DB_APP};
SQL

if [[ -n "$REPO_URL" && ! -d "$APP_DIR/.git" ]]; then
  git clone "$REPO_URL" "$APP_DIR"
fi
if [[ ! -f "$APP_DIR/backend/package.json" ]]; then
  echo "No se encontró el código en $APP_DIR. Clónalo o súbelo y vuelve a ejecutar el script." >&2
  exit 1
fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  cat > "$ENV_FILE" <<ENV
NODE_ENV=production
PORT=4000
HOST=127.0.0.1
DATABASE_URL=postgresql://${DB_APP}:${APP_PASS}@127.0.0.1:5432/${DB_NAME}?schema=public
MIGRATION_DATABASE_URL=postgresql://${DB_OWNER}:${OWNER_PASS}@127.0.0.1:5432/${DB_NAME}?schema=public
CORS_ORIGINS=https://${DOMAIN}
TRUST_PROXY=1
COOKIE_SECURE=true
SESSION_TTL_HOURS=12
INTEGRATION_ENCRYPTION_KEY=$(openssl rand -hex 32)
ALLOW_INSECURE_WEBHOOKS=false
OUTBOX_INTERVAL_SECONDS=20
REPORT_MAX_REQUESTS=20000
LOG_LEVEL=info
ENV
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "Archivo $ENV_FILE generado con credenciales aleatorias."
else
  echo "Se conserva el archivo $ENV_FILE existente y sus contraseñas de base de datos."
fi

mkdir -p /var/www/letsencrypt
sed "s/TU_DOMINIO/${DOMAIN}/g" "$APP_DIR/deployment/nginx/geogym-materiales.conf" > /etc/nginx/sites-available/geogym-materiales.conf
cat > /etc/nginx/sites-available/geogym-bootstrap.conf <<NGINX
server { listen 80; server_name ${DOMAIN}; location /.well-known/acme-challenge/ { root /var/www/letsencrypt; } }
NGINX
ln -sf /etc/nginx/sites-available/geogym-bootstrap.conf /etc/nginx/sites-enabled/geogym-bootstrap.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot certonly --webroot -w /var/www/letsencrypt -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive --deploy-hook "systemctl reload nginx"
rm -f /etc/nginx/sites-enabled/geogym-bootstrap.conf
ln -sf /etc/nginx/sites-available/geogym-materiales.conf /etc/nginx/sites-enabled/geogym-materiales.conf

cp "$APP_DIR/deployment/systemd/geogym-backend.service" /etc/systemd/system/geogym-backend.service
systemctl daemon-reload
systemctl enable geogym-backend

bash "$APP_DIR/deployment/scripts/deploy.sh" --seed

nginx -t && systemctl reload nginx

install -m 755 "$APP_DIR/deployment/scripts/backup.sh" /usr/local/bin/geogym-backup
mkdir -p /var/backups/geogym && chown postgres:postgres /var/backups/geogym && chmod 700 /var/backups/geogym
echo "15 3 * * * postgres /usr/local/bin/geogym-backup" > /etc/cron.d/geogym-backup

echo
echo "Instalación completada. Registra el primer administrador con:"
echo "  cd $APP_DIR/backend && sudo -u $APP_USER npm run admin:create"
