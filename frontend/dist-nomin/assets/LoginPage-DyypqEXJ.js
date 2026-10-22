import { c as createLucideIcon, u as useAuth, j as jsxRuntimeExports, m as motion } from "./index-DLrGS1ff.js";
import { u as useNavigate, d as useLocation, r as reactExports, N as Navigate } from "./react-0QgR9_yw.js";
import { L as Logo, B as BrandImage } from "./Logo-kYILI1OC.js";
import { B as Button } from "./Button-gyxO_wIM.js";
import { T as TextField } from "./Field-B-OAoH6p.js";
import { O as OrganicBlob } from "./Decor-9AfbzdCe.js";
/* empty css               */
import { U as UserRound } from "./user-round-Dvxqf_DP.js";
import { K as KeyRound } from "./key-round-DXjRlkqX.js";
import "./motion-C6keS6sr.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m10 17 5-5-5-5", key: "1bsop3" }],
  ["path", { d: "M15 12H3", key: "6jk70r" }],
  ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", key: "u53s6r" }]
];
const LogIn = createLucideIcon("log-in", __iconNode);
function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = reactExports.useState({ username: "", password: "" });
  const [errors, setErrors] = reactExports.useState({});
  const [busy, setBusy] = reactExports.useState(false);
  if (status === "authenticated") return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: location.state?.from ?? "/admin", replace: true });
  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!values.username.trim()) next.username = "Escribe tu nombre de usuario";
    if (!values.password) next.password = "Escribe tu contraseña";
    if (Object.keys(next).length) return setErrors(next);
    setBusy(true);
    setErrors({});
    try {
      await login({ username: values.username.trim().toLowerCase(), password: values.password });
      navigate(location.state?.from ?? "/admin", { replace: true });
    } catch (error) {
      setErrors({ form: error.message });
      setValues((v) => ({ ...v, password: "" }));
    } finally {
      setBusy(false);
    }
    return void 0;
  };
  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "login", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "login__art", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { light: true, subtitle: "Panel administrativo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(OrganicBlob, { className: "login__blob", color: "#393939" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "login__badge", initial: { opacity: 0, y: 30, rotate: 4 }, animate: { opacity: 1, y: 0, rotate: -4 }, transition: { type: "spring", stiffness: 140, damping: 16, delay: 0.15 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BrandImage, { className: "brand-sticker", large: true }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.h1, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }, children: [
        "Control",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "de ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "materiales" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "login__panel", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.form, { className: "login__form", onSubmit: submit, noValidate: true, initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.1 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "kicker", children: "Acceso restringido" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { children: "Iniciar sesión" }),
      location.state?.expired && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "alert alert--info", children: "Tu sesión expiró. Vuelve a iniciar sesión." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Nombre de usuario", icon: UserRound, value: values.username, onChange: set("username"), autoComplete: "username", autoCapitalize: "none", spellCheck: false, maxLength: 40, error: errors.username }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Contraseña", icon: KeyRound, type: "password", value: values.password, onChange: set("password"), autoComplete: "current-password", maxLength: 128, error: errors.password }),
      errors.form && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "alert", role: "alert", children: errors.form }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "coral", icon: LogIn, loading: busy, block: true, children: busy ? "Verificando…" : "Entrar al panel" })
    ] }) })
  ] });
}
export {
  LoginPage as default
};
