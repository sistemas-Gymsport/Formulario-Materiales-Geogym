import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import { useResource } from '../../hooks/useResource.js';
import { Card, PageHeader, TagList } from '../../components/admin/AdminUi.jsx';
import { InsightList, SummaryStats } from '../../components/admin/ReportBlocks.jsx';
import { BranchBarChart, DailyAreaChart } from '../../components/charts/Charts.jsx';
import { EmptyState, ErrorState, Skeleton, StatusPill } from '../../components/common/Feedback.jsx';
import { formatDateTime, formatOpening, formatTime12 } from '../../utils/dates.js';

const INTEGRATION_LABEL = { disabled: 'Desactivada', connected: 'Conectada', error: 'Con errores', unverified: 'Sin verificar' };

export default function DashboardPage() {
  const { data, error, loading, reload } = useResource(() => adminApi.dashboard(), []);

  if (loading && !data) {
    return (
      <div className="grid">
        <Skeleton height={60} width="50%" />
        <div className="grid grid--stats">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} height={110} radius={20} />
          ))}
        </div>
        <Skeleton height={320} radius={20} />
      </div>
    );
  }
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const { report, availability, recent, integration } = data;
  return (
    <>
      <PageHeader
        kicker={report.period.label}
        title="Dashboard"
        description="Resumen en tiempo real del mes en curso. Los números cuentan solicitudes y selecciones, no cantidades físicas."
        actions={
          <>
            <a className="btn btn--ghost btn--sm" href="/solicitar" target="_blank" rel="noreferrer">
              <ExternalLink size={16} /> Ver formulario
            </a>
            <Link className="btn btn--coral btn--sm" to="/admin/reportes">
              Reporte completo <ArrowRight size={16} />
            </Link>
          </>
        }
      />
      <div className="grid" style={{ gap: 20 }}>
        <div className="grid grid--2">
          <Card title="Estado del formulario" delay={0.05}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <StatusPill tone={availability.isOpen ? 'open' : 'closed'}>{availability.isOpen ? 'Abierto' : 'Cerrado'}</StatusPill>
              <span className="muted" style={{ fontWeight: 700 }}>
                {availability.isOpen
                  ? `Recibiendo solicitudes hasta las ${formatTime12(availability.closesAt, availability.timezone)}`
                  : availability.opensAt
                    ? `Próxima apertura: ${formatOpening(availability.opensAt, availability.timezone)}`
                    : 'Sin próxima apertura programada'}
              </span>
            </div>
            <Link to="/admin/configuracion/formulario" className="btn btn--ghost btn--sm" style={{ marginTop: 16 }}>
              Configurar horarios
            </Link>
          </Card>
          <Card title="Notificaciones WhatsApp" delay={0.1}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <StatusPill tone={integration.connectionStatus === 'connected' ? 'open' : integration.connectionStatus === 'error' ? 'closed' : 'neutral'}>
                {INTEGRATION_LABEL[integration.connectionStatus]}
              </StatusPill>
              <span className="muted" style={{ fontWeight: 700 }}>
                {integration.outbox.PENDING ?? 0} pendientes · {integration.outbox.SENT ?? 0} enviadas · {integration.outbox.FAILED ?? 0} fallidas
              </span>
            </div>
            <Link to="/admin/integraciones" className="btn btn--ghost btn--sm" style={{ marginTop: 16 }}>
              Administrar integración
            </Link>
          </Card>
        </div>
        <SummaryStats summary={report.summary} />
        <div className="grid grid--3-1">
          <Card title="Solicitudes por día" subtitle={report.period.label} className="chart-card" delay={0.15}>
            <DailyAreaChart data={report.charts.byDay} />
          </Card>
          <Card title="Por sucursal" className="chart-card" delay={0.2}>
            <BranchBarChart data={report.charts.byBranch} />
          </Card>
        </div>
        <div className="grid grid--2">
          <Card title="Análisis del mes" delay={0.25}>
            <InsightList insights={report.insights} />
          </Card>
          <Card
            title="Solicitudes recientes"
            delay={0.3}
            actions={
              <Link to="/admin/solicitudes" className="btn btn--ghost btn--sm">
                Ver todas
              </Link>
            }
          >
            {recent.length ? (
              <div className="grid" style={{ gap: 12 }}>
                {recent.map((r) => (
                  <div key={r.id} style={{ display: 'grid', gap: 6, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                      <strong style={{ color: 'var(--black)' }}>
                        {r.requesterName} · {r.branchName}
                      </strong>
                      <span className="muted tabular" style={{ fontSize: 13, fontWeight: 700 }}>
                        {r.folio} · {formatDateTime(r.createdAt, availability.timezone)}
                      </span>
                    </div>
                    <TagList items={r.categories.flatMap((c) => c.materials)} custom={r.customMaterials} max={5} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="Aún no hay solicitudes">Las solicitudes aparecerán aquí al registrarse.</EmptyState>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
