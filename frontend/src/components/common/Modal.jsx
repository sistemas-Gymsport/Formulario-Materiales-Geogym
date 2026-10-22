import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ModalPanel = ({ title, description, onClose, children, footer, width, dismissible, initialFocus }) => {
  const panelRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const previous = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const target = initialFocus?.current ?? panelRef.current?.querySelector(FOCUSABLE);
    requestAnimationFrame(() => target?.focus());
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [initialFocus]);

  const onKeyDown = (event) => {
    if (event.key === 'Escape' && dismissible) {
      event.stopPropagation();
      onClose();
    }
    if (event.key !== 'Tab') return;
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

  return (
    <div className="modal-root" onKeyDown={onKeyDown}>
      <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} onClick={dismissible ? onClose : undefined} />
      <motion.div
        ref={panelRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        style={{ '--modal-width': width }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      >
        <div className="modal__head">
          <div>
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
            {description && (
              <p id={descId} className="muted" style={{ marginTop: 8 }}>
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
              <X size={20} />
            </button>
          )}
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </motion.div>
    </div>
  );
};

export const Modal = ({ open, dismissible = true, ...props }) =>
  createPortal(<AnimatePresence>{open && <ModalPanel dismissible={dismissible} {...props} />}</AnimatePresence>, document.body);
