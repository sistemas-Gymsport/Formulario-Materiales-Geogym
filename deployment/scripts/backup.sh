#!/usr/bin/env bash
set -euo pipefail

DB_NAME=${DB_NAME:-geogym}
BACKUP_DIR=${BACKUP_DIR:-/var/backups/geogym}
RETENTION_DAYS=${RETENTION_DAYS:-30}
STAMP=$(date +%Y%m%d-%H%M%S)

umask 077
mkdir -p "$BACKUP_DIR"
pg_dump --format=custom --no-owner --dbname="$DB_NAME" --file="$BACKUP_DIR/geogym-$STAMP.dump"
pg_restore --list "$BACKUP_DIR/geogym-$STAMP.dump" >/dev/null
find "$BACKUP_DIR" -name 'geogym-*.dump' -type f -mtime +"$RETENTION_DAYS" -delete
echo "Respaldo creado: $BACKUP_DIR/geogym-$STAMP.dump"
