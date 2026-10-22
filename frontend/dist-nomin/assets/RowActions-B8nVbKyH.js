import { c as createLucideIcon, j as jsxRuntimeExports, S as StatusPill } from "./index-DLrGS1ff.js";
import { r as reactExports } from "./react-0QgR9_yw.js";
import { M as Modal } from "./Modal-D3Tpr7Pg.js";
import { B as Button } from "./Button-gyxO_wIM.js";
import { S as Switch, T as TextField } from "./Field-B-OAoH6p.js";
import { S as Save } from "./save-E1YfC_zl.js";
import { E as Eye } from "./eye-BpTxpMJ7.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M12 5v14", key: "s699le" }],
  ["path", { d: "m19 12-7 7-7-7", key: "1idqje" }]
];
const ArrowDown = createLucideIcon("arrow-down", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "m5 12 7-7 7 7", key: "hav0vg" }],
  ["path", { d: "M12 19V5", key: "x0mq9r" }]
];
const ArrowUp = createLucideIcon("arrow-up", __iconNode$2);
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
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f"
    }
  ],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  [
    "path",
    {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const EyeOff = createLucideIcon("eye-off", __iconNode$1);
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
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
const Pencil = createLucideIcon("pencil", __iconNode);
const EntityModal = ({ open, title, description, fields, initialValues, onSubmit, onClose, submitLabel = "Guardar" }) => {
  const [values, setValues] = reactExports.useState(initialValues);
  const [errors, setErrors] = reactExports.useState({});
  const [busy, setBusy] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (open) {
      setValues(initialValues);
      setErrors({});
    }
  }, [open, initialValues]);
  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: null, _form: null }));
  };
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    fields.forEach((f) => {
      const message = f.validate?.(values[f.name], values);
      if (message) nextErrors[f.name] = message;
    });
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    setBusy(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      const fieldErrors = error.details?.fields ?? {};
      setErrors({ ...fieldErrors, _form: Object.keys(fieldErrors).length ? null : error.message });
    } finally {
      setBusy(false);
    }
    return void 0;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      onClose,
      dismissible: !busy,
      title,
      description,
      footer: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: onClose, disabled: busy, children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "coral", icon: Save, type: "submit", form: "entity-form", loading: busy, children: submitLabel })
      ] }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { id: "entity-form", onSubmit: submit, noValidate: true, style: { display: "grid", gap: 18 }, children: [
        fields.map((field) => {
          if (field.type === "switch") {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { label: field.label, description: field.hint, checked: Boolean(values[field.name]), onChange: (v) => set(field.name, v) }, field.name);
          }
          if (field.type === "select") {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { as: "select", label: field.label, value: values[field.name] ?? "", onChange: (e) => set(field.name, e.target.value), error: errors[field.name], hint: field.hint, children: field.options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.value, children: o.label }, o.value)) }, field.name);
          }
          if (field.render) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: field.render(values[field.name], (v) => set(field.name, v)) }, field.name);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: field.label,
              type: field.type ?? "text",
              value: values[field.name] ?? "",
              maxLength: field.maxLength,
              autoComplete: field.autoComplete ?? "off",
              placeholder: field.placeholder,
              onChange: (e) => set(field.name, e.target.value),
              error: errors[field.name],
              hint: field.hint
            },
            field.name
          );
        }),
        errors._form && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "alert", role: "alert", children: errors._form })
      ] })
    }
  );
};
const ActiveBadge = ({ active }) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: active ? "open" : "neutral", children: active ? "Activo" : "Inactivo" });
const RowActions = ({ label, isActive, onMove, onEdit, onToggle, first, last, busy }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row-actions", children: [
  onMove && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "icon-btn", disabled: first || busy, onClick: () => onMove("up"), "aria-label": `Subir ${label}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { size: 17 }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "icon-btn", disabled: last || busy, onClick: () => onMove("down"), "aria-label": `Bajar ${label}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { size: 17 }) })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "icon-btn", onClick: onEdit, "aria-label": `Editar ${label}`, disabled: busy, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 17 }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "icon-btn", onClick: onToggle, disabled: busy, "aria-label": isActive ? `Desactivar ${label}` : `Reactivar ${label}`, title: isActive ? "Desactivar" : "Reactivar", children: isActive ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 17 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 17 }) })
] });
export {
  ActiveBadge as A,
  EntityModal as E,
  RowActions as R
};
