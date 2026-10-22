import { c as createLucideIcon, u as useAuth, g as useToast, j as jsxRuntimeExports, b as ErrorState, d as Skeleton, h as authApi, f as adminApi } from "./index-DLrGS1ff.js";
import { r as reactExports } from "./react-0QgR9_yw.js";
import { u as useResource } from "./useResource-vQCejOh0.js";
import { u as useAction } from "./useAction-BTeAeJfr.js";
import { P as PageHeader, C as Card } from "./AdminUi-DJ-0AwxO.js";
import { A as ActiveBadge, E as EntityModal } from "./RowActions-B8nVbKyH.js";
import { B as Button } from "./Button-gyxO_wIM.js";
import { c as formatDateTime } from "./dates-DPZEv6RN.js";
import { K as KeyRound } from "./key-round-DXjRlkqX.js";
import { S as ShieldCheck } from "./shield-check-D69hX9gw.js";
import "./motion-C6keS6sr.js";
import "./Modal-D3Tpr7Pg.js";
import "./x-B59TumVd.js";
import "./Field-B-OAoH6p.js";
import "./save-E1YfC_zl.js";
import "./eye-BpTxpMJ7.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
];
const UserPlus = createLucideIcon("user-plus", __iconNode);
const passwordIssues = (password, username = "") => {
  const issues = [];
  if (password.length < 12) issues.push("12 caracteres");
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) issues.push("mayúsculas y minúsculas");
  if (!/\d/.test(password)) issues.push("un número");
  if (!/[^a-zA-Z0-9]/.test(password)) issues.push("un símbolo");
  if (username && password.toLowerCase().includes(username.toLowerCase())) issues.push("no incluir el usuario");
  return issues;
};
const strongPassword = (value, values) => {
  const issues = passwordIssues(value ?? "", values.username);
  return issues.length ? `Requiere: ${issues.join(", ")}` : null;
};
const PASSWORD_FIELDS = [
  { name: "currentPassword", label: "Contraseña actual", type: "password", autoComplete: "current-password", validate: (v) => !v ? "Obligatoria" : null },
  { name: "newPassword", label: "Nueva contraseña", type: "password", autoComplete: "new-password", validate: strongPassword, hint: "Mínimo 12 caracteres con mayúsculas, minúsculas, número y símbolo." },
  { name: "confirm", label: "Confirmar nueva contraseña", type: "password", autoComplete: "new-password", validate: (v, all) => v !== all.newPassword ? "No coincide" : null }
];
const ADMIN_FIELDS = [
  { name: "username", label: "Nombre de usuario", autoComplete: "off", maxLength: 40, validate: (v) => !/^[a-zA-Z0-9._-]{3,40}$/.test(v ?? "") ? "3 a 40 caracteres: letras, números, . _ -" : null },
  { name: "password", label: "Contraseña temporal", type: "password", autoComplete: "new-password", validate: strongPassword, hint: "Compártela por un canal seguro; el administrador podrá cambiarla." }
];
const EMPTY_PASSWORD = { currentPassword: "", newPassword: "", confirm: "" };
const EMPTY_ADMIN = { username: "", password: "" };
function AdminsPage() {
  const { admin } = useAuth();
  const admins = useResource(() => adminApi.admins.list(), []);
  const [modal, setModal] = reactExports.useState(null);
  const { run, busy } = useAction();
  const toast = useToast();
  const toggle = async (target) => {
    if (await run(target.id, () => adminApi.admins.setActive(target.id, !target.isActive), target.isActive ? "Administrador desactivado" : "Administrador reactivado")) admins.reload({ silent: true });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        kicker: "Seguridad",
        title: "Administradores y perfil",
        description: "Solo los administradores inician sesión. Las contraseñas se almacenan con Argon2id en PostgreSQL.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", icon: KeyRound, onClick: () => setModal("password"), children: "Cambiar mi contraseña" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "coral", icon: UserPlus, onClick: () => setModal("admin"), children: "Nuevo administrador" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid", style: { gap: 20 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Mi perfil", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "kv", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Usuario" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: admin.username }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Último acceso" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Contraseña actualizada" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: formatDateTime(admin.passwordChangedAt) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Administradores", children: admins.error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error: admins.error, onRetry: admins.reload }) : !admins.data ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 160, radius: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "table table--stack", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Usuario" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Creado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Último acceso" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Estado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: admins.data.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: a.isActive ? "" : "is-inactive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Usuario", className: "table__primary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 }, children: [
            a.username,
            a.id === admin.id && /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { size: 16, "aria-label": "Tu cuenta" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Creado", children: formatDateTime(a.createdAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Último acceso", children: a.lastLoginAt ? formatDateTime(a.lastLoginAt) : "Nunca" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Estado", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveBadge, { active: a.isActive }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row-actions", children: a.id !== admin.id && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: a.isActive ? "danger" : "ghost", loading: busy === a.id, onClick: () => toggle(a), children: a.isActive ? "Desactivar" : "Reactivar" }) }) })
        ] }, a.id)) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EntityModal,
      {
        open: modal === "password",
        title: "Cambiar contraseña",
        description: "Se cerrarán tus otras sesiones abiertas.",
        fields: PASSWORD_FIELDS,
        initialValues: EMPTY_PASSWORD,
        submitLabel: "Actualizar contraseña",
        onSubmit: async (v) => {
          await authApi.changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword });
          toast.success("Contraseña actualizada");
        },
        onClose: () => setModal(null)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EntityModal,
      {
        open: modal === "admin",
        title: "Nuevo administrador",
        fields: ADMIN_FIELDS,
        initialValues: EMPTY_ADMIN,
        submitLabel: "Crear administrador",
        onSubmit: async (v) => {
          await adminApi.admins.create({ username: v.username.trim().toLowerCase(), password: v.password });
          toast.success("Administrador creado");
          admins.reload({ silent: true });
        },
        onClose: () => setModal(null)
      }
    )
  ] });
}
export {
  AdminsPage as default
};
