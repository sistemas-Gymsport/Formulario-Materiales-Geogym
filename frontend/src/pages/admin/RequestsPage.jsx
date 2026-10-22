import { useMemo, useState } from 'react';
import { Eye, Hash, Package, Search, Store } from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import { useResource } from '../../hooks/useResource.js';
import { useDebounced } from '../../hooks/useDebounced.js';
import { Card, PageHeader, Pagination, TagList } from '../../components/admin/AdminUi.jsx';
import { MonthPicker } from '../../components/admin/MonthPicker.jsx';
import { RequestDetailModal, NotificationPill } from '../../components/admin/RequestDetail.jsx';
import { TextField } from '../../components/common/Field.jsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/common/Feedback.jsx';
import { currentYearMonth, formatDateTime, monthKey } from '../../utils/dates.js';

const initialFilters = () => ({ month: monthKey(currentYearMonth()), branchId: '', categoryId: '', requester: '', material: '', folio: '' });

export default function RequestsPage() {
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);
  const branches = useResource(() => adminApi.branches.list(), []);
  const categories = useResource(() => adminApi.categories.list(), []);
  const textKey = useDebounced(JSON.stringify({ requester: filters.requester.trim(), material: filters.material.trim(), folio: filters.folio.trim() }));
  const text = useMemo(() => JSON.parse(textKey), [textKey]);
  const params = useMemo(
    () => ({ month: filters.month, branchId: filters.branchId, categoryId: filters.categoryId, ...text, page, pageSize: 15 }),
    [filters.month, filters.branchId, filters.categoryId, text, page]
  );
  const list = useResource(() => adminApi.requests(params), [params]);

  const set = (key) => (event) => {
    setFilters((f) => ({ ...f, [key]: typeof event === 'string' ? event : event.target.value }));
    setPage(1);
  };

  return (
    <>
      <PageHeader kicker="Registro" title="Solicitudes" description="Consulta las solicitudes registradas. Los materiales conservan el nombre con el que fueron solicitados." />
      <Card>
        <div className="toolbar">
          <MonthPicker value={filters.month} onChange={set('month')} allowAll />
          <TextField as="select" label="Sucursal" icon={Store} value={filters.branchId} onChange={set('branchId')}>
            <option value="">Todas</option>
            {branches.data?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </TextField>
          <TextField as="select" label="Categoría" value={filters.categoryId} onChange={set('categoryId')}>
            <option value="">Todas</option>
            {categories.data?.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </TextField>
          <TextField label="Solicitante" icon={Search} value={filters.requester} onChange={set('requester')} placeholder="Nombre" maxLength={100} />
          <TextField label="Material" icon={Package} value={filters.material} onChange={set('material')} placeholder="Ej. cloro" maxLength={80} />
          <TextField label="Folio" icon={Hash} value={filters.folio} onChange={set('folio')} placeholder="SOL-…" maxLength={24} />
        </div>
        {list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : list.loading && !list.data ? (
          <div className="grid" style={{ gap: 10 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} height={52} />
            ))}
          </div>
        ) : list.data.data.length === 0 ? (
          <EmptyState title="No hay solicitudes con estos filtros">Ajusta los filtros o selecciona otro mes.</EmptyState>
        ) : (
          <div className="table-wrap" style={{ opacity: list.loading ? 0.55 : 1, transition: 'opacity .2s' }}>
            <table className="table table--stack">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Fecha</th>
                  <th>Solicitante</th>
                  <th>Sucursal</th>
                  <th>Materiales</th>
                  <th>WhatsApp</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.data.data.map((r) => (
                  <tr key={r.id}>
                    <td data-label="Folio" className="table__primary tabular">
                      {r.folio}
                    </td>
                    <td data-label="Fecha" className="tabular" style={{ whiteSpace: 'nowrap' }}>
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td data-label="Solicitante" className="table__primary">
                      {r.requesterName}
                    </td>
                    <td data-label="Sucursal">{r.branchName}</td>
                    <td data-label={`Materiales (${r.itemCount})`} style={{ minWidth: 240 }}>
                      <TagList items={r.categories.flatMap((c) => c.materials)} custom={r.customMaterials} max={4} />
                    </td>
                    <td data-label="WhatsApp">
                      <NotificationPill notification={r.notification} />
                    </td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="icon-btn" onClick={() => setDetailId(r.id)} aria-label={`Ver detalle de ${r.folio}`}>
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={list.data?.pagination} onPage={setPage} />
      </Card>
      <RequestDetailModal id={detailId} onClose={() => setDetailId(null)} />
    </>
  );
}
