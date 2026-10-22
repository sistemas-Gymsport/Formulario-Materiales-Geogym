import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, UserRound } from 'lucide-react';
import { TextField } from '../common/Field.jsx';

const BranchPicker = ({ branches, value, onChange }) => {
  const refs = useRef([]);
  const selectedIndex = branches.findIndex((b) => b.id === value);

  const onKeyDown = (event, index) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = (index + keys[event.key] + branches.length) % branches.length;
    onChange(branches[next].id);
    refs.current[next]?.focus();
  };

  const selected = branches[selectedIndex];
  return (
    <div className="branches">
      <span className="field__label" id="branch-label">
        Sucursal
      </span>
      <div className="branches__grid" role="radiogroup" aria-labelledby="branch-label" aria-required="true">
        {branches.map((branch, index) => {
          const checked = branch.id === value;
          return (
            <button
              key={branch.id}
              ref={(el) => (refs.current[index] = el)}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked || (selectedIndex === -1 && index === 0) ? 0 : -1}
              className="branch"
              onClick={() => onChange(branch.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
            >
              {checked && <motion.span layoutId="branch-bg" className="branch__bg" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="branch__dot" aria-hidden="true">
                {checked && <Check size={13} strokeWidth={3.4} />}
              </span>
              <span className="branch__label">{branch.name}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        {selected && (
          <motion.p key={selected.id} className="branch-confirm" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.22 }} aria-live="polite">
            <span className="branch-confirm__icon" aria-hidden="true">
              <Check size={15} strokeWidth={3} />
            </span>
            Solicitarás materiales para <strong>{selected.name}</strong>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export const RequesterSection = ({ name, onNameChange, nameError, branches, branchId, onBranchChange, limits }) => {
  const [touched, setTouched] = useState(false);
  const showError = touched && nameError;
  return (
    <div className="requester">
      <TextField
        label="Nombre completo"
        icon={UserRound}
        value={name}
        maxLength={limits.nameMax}
        autoComplete="name"
        placeholder="Ej. María Fernanda López"
        onChange={(e) => onNameChange(e.target.value)}
        onBlur={() => setTouched(true)}
        error={showError ? nameError : null}
        valid={!nameError}
        hint="Escribe nombre y apellido como aparecerá en la solicitud."
        required
      />
      <BranchPicker branches={branches} value={branchId} onChange={onBranchChange} />
    </div>
  );
};
