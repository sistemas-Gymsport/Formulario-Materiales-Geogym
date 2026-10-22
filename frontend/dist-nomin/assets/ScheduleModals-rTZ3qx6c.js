import { c as createLucideIcon, j as jsxRuntimeExports, m as motion } from "./index-DLrGS1ff.js";
import { M as Modal } from "./Modal-D3Tpr7Pg.js";
import { B as Button } from "./Button-gyxO_wIM.js";
import { e as formatWeekdays, g as formatClock, f as formatTime12, b as formatOpening, h as formatDateKey } from "./dates-DPZEv6RN.js";
import { L as Lock } from "./lock-FULoXHdk.js";
import { C as CalendarDays } from "./calendar-days-CP74_h2r.js";
import { S as Sparkles } from "./sparkles-BwZ1z1_x.js";
import { C as CalendarClock } from "./calendar-clock-_bd__aAg.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["polyline", { points: "12 6 12 12 16.5 12", key: "1aq6pp" }]
];
const Clock3 = createLucideIcon("clock-3", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "m3 11 18-5v12L3 14v-3z", key: "n962bs" }],
  ["path", { d: "M11.6 16.8a3 3 0 1 1-5.8-1.6", key: "1yl0tm" }]
];
const Megaphone = createLucideIcon("megaphone", __iconNode);
const Paragraphs = ({ text }) => text?.split("\n").filter((line) => line.trim()).map((line, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: line }, i));
const specialText = (s) => s.allowed ? `abierto de ${formatClock(s.openingTime)} a ${formatClock(s.closingTime)}` : "cerrado, sin recepción de pedidos";
const ScheduleDetails = ({ availability }) => {
  const { schedule, specialDates = [], timezone } = availability;
  const items = [];
  if (schedule.weekdays.length) {
    items.push({ icon: CalendarDays, label: "Días de recepción", value: formatWeekdays(schedule.weekdays) });
    items.push({ icon: Clock3, label: "Horario", value: `de ${formatClock(schedule.openingTime)} a ${formatClock(schedule.closingTime)}` });
  }
  if (availability.isOpen && availability.closesAt) {
    items.push({ icon: Sparkles, label: "Hoy", value: `recibimos solicitudes hasta las ${formatTime12(availability.closesAt, timezone)}`, accent: true });
  }
  if (!availability.isOpen) {
    items.push({
      icon: CalendarClock,
      label: "Próxima apertura",
      value: availability.opensAt ? formatOpening(availability.opensAt, timezone) : "por ahora no hay una apertura programada",
      accent: true
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "schedule-details", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "schedule-list", children: items.map((item, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.li, { className: item.accent ? "is-accent" : void 0, initial: { opacity: 0, x: -10 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.12 + i * 0.06 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "schedule-list__icon", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { size: 17 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          item.label,
          ":"
        ] }),
        " ",
        item.value
      ] })
    ] }, item.label)) }),
    specialDates.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "schedule-special", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "schedule-special__title", children: "Fechas especiales" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: specialDates.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: s.allowed ? "is-open" : "is-closed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "schedule-special__date", children: formatDateKey(s.date) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          specialText(s),
          s.note ? ` · ${s.note}` : ""
        ] })
      ] }, s.date)) })
    ] })
  ] });
};
const ScheduleMessage = ({ message, availability }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "schedule-message", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Paragraphs, { text: message.intro }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleDetails, { availability }),
  message.outro && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "schedule-message__outro", children: message.outro })
] });
const ModalTitle = ({ icon: Icon, children, tone }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "schedule-title", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `schedule-title__icon schedule-title__icon--${tone}`, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 20 }) }),
  children
] });
const NoticeModal = ({ open, onClose, availability }) => {
  const message = availability.messages.notice;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      onClose,
      title: /* @__PURE__ */ jsxRuntimeExports.jsx(ModalTitle, { icon: Megaphone, tone: "coral", children: message.title }),
      width: "560px",
      footer: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "coral", onClick: onClose, block: true, children: message.button }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleMessage, { message, availability })
    }
  );
};
const ClosedModal = ({ open, onClose, availability }) => {
  const message = availability.messages.closed;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      onClose,
      dismissible: false,
      title: /* @__PURE__ */ jsxRuntimeExports.jsx(ModalTitle, { icon: Lock, tone: "dark", children: message.title }),
      width: "560px",
      footer: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "dark", onClick: onClose, block: true, children: message.button }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleMessage, { message, availability })
    }
  );
};
export {
  ClosedModal as C,
  Megaphone as M,
  NoticeModal as N,
  ScheduleDetails as S
};
