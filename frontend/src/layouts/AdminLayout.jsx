import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { BarChart3, CalendarClock, ClipboardList, Store, LayoutDashboard, LogOut, Menu, Package, Shapes, ShieldCheck, Webhook, X } from 'lucide-react';
import { Logo } from '../components/common/Logo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useResource } from '../hooks/useResource.js';
import { useInterval } from '../hooks/useInterval.js';
import { publicApi } from '../services/publicApi.js';
import { formatOpening, formatTime12 } from '../utils/dates.js';
import '../styles/admin.css';

const NAV = [
  { group: 'General' },
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/solicitudes', label: 'Solicitudes', icon: ClipboardList },
  { to: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  { group: 'Catálogo' },
  { to: '/admin/materiales', label: 'Materiales', icon: Package },
  { to: '/admin/categorias', label: 'Categorías', icon: Shapes },
  { to: '/admin/sucursales', label: 'Sucursales', icon: Store },
  { group: 'Configuración' },
  { to: '/admin/configuracion/formulario', label: 'Formulario', icon: CalendarClock },
  { to: '/admin/integraciones', label: 'Integraciones', icon: Webhook },
  { to: '/admin/administradores', label: 'Administradores', icon: ShieldCheck }
];

const FormStatus = () => {
  const { data, reload } = useResource(() => publicApi.availability(), []);
  useInterval(() => reload({ silent: true }), 60000);
  if (!data) return null;
  return (
    <div className="sidebar__status">
      <span className={`pill ${data.isOpen ? 'pill--open' : 'pill--closed'}`}>
        <span className="pill__dot" />
        {data.isOpen ? 'Formulario abierto' : 'Formulario cerrado'}
      </span>
      <small>
        {data.isOpen ? `Cierra a las ${formatTime12(data.closesAt, data.timezone)}` : data.opensAt ? `Abre ${formatOpening(data.opensAt, data.timezone)}` : 'Sin próxima apertura programada'}
      </small>
    </div>
  );
};

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="admin">
      <AnimatePresence>{open && <motion.div className="sidebar-scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />}</AnimatePresence>
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Navegación administrativa">
        <div className="sidebar__brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo light subtitle="Panel administrativo" />
          {open && (
            <button type="button" className="icon-btn" style={{ color: 'white' }} onClick={() => setOpen(false)} aria-label="Cerrar menú">
              <X size={20} />
            </button>
          )}
        </div>
        <FormStatus />
        <nav className="nav">
          {NAV.map((item) =>
            item.group ? (
              <span key={item.group} className="nav__group">
                {item.group}
              </span>
            ) : (
              <NavLink key={item.to} to={item.to} end={item.end} className="nav__link">
                {({ isActive }) => (
                  <>
                    {isActive && <motion.span layoutId="nav-active" className="nav__active" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                    <item.icon size={19} aria-hidden="true" />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          )}
        </nav>
        <div className="sidebar__foot">
          <div className="sidebar__user">
            <span className="avatar" aria-hidden="true">
              {admin?.username?.charAt(0)}
            </span>
            <span>{admin?.username}</span>
          </div>
          <button type="button" className="nav__link" onClick={logout}>
            <LogOut size={19} aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
      <div style={{ minWidth: 0 }}>
        <div className="admin__mobilebar">
          <Logo subtitle={null} size={32} />
          <button type="button" className="icon-btn" onClick={() => setOpen(true)} aria-label="Abrir menú" aria-expanded={open}>
            <Menu size={22} />
          </button>
        </div>
        <main className="admin__main">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
