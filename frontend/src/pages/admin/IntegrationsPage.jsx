import { useEffect, useState } from 'react';
import { Copy, KeyRound, Link2, MessageCircle, Phone, PlugZap, RefreshCw, Save } from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import { useResource } from '../../hooks/useResource.js';
import { useAction } from '../../hooks/useAction.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Card, PageHeader, StatCard } from '../../components/admin/AdminUi.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Switch, TextField } from '../../components/common/Field.jsx';
import { ErrorState, Skeleton, StatusPill } from '../../components/common/Feedback.jsx';
import { formatDateTime } from '../../utils/dates.js';

const STATUS = {
  disabled: { tone: 'neutral', label: 'Desactivada' },
  unverified: { tone: 'warning', label: 'Sin verificar' },
  connected: { tone: 'open', label: 'Conectada' },
  error: { tone: 'closed', label: 'Con errores' }
};

const PHONE = /^\+[1-9]\d{7,14}$/;

const toForm = (s) => ({ enabled: s.enabled, webhookUrl: s.webhookUrl ?? '', destinationPhone: s.destinationPhone ?? '', authMode: s.authMode, heldPolicy: s.heldPolicy, credential: '' });

const validate = (form, settings) => {
  const errors = {};
  const phone = form.destinationPhone.replace(/[\s()-]/g, '');
  if (phone && !PHONE.test(phone)) errors.destinationPhone = 'Usa formato internacional: +5215512345678';
  if (form.webhookUrl && !/^https?:\/\/.+/i.test(form.webhookUrl)) errors.webhookUrl = 'URL inválida';
  if (form.credential && form.credential.length < 16) errors.credential = 'Mínimo 16 caracteres';
  if (form.enabled) {
    if (!form.webhookUrl) errors.webhookUrl = 'Requerida para activar';
    if (!phone) errors.destinationPhone = 'Requerido para activar';
    if (!form.credential && !settings.hasCredential) errors.credential = 'Define un secreto o genéralo';
  }
  return errors;
};

const ResultLine = ({ at, ok, message, label }) => (
  <div>
    <dt>{label}</dt>
    <dd>
      {at ? (
        <>
          <StatusPill tone={ok ? 'open' : 'closed'}>{ok ? 'Correcto' : 'Error'}</StatusPill>
          <small className="muted" style={{ display: 'block', marginTop: 6 }}>
            {formatDateTime(at)} · {message}
          </small>
        </>
      ) : (
        <span className="muted">Sin registros</span>
      )}
    </dd>
  </div>
);

export default function IntegrationsPage() {
  const settings = useResource(() => adminApi.integrations.get(), []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [secret, setSecret] = useState(null);
  const { run, busy } = useAction();
  const toast = useToast();

  useEffect(() => {
    if (settings.data) setForm(toForm(settings.data));
  }, [settings.data]);

  if (settings.error) return <ErrorState error={settings.error} onRetry={settings.reload} />;
  if (!form) return <Skeleton height={420} radius={20} />;
  const s = settings.data;

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
  };

  const save = async () => {
    const found = validate(form, s);
    if (Object.keys(found).length) return setErrors(found);
    const body = { ...form, credential: form.credential || undefined };
    const result = await run('save', () => adminApi.integrations.save(body), 'Integración guardada');
    if (result) settings.setData(result);
    return undefined;
  };

  const rotate = async () => {
    const result = await run('rotate', () => adminApi.integrations.rotate());
    if (result) {
      setSecret(result.secret);
      settings.setData(result.settings);
    }
  };

  const test = async () => {
    const result = await run('test', () => adminApi.integrations.test());
    if (!result) return;
    settings.setData(result.settings);
    if (result.result.ok) toast.success('El webhook respondió correctamente');
    else toast.error(result.result.message);
  };

  const retry = async () => {
    const result = await run('retry', () => adminApi.integrations.retry());
    if (result) {
      settings.setData(result.settings);
      toast.success(`${result.requeued} eventos reprogramados`);
    }
  };

  const status = STATUS[s.connectionStatus];
  return (
    <>
      <PageHeader
        kicker="Integraciones"
        title="Notificaciones por WhatsApp"
        description="El backend envía cada solicitud confirmada a tu flujo de n8n, que la reenvía por WhatsApp. Registrar solicitudes nunca depende de esta integración."
        actions={
          <Button variant="coral" icon={Save} loading={busy === 'save'} onClick={save}>
            Guardar
          </Button>
        }
      />
      <div className="grid" style={{ gap: 20 }}>
        <div className="grid grid--stats">
          <StatCard label="Estado" value={status.label} icon={PlugZap} tone={s.connectionStatus === 'connected' ? 'accent' : undefined} index={0} />
          <StatCard label="Pendientes" value={(s.outbox.PENDING ?? 0) + (s.outbox.PROCESSING ?? 0)} icon={RefreshCw} index={1} />
          <StatCard label="Enviadas a n8n" value={s.outbox.SENT ?? 0} icon={MessageCircle} index={2} />
          <StatCard label="Fallidas" value={s.outbox.FAILED ?? 0} icon={RefreshCw} index={3} hint={s.outbox.HELD ? `${s.outbox.HELD} retenidas` : undefined} />
        </div>
        <div className="grid grid--2">
          <Card title="Configuración" subtitle="Guardada en PostgreSQL; el secreto se cifra y nunca se envía al navegador">
            <div className="grid" style={{ gap: 18 }}>
              <Switch checked={form.enabled} onChange={(v) => set('enabled', v)} label="Activar integración" description="Desactivada, el sistema no realiza peticiones externas." />
              <TextField label="URL del webhook de n8n" icon={Link2} value={form.webhookUrl} onChange={(e) => set('webhookUrl', e.target.value)} placeholder="https://n8n.tudominio.com/webhook/geogym" error={errors.webhookUrl} maxLength={500} />
              <TextField label="Número de WhatsApp destinatario" icon={Phone} value={form.destinationPhone} onChange={(e) => set('destinationPhone', e.target.value)} placeholder="+5215512345678" error={errors.destinationPhone} hint="Formato internacional con código de país." />
              <TextField
                label="Secreto compartido"
                icon={KeyRound}
                type="password"
                value={form.credential}
                autoComplete="new-password"
                onChange={(e) => set('credential', e.target.value)}
                placeholder={s.hasCredential ? `Guardado (${s.credentialHint}). Escribe para reemplazar` : 'Mínimo 16 caracteres'}
                error={errors.credential}
              />
              <Button variant="ghost" size="sm" icon={KeyRound} loading={busy === 'rotate'} onClick={rotate} style={{ justifySelf: 'start' }}>
                Generar secreto seguro
              </Button>
              <TextField as="select" label="Autenticación del webhook" value={form.authMode} onChange={(e) => set('authMode', e.target.value)} hint="HMAC firma cada envío sin transmitir el secreto. Bearer facilita usar Header Auth en n8n.">
                <option value="hmac">Firma HMAC-SHA256 (recomendado)</option>
                <option value="header">Firma HMAC + encabezado Authorization Bearer</option>
              </TextField>
              <TextField as="select" label="Solicitudes registradas mientras estuvo desactivada" value={form.heldPolicy} onChange={(e) => set('heldPolicy', e.target.value)} hint="Se aplica al activar la integración.">
                <option value="ignore">Ignorarlas (evita envíos históricos)</option>
                <option value="send">Enviarlas al activar</option>
              </TextField>
            </div>
          </Card>
          <Card title="Conexión" subtitle="Una respuesta 2xx de n8n confirma la recepción del webhook, no la entrega en WhatsApp">
            <dl className="kv" style={{ gridTemplateColumns: '1fr', gap: 18 }}>
              <div>
                <dt>Estado</dt>
                <dd>
                  <StatusPill tone={status.tone}>{status.label}</StatusPill>
                </dd>
              </div>
              <ResultLine label="Última prueba" at={s.lastTestAt} ok={s.lastTestOk} message={s.lastTestMessage} />
              <ResultLine label="Último envío" at={s.lastDeliveryAt} ok={s.lastDeliveryOk} message={s.lastDeliveryMessage} />
              <div>
                <dt>Confirmación de entrega (opcional)</dt>
                <dd style={{ fontWeight: 600 }}>
                  n8n puede reportar la entrega real enviando un POST firmado a <code>{s.callbackPath}</code>.
                </dd>
              </div>
            </dl>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
              <Button variant="dark" size="sm" icon={PlugZap} loading={busy === 'test'} onClick={test}>
                Probar conexión
              </Button>
              <Button variant="ghost" size="sm" icon={RefreshCw} loading={busy === 'retry'} onClick={retry} disabled={!s.outbox.FAILED}>
                Reintentar fallidas
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <Modal
        open={Boolean(secret)}
        onClose={() => setSecret(null)}
        title="Nuevo secreto generado"
        description="Cópialo ahora y configúralo en n8n. Por seguridad no volverá a mostrarse."
        footer={
          <Button
            variant="coral"
            icon={Copy}
            onClick={async () => {
              await navigator.clipboard?.writeText(secret);
              toast.success('Secreto copiado');
            }}
          >
            Copiar secreto
          </Button>
        }
      >
        <div className="secret-box">{secret}</div>
      </Modal>
    </>
  );
}
