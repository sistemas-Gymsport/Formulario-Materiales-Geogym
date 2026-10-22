#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 || ! -f "$1" ]]; then
  echo "Uso: sudo bash restore.sh /var/backups/geogym/geogym-AAAAMMDD-HHMMSS.dump" >&2
  exit 1
fi

DUMP=$1
DB_NAME=${DB_NAME:-geogym}
DB_OWNER=${DB_OWNER:-geogym_owner}
DB_APP=${DB_APP:-geogym_app}

read -rp "Se reemplazará el contenido de la base '$DB_NAME'. Escribe RESTAURAR para continuar: " CONFIRM
[[ "$CONFIRM" == "RESTAURAR" ]] || { echo "Cancelado."; exit 1; }

systemctl stop geogym-backend
sudo -u postgres /usr/local/bin/geogym-backup || true
sudo -u postgres pg_restore --clean --if-exists --no-owner --role="$DB_OWNER" --dbname="$DB_NAME" "$DUMP"
sudo -u postgres psql -v ON_ERROR_STOP=1 -d "$DB_NAME" <<SQL
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${DB_APP};
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${DB_APP};
SQL
systemctl start geogym-backend
echo "Restauración completada."
