import { c as createLucideIcon, j as jsxRuntimeExports, m as motion } from "./index-DLrGS1ff.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
const ChevronLeft = createLucideIcon("chevron-left", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode);
const PageHeader = ({ kicker, title, description, actions }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.header, { className: "page-head", initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    kicker && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "kicker", children: kicker }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { marginTop: kicker ? 10 : 0 }, children: title }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: description })
  ] }),
  actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "page-head__actions", children: actions })
] });
const Card = ({ title, subtitle, actions, children, className = "", delay = 0, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  motion.section,
  {
    className: `card ${className}`,
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
    ...props,
    children: [
      (title || actions) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card__head", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          title && /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "card__title", children: title }),
          subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "card__sub", children: subtitle })
        ] }),
        actions
      ] }),
      children
    ]
  }
);
const StatCard = ({ label, value, hint, icon: Icon, tone, index = 0 }) => {
  const isText = typeof value === "string" && value.length > 8;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      className: `stat ${tone ? `stat--${tone}` : ""}`,
      initial: { opacity: 0, y: 18, scale: 0.98 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
      children: [
        Icon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat__icon", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat__label", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `stat__value ${isText ? "stat__value--text" : ""} tabular`, children: value }),
        hint && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "stat__hint", children: hint })
      ]
    }
  );
};
const Pagination = ({ pagination, onPage }) => {
  if (!pagination) return null;
  const { page, totalPages, total, pageSize } = pagination;
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pagination", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tabular", children: [
      from,
      "–",
      to,
      " de ",
      total
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pagination__controls", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "icon-btn", disabled: page <= 1, onClick: () => onPage(page - 1), "aria-label": "Página anterior", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 18 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { alignSelf: "center", padding: "0 6px" }, className: "tabular", children: [
        page,
        " / ",
        totalPages
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "icon-btn", disabled: page >= totalPages, onClick: () => onPage(page + 1), "aria-label": "Página siguiente", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 18 }) })
    ] })
  ] });
};
const Tabs = ({ value, onChange, options, id }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "tabs", role: "tablist", children: options.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", role: "tab", "aria-selected": value === option.value, onClick: () => onChange(option.value), children: [
  value === option.value && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { layoutId: `tabs-${id}`, className: "tabs__bg", transition: { type: "spring", stiffness: 420, damping: 36 } }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: option.label })
] }, option.value)) });
const TagList = ({ items, max = 6, custom = [] }) => {
  const all = [...items.map((name) => ({ name })), ...custom.map((name) => ({ name, custom: true }))];
  const visible = all.slice(0, max);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "tag-list", children: [
    visible.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `tag ${t.custom ? "tag--custom" : ""}`, children: t.name }, `${t.name}-${i}`)),
    all.length > max && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "tag tag--more", children: [
      "+",
      all.length - max
    ] })
  ] });
};
export {
  Card as C,
  PageHeader as P,
  StatCard as S,
  TagList as T,
  Pagination as a,
  Tabs as b
};
