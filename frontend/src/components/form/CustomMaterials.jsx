import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, PackagePlus, Plus, X } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { Modal } from '../common/Modal.jsx';
import { TextField } from '../common/Field.jsx';
import { collapseSpaces, validateCustomName } from '../../utils/text.js';

export const AddCustomModal = ({ open, initialValue, onClose, selection, limits }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [match, setMatch] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(initialValue ?? '');
      setError(null);
      setMatch(null);
    }
  }, [open, initialValue]);

  const limitReached = selection.custom.length >= limits.customCount;

  const submit = (event) => {
    event.preventDefault();
    if (limitReached) return setError(`Puedes agregar hasta ${limits.customCount} materiales adicionales.`);
    const invalid = validateCustomName(value, limits);
    if (invalid) return setError(invalid);
    const result = selection.addCustom(collapseSpaces(value));
    if (result.error) {
      setError(result.error);
      setMatch(result.match ?? null);
      return undefined;
    }
    onClose(result.item);
    return undefined;
  };

  const selectMatch = () => {
    if (!selection.selectedSet.has(match.id)) selection.toggle(match.id);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => onClose()}
      title="Agregar otro material"
      description="Escribe el nombre del material que necesitas solicitar."
      initialFocus={inputRef}
      width="520px"
      footer={
        <>
          <Button variant="ghost" onClick={() => onClose()}>
            Cancelar
          </Button>
          <Button variant="coral" icon={Plus} type="submit" form="custom-material-form">
            Agregar material
          </Button>
        </>
      }
    >
      <form id="custom-material-form" onSubmit={submit} noValidate>
        <TextField
          ref={inputRef}
          label="Nombre del material"
          icon={PackagePlus}
          value={value}
          maxLength={limits.customMax}
          placeholder="Ej. Cinta canela"
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
            setMatch(null);
          }}
          error={error}
          hint={`Una vez agregado no podrás editarlo; solo eliminarlo. ${selection.custom.length}/${limits.customCount} agregados.`}
        />
        <AnimatePresence>
          {match && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
              <Button variant="dark" size="sm" icon={Check} onClick={selectMatch} style={{ marginTop: 14 }}>
                {selection.selectedSet.has(match.id) ? 'Ya está seleccionado' : `Seleccionar «${match.name}» del catálogo`}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Modal>
  );
};

export const CustomMaterials = ({ items, onRemove, onAdd }) => (
  <div className="custom">
    <div className="custom__cta">
      <span className="custom__cta-blob" aria-hidden="true" />
      <h3>¿No encuentras el material?</h3>
      <p>Agrégalo manualmente. Se enviará como material adicional y el equipo administrativo lo revisará.</p>
      <Button variant="coral" icon={Plus} onClick={() => onAdd()}>
        Agregar otro material
      </Button>
    </div>
    <div>
      <p className="field__label" style={{ marginBottom: 10 }}>
        Materiales adicionales
      </p>
      <motion.ul className="chips" layout style={{ listStyle: 'none', margin: 0 }} aria-label="Materiales adicionales seleccionados">
        <AnimatePresence initial={false} mode="popLayout">
          {items.length === 0 && (
            <motion.li key="empty" className="chips__empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Aún no agregas materiales adicionales.
            </motion.li>
          )}
          {items.map((item) => (
            <motion.li
              key={item.key}
              layout
              className="chip"
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 480, damping: 30 }}
            >
              <span className="chip__badge" aria-hidden="true">
                <Check size={13} strokeWidth={3.4} />
              </span>
              <span>{item.name}</span>
              <button type="button" className="chip__remove" onClick={() => onRemove(item.key)} aria-label={`Eliminar ${item.name}`}>
                <X size={15} strokeWidth={2.8} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  </div>
);
