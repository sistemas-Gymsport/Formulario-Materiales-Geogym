import { c as createLucideIcon, j as jsxRuntimeExports, b as ErrorState, d as Skeleton, E as EmptyState, f as adminApi } from "./index-DLrGS1ff.js";
import { r as reactExports } from "./react-0QgR9_yw.js";
import { u as useResource } from "./useResource-vQCejOh0.js";
import { u as useDebounced } from "./useDebounced-P3YB1D1A.js";
import { P as PageHeader, C as Card, T as TagList, a as Pagination } from "./AdminUi-DJ-0AwxO.js";
import { M as MonthPicker, N as NotificationPill, R as RequestDetailModal } from "./RequestDetail-Cd_uKdRA.js";
import { T as TextField } from "./Field-B-OAoH6p.js";
import { c as formatDateTime, m as monthKey, d as currentYearMonth } from "./dates-DPZEv6RN.js";
import { S as Store } from "./store-D4QrbCWn.js";
import { S as Search } from "./search-256c8Xwh.js";
import { P as Package } from "./package-plU1MyOK.js";
import { E as Eye } from "./eye-BpTxpMJ7.js";
import "./motion-C6keS6sr.js";
import "./calendar-days-CP74_h2r.js";
import "./Modal-D3Tpr7Pg.js";
import "./x-B59TumVd.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
  ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
  ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
  ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }]
];
const Hash = createLucideIcon("hash", __iconNode);
const initialFilters = () => ({ month: monthKey(currentYearMonth()), branchId: "", categoryId: "", requester: "", material: "", folio: "" });
function RequestsPage() {
  const [filters, setFilters] = reactExports.useState(initialFilters);
  const [page, setPage] = reactExports.useState(1);
  const [detailId, setDetailId] = reactExports.useState(null);
  const branches = useResource(() => adminApi.branches.list(), []);
  const categories = useResource(() => adminApi.categories.list(), []);
  const textKey = useDebounced(JSON.stringify({ requester: filters.requester.trim(), material: filters.material.trim(), folio: filters.folio.trim() }));
  const text = reactExports.useMemo(() => JSON.parse(textKey), [textKey]);
  const params = reactExports.useMemo(
    () => ({ month: filters.month, branchId: filters.branchId, categoryId: filters.categoryId, ...text, page, pageSize: 15 }),
    [filters.month, filters.branchId, filters.categoryId, text, page]
  );
  const list = useResource(() => adminApi.requests(params), [params]);
  const set = (key) => (event) => {
    setFilters((f) => ({ ...f, [key]: typeof event === "string" ? event : event.target.value }));
    setPage(1);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { kicker: "Registro", title: "Solicitudes", description: "Consulta las solicitudes registradas. Los materiales conservan el nombre con el que fueron solicitados." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "toolbar", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MonthPicker, { value: filters.month, onChange: set("month"), allowAll: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TextField, { as: "select", label: "Sucursal", icon: Store, value: filters.branchId, onChange: set("branchId"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Todas" }),
          branches.data?.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: b.id, children: b.name }, b.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TextField, { as: "select", label: "Categoría", value: filters.categoryId, onChange: set("categoryId"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Todas" }),
          categories.data?.categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.id, children: c.name }, c.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Solicitante", icon: Search, value: filters.requester, onChange: set("requester"), placeholder: "Nombre", maxLength: 100 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Material", icon: Package, value: filters.material, onChange: set("material"), placeholder: "Ej. cloro", maxLength: 80 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Folio", icon: Hash, value: filters.folio, onChange: set("folio"), placeholder: "SOL-…", maxLength: 24 })
      ] }),
      list.error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error: list.error, onRetry: list.reload }) : list.loading && !list.data ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid", style: { gap: 10 }, children: Array.from({ length: 6 }, (_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 52 }, i)) }) : list.data.data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "No hay solicitudes con estos filtros", children: "Ajusta los filtros o selecciona otro mes." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-wrap", style: { opacity: list.loading ? 0.55 : 1, transition: "opacity .2s" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "table table--stack", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Folio" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Fecha" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Solicitante" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Sucursal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Materiales" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "WhatsApp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: list.data.data.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Folio", className: "table__primary tabular", children: r.folio }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Fecha", className: "tabular", style: { whiteSpace: "nowrap" }, children: formatDateTime(r.createdAt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Solicitante", className: "table__primary", children: r.requesterName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Sucursal", children: r.branchName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": `Materiales (${r.itemCount})`, style: { minWidth: 240 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TagList, { items: r.categories.flatMap((c) => c.materials), custom: r.customMaterials, max: 4 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "WhatsApp", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationPill, { notification: r.notification }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "icon-btn", onClick: () => setDetailId(r.id), "aria-label": `Ver detalle de ${r.folio}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 18 }) }) }) })
        ] }, r.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Pagination, { pagination: list.data?.pagination, onPage: setPage })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RequestDetailModal, { id: detailId, onClose: () => setDetailId(null) })
  ] });
}
export {
  RequestsPage as default
};
