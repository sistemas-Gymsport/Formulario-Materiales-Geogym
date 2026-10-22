import { useMemo, useState } from 'react';
import { CheckCircle2, Plus, Search } from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import { useResource } from '../../hooks/useResource.js';
import { useAction } from '../../hooks/useAction.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useDebounced } from '../../hooks/useDebounced.js';
import { Card, PageHeader, Tabs } from '../../components/admin/AdminUi.jsx';
import { EntityModal } from '../../components/admin/EntityModal.jsx';
import { ActiveBadge, RowActions } from '../../components/admin/RowActions.jsx';
import { Button } from '../../components/common/Button.jsx';
import { TextField } from '../../components/common/Field.jsx';
import { EmptyState, ErrorState, Skeleton, StatusPill } from '../../components/common/Feedback.jsx';
import { formatDateTime } from '../../utils/dates.js';

const required = (v) => (!v || String(v).trim().length < 2 ? 'Escribe al menos 2 caracteres' : null);

const CatalogTab = ({ categories, onEdit, version }) => {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('all');
  const debounced = useDebounced(search.trim());
  const list = useResource(() => adminApi.materials.list({ search: debounced, categoryId, status }), [debounced, categoryId, status, version]);
  const { run, busy } = useAction();

  const act = async (key, task, message) => {
    if (await run(key, task, message)) list.reload({ silent: true });
  };

  return (
    <>
      <div className="toolbar">
        <TextField label="Buscar" icon={Search} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre del material" maxLength={80} />
        <TextField as="select" label="Categoría" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </TextField>
        <TextField as="select" label="Estado" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </TextField>
      </div>
      {list.error ? (
        <ErrorState error={list.error} onRetry={list.reload} />
      ) : !list.data ? (
        <Skeleton height={300} radius={16} />
      ) : list.data.length === 0 ? (
        <EmptyState title="Sin materiales">No hay materiales con estos filtros.</EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="table table--stack">
            <thead>
              <tr>
                <th>Material</th>
                <th>Categoría</th>
                <th className="num">Veces solicitado</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.data.map((m, i, all) => {
                const sameCategory = (other) => other && other.categoryId === m.categoryId;
                return (
                  <tr key={m.id} className={m.isActive ? '' : 'is-inactive'}>
                    <td data-label="Material" className="table__primary">
                      {m.name}
                    </td>
                    <td data-label="Categoría">{m.category.name}</td>
                    <td data-label="Veces solicitado" className="num">
                      {m._count.requestItems}
                    </td>
                    <td data-label="Estado">
                      <ActiveBadge active={m.isActive} />
                    </td>
                    <td>
                      <RowActions
                        label={m.name}
                        isActive={m.isActive}
                        busy={busy === m.id}
                        first={!sameCategory(all[i - 1])}
                        last={!sameCategory(all[i + 1])}
                        onMove={!debounced && status === 'all' ? (dir) => act(m.id, () => adminApi.materials.move(m.id, dir)) : undefined}
                        onEdit={() => onEdit(m)}
                        onToggle={() => act(m.id, () => adminApi.materials.update(m.id, { isActive: !m.isActive }), m.isActive ? 'Material desactivado' : 'Material reactivado')}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

const CustomTab = ({ onPromote, version }) => {
  const list = useResource(() => adminApi.materials.custom(), [version]);
  if (list.error) return <ErrorState error={list.error} onRetry={list.reload} />;
  if (!list.data) return <Skeleton height={240} radius={16} />;
  if (!list.data.length) return <EmptyState title="Sin materiales adicionales">Cuando los colaboradores escriban materiales fuera del catálogo aparecerán aquí.</EmptyState>;
  return (
    <div className="table-wrap">
      <table className="table table--stack">
        <thead>
          <tr>
            <th>Material escrito</th>
            <th className="num">Veces</th>
            <th>Última solicitud</th>
            <th>Estado</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {list.data.map((c) => (
            <tr key={c.normalizedName}>
              <td data-label="Material" className="table__primary">
                {c.name}
              </td>
              <td data-label="Veces" className="num">
                {c.timesRequested}
              </td>
              <td data-label="Última solicitud">
                {c.lastRequestedAt ? `${formatDateTime(c.lastRequestedAt)} · ${c.lastBranch}` : '—'}
              </td>
              <td data-label="Estado">{c.inCatalog ? <StatusPill tone="open">En catálogo</StatusPill> : <StatusPill tone="warning">Fuera del catálogo</StatusPill>}</td>
              <td>
                <div className="row-actions">
                  {!c.inCatalog && (
                    <Button size="sm" variant="ghost" icon={CheckCircle2} onClick={() => onPromote(c.name)}>
                      Agregar al catálogo
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function MaterialsPage() {
  const [tab, setTab] = useState('catalog');
  const [editing, setEditing] = useState(null);
  const [version, setVersion] = useState(0);
  const toast = useToast();
  const categories = useResource(() => adminApi.categories.list(), []);
  const categoryList = categories.data?.categories ?? [];
  const fields = useMemo(
    () => [
      { name: 'name', label: 'Nombre del material', maxLength: 80, validate: required, placeholder: 'Ej. Cinta canela' },
      { name: 'categoryId', label: 'Categoría', type: 'select', options: categoryList.map((c) => ({ value: String(c.id), label: c.isActive ? c.name : `${c.name} (inactiva)` })) },
      { name: 'isActive', label: 'Visible en el formulario', type: 'switch' }
    ],
    [categoryList]
  );

  const open = (initial) => setEditing({ initial });
  const openNew = (name = '') => open({ name, categoryId: String(categoryList[0]?.id ?? ''), isActive: true });

  const save = async (values) => {
    const body = { name: values.name.trim(), categoryId: Number(values.categoryId), isActive: values.isActive };
    const id = editing.initial.id;
    await (id ? adminApi.materials.update(id, body) : adminApi.materials.create(body));
    toast.success(id ? 'Material actualizado' : 'Material registrado');
    setVersion((v) => v + 1);
  };

  return (
    <>
      <PageHeader
        kicker="Catálogo"
        title="Materiales"
        description="Administra el catálogo del formulario. Los materiales con historial se desactivan, nunca se eliminan."
        actions={
          <Button variant="coral" icon={Plus} onClick={() => openNew()} disabled={!categoryList.length}>
            Nuevo material
          </Button>
        }
      />
      <Card>
        <div style={{ marginBottom: 18 }}>
          <Tabs
            id="materials"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'catalog', label: 'Catálogo' },
              { value: 'custom', label: 'Adicionales de usuarios' }
            ]}
          />
        </div>
        {tab === 'catalog' ? (
          <CatalogTab version={version} categories={categoryList} onEdit={(m) => open({ id: m.id, name: m.name, categoryId: String(m.categoryId), isActive: m.isActive })} />
        ) : (
          <CustomTab version={version} onPromote={openNew} />
        )}
      </Card>
      <EntityModal
        open={Boolean(editing)}
        title={editing?.initial.id ? 'Editar material' : 'Nuevo material'}
        description={editing?.initial.id ? 'El cambio de nombre no modifica las solicitudes históricas.' : undefined}
        fields={fields}
        initialValues={editing?.initial ?? {}}
        onSubmit={save}
        onClose={() => setEditing(null)}
      />
    </>
  );
}
