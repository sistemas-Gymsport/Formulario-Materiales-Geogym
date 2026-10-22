import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useResource } from '../../hooks/useResource.js';
import { useAction } from '../../hooks/useAction.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { Card, PageHeader } from './AdminUi.jsx';
import { EntityModal } from './EntityModal.jsx';
import { ActiveBadge, RowActions } from './RowActions.jsx';
import { Button } from '../common/Button.jsx';
import { EmptyState, ErrorState, Skeleton } from '../common/Feedback.jsx';

export const OrderedListPage = ({ kicker, title, description, noun, feminine, api, load, columns, fields, emptyValues, toInitial, toBody, extra }) => {
  const list = useResource(load, []);
  const [editing, setEditing] = useState(null);
  const { run, busy } = useAction();
  const toast = useToast();

  const g = feminine ? 'a' : 'o';
  const act = async (id, task, message) => {
    if (await run(id, task, message)) list.reload({ silent: true });
  };

  const save = async (values) => {
    const id = editing.id;
    await (id ? api.update(id, toBody(values)) : api.create(toBody(values)));
    toast.success(id ? `${noun} actualizad${g}` : `${noun} registrad${g}`);
    list.reload({ silent: true });
  };

  const items = list.data ?? [];
  return (
    <>
      <PageHeader
        kicker={kicker}
        title={title}
        description={description}
        actions={
          <Button variant="coral" icon={Plus} onClick={() => setEditing({ values: emptyValues })}>
            Nuev{g}
          </Button>
        }
      />
      {extra}
      <Card>
        {list.error ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : !list.data ? (
          <Skeleton height={260} radius={16} />
        ) : items.length === 0 ? (
          <EmptyState title="Sin registros">Crea el primer registro con el botón «Nuev{g}».</EmptyState>
        ) : (
          <div className="table-wrap">
            <table className="table table--stack">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.label} className={c.num ? 'num' : undefined}>
                      {c.label}
                    </th>
                  ))}
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className={item.isActive ? '' : 'is-inactive'}>
                    {columns.map((c) => (
                      <td key={c.label} data-label={c.label} className={[c.num && 'num', c.primary && 'table__primary'].filter(Boolean).join(' ') || undefined}>
                        {c.render(item)}
                      </td>
                    ))}
                    <td data-label="Estado">
                      <ActiveBadge active={item.isActive} />
                    </td>
                    <td>
                      <RowActions
                        label={item.name}
                        isActive={item.isActive}
                        busy={busy === item.id}
                        first={index === 0}
                        last={index === items.length - 1}
                        onMove={(dir) => act(item.id, () => api.move(item.id, dir))}
                        onEdit={() => setEditing({ id: item.id, values: toInitial(item) })}
                        onToggle={() => act(item.id, () => api.update(item.id, { isActive: !item.isActive }), item.isActive ? `${noun} desactivad${g}` : `${noun} reactivad${g}`)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <EntityModal
        open={Boolean(editing)}
        title={editing?.id ? `Editar ${noun.toLowerCase()}` : `Nuev${g} ${noun.toLowerCase()}`}
        fields={fields}
        initialValues={editing?.values ?? emptyValues}
        onSubmit={save}
        onClose={() => setEditing(null)}
      />
    </>
  );
};
