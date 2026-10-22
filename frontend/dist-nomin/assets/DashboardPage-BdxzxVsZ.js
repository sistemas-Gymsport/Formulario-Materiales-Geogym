import { c as createLucideIcon, j as jsxRuntimeExports, d as Skeleton, b as ErrorState, S as StatusPill, E as EmptyState, f as adminApi } from "./index-DLrGS1ff.js";
import { u as useResource } from "./useResource-vQCejOh0.js";
import { P as PageHeader, C as Card, T as TagList } from "./AdminUi-DJ-0AwxO.js";
import { S as SummaryStats, D as DailyAreaChart, B as BranchBarChart, I as InsightList } from "./Charts-mqklsDKg.js";
import { f as formatTime12, b as formatOpening, c as formatDateTime } from "./dates-DPZEv6RN.js";
import { L as Link } from "./react-0QgR9_yw.js";
import { A as ArrowRight } from "./arrow-right-DaLgMcBV.js";
import "./motion-C6keS6sr.js";
import "./text-DoNvVMZy.js";
import "./clipboard-list-CGPycJhm.js";
import "./store-D4QrbCWn.js";
import "./sparkles-BwZ1z1_x.js";
import "./charts-wFWv2kA2.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode);
const INTEGRATION_LABEL = { disabled: "Desactivada", connected: "Conectada", error: "Con errores", unverified: "Sin verificar" };
function DashboardPage() {
  const { data, error, loading, reload } = useResource(() => adminApi.dashboard(), []);
  if (loading && !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 60, width: "50%" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid--stats", children: Array.from({ length: 6 }, (_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 110, radius: 20 }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 320, radius: 20 })
    ] });
  }
  if (error) return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error, onRetry: reload });
  const { report, availability, recent, integration } = data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        kicker: report.period.label,
        title: "Dashboard",
        description: "Resumen en tiempo real del mes en curso. Los números cuentan solicitudes y selecciones, no cantidades físicas.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { className: "btn btn--ghost btn--sm", href: "/solicitar", target: "_blank", rel: "noreferrer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { size: 16 }),
            " Ver formulario"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { className: "btn btn--coral btn--sm", to: "/admin/reportes", children: [
            "Reporte completo ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { size: 16 })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid", style: { gap: 20 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid--2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { title: "Estado del formulario", delay: 0.05, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: availability.isOpen ? "open" : "closed", children: availability.isOpen ? "Abierto" : "Cerrado" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "muted", style: { fontWeight: 700 }, children: availability.isOpen ? `Recibiendo solicitudes hasta las ${formatTime12(availability.closesAt, availability.timezone)}` : availability.opensAt ? `Próxima apertura: ${formatOpening(availability.opensAt, availability.timezone)}` : "Sin próxima apertura programada" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/configuracion/formulario", className: "btn btn--ghost btn--sm", style: { marginTop: 16 }, children: "Configurar horarios" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { title: "Notificaciones WhatsApp", delay: 0.1, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: integration.connectionStatus === "connected" ? "open" : integration.connectionStatus === "error" ? "closed" : "neutral", children: INTEGRATION_LABEL[integration.connectionStatus] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "muted", style: { fontWeight: 700 }, children: [
              integration.outbox.PENDING ?? 0,
              " pendientes · ",
              integration.outbox.SENT ?? 0,
              " enviadas · ",
              integration.outbox.FAILED ?? 0,
              " fallidas"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/integraciones", className: "btn btn--ghost btn--sm", style: { marginTop: 16 }, children: "Administrar integración" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryStats, { summary: report.summary }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid--3-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Solicitudes por día", subtitle: report.period.label, className: "chart-card", delay: 0.15, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DailyAreaChart, { data: report.charts.byDay }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Por sucursal", className: "chart-card", delay: 0.2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(BranchBarChart, { data: report.charts.byBranch }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid--2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Análisis del mes", delay: 0.25, children: /* @__PURE__ */ jsxRuntimeExports.jsx(InsightList, { insights: report.insights }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            title: "Solicitudes recientes",
            delay: 0.3,
            actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin/solicitudes", className: "btn btn--ghost btn--sm", children: "Ver todas" }),
            children: recent.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid", style: { gap: 12 }, children: recent.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 6, paddingBottom: 12, borderBottom: "1px solid var(--line)" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { style: { color: "var(--black)" }, children: [
                  r.requesterName,
                  " · ",
                  r.branchName
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "muted tabular", style: { fontSize: 13, fontWeight: 700 }, children: [
                  r.folio,
                  " · ",
                  formatDateTime(r.createdAt, availability.timezone)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TagList, { items: r.categories.flatMap((c) => c.materials), custom: r.customMaterials, max: 5 })
            ] }, r.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "Aún no hay solicitudes", children: "Las solicitudes aparecerán aquí al registrarse." })
          }
        )
      ] })
    ] })
  ] });
}
export {
  DashboardPage as default
};
