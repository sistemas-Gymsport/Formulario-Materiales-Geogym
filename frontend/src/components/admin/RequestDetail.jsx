import { Modal } from '../common/Modal.jsx';
import { ErrorState, Skeleton, StatusPill } from '../common/Feedback.jsx';
import { adminApi } from '../../services/adminApi.js';
import { useResource } from '../../hooks/useResource.js';
import { formatDateTime } from '../../utils/dates.js';

const NOTIFICATION = {
  HELD: { tone: 'neutral', label: 'Integración inactiva' },
  IGNORED: { tone: 'neutral', label: 'Omitida' },
  PENDING: { tone: 'warning', label: 'Pendiente' },
  PROCESSING: { tone: 'warning', label: 'Enviando' },
  SENT: { tone: 'open', label: 'Enviada a n8n' },
  FAILED: { tone: 'closed', label: 'Fallida' }
};

const PROVIDER = { delivered: 'Entregada', read: 'Leída', failed: 'Entrega fallida' };

export const NotificationPill = ({ notification }) => {
  if (!notification) return <span className="muted">—</span>;
  if (notification.providerStatus) {
    return <StatusPill tone={notification.providerStatus === 'failed' ? 'closed' : 'open'}>{PROVIDER[notification.providerStatus]}</StatusPill>;
  }
  const meta = NOTIFICATION[notification.status] ?? NOTIFICATION.HELD;
  return <StatusPill tone={meta.tone}>{meta.label}</StatusPill>;
};

const DetailBody = ({ id }) => {
  const { data, error, loading, reload } = useResource(() => adminApi.request(id), [id]);
  if (loading) return <Skeleton height={220} radius={16} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return (
    <div className="grid" style={{ gap: 20 }}>
      <dl className="kv">
        <dt>Folio</dt>
        <dd className="tabular">{data.folio}</dd>
        <dt>Fecha</dt>
        <dd>{formatDateTime(data.createdAt)}</dd>
        <dt>Solicitante</dt>
        <dd>{data.requesterName}</dd>
        <dt>Sucursal</dt>
        <dd>{data.branchName}</dd>
        <dt>Total</dt>
        <dd>{data.itemCount} materiales diferentes</dd>
        <dt>WhatsApp</dt>
        <dd>
          <NotificationPill notification={data.notification} />
          {data.notification?.lastError && (
            <small className="muted" style={{ display: 'block', marginTop: 6 }}>
              {data.notification.lastError}
            </small>
          )}
        </dd>
      </dl>
      {data.categories.map((c) => (
        <section key={c.name} className="review-group">
          <h3>
            {c.name}
            <span>{c.materials.length}</span>
          </h3>
          <ul className="review-list">
            {c.materials.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>
      ))}
      {data.customMaterials.length > 0 && (
        <section className="review-group">
          <h3>
            Materiales adicionales
            <span>{data.customMaterials.length}</span>
          </h3>
          <ul className="review-list review-list--custom">
            {data.customMaterials.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export const RequestDetailModal = ({ id, onClose }) => (
  <Modal open={Boolean(id)} onClose={onClose} title="Detalle de solicitud" width="640px">
    {id && <DetailBody id={id} />}
  </Modal>
);
