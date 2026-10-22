import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { Switch, TextField } from '../common/Field.jsx';

export const EntityModal = ({ open, title, description, fields, initialValues, onSubmit, onClose, submitLabel = 'Guardar' }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setErrors({});
    }
  }, [open, initialValues]);

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: null, _form: null }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    fields.forEach((f) => {
      const message = f.validate?.(values[f.name], values);
      if (message) nextErrors[f.name] = message;
    });
    if (Object.keys(nextErrors).length) return setErrors(nextErrors);
    setBusy(true);
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      const fieldErrors = error.details?.fields ?? {};
      setErrors({ ...fieldErrors, _form: Object.keys(fieldErrors).length ? null : error.message });
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button variant="coral" icon={Save} type="submit" form="entity-form" loading={busy}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="entity-form" onSubmit={submit} noValidate style={{ display: 'grid', gap: 18 }}>
        {fields.map((field) => {
          if (field.type === 'switch') {
            return <Switch key={field.name} label={field.label} description={field.hint} checked={Boolean(values[field.name])} onChange={(v) => set(field.name, v)} />;
          }
          if (field.type === 'select') {
            return (
              <TextField key={field.name} as="select" label={field.label} value={values[field.name] ?? ''} onChange={(e) => set(field.name, e.target.value)} error={errors[field.name]} hint={field.hint}>
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </TextField>
            );
          }
          if (field.render) return <div key={field.name}>{field.render(values[field.name], (v) => set(field.name, v))}</div>;
          return (
            <TextField
              key={field.name}
              label={field.label}
              type={field.type ?? 'text'}
              value={values[field.name] ?? ''}
              maxLength={field.maxLength}
              autoComplete={field.autoComplete ?? 'off'}
              placeholder={field.placeholder}
              onChange={(e) => set(field.name, e.target.value)}
              error={errors[field.name]}
              hint={field.hint}
            />
          );
        })}
        {errors._form && (
          <div className="alert" role="alert">
            {errors._form}
          </div>
        )}
      </form>
    </Modal>
  );
};
