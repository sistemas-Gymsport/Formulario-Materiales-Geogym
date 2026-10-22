import { useState } from 'react';
import { KeyRound, ShieldCheck, UserPlus } from 'lucide-react';
import { adminApi, authApi } from '../../services/adminApi.js';
import { useResource } from '../../hooks/useResource.js';
import { useAction } from '../../hooks/useAction.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Card, PageHeader } from '../../components/admin/AdminUi.jsx';
import { EntityModal } from '../../components/admin/EntityModal.jsx';
import { ActiveBadge } from '../../components/admin/RowActions.jsx';
import { Button } from '../../components/common/Button.jsx';
import { ErrorState, Skeleton } from '../../components/common/Feedback.jsx';
import { formatDateTime } from '../../utils/dates.js';

const passwordIssues = (password, username = '') => {
  const issues = [];
  if (password.length < 12) issues.push('12 caracteres');
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) issues.push('mayúsculas y minúsculas');
  if (!/\d/.test(password)) issues.push('un número');
  if (!/[^a-zA-Z0-9]/.test(password)) issues.push('un símbolo');
  if (username && password.toLowerCase().includes(username.toLowerCase())) issues.push('no incluir el usuario');
  return issues;
};

const strongPassword = (value, values) => {
  const issues = passwordIssues(value ?? '', values.username);
  return issues.length ? `Requiere: ${issues.join(', ')}` : null;
};

const PASSWORD_FIELDS = [
  { name: 'currentPassword', label: 'Contraseña actual', type: 'password', autoComplete: 'current-password', validate: (v) => (!v ? 'Obligatoria' : null) },
  { name: 'newPassword', label: 'Nueva contraseña', type: 'password', autoComplete: 'new-password', validate: strongPassword, hint: 'Mínimo 12 caracteres con mayúsculas, minúsculas, número y símbolo.' },
  { name: 'confirm', label: 'Confirmar nueva contraseña', type: 'password', autoComplete: 'new-password', validate: (v, all) => (v !== all.newPassword ? 'No coincide' : null) }
];

const ADMIN_FIELDS = [
  { name: 'username', label: 'Nombre de usuario', autoComplete: 'off', maxLength: 40, validate: (v) => (!/^[a-zA-Z0-9._-]{3,40}$/.test(v ?? '') ? '3 a 40 caracteres: letras, números, . _ -' : null) },
  { name: 'password', label: 'Contraseña temporal', type: 'password', autoComplete: 'new-password', validate: strongPassword, hint: 'Compártela por un canal seguro; el administrador podrá cambiarla.' }
];

const EMPTY_PASSWORD = { currentPassword: '', newPassword: '', confirm: '' };
const EMPTY_ADMIN = { username: '', password: '' };

export default function AdminsPage() {
  const { admin } = useAuth();
  const admins = useResource(() => adminApi.admins.list(), []);
  const [modal, setModal] = useState(null);
  const { run, busy } = useAction();
  const toast = useToast();

  const toggle = async (target) => {
    if (await run(target.id, () => adminApi.admins.setActive(target.id, !target.isActive), target.isActive ? 'Administrador desactivado' : 'Administrador reactivado')) admins.reload({ silent: true });
  };

  return (
    <>
      <PageHeader
        kicker="Seguridad"
        title="Administradores y perfil"
        description="Solo los administradores inician sesión. Las contraseñas se almacenan con Argon2id en PostgreSQL."
        actions={
          <>
            <Button variant="ghost" icon={KeyRound} onClick={() => setModal('password')}>
              Cambiar mi contraseña
            </Button>
            <Button variant="coral" icon={UserPlus} onClick={() => setModal('admin')}>
              Nuevo administrador
            </Button>
          </>
        }
      />
      <div className="grid" style={{ gap: 20 }}>
        <Card title="Mi perfil">
          <dl className="kv">
            <dt>Usuario</dt>
            <dd>{admin.username}</dd>
            <dt>Último acceso</dt>
            <dd>{admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : '—'}</dd>
            <dt>Contraseña actualizada</dt>
            <dd>{formatDateTime(admin.passwordChangedAt)}</dd>
          </dl>
        </Card>
        <Card title="Administradores">
          {admins.error ? (
            <ErrorState error={admins.error} onRetry={admins.reload} />
          ) : !admins.data ? (
            <Skeleton height={160} radius={16} />
          ) : (
            <div className="table-wrap">
              <table className="table table--stack">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Creado</th>
                    <th>Último acceso</th>
                    <th>Estado</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {admins.data.map((a) => (
                    <tr key={a.id} className={a.isActive ? '' : 'is-inactive'}>
                      <td data-label="Usuario" className="table__primary">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          {a.username}
                          {a.id === admin.id && <ShieldCheck size={16} aria-label="Tu cuenta" />}
                        </span>
                      </td>
                      <td data-label="Creado">{formatDateTime(a.createdAt)}</td>
                      <td data-label="Último acceso">{a.lastLoginAt ? formatDateTime(a.lastLoginAt) : 'Nunca'}</td>
                      <td data-label="Estado">
                        <ActiveBadge active={a.isActive} />
                      </td>
                      <td>
                        <div className="row-actions">
                          {a.id !== admin.id && (
                            <Button size="sm" variant={a.isActive ? 'danger' : 'ghost'} loading={busy === a.id} onClick={() => toggle(a)}>
                              {a.isActive ? 'Desactivar' : 'Reactivar'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      <EntityModal
        open={modal === 'password'}
        title="Cambiar contraseña"
        description="Se cerrarán tus otras sesiones abiertas."
        fields={PASSWORD_FIELDS}
        initialValues={EMPTY_PASSWORD}
        submitLabel="Actualizar contraseña"
        onSubmit={async (v) => {
          await authApi.changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword });
          toast.success('Contraseña actualizada');
        }}
        onClose={() => setModal(null)}
      />
      <EntityModal
        open={modal === 'admin'}
        title="Nuevo administrador"
        fields={ADMIN_FIELDS}
        initialValues={EMPTY_ADMIN}
        submitLabel="Crear administrador"
        onSubmit={async (v) => {
          await adminApi.admins.create({ username: v.username.trim().toLowerCase(), password: v.password });
          toast.success('Administrador creado');
          admins.reload({ silent: true });
        }}
        onClose={() => setModal(null)}
      />
    </>
  );
}
