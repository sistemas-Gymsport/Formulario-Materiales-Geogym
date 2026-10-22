import { c as createLucideIcon, j as jsxRuntimeExports, g as useToast, b as ErrorState, d as Skeleton, f as adminApi, S as StatusPill, E as EmptyState } from "./index-DLrGS1ff.js";
import { r as reactExports } from "./react-0QgR9_yw.js";
import { u as useResource } from "./useResource-vQCejOh0.js";
import { u as useAction } from "./useAction-BTeAeJfr.js";
import { C as Card, P as PageHeader } from "./AdminUi-DJ-0AwxO.js";
import { B as Button } from "./Button-gyxO_wIM.js";
import { T as TextField, S as Switch } from "./Field-B-OAoH6p.js";
import { M as Megaphone, N as NoticeModal, C as ClosedModal, S as ScheduleDetails } from "./ScheduleModals-rTZ3qx6c.js";
import { L as Lock } from "./lock-FULoXHdk.js";
import { E as Eye } from "./eye-BpTxpMJ7.js";
import { W as WEEKDAYS, f as formatTime12, b as formatOpening } from "./dates-DPZEv6RN.js";
import { S as Save } from "./save-E1YfC_zl.js";
import { T as Trash2 } from "./trash-2-CS_7f1qM.js";
import "./motion-C6keS6sr.js";
import "./Modal-D3Tpr7Pg.js";
import "./x-B59TumVd.js";
import "./calendar-days-CP74_h2r.js";
import "./sparkles-BwZ1z1_x.js";
import "./calendar-clock-_bd__aAg.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M16 19h6", key: "xwg31i" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M19 16v6", key: "tddt3s" }],
  ["path", { d: "M21 12.598V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8.5", key: "1glfrc" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }]
];
const CalendarPlus = createLucideIcon("calendar-plus", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]
];
const Clock = createLucideIcon("clock", __iconNode);
const MESSAGE_FIELDS = ["noticeTitle", "noticeIntro", "noticeOutro", "noticeButton", "closedTitle", "closedMessage", "closedOutro", "closedButton"];
const GROUPS = [
  {
    key: "notice",
    title: "Aviso cuando el formulario está abierto",
    subtitle: "Se muestra al entrar al formulario en los días y horas de recepción",
    icon: Megaphone,
    fields: { title: "noticeTitle", intro: "noticeIntro", outro: "noticeOutro", button: "noticeButton" }
  },
  {
    key: "closed",
    title: "Bloqueo cuando el formulario está cerrado",
    subtitle: "Se muestra fuera de horario y no permite registrar solicitudes",
    icon: Lock,
    fields: { title: "closedTitle", intro: "closedMessage", outro: "closedOutro", button: "closedButton" }
  }
];
const buildPreview = (form, availability, key) => ({
  ...availability,
  isOpen: key === "notice",
  closesAt: key === "notice" ? availability.closesAt ?? null : null,
  schedule: { enabled: form.enabled, weekdays: form.allowedWeekdays, openingTime: form.openingTime, closingTime: form.closingTime },
  messages: Object.fromEntries(GROUPS.map((g) => [g.key, Object.fromEntries(Object.entries(g.fields).map(([part, field]) => [part, form[field]]))]))
});
const ScheduleMessagesCard = ({ form, errors, onChange, availability }) => {
  const [preview, setPreview] = reactExports.useState(null);
  const previewData = preview ? buildPreview(form, availability, preview) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid--2", children: GROUPS.map((group, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Card,
      {
        title: group.title,
        subtitle: group.subtitle,
        delay: 0.08 + i * 0.04,
        actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", icon: Eye, onClick: () => setPreview(group.key), children: "Vista previa" }),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid", style: { gap: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Título", icon: group.icon, value: form[group.fields.title], maxLength: 120, onChange: (e) => onChange(group.fields.title, e.target.value), error: errors[group.fields.title] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              as: "textarea",
              label: "Texto principal",
              rows: 5,
              value: form[group.fields.intro],
              maxLength: 800,
              onChange: (e) => onChange(group.fields.intro, e.target.value),
              error: errors[group.fields.intro],
              hint: "Cada salto de línea es un párrafo. Los días, el horario, las fechas especiales y la próxima apertura se agregan automáticamente."
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { as: "textarea", label: "Texto final", rows: 2, value: form[group.fields.outro], maxLength: 400, onChange: (e) => onChange(group.fields.outro, e.target.value), error: errors[group.fields.outro] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Texto del botón", value: form[group.fields.button], maxLength: 40, onChange: (e) => onChange(group.fields.button, e.target.value), error: errors[group.fields.button] })
        ] })
      },
      group.key
    )) }),
    previewData && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(NoticeModal, { open: preview === "notice", onClose: () => setPreview(null), availability: previewData }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClosedModal, { open: preview === "closed", onClose: () => setPreview(null), availability: previewData })
    ] })
  ] });
};
const TIMEZONES = ["America/Mexico_City", "America/Monterrey", "America/Merida", "America/Cancun", "America/Chihuahua", "America/Mazatlan", "America/Hermosillo", "America/Tijuana"];
const emptyException = { date: "", allowed: false, openingTime: "", closingTime: "", note: "" };
const AvailabilityPreview = ({ availability }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: availability.isOpen ? "open" : "closed", children: availability.isOpen ? "Abierto ahora" : "Cerrado ahora" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "muted", style: { fontWeight: 700 }, children: availability.isOpen ? `Cierra hoy a las ${formatTime12(availability.closesAt, availability.timezone)}` : availability.opensAt ? `Próxima apertura: ${formatOpening(availability.opensAt, availability.timezone)}` : "No hay una próxima apertura programada" })
] });
const ExceptionsCard = ({ exceptions, onChange }) => {
  const [draft, setDraft] = reactExports.useState(emptyException);
  const { run, busy } = useAction();
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const add = async (event) => {
    event.preventDefault();
    const body = { date: draft.date, allowed: draft.allowed, note: draft.note || void 0, openingTime: draft.allowed && draft.openingTime ? draft.openingTime : null, closingTime: draft.allowed && draft.closingTime ? draft.closingTime : null };
    if (await run("add", () => adminApi.schedule.addException(body), "Fecha guardada")) {
      setDraft(emptyException);
      onChange();
    }
  };
  const remove = async (id) => {
    if (await run(id, () => adminApi.schedule.removeException(id).then(() => true), "Fecha eliminada")) onChange();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { title: "Fechas extraordinarias y bloqueadas", subtitle: "Tienen prioridad sobre el horario semanal", delay: 0.1, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: add, className: "form-grid", style: { marginBottom: 20 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Fecha", type: "date", value: draft.date, onChange: (e) => set("date", e.target.value), required: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TextField, { as: "select", label: "Tipo", value: draft.allowed ? "open" : "blocked", onChange: (e) => set("allowed", e.target.value === "open"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "blocked", children: "Bloquear fecha (cerrado)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "open", children: "Apertura extraordinaria" })
      ] }),
      draft.allowed && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Apertura (opcional)", type: "time", value: draft.openingTime, onChange: (e) => set("openingTime", e.target.value), hint: "Vacío = horario general" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Cierre (opcional)", type: "time", value: draft.closingTime, onChange: (e) => set("closingTime", e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { className: "form-grid--full", label: "Nota", value: draft.note, onChange: (e) => set("note", e.target.value), maxLength: 120, placeholder: "Ej. Día festivo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "form-grid--full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "dark", icon: CalendarPlus, loading: busy === "add", disabled: !draft.date, children: "Agregar fecha" }) })
    ] }),
    exceptions.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "table-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "table table--stack", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Fecha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Tipo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Horario" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { children: "Nota" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: exceptions.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Fecha", className: "table__primary tabular", children: e.date.split("-").reverse().join("/") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Tipo", children: e.allowed ? /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: "open", children: "Apertura" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(StatusPill, { tone: "closed", children: "Bloqueada" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Horario", children: e.allowed ? `${e.openingTime ?? "General"} – ${e.closingTime ?? "General"}` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { "data-label": "Nota", children: e.note ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "row-actions", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "icon-btn", onClick: () => remove(e.id), disabled: busy === e.id, "aria-label": `Eliminar ${e.date}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 17 }) }) }) })
      ] }, e.id)) })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { title: "Sin fechas especiales", children: "Agrega días festivos bloqueados o aperturas extraordinarias." })
  ] });
};
function FormSettingsPage() {
  const config = useResource(() => adminApi.schedule.get(), []);
  const [form, setForm] = reactExports.useState(null);
  const [errors, setErrors] = reactExports.useState({});
  const [saving, setSaving] = reactExports.useState(false);
  const toast = useToast();
  reactExports.useEffect(() => {
    if (config.data) {
      const { schedule } = config.data;
      const keys = ["enabled", "timezone", "openingTime", "closingTime", "allowedWeekdays", ...MESSAGE_FIELDS];
      setForm(Object.fromEntries(keys.map((k) => [k, schedule[k]])));
    }
  }, [config.data]);
  if (config.error) return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorState, { error: config.error, onRetry: config.reload });
  if (!form) return /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { height: 420, radius: 20 });
  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
  };
  const toggleDay = (day) => set("allowedWeekdays", form.allowedWeekdays.includes(day) ? form.allowedWeekdays.filter((d) => d !== day) : [...form.allowedWeekdays, day]);
  const save = async () => {
    if (form.closingTime <= form.openingTime) return setErrors({ closingTime: "Debe ser posterior a la apertura" });
    if (!form.allowedWeekdays.length && form.enabled) return setErrors({ allowedWeekdays: "Selecciona al menos un día o desactiva el formulario" });
    setErrors({});
    setSaving(true);
    try {
      const result = await adminApi.schedule.save(form);
      config.setData(result);
      toast.success("Configuración guardada");
    } catch (error) {
      setErrors(error.details?.fields ?? {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
    return void 0;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PageHeader,
      {
        kicker: "Configuración",
        title: "Disponibilidad del formulario",
        description: "El servidor valida estos horarios en cada envío; no es posible registrar solicitudes fuera de ellos.",
        actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "coral", icon: Save, loading: saving, onClick: save, children: "Guardar cambios" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid", style: { gap: 20 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Estado actual", delay: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvailabilityPreview, { availability: config.data.availability }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid--2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Horario semanal", subtitle: "Días y horas en que se aceptan solicitudes", delay: 0.05, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid", style: { gap: 20 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: form.enabled, onChange: (v) => set("enabled", v), label: "Formulario activado", description: "Desactívalo para cerrar el formulario de inmediato, sin importar el horario." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "field", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "field__label", children: "Días habilitados" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "days", children: WEEKDAYS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "day", "aria-pressed": form.allowedWeekdays.includes(d.value), "aria-label": d.label, onClick: () => toggleDay(d.value), children: d.short }, d.value)) }),
            errors.allowedWeekdays && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "field__error", children: errors.allowedWeekdays })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "form-grid", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Hora de apertura", type: "time", icon: Clock, value: form.openingTime, onChange: (e) => set("openingTime", e.target.value) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { label: "Hora de cierre", type: "time", icon: Clock, value: form.closingTime, onChange: (e) => set("closingTime", e.target.value), error: errors.closingTime })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextField, { as: "select", label: "Zona horaria", value: form.timezone, onChange: (e) => set("timezone", e.target.value), children: TIMEZONES.map((tz) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: tz, children: tz }, tz)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Así se verá en los avisos", subtitle: "Generado con la configuración actual del formulario", delay: 0.08, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleDetails, { availability: { ...config.data.availability, schedule: { enabled: form.enabled, weekdays: form.allowedWeekdays, openingTime: form.openingTime, closingTime: form.closingTime } } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleMessagesCard, { form, errors, onChange: set, availability: config.data.availability }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExceptionsCard, { exceptions: config.data.exceptions, onChange: () => config.reload({ silent: true }) })
    ] })
  ] });
}
export {
  FormSettingsPage as default
};
