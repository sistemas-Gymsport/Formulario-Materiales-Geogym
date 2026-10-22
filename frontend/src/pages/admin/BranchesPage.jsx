import { adminApi } from '../../services/adminApi.js';
import { OrderedListPage } from '../../components/admin/OrderedListPage.jsx';

const EMPTY = { name: '', isActive: true };

const FIELDS = [
  { name: 'name', label: 'Nombre de la sucursal', maxLength: 80, placeholder: 'Ej. Satélite', validate: (v) => (!v || v.trim().length < 2 ? 'Escribe al menos 2 caracteres' : null) },
  { name: 'isActive', label: 'Disponible en el formulario', type: 'switch' }
];

const COLUMNS = [
  { label: 'Sucursal', primary: true, render: (b) => b.name },
  { label: 'Solicitudes históricas', num: true, render: (b) => b._count.requests }
];

export default function BranchesPage() {
  return (
    <OrderedListPage
      kicker="Catálogo"
      title="Sucursales"
      description="Las sucursales activas aparecen en el formulario público. Las solicitudes históricas conservan el nombre original."
      feminine
      noun="Sucursal"
      api={adminApi.branches}
      load={() => adminApi.branches.list()}
      columns={COLUMNS}
      fields={FIELDS}
      emptyValues={EMPTY}
      toInitial={(b) => ({ name: b.name, isActive: b.isActive })}
      toBody={(v) => ({ name: v.name.trim(), isActive: v.isActive })}
    />
  );
}
