import { j as jsxRuntimeExports, A as AnimatePresence, m as motion } from "./index-DLrGS1ff.js";
import { h as reactDomExports, r as reactExports } from "./react-0QgR9_yw.js";
import { X } from "./x-B59TumVd.js";
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const ModalPanel = ({ title, description, onClose, children, footer, width, dismissible, initialFocus }) => {
  const panelRef = reactExports.useRef(null);
  const titleId = reactExports.useId();
  const descId = reactExports.useId();
  reactExports.useEffect(() => {
    const previous = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const target = initialFocus?.current ?? panelRef.current?.querySelector(FOCUSABLE);
    requestAnimationFrame(() => target?.focus());
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [initialFocus]);
  const onKeyDown = (event) => {
    if (event.key === "Escape" && dismissible) {
      event.stopPropagation();
      onClose();
    }
    if (event.key !== "Tab") return;
    const nodes = [...panelRef.current.querySelectorAll(FOCUSABLE)];
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal-root", onKeyDown, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "modal-backdrop", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.25 }, onClick: dismissible ? onClose : void 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        ref: panelRef,
        className: "modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": titleId,
        "aria-describedby": description ? descId : void 0,
        style: { "--modal-width": width },
        initial: { opacity: 0, y: 40, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 24, scale: 0.98 },
        transition: { type: "spring", stiffness: 380, damping: 34 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "modal__head", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: titleId, className: "modal__title", children: title }),
              description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: descId, className: "muted", style: { marginTop: 8 }, children: description })
            ] }),
            dismissible && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "modal__close", onClick: onClose, "aria-label": "Cerrar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal__body", children }),
          footer && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "modal__foot", children: footer })
        ]
      }
    )
  ] });
};
const Modal = ({ open, dismissible = true, ...props }) => reactDomExports.createPortal(/* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsx(ModalPanel, { dismissible, ...props }) }), document.body);
export {
  Modal as M
};
