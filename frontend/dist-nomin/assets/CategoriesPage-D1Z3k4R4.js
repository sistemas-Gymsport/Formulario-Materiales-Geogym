import { j as jsxRuntimeExports, f as adminApi } from "./index-DLrGS1ff.js";
import { O as OrderedListPage } from "./OrderedListPage-DL29IHP9.js";
import { C as CategoryIcon, I as ICON_MAP } from "./CategoryIcon-YmTLOAAs.js";
import "./react-0QgR9_yw.js";
import "./motion-C6keS6sr.js";
import "./useResource-vQCejOh0.js";
import "./useAction-BTeAeJfr.js";
import "./AdminUi-DJ-0AwxO.js";
import "./RowActions-B8nVbKyH.js";
import "./Modal-D3Tpr7Pg.js";
import "./x-B59TumVd.js";
import "./Button-gyxO_wIM.js";
import "./Field-B-OAoH6p.js";
import "./save-E1YfC_zl.js";
import "./eye-BpTxpMJ7.js";
import "./plus-DYeHZmIa.js";
import "./package-plU1MyOK.js";
import "./trash-2-CS_7f1qM.js";
const IconPicker = ({ value, onChange }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "field", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "field__label", children: "Icono" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "days", role: "radiogroup", "aria-label": "Icono de la categoría", children: Object.keys(ICON_MAP).map((name) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "day", role: "radio", "aria-checked": value === name, "aria-pressed": value === name, "aria-label": name, onClick: () => onChange(name), style: { minWidth: 52, height: 52 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryIcon, { name, size: 20 }) }, name)) })
] });
const EMPTY = { name: "", icon: "package", isActive: true };
const FIELDS = [
  { name: "name", label: "Nombre de la categoría", maxLength: 80, validate: (v) => !v || v.trim().length < 2 ? "Escribe al menos 2 caracteres" : null },
  { name: "icon", render: (value, onChange) => /* @__PURE__ */ jsxRuntimeExports.jsx(IconPicker, { value, onChange }) },
  { name: "isActive", label: "Visible en el formulario", type: "switch" }
];
const COLUMNS = [
  {
    label: "Categoría",
    primary: true,
    render: (c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "avatar", style: { width: 32, height: 32 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryIcon, { name: c.icon, size: 16 }) }),
      c.name
    ] })
  },
  { label: "Materiales activos", num: true, render: (c) => c._count.materials }
];
function CategoriesPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    OrderedListPage,
    {
      kicker: "Catálogo",
      title: "Categorías",
      description: "Organiza los materiales del formulario. El orden aquí es el orden que verán los colaboradores.",
      feminine: true,
      noun: "Categoría",
      api: adminApi.categories,
      load: async () => (await adminApi.categories.list()).categories,
      columns: COLUMNS,
      fields: FIELDS,
      emptyValues: EMPTY,
      toInitial: (c) => ({ name: c.name, icon: c.icon, isActive: c.isActive }),
      toBody: (v) => ({ name: v.name.trim(), icon: v.icon, isActive: v.isActive })
    }
  );
}
export {
  CategoriesPage as default
};
