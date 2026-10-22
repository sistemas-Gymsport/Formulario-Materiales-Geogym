import { g as useToast, j as jsxRuntimeExports, S as StatusPill, b as ErrorState, d as Skeleton, f as adminApi, E as EmptyState } from "./index-DLrGS1ff.js";
import { r as reactExports } from "./react-0QgR9_yw.js";
import { u as useResource } from "./useResource-vQCejOh0.js";
import { u as useAction } from "./useAction-BTeAeJfr.js";
import { P as PageHeader, C as Card } from "./AdminUi-DJ-0AwxO.js";
import { M as MonthPicker, R as RequestDetailModal } from "./RequestDetail-Cd_uKdRA.js";
import { S as SummaryStats, I as InsightList, B as BranchBarChart, C as CategoryDonut, D as DailyAreaChart, R as RankingChart, a as BranchCategoryChart } from "./Charts-mqklsDKg.js";
import { B as Button } from "./Button-gyxO_wIM.js";
import { m as monthKey, d as currentYearMonth, c as formatDateTime } from "./dates-DPZEv6RN.js";
import { D as Download, d as downloadBlob } from "./files-CmzFGime.js";
import { L as Lock } from "./lock-FULoXHdk.js";
import "./motion-C6keS6sr.js";
import "./Field-B-OAoH6p.js";
import "./calendar-days-CP74_h2r.js";
import "./Modal-D3Tpr7Pg.js";
import "./x-B59TumVd.js";
import "./text-DoNvVMZy.js";
import "./clipboard-list-CGPycJhm.js";
import "./store-D4QrbCWn.js";
import "./sparkles-BwZ1z1_x.js";
import "./charts-wFWv2kA2.js";
const RequestersTable = ({ requesters, onOpen }) => requesters.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "table table--stack", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Solicitante" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Sucursal" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "num", children: "Solicitudes" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Folios y fechas" })
  ] }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: requesters.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Solicitante", className: "table__primary", children: r.name }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Sucursal", children: r.branch }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Solicitudes", className: "num", children: r.count }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Folios", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tag-list", children: r.requests.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", className: "tag", onClick: () => onOpen(q.id), title: `${q.itemCount} materiales`, children: [
      q.folio,
      " · ",
      formatDateTime(q.createdAt)
    ] }, q.id)) }) })
  ] }, `${r.name}-${r.branch}`)) })
] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "Sin solicitantes este mes" });
function ReportsPage() {
  const [month, setMonth] = reactExports.useState(monthKey(currentYearMonth()));
  const [detailId, setDetailId] = reactExports.useState(null);
  const [downloading, setDownloading] = reactExports.useState(false);
  const abortRef = reactExports.useRef(null);
  const [year, monthNumber] = reactExports.useMemo(() => month.split("-").map(Number), [month]);
  const report = useResource(() => adminApi.reports.monthly(year, monthNumber), [year, monthNumber]);
  const { run, busy } = useAction();
  const toast = useToast();
  const download = async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setDownloading(true);
    try {
      const response = await adminApi.reports.pdf(year, monthNumber, abortRef.current.signal);
      downloadBlob(await response.blob(), `reporte-geogym-${month}.pdf`);
      toast.success("Reporte descargado");
    } catch (error) {
      if (error.name !== "AbortError") toast.error(error.message);
    } finally {
      setDownloading(false);
    }
  };
  const closeMonth = async () => {
    if (await run("close", () => adminApi.reports.close(year, monthNumber), "Periodo marcado como cerrado")) report.reload({ silent: true });
  };
  const data = report.data;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        kicker: "Análisis mensual",
        title: "Reportes",
        description: "Estadísticas exclusivamente mensuales calculadas con la zona horaria oficial. El PDF se genera al momento y no se almacena.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "coral", icon: Download, loading: downloading, onClick: download, disabled: !data, children: "Descargar reporte mensual completo" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { style: { marginBottom: 20 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "toolbar", style: { marginBottom: 0, alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: "0 1 280px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MonthPicker, { value: month, onChange: setMonth, label: "Periodo" }) }),
      data && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 26 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: data.period.isClosed ? "dark" : data.period.isCurrent ? "open" : "neutral", children: data.period.isClosed ? `Cerrado ${formatDateTime(data.period.closedAt)}` : data.period.isCurrent ? "Mes en curso" : "Periodo abierto" }),
        !data.period.isClosed && !data.period.isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", icon: Lock, loading: busy === "close", onClick: closeMonth, children: "Cerrar periodo" })
      ] })
    ] }) }),
    report.error ? /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error: report.error, onRetry: report.reload }) : !data ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 220, radius: 20 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 320, radius: 20 })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid", style: { gap: 20, opacity: report.loading ? 0.6 : 1, transition: "opacity .2s" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryStats, { summary: data.summary }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Conclusiones automáticas", subtitle: "Calculadas de forma determinista con los datos del mes", children: /* @__PURE__ */ jsxRuntimeExports.jsx(InsightList, { insights: data.insights }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid--2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Solicitudes por sucursal", className: "chart-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BranchBarChart, { data: data.charts.byBranch }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Participación por categorías", subtitle: "Selecciones del catálogo", className: "chart-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryDonut, { data: data.charts.byCategory }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Solicitudes por día del mes", className: "chart-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DailyAreaChart, { data: data.charts.byDay }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid--2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Materiales más solicitados", subtitle: "Número de solicitudes que incluyen cada material", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RankingChart, { data: data.charts.topMaterials }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Sucursales y categorías", subtitle: "Selecciones por categoría en cada sucursal", className: "chart-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BranchCategoryChart, { data: data.charts.branchCategory }) })
      ] }),
      data.charts.topCustom.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Materiales adicionales más frecuentes", subtitle: "Escritos por los solicitantes fuera del catálogo", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RankingChart, { data: data.charts.topCustom, unit: "veces" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Detalle por solicitante", subtitle: "Agrupación aproximada por nombre normalizado y sucursal", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequestersTable, { requesters: data.requesters, onOpen: setDetailId }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RequestDetailModal, { id: detailId, onClose: () => setDetailId(null) })
  ] });
}
export {
  ReportsPage as default
};
