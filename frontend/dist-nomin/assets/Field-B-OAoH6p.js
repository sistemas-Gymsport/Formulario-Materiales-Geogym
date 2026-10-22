import { c as createLucideIcon, j as jsxRuntimeExports, A as AnimatePresence, m as motion, i as CircleAlert } from "./index-DLrGS1ff.js";
import { r as reactExports } from "./react-0QgR9_yw.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
const Check = createLucideIcon("check", __iconNode);
const Message = ({ id, error, hint }) => /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", initial: false, children: error ? /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.span, { id, className: "field__error", role: "alert", initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.18 }, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { size: 14, "aria-hidden": "true" }),
  error
] }, "error") : hint ? /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { id, className: "field__hint", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, children: hint }, "hint") : null });
const TextField = reactExports.forwardRef(function TextField2({ label, error, hint, valid, icon: Icon, as = "input", className = "", ...props }, ref) {
  const id = reactExports.useId();
  const messageId = `${id}-msg`;
  const Control = as;
  const classes = ["field", error && "field--invalid", valid && "field--valid", className].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: classes, children: [
    label && /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "field__label", htmlFor: id, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "field__control", children: [
      Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 19, className: "field__icon", "aria-hidden": "true" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Control,
        {
          ref,
          id,
          className: ["input", Icon && "input--with-icon", as === "select" && "select", as === "textarea" && "textarea"].filter(Boolean).join(" "),
          "aria-invalid": Boolean(error) || void 0,
          "aria-describedby": error || hint ? messageId : void 0,
          ...props
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: valid && !error && as === "input" && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { className: "field__status", initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0, opacity: 0 }, transition: { type: "spring", stiffness: 500, damping: 26 }, "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 15, strokeWidth: 3.2 }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Message, { id: messageId, error, hint })
  ] });
});
const Switch = ({ checked, onChange, label, disabled, description }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "switch", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", role: "switch", checked, disabled, onChange: (e) => onChange(e.target.checked) }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "switch__track", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "switch__thumb" }) }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
    label,
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("small", { className: "muted", style: { display: "block", fontWeight: 600 }, children: description })
  ] })
] });
export {
  Check as C,
  Switch as S,
  TextField as T
};
