import { g as useToast, j as jsxRuntimeExports, f as adminApi, b as ErrorState, d as Skeleton, E as EmptyState, S as StatusPill, C as CircleCheck } from "./index-DLrGS1ff.js";
import { r as reactExports } from "./react-0QgR9_yw.js";
import { u as useResource } from "./useResource-vQCejOh0.js";
import { u as useAction } from "./useAction-BTeAeJfr.js";
import { u as useDebounced } from "./useDebounced-P3YB1D1A.js";
import { P as PageHeader, C as Card, b as Tabs } from "./AdminUi-DJ-0AwxO.js";
import { E as EntityModal, A as ActiveBadge, R as RowActions } from "./RowActions-B8nVbKyH.js";
import { B as Button } from "./Button-gyxO_wIM.js";
import { T as TextField } from "./Field-B-OAoH6p.js";
import { c as formatDateTime } from "./dates-DPZEv6RN.js";
import { P as Plus } from "./plus-DYeHZmIa.js";
import { S as Search } from "./search-256c8Xwh.js";
import "./motion-C6keS6sr.js";
import "./Modal-D3Tpr7Pg.js";
import "./x-B59TumVd.js";
import "./save-E1YfC_zl.js";
import "./eye-BpTxpMJ7.js";
const required = (v) => !v || String(v).trim().length < 2 ? "Escribe al menos 2 caracteres" : null;
const CatalogTab = ({ categories, onEdit, version }) => {
  const [search, setSearch] = reactExports.useState("");
  const [categoryId, setCategoryId] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("all");
  const debounced = useDebounced(search.trim());
  const list = useResource(() => adminApi.materials.list({ search: debounced, categoryId, status }), [debounced, categoryId, status, version]);
  const { run, busy } = useAction();
  const act = async (key, task, message) => {
    if (await run(key, task, message)) list.reload({ silent: true });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "toolbar", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Buscar", icon: Search, value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Nombre del material", maxLength: 80 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TextField, { as: "select", label: "Categoría", value: categoryId, onChange: (e) => setCategoryId(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Todas" }),
        categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.id, children: c.name }, c.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TextField, { as: "select", label: "Estado", value: status, onChange: (e) => setStatus(e.target.value), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "Todos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "active", children: "Activos" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "inactive", children: "Inactivos" })
      ] })
    ] }),
    list.error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error: list.error, onRetry: list.reload }) : !list.data ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 300, radius: 16 }) : list.data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "Sin materiales", children: "No hay materiales con estos filtros." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "table table--stack", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Material" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Categoría" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "num", children: "Veces solicitado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Estado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: list.data.map((m, i, all) => {
        const sameCategory = (other) => other && other.categoryId === m.categoryId;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: m.isActive ? "" : "is-inactive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Material", className: "table__primary", children: m.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Categoría", children: m.category.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Veces solicitado", className: "num", children: m._count.requestItems }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Estado", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ActiveBadge, { active: m.isActive }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            RowActions,
            {
              label: m.name,
              isActive: m.isActive,
              busy: busy === m.id,
              first: !sameCategory(all[i - 1]),
              last: !sameCategory(all[i + 1]),
              onMove: !debounced && status === "all" ? (dir) => act(m.id, () => adminApi.materials.move(m.id, dir)) : void 0,
              onEdit: () => onEdit(m),
              onToggle: () => act(m.id, () => adminApi.materials.update(m.id, { isActive: !m.isActive }), m.isActive ? "Material desactivado" : "Material reactivado")
            }
          ) })
        ] }, m.id);
      }) })
    ] }) })
  ] });
};
const CustomTab = ({ onPromote, version }) => {
  const list = useResource(() => adminApi.materials.custom(), [version]);
  if (list.error) return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error: list.error, onRetry: list.reload });
  if (!list.data) return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 240, radius: 16 });
  if (!list.data.length) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "Sin materiales adicionales", children: "Cuando los colaboradores escriban materiales fuera del catálogo aparecerán aquí." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "table table--stack", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Material escrito" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "num", children: "Veces" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Última solicitud" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Estado" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: list.data.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Material", className: "table__primary", children: c.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Veces", className: "num", children: c.timesRequested }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Última solicitud", children: c.lastRequestedAt ? `${formatDateTime(c.lastRequestedAt)} · ${c.lastBranch}` : "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Estado", children: c.inCatalog ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: "open", children: "En catálogo" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: "warning", children: "Fuera del catálogo" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row-actions", children: !c.inCatalog && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", icon: CircleCheck, onClick: () => onPromote(c.name), children: "Agregar al catálogo" }) }) })
    ] }, c.normalizedName)) })
  ] }) });
};
function MaterialsPage() {
  const [tab, setTab] = reactExports.useState("catalog");
  const [editing, setEditing] = reactExports.useState(null);
  const [version, setVersion] = reactExports.useState(0);
  const toast = useToast();
  const categories = useResource(() => adminApi.categories.list(), []);
  const categoryList = categories.data?.categories ?? [];
  const fields = reactExports.useMemo(
    () => [
      { name: "name", label: "Nombre del material", maxLength: 80, validate: required, placeholder: "Ej. Cinta canela" },
      { name: "categoryId", label: "Categoría", type: "select", options: categoryList.map((c) => ({ value: String(c.id), label: c.isActive ? c.name : `${c.name} (inactiva)` })) },
      { name: "isActive", label: "Visible en el formulario", type: "switch" }
    ],
    [categoryList]
  );
  const open = (initial) => setEditing({ initial });
  const openNew = (name = "") => open({ name, categoryId: String(categoryList[0]?.id ?? ""), isActive: true });
  const save = async (values) => {
    const body = { name: values.name.trim(), categoryId: Number(values.categoryId), isActive: values.isActive };
    const id = editing.initial.id;
    await (id ? adminApi.materials.update(id, body) : adminApi.materials.create(body));
    toast.success(id ? "Material actualizado" : "Material registrado");
    setVersion((v) => v + 1);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        kicker: "Catálogo",
        title: "Materiales",
        description: "Administra el catálogo del formulario. Los materiales con historial se desactivan, nunca se eliminan.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "coral", icon: Plus, onClick: () => openNew(), disabled: !categoryList.length, children: "Nuevo material" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginBottom: 18 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Tabs,
        {
          id: "materials",
          value: tab,
          onChange: setTab,
          options: [
            { value: "catalog", label: "Catálogo" },
            { value: "custom", label: "Adicionales de usuarios" }
          ]
        }
      ) }),
      tab === "catalog" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CatalogTab, { version, categories: categoryList, onEdit: (m) => open({ id: m.id, name: m.name, categoryId: String(m.categoryId), isActive: m.isActive }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTab, { version, onPromote: openNew })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EntityModal,
      {
        open: Boolean(editing),
        title: editing?.initial.id ? "Editar material" : "Nuevo material",
        description: editing?.initial.id ? "El cambio de nombre no modifica las solicitudes históricas." : void 0,
        fields,
        initialValues: editing?.initial ?? {},
        onSubmit: save,
        onClose: () => setEditing(null)
      }
    )
  ] });
}
export {
  MaterialsPage as default
};
