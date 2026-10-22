import { c as createLucideIcon, u as useAuth, j as jsxRuntimeExports, A as AnimatePresence, m as motion } from "./index-DLrGS1ff.js";
import { r as reactExports, d as useLocation, i as NavLink, O as Outlet } from "./react-0QgR9_yw.js";
import { L as Logo } from "./Logo-kYILI1OC.js";
import { u as useResource } from "./useResource-vQCejOh0.js";
import { p as publicApi, u as useInterval } from "./useInterval-BNgLL0ib.js";
import { f as formatTime12, b as formatOpening } from "./dates-DPZEv6RN.js";
/* empty css               */
import { X } from "./x-B59TumVd.js";
import { C as ClipboardList, a as ChartColumn } from "./clipboard-list-CGPycJhm.js";
import { P as Package } from "./package-plU1MyOK.js";
import { S as Store } from "./store-D4QrbCWn.js";
import { C as CalendarClock } from "./calendar-clock-_bd__aAg.js";
import { S as ShieldCheck } from "./shield-check-D69hX9gw.js";
import "./motion-C6keS6sr.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["rect", { width: "7", height: "9", x: "3", y: "3", rx: "1", key: "10lvy0" }],
  ["rect", { width: "7", height: "5", x: "14", y: "3", rx: "1", key: "16une8" }],
  ["rect", { width: "7", height: "9", x: "14", y: "12", rx: "1", key: "1hutg5" }],
  ["rect", { width: "7", height: "5", x: "3", y: "16", rx: "1", key: "ldoo1y" }]
];
const LayoutDashboard = createLucideIcon("layout-dashboard", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "m16 17 5-5-5-5", key: "1bji2h" }],
  ["path", { d: "M21 12H9", key: "dn1m92" }],
  ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", key: "1uf3rs" }]
];
const LogOut = createLucideIcon("log-out", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M4 12h16", key: "1lakjw" }],
  ["path", { d: "M4 18h16", key: "19g7jn" }],
  ["path", { d: "M4 6h16", key: "1o0s65" }]
];
const Menu = createLucideIcon("menu", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z",
      key: "1bo67w"
    }
  ],
  ["rect", { x: "3", y: "14", width: "7", height: "7", rx: "1", key: "1bkyp8" }],
  ["circle", { cx: "17.5", cy: "17.5", r: "3.5", key: "w3z12y" }]
];
const Shapes = createLucideIcon("shapes", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2",
      key: "q3hayz"
    }
  ],
  ["path", { d: "m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06", key: "1go1hn" }],
  ["path", { d: "m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8", key: "qlwsc0" }]
];
const Webhook = createLucideIcon("webhook", __iconNode);
const NAV = [
  { group: "General" },
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/solicitudes", label: "Solicitudes", icon: ClipboardList },
  { to: "/admin/reportes", label: "Reportes", icon: ChartColumn },
  { group: "Catálogo" },
  { to: "/admin/materiales", label: "Materiales", icon: Package },
  { to: "/admin/categorias", label: "Categorías", icon: Shapes },
  { to: "/admin/sucursales", label: "Sucursales", icon: Store },
  { group: "Configuración" },
  { to: "/admin/configuracion/formulario", label: "Formulario", icon: CalendarClock },
  { to: "/admin/integraciones", label: "Integraciones", icon: Webhook },
  { to: "/admin/administradores", label: "Administradores", icon: ShieldCheck }
];
const FormStatus = () => {
  const { data, reload } = useResource(() => publicApi.availability(), []);
  useInterval(() => reload({ silent: true }), 6e4);
  if (!data) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sidebar__status", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `pill ${data.isOpen ? "pill--open" : "pill--closed"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pill__dot" }),
      data.isOpen ? "Formulario abierto" : "Formulario cerrado"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("small", { children: data.isOpen ? `Cierra a las ${formatTime12(data.closesAt, data.timezone)}` : data.opensAt ? `Abre ${formatOpening(data.opensAt, data.timezone)}` : "Sin próxima apertura programada" })
  ] });
};
function AdminLayout() {
  const { admin, logout } = useAuth();
  const [open, setOpen] = reactExports.useState(false);
  const location = useLocation();
  reactExports.useEffect(() => setOpen(false), [location.pathname]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "admin", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "sidebar-scrim", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setOpen(false) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: `sidebar ${open ? "is-open" : ""}`, "aria-label": "Navegación administrativa", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sidebar__brand", style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { light: true, subtitle: "Panel administrativo" }),
        open && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "icon-btn", style: { color: "white" }, onClick: () => setOpen(false), "aria-label": "Cerrar menú", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormStatus, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "nav", children: NAV.map(
        (item) => item.group ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "nav__group", children: item.group }, item.group) : /* @__PURE__ */ jsxRuntimeExports.jsx(NavLink, { to: item.to, end: item.end, className: "nav__link", children: ({ isActive }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { layoutId: "nav-active", className: "nav__active", transition: { type: "spring", stiffness: 420, damping: 36 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { size: 19, "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label })
        ] }) }, item.to)
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sidebar__foot", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sidebar__user", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "avatar", "aria-hidden": "true", children: admin?.username?.charAt(0) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: admin?.username })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "nav__link", onClick: logout, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { size: 19, "aria-hidden": "true" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Cerrar sesión" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { minWidth: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "admin__mobilebar", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { subtitle: null, size: 32 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "icon-btn", onClick: () => setOpen(true), "aria-label": "Abrir menú", "aria-expanded": open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { size: 22 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "admin__main", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }, location.pathname) }) })
    ] })
  ] });
}
export {
  AdminLayout as default
};
