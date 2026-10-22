import { adminApi } from '../../services/adminApi.js';
import { OrderedListPage } from '../../components/admin/OrderedListPage.jsx';
import { CategoryIcon, ICON_MAP } from '../../components/common/CategoryIcon.jsx';

const IconPicker = ({ value, onChange }) => (
  <div className="field">
    <span className="field__label">Icono</span>
    <div className="days" role="radiogroup" aria-label="Icono de la categoría">
      {Object.keys(ICON_MAP).map((name) => (
        <button key={name} type="button" className="day" role="radio" aria-checked={value === name} aria-pressed={value === name} aria-label={name} onClick={() => onChange(name)} style={{ minWidth: 52, height: 52 }}>
          <CategoryIcon name={name} size={20} />
        </button>
      ))}
    </div>
  </div>
);

const EMPTY = { name: '', icon: 'package', isActive: true };

const FIELDS = [
  { name: 'name', label: 'Nombre de la categoría', maxLength: 80, validate: (v) => (!v || v.trim().length < 2 ? 'Escribe al menos 2 caracteres' : null) },
  { name: 'icon', render: (value, onChange) => <IconPicker value={value} onChange={onChange} /> },
  { name: 'isActive', label: 'Visible en el formulario', type: 'switch' }
];

const COLUMNS = [
  {
    label: 'Categoría',
    primary: true,
    render: (c) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span className="avatar" style={{ width: 32, height: 32 }}>
          <CategoryIcon name={c.icon} size={16} />
        </span>
        {c.name}
      </span>
    )
  },
  { label: 'Materiales activos', num: true, render: (c) => c._count.materials }
];

export default function CategoriesPage() {
  return (
    <OrderedListPage
      kicker="Catálogo"
      title="Categorías"
      description="Organiza los materiales del formulario. El orden aquí es el orden que verán los colaboradores."
      feminine
      noun="Categoría"
      api={adminApi.categories}
      load={async () => (await adminApi.categories.list()).categories}
      columns={COLUMNS}
      fields={FIELDS}
      emptyValues={EMPTY}
      toInitial={(c) => ({ name: c.name, icon: c.icon, isActive: c.isActive })}
      toBody={(v) => ({ name: v.name.trim(), icon: v.icon, isActive: v.isActive })}
    />
  );
}
