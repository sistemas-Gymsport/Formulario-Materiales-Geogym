import { j as jsxRuntimeExports } from "./index-DLrGS1ff.js";
import { r as reactExports } from "./react-0QgR9_yw.js";
const trackPointer = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
};
const Button = reactExports.forwardRef(function Button2({ variant = "dark", size, block, icon: Icon, iconRight: IconRight, loading, children, className = "", type = "button", disabled, ...props }, ref) {
  const classes = ["btn", variant !== "dark" && `btn--${variant}`, size && `btn--${size}`, block && "btn--block", className].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { ref, type, className: classes, disabled: disabled || loading, "aria-busy": loading || void 0, onPointerMove: trackPointer, ...props, children: [
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "spinner", "aria-hidden": "true" }) : Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 18, strokeWidth: 2.4, "aria-hidden": "true" }),
    children,
    IconRight && !loading && /* @__PURE__ */ jsxRuntimeExports.jsx(IconRight, { size: 18, strokeWidth: 2.4, "aria-hidden": "true" })
  ] });
});
export {
  Button as B
};
