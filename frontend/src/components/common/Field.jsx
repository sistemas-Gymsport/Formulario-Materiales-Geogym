import { forwardRef, useId } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, Check } from 'lucide-react';

const Message = ({ id, error, hint }) => (
  <AnimatePresence mode="wait" initial={false}>
    {error ? (
      <motion.span key="error" id={id} className="field__error" role="alert" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
        <AlertCircle size={14} aria-hidden="true" />
        {error}
      </motion.span>
    ) : hint ? (
      <motion.span key="hint" id={id} className="field__hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        {hint}
      </motion.span>
    ) : null}
  </AnimatePresence>
);

export const TextField = forwardRef(function TextField({ label, error, hint, valid, icon: Icon, as = 'input', className = '', ...props }, ref) {
  const id = useId();
  const messageId = `${id}-msg`;
  const Control = as;
  const classes = ['field', error && 'field--invalid', valid && 'field--valid', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="field__control">
        {Icon && <Icon size={19} className="field__icon" aria-hidden="true" />}
        <Control
          ref={ref}
          id={id}
          className={['input', Icon && 'input--with-icon', as === 'select' && 'select', as === 'textarea' && 'textarea'].filter(Boolean).join(' ')}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error || hint ? messageId : undefined}
          {...props}
        />
        <AnimatePresence>
          {valid && !error && as === 'input' && (
            <motion.span className="field__status" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 26 }} aria-hidden="true">
              <Check size={15} strokeWidth={3.2} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <Message id={messageId} error={error} hint={hint} />
    </div>
  );
});

export const Switch = ({ checked, onChange, label, disabled, description }) => (
  <label className="switch">
    <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    <span className="switch__track" aria-hidden="true">
      <span className="switch__thumb" />
    </span>
    <span>
      {label}
      {description && <small className="muted" style={{ display: 'block', fontWeight: 600 }}>{description}</small>}
    </span>
  </label>
);
