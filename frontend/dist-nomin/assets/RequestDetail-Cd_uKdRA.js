import { j as jsxRuntimeExports, S as StatusPill, f as adminApi, d as Skeleton, b as ErrorState } from "./index-DLrGS1ff.js";
import { r as reactExports } from "./react-0QgR9_yw.js";
import { T as TextField } from "./Field-B-OAoH6p.js";
import { d as currentYearMonth, M as MONTHS, m as monthKey, c as formatDateTime } from "./dates-DPZEv6RN.js";
import { C as CalendarDays } from "./calendar-days-CP74_h2r.js";
import { M as Modal } from "./Modal-D3Tpr7Pg.js";
import { u as useResource } from "./useResource-vQCejOh0.js";
const monthOptions = (count = 24) => {
  const now = currentYearMonth();
  return Array.from({ length: count }, (_, i) => {
    const total = now.year * 12 + (now.month - 1) - i;
    const year = Math.floor(total / 12);
    const month = total % 12 + 1;
    return { value: monthKey({ year, month }), label: `${MONTHS[month - 1]} ${year}`, year, month };
  });
};
const MonthPicker = ({ value, onChange, allowAll, label = "Mes" }) => {
  const options = reactExports.useMemo(() => monthOptions(), []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(TextField, { as: "select", label, icon: CalendarDays, value, onChange: (e) => onChange(e.target.value), children: [
    allowAll && /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Todos los meses" }),
    options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o.value, children: o.label }, o.value))
  ] });
};
const NOTIFICATION = {
  HELD: { tone: "neutral", label: "Integración inactiva" },
  IGNORED: { tone: "neutral", label: "Omitida" },
  PENDING: { tone: "warning", label: "Pendiente" },
  PROCESSING: { tone: "warning", label: "Enviando" },
  SENT: { tone: "open", label: "Enviada a n8n" },
  FAILED: { tone: "closed", label: "Fallida" }
};
const PROVIDER = { delivered: "Entregada", read: "Leída", failed: "Entrega fallida" };
const NotificationPill = ({ notification }) => {
  if (!notification) return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "muted", children: "—" });
  if (notification.providerStatus) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: notification.providerStatus === "failed" ? "closed" : "open", children: PROVIDER[notification.providerStatus] });
  }
  const meta = NOTIFICATION[notification.status] ?? NOTIFICATION.HELD;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: meta.tone, children: meta.label });
};
const DetailBody = ({ id }) => {
  const { data, error, loading, reload } = useResource(() => adminApi.request(id), [id]);
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 220, radius: 16 });
  if (error) return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error, onRetry: reload });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid", style: { gap: 20 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "kv", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Folio" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "tabular", children: data.folio }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Fecha" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: formatDateTime(data.createdAt) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Solicitante" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: data.requesterName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Sucursal" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { children: data.branchName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "Total" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { children: [
        data.itemCount,
        " materiales diferentes"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { children: "WhatsApp" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(NotificationPill, { notification: data.notification }),
        data.notification?.lastError && /* @__PURE__ */ jsxRuntimeExports.jsx("small", { className: "muted", style: { display: "block", marginTop: 6 }, children: data.notification.lastError })
      ] })
    ] }),
    data.categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "review-group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { children: [
        c.name,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c.materials.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "review-list", children: c.materials.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: m }, m)) })
    ] }, c.name)),
    data.customMaterials.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "review-group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { children: [
        "Materiales adicionales",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: data.customMaterials.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "review-list review-list--custom", children: data.customMaterials.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: m }, m)) })
    ] })
  ] });
};
const RequestDetailModal = ({ id, onClose }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Modal, { open: Boolean(id), onClose, title: "Detalle de solicitud", width: "640px", children: id && /* @__PURE__ */ jsxRuntimeExports.jsx(DetailBody, { id }) });
export {
  MonthPicker as M,
  NotificationPill as N,
  RequestDetailModal as R
};
