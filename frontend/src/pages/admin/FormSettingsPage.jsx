import { useEffect, useState } from 'react';
import { CalendarPlus, Clock, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi.js';
import { useResource } from '../../hooks/useResource.js';
import { useAction } from '../../hooks/useAction.js';
import { useToast } from '../../contexts/ToastContext.jsx';
import { MESSAGE_FIELDS, ScheduleMessagesCard } from '../../components/admin/ScheduleMessagesCard.jsx';
import { ScheduleDetails } from '../../components/form/ScheduleModals.jsx';
import { Card, PageHeader } from '../../components/admin/AdminUi.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Switch, TextField } from '../../components/common/Field.jsx';
import { EmptyState, ErrorState, Skeleton, StatusPill } from '../../components/common/Feedback.jsx';
import { WEEKDAYS, formatOpening, formatTime12 } from '../../utils/dates.js';

const TIMEZONES = ['America/Mexico_City', 'America/Monterrey', 'America/Merida', 'America/Cancun', 'America/Chihuahua', 'America/Mazatlan', 'America/Hermosillo', 'America/Tijuana'];

const emptyException = { date: '', allowed: false, openingTime: '', closingTime: '', note: '' };

const AvailabilityPreview = ({ availability }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
    <StatusPill tone={availability.isOpen ? 'open' : 'closed'}>{availability.isOpen ? 'Abierto ahora' : 'Cerrado ahora'}</StatusPill>
    <span className="muted" style={{ fontWeight: 700 }}>
      {availability.isOpen
        ? `Cierra hoy a las ${formatTime12(availability.closesAt, availability.timezone)}`
        : availability.opensAt
          ? `Próxima apertura: ${formatOpening(availability.opensAt, availability.timezone)}`
          : 'No hay una próxima apertura programada'}
    </span>
  </div>
);

const ExceptionsCard = ({ exceptions, onChange }) => {
  const [draft, setDraft] = useState(emptyException);
  const { run, busy } = useAction();
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const add = async (event) => {
    event.preventDefault();
    const body = { date: draft.date, allowed: draft.allowed, note: draft.note || undefined, openingTime: draft.allowed && draft.openingTime ? draft.openingTime : null, closingTime: draft.allowed && draft.closingTime ? draft.closingTime : null };
    if (await run('add', () => adminApi.schedule.addException(body), 'Fecha guardada')) {
      setDraft(emptyException);
      onChange();
    }
  };

  const remove = async (id) => {
    if (await run(id, () => adminApi.schedule.removeException(id).then(() => true), 'Fecha eliminada')) onChange();
  };

  return (
    <Card title="Fechas extraordinarias y bloqueadas" subtitle="Tienen prioridad sobre el horario semanal" delay={0.1}>
      <form onSubmit={add} className="form-grid" style={{ marginBottom: 20 }}>
        <TextField label="Fecha" type="date" value={draft.date} onChange={(e) => set('date', e.target.value)} required />
        <TextField as="select" label="Tipo" value={draft.allowed ? 'open' : 'blocked'} onChange={(e) => set('allowed', e.target.value === 'open')}>
          <option value="blocked">Bloquear fecha (cerrado)</option>
          <option value="open">Apertura extraordinaria</option>
        </TextField>
        {draft.allowed && (
          <>
            <TextField label="Apertura (opcional)" type="time" value={draft.openingTime} onChange={(e) => set('openingTime', e.target.value)} hint="Vacío = horario general" />
            <TextField label="Cierre (opcional)" type="time" value={draft.closingTime} onChange={(e) => set('closingTime', e.target.value)} />
          </>
        )}
        <TextField className="form-grid--full" label="Nota" value={draft.note} onChange={(e) => set('note', e.target.value)} maxLength={120} placeholder="Ej. Día festivo" />
        <div className="form-grid--full">
          <Button type="submit" variant="dark" icon={CalendarPlus} loading={busy === 'add'} disabled={!draft.date}>
            Agregar fecha
          </Button>
        </div>
      </form>
      {exceptions.length ? (
        <div className="table-wrap">
          <table className="table table--stack">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Horario</th>
                <th>Nota</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {exceptions.map((e) => (
                <tr key={e.id}>
                  <td data-label="Fecha" className="table__primary tabular">
                    {e.date.split('-').reverse().join('/')}
                  </td>
                  <td data-label="Tipo">{e.allowed ? <StatusPill tone="open">Apertura</StatusPill> : <StatusPill tone="closed">Bloqueada</StatusPill>}</td>
                  <td data-label="Horario">{e.allowed ? `${e.openingTime ?? 'General'} – ${e.closingTime ?? 'General'}` : '—'}</td>
                  <td data-label="Nota">{e.note ?? '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => remove(e.id)} disabled={busy === e.id} aria-label={`Eliminar ${e.date}`}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Sin fechas especiales">Agrega días festivos bloqueados o aperturas extraordinarias.</EmptyState>
      )}
    </Card>
  );
};

export default function FormSettingsPage() {
  const config = useResource(() => adminApi.schedule.get(), []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (config.data) {
      const { schedule } = config.data;
      const keys = ['enabled', 'timezone', 'openingTime', 'closingTime', 'allowedWeekdays', ...MESSAGE_FIELDS];
      setForm(Object.fromEntries(keys.map((k) => [k, schedule[k]])));
    }
  }, [config.data]);

  if (config.error) return <ErrorState error={config.error} onRetry={config.reload} />;
  if (!form) return <Skeleton height={420} radius={20} />;

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: null }));
  };
  const toggleDay = (day) => set('allowedWeekdays', form.allowedWeekdays.includes(day) ? form.allowedWeekdays.filter((d) => d !== day) : [...form.allowedWeekdays, day]);

  const save = async () => {
    if (form.closingTime <= form.openingTime) return setErrors({ closingTime: 'Debe ser posterior a la apertura' });
    if (!form.allowedWeekdays.length && form.enabled) return setErrors({ allowedWeekdays: 'Selecciona al menos un día o desactiva el formulario' });
    setErrors({});
    setSaving(true);
    try {
      const result = await adminApi.schedule.save(form);
      config.setData(result);
      toast.success('Configuración guardada');
    } catch (error) {
      setErrors(error.details?.fields ?? {});
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
    return undefined;
  };

  return (
    <>
      <PageHeader
        kicker="Configuración"
        title="Disponibilidad del formulario"
        description="El servidor valida estos horarios en cada envío; no es posible registrar solicitudes fuera de ellos."
        actions={
          <Button variant="coral" icon={Save} loading={saving} onClick={save}>
            Guardar cambios
          </Button>
        }
      />
      <div className="grid" style={{ gap: 20 }}>
        <Card title="Estado actual" delay={0}>
          <AvailabilityPreview availability={config.data.availability} />
        </Card>
        <div className="grid grid--2">
          <Card title="Horario semanal" subtitle="Días y horas en que se aceptan solicitudes" delay={0.05}>
            <div className="grid" style={{ gap: 20 }}>
              <Switch checked={form.enabled} onChange={(v) => set('enabled', v)} label="Formulario activado" description="Desactívalo para cerrar el formulario de inmediato, sin importar el horario." />
              <div className="field">
                <span className="field__label">Días habilitados</span>
                <div className="days">
                  {WEEKDAYS.map((d) => (
                    <button key={d.value} type="button" className="day" aria-pressed={form.allowedWeekdays.includes(d.value)} aria-label={d.label} onClick={() => toggleDay(d.value)}>
                      {d.short}
                    </button>
                  ))}
                </div>
                {errors.allowedWeekdays && <span className="field__error">{errors.allowedWeekdays}</span>}
              </div>
              <div className="form-grid">
                <TextField label="Hora de apertura" type="time" icon={Clock} value={form.openingTime} onChange={(e) => set('openingTime', e.target.value)} />
                <TextField label="Hora de cierre" type="time" icon={Clock} value={form.closingTime} onChange={(e) => set('closingTime', e.target.value)} error={errors.closingTime} />
              </div>
              <TextField as="select" label="Zona horaria" value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </TextField>
            </div>
          </Card>
          <Card title="Así se verá en los avisos" subtitle="Generado con la configuración actual del formulario" delay={0.08}>
            <ScheduleDetails availability={{ ...config.data.availability, schedule: { enabled: form.enabled, weekdays: form.allowedWeekdays, openingTime: form.openingTime, closingTime: form.closingTime } }} />
          </Card>
        </div>
        <ScheduleMessagesCard form={form} errors={errors} onChange={set} availability={config.data.availability} />
        <ExceptionsCard exceptions={config.data.exceptions} onChange={() => config.reload({ silent: true })} />
      </div>
    </>
  );
}
