# GEO GYM · Sistema de solicitudes de materiales

Aplicación web para que las sucursales de GEO GYM soliciten materiales (sin cantidades), con panel administrativo, reportes mensuales en PDF generados en memoria y salida de eventos hacia n8n para notificaciones por WhatsApp.

- **Frontend:** React 19 + Vite 6, JavaScript/JSX, CSS por módulos con variables, Motion, Recharts, Lucide.
- **Backend:** Node.js 20+, Express 5, Prisma 6, PostgreSQL, Zod, Argon2id, Helmet, Pino, PDFKit.
- **Infraestructura:** Ubuntu 24.04, PostgreSQL local, Nginx, Let's Encrypt, systemd (o PM2).

---

## Estructura

```text
geogym-materiales/
├── backend/
│   ├── prisma/            schema.prisma, migraciones, catálogo inicial y seed
│   ├── scripts/           admin:create, generación de secretos, preparación de pruebas
│   ├── src/
│   │   ├── config/        variables de entorno validadas, logger, Prisma
│   │   ├── middleware/    autenticación, CSRF, rate limiting, validación, errores
│   │   ├── routes/        API pública, administrativa y callback de n8n
│   │   ├── services/      reglas de negocio (solicitudes, horarios, reportes, PDF, notificaciones)
│   │   ├── validators/    esquemas Zod
│   │   ├── jobs/          cierre mensual, outbox y limpieza de sesiones
│   │   └── utils/         zona horaria, normalización, cifrado
│   └── tests/             pruebas unitarias y de integración (Vitest + Supertest)
├── frontend/
│   └── src/
│       ├── components/    common, form, admin, charts
│       ├── pages/         public y admin
│       ├── hooks/ contexts/ services/ utils/ styles/ layouts/
├── deployment/            Nginx, systemd, PM2 y scripts de instalación, despliegue y respaldo
└── README.md
```

Prisma ya actúa como capa de repositorio; los servicios concentran la lógica y las rutas solo validan y delegan.

---

## Funcionalidades principales

| Módulo | Detalle |
|---|---|
| Formulario público `/solicitar` | Nombre + sucursal, catálogo por categorías con búsqueda instantánea local, selección por material (sin cantidades), materiales adicionales no editables, resumen antes de enviar, folio `SOL-AAAAMMDD-NNNN`. |
| Disponibilidad | Días, horario, zona horaria, apagado manual, fechas extraordinarias y bloqueadas. El backend vuelve a validar al momento exacto del envío. |
| Idempotencia | Cada confirmación envía `Idempotency-Key`; reintentos y doble clic devuelven el mismo folio. |
| Panel `/admin` | Dashboard, solicitudes (filtros y paginación en servidor), materiales, adicionales de usuarios, categorías, sucursales, reportes, horarios, integraciones, administradores y perfil. |
| Reportes | Exclusivamente mensuales, en la zona horaria oficial. Indicadores, 6 gráficas, conclusiones deterministas, detalle por solicitante y PDF completo generado en memoria (nunca se escribe en disco). |
| Cierre mensual | Tarea idempotente que marca como cerrados los meses terminados. No elimina datos. |
| n8n / WhatsApp | Outbox persistente, reintentos con backoff, firma HMAC, política para eventos retenidos y callback opcional de confirmación de entrega. |

---

## Desarrollo local

Requisitos: Node.js 20.11+ y PostgreSQL 15+.

```bash
cd backend
npm install
cp .env.example .env
npm run secret:generate
```

Copia el valor generado en `INTEGRATION_ENCRYPTION_KEY` y ajusta `DATABASE_URL`, `MIGRATION_DATABASE_URL` y `TEST_DATABASE_URL`.

Crear las bases (ejemplo con el usuario `postgres`):

```bash
sudo -u postgres psql -c "CREATE ROLE geogym_owner LOGIN PASSWORD 'cambia-esto';" -c "CREATE DATABASE geogym OWNER geogym_owner;" -c "CREATE DATABASE geogym_test OWNER geogym_owner;"
```

En local puedes usar el mismo rol en `DATABASE_URL` y `MIGRATION_DATABASE_URL`. Después:

```bash
npx prisma migrate deploy
```

```bash
npm run db:seed
```

```bash
npm run admin:create
```

```bash
npm run dev
```

En otra terminal:

```bash
cd frontend && npm install && npm run dev
```

- Formulario: http://localhost:5173/solicitar
- Panel: http://localhost:5173/admin

Vite redirige `/api` al backend (puerto 4000), por lo que las cookies funcionan como en producción (mismo origen).

### Pruebas

`TEST_DATABASE_URL` debe apuntar a una base **exclusiva para pruebas** (se vacía en cada prueba). El script se niega a ejecutarse si coincide con `DATABASE_URL`.

```bash
cd backend && npm test
```

Cubren: disponibilidad y zona horaria, idempotencia y doble envío concurrente, folios únicos, formulario cerrado vía API directa, validación de materiales y adicionales, snapshots históricos, autenticación, bloqueo por intentos, CSRF, permisos, administración de catálogo y horarios, estadísticas mensuales, PDF en memoria sin archivos en disco, PDF completo con muchas solicitudes, outbox con n8n activo, inactivo y caído, política de eventos retenidos, firma HMAC y cierre mensual idempotente.

---

## Administradores

Las credenciales **nunca** van en `.env`. El primer administrador se registra en PostgreSQL con:

```bash
cd backend && npm run admin:create
```

El comando verifica la conexión, se detiene si ya existe un administrador, pide usuario y contraseña (oculta, con confirmación), valida la política (12+ caracteres, mayúsculas, minúsculas, número, símbolo, sin incluir el usuario), guarda el hash Argon2id y confirma el registro sin imprimir la contraseña. Requiere una terminal interactiva.

Los administradores adicionales se crean desde **Panel → Administradores**, donde también se cambia la contraseña propia (cierra las demás sesiones).

Seguridad de sesión: cookie `HttpOnly`, `SameSite=Strict`, `Secure` y prefijo `__Host-` en producción; token CSRF por sesión en cada operación de escritura; bloqueo de 15 minutos tras 5 intentos fallidos más límite por IP.

---

## Producción en VPS Ubuntu 24.04

### Instalación inicial

1. Apunta el registro DNS `A` del dominio a la IP del VPS.
2. Lleva el código al VPS de una de estas dos formas:
   - **Con Git:** sube el proyecto a un repositorio y el script lo clonará.
   - **Sin Git:** copia la carpeta (sin `node_modules`, `dist` ni `.env`) a `/opt/geogym-materiales` y deja vacía la pregunta del repositorio.
3. En el VPS:

```bash
sudo bash /opt/geogym-materiales/deployment/scripts/install-server.sh
```

El script instala Node.js 22, PostgreSQL, Nginx y Certbot; configura el firewall (solo SSH, 80 y 443); limita PostgreSQL a `localhost`; crea dos roles de base de datos (`geogym_owner` para migraciones y `geogym_app` solo con `SELECT/INSERT/UPDATE/DELETE`); genera `backend/.env` con contraseñas y clave de cifrado aleatorias (permisos 600); obtiene el certificado HTTPS; instala el servicio systemd; ejecuta migraciones, seed y compilación; y programa respaldos diarios.

4. Registra el primer administrador en la base real:

```bash
cd /opt/geogym-materiales/backend && sudo -u geogym npm run admin:create
```

> El administrador no se ha creado en ningún servidor durante el desarrollo: este paso debe ejecutarse en tu VPS.

### Actualizar desde Git

```bash
sudo bash /opt/geogym-materiales/deployment/scripts/deploy.sh
```

Hace `git pull`, instala dependencias, aplica migraciones con el rol propietario (`prisma migrate deploy`, nunca `db push`), compila el frontend y reinicia el servicio.

### Servicio y logs

```bash
sudo systemctl status geogym-backend
```

```bash
sudo journalctl -u geogym-backend -f
```

Los logs son JSON (Pino) y ocultan cookies, contraseñas, tokens y secretos. Alternativa con PM2: `deployment/pm2/ecosystem.config.cjs`.

### Respaldos

Diarios a las 03:15 en `/var/backups/geogym` (formato custom de `pg_dump`, verificados con `pg_restore --list`, retención de 30 días). Manual:

```bash
sudo -u postgres /usr/local/bin/geogym-backup
```

Restaurar (crea un respaldo previo automáticamente y pide confirmación):

```bash
sudo bash /opt/geogym-materiales/deployment/scripts/restore.sh /var/backups/geogym/geogym-AAAAMMDD-HHMMSS.dump
```

Copia periódicamente los respaldos fuera del VPS.

### Cambiar el dominio

1. Apunta el DNS del nuevo dominio al VPS.
2. Obtén el certificado:

```bash
sudo certbot certonly --webroot -w /var/www/letsencrypt -d NUEVO_DOMINIO
```

3. Regenera la configuración de Nginx:

```bash
sudo sh -c 'sed "s/TU_DOMINIO/NUEVO_DOMINIO/g" /opt/geogym-materiales/deployment/nginx/geogym-materiales.conf > /etc/nginx/sites-available/geogym-materiales.conf' && sudo nginx -t && sudo systemctl reload nginx
```

4. Actualiza `CORS_ORIGINS=https://NUEVO_DOMINIO` en `backend/.env` y reinicia:

```bash
sudo systemctl restart geogym-backend
```

---

## Integración con n8n (WhatsApp)

El sistema **no** envía mensajes por sí mismo ni desde el navegador. Al confirmarse una solicitud:

1. Se guarda en PostgreSQL dentro de una transacción junto con un evento en `NotificationOutbox`.
2. Si la integración está activa, el backend envía el evento al webhook de n8n; si está inactiva el evento queda `HELD` y no se hace ninguna petición externa.
3. Si n8n falla, la solicitud permanece guardada y el evento se reintenta (1, 5, 15, 60, 180, 360 y 720 minutos; luego `FAILED`, reintento manual desde el panel).
4. Una respuesta `2xx` marca el evento como `SENT` («enviada a n8n»). Esto **no** significa que WhatsApp lo entregó.

Configura en **Panel → Integraciones**: activación, URL del webhook (HTTPS obligatorio en producción, salvo `http://localhost` o `http://127.0.0.1` cuando n8n corre en el mismo VPS), número destinatario en formato internacional, secreto compartido (cifrado con AES-256-GCM; nunca se muestra completo) y qué hacer con los eventos retenidos al activar (ignorarlos o enviarlos).

### Petición que recibe n8n

`POST` con `Content-Type: application/json` y encabezados:

| Encabezado | Valor |
|---|---|
| `X-GeoGym-Event` | `REQUEST_CREATED` o `CONNECTION_TEST` |
| `X-GeoGym-Event-Id` | UUID del evento (úsalo para descartar duplicados) |
| `X-GeoGym-Timestamp` | segundos Unix |
| `X-GeoGym-Signature` | `sha256=` + HMAC-SHA256(secreto, `timestamp + "." + cuerpo`) |
| `Authorization` | `Bearer <secreto>` solo si eliges el modo «HMAC + Bearer» (permite usar *Header Auth* del nodo Webhook) |

```json
{
  "eventId": "6c1f…",
  "type": "REQUEST_CREATED",
  "attempt": 1,
  "destinationPhone": "+5215512345678",
  "request": {
    "folio": "SOL-20261021-0001",
    "requesterName": "Nombre completo",
    "branchName": "Satélite",
    "date": "21/10/2026",
    "time": "10:42",
    "createdAt": "2026-10-21T16:42:00.000Z",
    "categories": [{ "name": "Papelería y oficina", "materials": ["Hojas blancas", "Pluma negra"] }],
    "customMaterials": ["Nombre del material personalizado"],
    "totalMaterials": 5
  },
  "message": "*NUEVA SOLICITUD DE MATERIALES – GEO GYM*\n\nFolio: …"
}
```

`message` ya viene formateado para WhatsApp; puedes usarlo tal cual o construir el tuyo con `request`.

Verificación de la firma en un nodo *Code* de n8n (activa «Raw Body» en el Webhook):

```js
const crypto = require('crypto');
const secret = $env.GEOGYM_SECRET;
const ts = $json.headers['x-geogym-timestamp'];
const raw = Buffer.from($binary.data.data, 'base64').toString('utf8');
const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(`${ts}.${raw}`).digest('hex');
if (expected !== $json.headers['x-geogym-signature'] || Math.abs(Date.now() / 1000 - Number(ts)) > 300) throw new Error('Firma inválida');
return [{ json: JSON.parse(raw) }];
```

### Confirmación de entrega (opcional)

Cuando tu proveedor de WhatsApp confirme la entrega, n8n puede informarlo:

`POST https://TU_DOMINIO/api/integrations/n8n/delivery` con cuerpo `{"eventId":"<uuid>","status":"delivered|read|failed","detail":"opcional"}`, firmado igual (`X-GeoGym-Timestamp` + `X-GeoGym-Signature`) o con `Authorization: Bearer` en modo Bearer. El panel mostrará «Entregada», «Leída» o «Entrega fallida» solo cuando reciba esta confirmación.

---

## API

| Método | Ruta | Uso |
|---|---|---|
| GET | `/api/public/config` | Disponibilidad, sucursales, catálogo y límites en una sola llamada |
| GET | `/api/public/form-availability` · `/branches` · `/categories` · `/materials` | Consultas públicas individuales |
| POST | `/api/public/requests` | Registrar solicitud (requiere `Idempotency-Key`) |
| POST/GET | `/api/admin/auth/login` · `/logout` · `/me` · `/password` | Sesión administrativa |
| GET | `/api/admin/dashboard` | Resumen del mes actual |
| GET | `/api/admin/requests` · `/requests/:id` | Consulta con filtros (mes, sucursal, solicitante, categoría, material, folio) |
| GET/POST/PATCH | `/api/admin/materials` · `/materials/:id` · `/materials/:id/move` · `/materials/custom` | Catálogo y adicionales |
| GET/POST/PATCH | `/api/admin/categories…` · `/api/admin/branches…` | Categorías y sucursales |
| GET/PUT | `/api/admin/schedule` · POST/DELETE `/schedule/exceptions` | Disponibilidad |
| GET | `/api/admin/reports/monthly` · `/reports/monthly/pdf` | Reporte JSON y PDF (`?year=&month=`) |
| GET/POST | `/api/admin/reports/closes` | Cierres mensuales |
| GET/PUT/POST | `/api/admin/integrations` · `/credential` · `/test` · `/retry` | Integración n8n |
| GET/POST/PATCH | `/api/admin/admins` | Administradores |
| POST | `/api/integrations/n8n/delivery` | Confirmación de entrega firmada |

---

## Identidad visual

Paleta oficial (`#EBE8E2`, `#F64851`, `#393939`, `#000000`) definida en `frontend/src/styles/tokens.css`. Tipografías libres autoalojadas: **Unbounded** (títulos) y **Manrope** (texto), en sustitución de *Brought* mientras no se cuente con licencia web; para usarla, agrega los archivos con licencia y cambia `--font-display`.

El logotipo oficial está en `brand/geogym-logo-original.webp` (2000×1779). Variantes derivadas:

| Archivo | Uso |
|---|---|
| `frontend/public/assets/logo.webp` (640 px) | Sticker de marca en el formulario y el login |
| `frontend/public/assets/logo-sm.webp` (256 px) | Insignia de las barras superior y lateral |
| `frontend/public/assets/favicon.png`, `apple-touch-icon.png` | Íconos del navegador y del celular |
| `backend/assets/logo.jpg` (700 px) | Portada y encabezados del PDF (PDFKit acepta PNG o JPEG; se usa `logo.png` si existe) |

Para cambiar el logotipo basta con reemplazar esos archivos manteniendo los nombres.

Los botones coral usan texto negro para cumplir contraste AA; la selección se indica con color, ícono de verificación y `aria-checked`, y todas las animaciones respetan `prefers-reduced-motion`.
