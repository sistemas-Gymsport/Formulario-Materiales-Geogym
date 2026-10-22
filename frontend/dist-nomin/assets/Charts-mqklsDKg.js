import { c as createLucideIcon, j as jsxRuntimeExports, m as motion, E as EmptyState } from "./index-DLrGS1ff.js";
import { S as StatCard } from "./AdminUi-DJ-0AwxO.js";
import { P as PackagePlus, p as plural } from "./text-DoNvVMZy.js";
import { C as ClipboardList, a as ChartColumn } from "./clipboard-list-CGPycJhm.js";
import { S as Store } from "./store-D4QrbCWn.js";
import { S as Sparkles } from "./sparkles-BwZ1z1_x.js";
import { R as ResponsiveContainer, A as AreaChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, a as Area, B as BarChart, b as Bar, c as Cell, P as PieChart, d as Pie, L as Legend } from "./charts-wFWv2kA2.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
];
const Layers = createLucideIcon("layers", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6", key: "17hqa7" }],
  ["path", { d: "M18 9h1.5a2.5 2.5 0 0 0 0-5H18", key: "lmptdp" }],
  ["path", { d: "M4 22h16", key: "57wxv0" }],
  ["path", { d: "M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22", key: "1nw9bq" }],
  ["path", { d: "M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22", key: "1np0yb" }],
  ["path", { d: "M18 2H6v7a6 6 0 0 0 12 0V2Z", key: "u46fv3" }]
];
const Trophy = createLucideIcon("trophy", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
const Users = createLucideIcon("users", __iconNode);
const leaderText = (leader) => leader ? leader.names.join(" / ") : "Sin datos";
const SummaryStats = ({ summary }) => {
  const items = [
    { label: "Solicitudes", value: summary.totalRequests, icon: ClipboardList, tone: "accent", hint: "registradas en el mes" },
    { label: "Sucursales", value: `${summary.branchesWithRequests}/${summary.activeBranches}`, icon: Store, hint: "con solicitudes" },
    { label: "Solicitantes", value: summary.uniqueRequesters, icon: Users, hint: "nombre + sucursal" },
    { label: "Selecciones", value: summary.totalSelections, icon: Layers, hint: "materiales marcados" },
    { label: "Materiales diferentes", value: summary.distinctMaterials, icon: Sparkles, hint: "incluye adicionales" },
    { label: "Adicionales", value: summary.customSelections, icon: PackagePlus, hint: "fuera del catálogo" },
    { label: "Material más frecuente", value: leaderText(summary.topMaterial), icon: Trophy, tone: "dark", hint: summary.topMaterial ? plural(summary.topMaterial.value, "solicitud", "solicitudes") : void 0 },
    { label: "Categoría líder", value: leaderText(summary.topCategory), icon: Layers, hint: summary.topCategory ? plural(summary.topCategory.value, "selección", "selecciones") : void 0 },
    { label: "Sucursal líder", value: leaderText(summary.topBranch), icon: Store, hint: summary.topBranch ? plural(summary.topBranch.value, "solicitud", "solicitudes") : void 0 }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid--stats", children: items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { index: i, ...item }, item.label)) });
};
const InsightList = ({ insights }) => /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "insights", children: insights.map((insight, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.li, { className: `insight insight--${insight.tone}`, initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.1 + i * 0.06 }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "insight__dot", "aria-hidden": "true" }),
  insight.text
] }, insight.text)) });
const PALETTE = ["#F64851", "#393939", "#B5A595", "#FF9A9E", "#77716A", "#D9CEC1", "#000000", "#C7363E"];
const AXIS = { fontSize: 12, fontWeight: 700, fill: "#6f6a63" };
const GRID = { stroke: "rgba(57,57,57,.12)", strokeDasharray: "3 4", vertical: false };
const ChartTooltip = ({ active, payload, label, unit = "solicitudes" }) => {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "chart-tooltip", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label ?? payload[0].payload.name }),
    payload.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { style: payload.length > 1 ? { color: p.color ?? p.payload.fill } : void 0, children: [
      payload.length > 1 ? `${p.name}: ` : "",
      p.value,
      " ",
      payload.length > 1 ? "" : unit
    ] }, p.dataKey ?? p.name))
  ] });
};
const hasData = (data, key = "value") => data?.some((d) => d[key] > 0);
const Empty = () => /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: ChartColumn, title: "Sin datos en este mes", children: "Las gráficas aparecerán cuando existan solicitudes." });
const truncate = (text, size = 14) => text.length > size ? `${text.slice(0, size - 1)}…` : text;
const BranchBarChart = ({ data }) => hasData(data) ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data, margin: { top: 16, right: 8, left: -18, bottom: 0 }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { ...GRID }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", tick: AXIS, tickLine: false, axisLine: false, tickFormatter: (v) => truncate(v, 11), interval: 0 }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: AXIS, tickLine: false, axisLine: false }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, {}), cursor: { fill: "rgba(246,72,81,.08)" } }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", radius: [10, 10, 4, 4], maxBarSize: 52, animationDuration: 900, children: data.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: i === 0 ? "#F64851" : "#393939" }, d.name)) })
] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {});
const RankingChart = ({ data, unit = "solicitudes" }) => data?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: Math.max(220, data.length * 34 + 20), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data, layout: "vertical", margin: { top: 4, right: 24, left: 8, bottom: 4 }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { ...GRID, horizontal: false, vertical: true }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", allowDecimals: false, tick: AXIS, tickLine: false, axisLine: false }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { type: "category", dataKey: "name", width: 150, tick: { ...AXIS, fill: "#393939" }, tickLine: false, axisLine: false, tickFormatter: (v) => truncate(v, 20) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { unit }), cursor: { fill: "rgba(246,72,81,.08)" } }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "value", radius: [4, 10, 10, 4], barSize: 18, animationDuration: 900, children: data.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: i < 3 ? "#F64851" : "#393939" }, d.name)) })
] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {});
const CategoryDonut = ({ data }) => {
  if (!hasData(data)) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {});
  const total = data.reduce((s, d) => s + d.value, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(PieChart, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Pie, { data, dataKey: "value", nameKey: "name", innerRadius: "58%", outerRadius: "86%", paddingAngle: 2, stroke: "none", animationDuration: 900, children: data.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { fill: PALETTE[i % PALETTE.length] }, d.name)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: "50%", y: "46%", textAnchor: "middle", dominantBaseline: "middle", style: { fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, fill: "#000" }, children: total }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: "50%", y: "56%", textAnchor: "middle", style: { fontSize: 11, fontWeight: 800, fill: "#6f6a63", letterSpacing: ".1em" }, children: "SELECCIONES" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, { unit: "selecciones" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconType: "circle", iconSize: 9, wrapperStyle: { fontSize: 12.5, fontWeight: 700 }, formatter: (v) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#393939" }, children: v }) })
  ] }) });
};
const DailyAreaChart = ({ data }) => hasData(data) ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 260, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data, margin: { top: 12, right: 8, left: -18, bottom: 0 }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "dailyFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "#F64851", stopOpacity: 0.45 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "#F64851", stopOpacity: 0.02 })
  ] }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { ...GRID }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "day", tick: AXIS, tickLine: false, axisLine: false, interval: "preserveStartEnd" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: AXIS, tickLine: false, axisLine: false }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, {}), labelFormatter: (d) => `Día ${d}` }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "value", stroke: "#F64851", strokeWidth: 3, fill: "url(#dailyFill)", activeDot: { r: 6, fill: "#000", stroke: "#F64851", strokeWidth: 3 }, animationDuration: 1100 })
] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {});
const BranchCategoryChart = ({ data }) => data?.rows?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 320, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: data.rows, margin: { top: 12, right: 8, left: -18, bottom: 0 }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { ...GRID }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "name", tick: AXIS, tickLine: false, axisLine: false, interval: 0, tickFormatter: (v) => truncate(v, 11) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { allowDecimals: false, tick: AXIS, tickLine: false, axisLine: false }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTooltip, {}), cursor: { fill: "rgba(246,72,81,.08)" } }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconType: "circle", iconSize: 9, wrapperStyle: { fontSize: 12, fontWeight: 700 } }),
  data.categories.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: c, stackId: "a", fill: PALETTE[i % PALETTE.length], maxBarSize: 56, radius: i === data.categories.length - 1 ? [8, 8, 0, 0] : 0, animationDuration: 900 }, c))
] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, {});
export {
  BranchBarChart as B,
  CategoryDonut as C,
  DailyAreaChart as D,
  InsightList as I,
  RankingChart as R,
  SummaryStats as S,
  BranchCategoryChart as a
};
