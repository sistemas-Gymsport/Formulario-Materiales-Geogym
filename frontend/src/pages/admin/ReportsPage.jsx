import { useMemo, useRef, useState } from 'react';
import { Download, Lock } from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import { useResource } from '../../hooks/useResource.js';
import { useAction } from '../../hooks/useAction.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Card, PageHeader } from '../../components/admin/AdminUi.jsx';
import { MonthPicker } from '../../components/admin/MonthPicker.jsx';
import { InsightList, SummaryStats } from '../../components/admin/ReportBlocks.jsx';
import { RequestDetailModal } from '../../components/admin/RequestDetail.jsx';
import { BranchBarChart, BranchCategoryChart, CategoryDonut, DailyAreaChart, RankingChart } from '../../components/charts/Charts.jsx';
import { Button } from '../../components/common/Button.jsx';
import { EmptyState, ErrorState, Skeleton, StatusPill } from '../../components/common/Feedback.jsx';
import { currentYearMonth, formatDateTime, monthKey } from '../../utils/dates.js';
import { downloadBlob } from '../../utils/files.js';

const RequestersTable = ({ requesters, onOpen }) =>
  requesters.length ? (
    <div className="table-wrap">
      <table className="table table--stack">
        <thead>
          <tr>
            <th>Solicitante</th>
            <th>Sucursal</th>
            <th className="num">Solicitudes</th>
            <th>Folios y fechas</th>
          </tr>
        </thead>
        <tbody>
          {requesters.map((r) => (
            <tr key={`${r.name}-${r.branch}`}>
              <td data-label="Solicitante" className="table__primary">
                {r.name}
              </td>
              <td data-label="Sucursal">{r.branch}</td>
              <td data-label="Solicitudes" className="num">
                {r.count}
              </td>
              <td data-label="Folios">
                <div className="tag-list">
                  {r.requests.map((q) => (
                    <button key={q.id} type="button" className="tag" onClick={() => onOpen(q.id)} title={`${q.itemCount} materiales`}>
                      {q.folio} · {formatDateTime(q.createdAt)}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <EmptyState title="Sin solicitantes este mes" />
  );

export default function ReportsPage() {
  const [month, setMonth] = useState(monthKey(currentYearMonth()));
  const [detailId, setDetailId] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const abortRef = useRef(null);
  const [year, monthNumber] = useMemo(() => month.split('-').map(Number), [month]);
  const report = useResource(() => adminApi.reports.monthly(year, monthNumber), [year, monthNumber]);
  const { run, busy } = useAction();
  const toast = useToast();

  const download = async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setDownloading(true);
    try {
      const response = await adminApi.reports.pdf(year, monthNumber, abortRef.current.signal);
      downloadBlob(await response.blob(), `reporte-geogym-${month}.pdf`);
      toast.success('Reporte descargado');
    } catch (error) {
      if (error.name !== 'AbortError') toast.error(error.message);
    } finally {
      setDownloading(false);
    }
  };

  const closeMonth = async () => {
    if (await run('close', () => adminApi.reports.close(year, monthNumber), 'Periodo marcado como cerrado')) report.reload({ silent: true });
  };

  const data = report.data;
  return (
    <>
      <PageHeader
        kicker="Análisis mensual"
        title="Reportes"
        description="Estadísticas exclusivamente mensuales calculadas con la zona horaria oficial. El PDF se genera al momento y no se almacena."
        actions={
          <Button variant="coral" icon={Download} loading={downloading} onClick={download} disabled={!data}>
            Descargar reporte mensual completo
          </Button>
        }
      />
      <Card style={{ marginBottom: 20 }}>
        <div className="toolbar" style={{ marginBottom: 0, alignItems: 'center' }}>
          <div style={{ flex: '0 1 280px' }}>
            <MonthPicker value={month} onChange={setMonth} label="Periodo" />
          </div>
          {data && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 26 }}>
              <StatusPill tone={data.period.isClosed ? 'dark' : data.period.isCurrent ? 'open' : 'neutral'}>
                {data.period.isClosed ? `Cerrado ${formatDateTime(data.period.closedAt)}` : data.period.isCurrent ? 'Mes en curso' : 'Periodo abierto'}
              </StatusPill>
              {!data.period.isClosed && !data.period.isCurrent && (
                <Button size="sm" variant="ghost" icon={Lock} loading={busy === 'close'} onClick={closeMonth}>
                  Cerrar periodo
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
      {report.error ? (
        <ErrorState error={report.error} onRetry={report.reload} />
      ) : !data ? (
        <div className="grid">
          <Skeleton height={220} radius={20} />
          <Skeleton height={320} radius={20} />
        </div>
      ) : (
        <div className="grid" style={{ gap: 20, opacity: report.loading ? 0.6 : 1, transition: 'opacity .2s' }}>
          <SummaryStats summary={data.summary} />
          <Card title="Conclusiones automáticas" subtitle="Calculadas de forma determinista con los datos del mes">
            <InsightList insights={data.insights} />
          </Card>
          <div className="grid grid--2">
            <Card title="Solicitudes por sucursal" className="chart-card">
              <BranchBarChart data={data.charts.byBranch} />
            </Card>
            <Card title="Participación por categorías" subtitle="Selecciones del catálogo" className="chart-card">
              <CategoryDonut data={data.charts.byCategory} />
            </Card>
          </div>
          <Card title="Solicitudes por día del mes" className="chart-card">
            <DailyAreaChart data={data.charts.byDay} />
          </Card>
          <div className="grid grid--2">
            <Card title="Materiales más solicitados" subtitle="Número de solicitudes que incluyen cada material">
              <RankingChart data={data.charts.topMaterials} />
            </Card>
            <Card title="Sucursales y categorías" subtitle="Selecciones por categoría en cada sucursal" className="chart-card">
              <BranchCategoryChart data={data.charts.branchCategory} />
            </Card>
          </div>
          {data.charts.topCustom.length > 0 && (
            <Card title="Materiales adicionales más frecuentes" subtitle="Escritos por los solicitantes fuera del catálogo">
              <RankingChart data={data.charts.topCustom} unit="veces" />
            </Card>
          )}
          <Card title="Detalle por solicitante" subtitle="Agrupación aproximada por nombre normalizado y sucursal">
            <RequestersTable requesters={data.requesters} onOpen={setDetailId} />
          </Card>
        </div>
      )}
      <RequestDetailModal id={detailId} onClose={() => setDetailId(null)} />
    </>
  );
}
