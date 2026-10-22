import { useState } from 'react';
import { Eye, Lock, Megaphone } from 'lucide-react';
import { Card } from './AdminUi.jsx';
import { Button } from '../common/Button.jsx';
import { TextField } from '../common/Field.jsx';
import { ClosedModal, NoticeModal } from '../form/ScheduleModals.jsx';

export const MESSAGE_FIELDS = ['noticeTitle', 'noticeIntro', 'noticeOutro', 'noticeButton', 'closedTitle', 'closedMessage', 'closedOutro', 'closedButton'];

const GROUPS = [
  {
    key: 'notice',
    title: 'Aviso cuando el formulario está abierto',
    subtitle: 'Se muestra al entrar al formulario en los días y horas de recepción',
    icon: Megaphone,
    fields: { title: 'noticeTitle', intro: 'noticeIntro', outro: 'noticeOutro', button: 'noticeButton' }
  },
  {
    key: 'closed',
    title: 'Bloqueo cuando el formulario está cerrado',
    subtitle: 'Se muestra fuera de horario y no permite registrar solicitudes',
    icon: Lock,
    fields: { title: 'closedTitle', intro: 'closedMessage', outro: 'closedOutro', button: 'closedButton' }
  }
];

const buildPreview = (form, availability, key) => ({
  ...availability,
  isOpen: key === 'notice',
  closesAt: key === 'notice' ? availability.closesAt ?? null : null,
  schedule: { enabled: form.enabled, weekdays: form.allowedWeekdays, openingTime: form.openingTime, closingTime: form.closingTime },
  messages: Object.fromEntries(GROUPS.map((g) => [g.key, Object.fromEntries(Object.entries(g.fields).map(([part, field]) => [part, form[field]]))]))
});

export const ScheduleMessagesCard = ({ form, errors, onChange, availability }) => {
  const [preview, setPreview] = useState(null);
  const previewData = preview ? buildPreview(form, availability, preview) : null;
  return (
    <>
      <div className="grid grid--2">
        {GROUPS.map((group, i) => (
          <Card
            key={group.key}
            title={group.title}
            subtitle={group.subtitle}
            delay={0.08 + i * 0.04}
            actions={
              <Button size="sm" variant="ghost" icon={Eye} onClick={() => setPreview(group.key)}>
                Vista previa
              </Button>
            }
          >
            <div className="grid" style={{ gap: 16 }}>
              <TextField label="Título" icon={group.icon} value={form[group.fields.title]} maxLength={120} onChange={(e) => onChange(group.fields.title, e.target.value)} error={errors[group.fields.title]} />
              <TextField
                as="textarea"
                label="Texto principal"
                rows={5}
                value={form[group.fields.intro]}
                maxLength={800}
                onChange={(e) => onChange(group.fields.intro, e.target.value)}
                error={errors[group.fields.intro]}
                hint="Cada salto de línea es un párrafo. Los días, el horario, las fechas especiales y la próxima apertura se agregan automáticamente."
              />
              <TextField as="textarea" label="Texto final" rows={2} value={form[group.fields.outro]} maxLength={400} onChange={(e) => onChange(group.fields.outro, e.target.value)} error={errors[group.fields.outro]} />
              <TextField label="Texto del botón" value={form[group.fields.button]} maxLength={40} onChange={(e) => onChange(group.fields.button, e.target.value)} error={errors[group.fields.button]} />
            </div>
          </Card>
        ))}
      </div>
      {previewData && (
        <>
          <NoticeModal open={preview === 'notice'} onClose={() => setPreview(null)} availability={previewData} />
          <ClosedModal open={preview === 'closed'} onClose={() => setPreview(null)} availability={previewData} />
        </>
      )}
    </>
  );
};
