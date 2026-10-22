import { motion } from 'motion/react';
import { CalendarClock, CalendarDays, Clock3, Lock, Megaphone, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { formatClock, formatDateKey, formatOpening, formatTime12, formatWeekdays } from '../../utils/dates.js';

const Paragraphs = ({ text }) =>
  text
    ?.split('\n')
    .filter((line) => line.trim())
    .map((line, i) => <p key={i}>{line}</p>);

const specialText = (s) =>
  s.allowed
    ? `abierto de ${formatClock(s.openingTime)} a ${formatClock(s.closingTime)}`
    : 'cerrado, sin recepción de pedidos';

export const ScheduleDetails = ({ availability }) => {
  const { schedule, specialDates = [], timezone } = availability;
  const items = [];
  if (schedule.weekdays.length) {
    items.push({ icon: CalendarDays, label: 'Días de recepción', value: formatWeekdays(schedule.weekdays) });
    items.push({ icon: Clock3, label: 'Horario', value: `de ${formatClock(schedule.openingTime)} a ${formatClock(schedule.closingTime)}` });
  }
  if (availability.isOpen && availability.closesAt) {
    items.push({ icon: Sparkles, label: 'Hoy', value: `recibimos solicitudes hasta las ${formatTime12(availability.closesAt, timezone)}`, accent: true });
  }
  if (!availability.isOpen) {
    items.push({
      icon: CalendarClock,
      label: 'Próxima apertura',
      value: availability.opensAt ? formatOpening(availability.opensAt, timezone) : 'por ahora no hay una apertura programada',
      accent: true
    });
  }
  return (
    <div className="schedule-details">
      <ul className="schedule-list">
        {items.map((item, i) => (
          <motion.li key={item.label} className={item.accent ? 'is-accent' : undefined} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.06 }}>
            <span className="schedule-list__icon" aria-hidden="true">
              <item.icon size={17} />
            </span>
            <span>
              <strong>{item.label}:</strong> {item.value}
            </span>
          </motion.li>
        ))}
      </ul>
      {specialDates.length > 0 && (
        <div className="schedule-special">
          <p className="schedule-special__title">Fechas especiales</p>
          <ul>
            {specialDates.map((s) => (
              <li key={s.date} className={s.allowed ? 'is-open' : 'is-closed'}>
                <span className="schedule-special__date">{formatDateKey(s.date)}</span>
                <span>
                  {specialText(s)}
                  {s.note ? ` · ${s.note}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ScheduleMessage = ({ message, availability }) => (
  <div className="schedule-message">
    <Paragraphs text={message.intro} />
    <ScheduleDetails availability={availability} />
    {message.outro && <p className="schedule-message__outro">{message.outro}</p>}
  </div>
);

const ModalTitle = ({ icon: Icon, children, tone }) => (
  <span className="schedule-title">
    <span className={`schedule-title__icon schedule-title__icon--${tone}`} aria-hidden="true">
      <Icon size={20} />
    </span>
    {children}
  </span>
);

export const NoticeModal = ({ open, onClose, availability }) => {
  const message = availability.messages.notice;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<ModalTitle icon={Megaphone} tone="coral">{message.title}</ModalTitle>}
      width="560px"
      footer={
        <Button variant="coral" onClick={onClose} block>
          {message.button}
        </Button>
      }
    >
      <ScheduleMessage message={message} availability={availability} />
    </Modal>
  );
};

export const ClosedModal = ({ open, onClose, availability }) => {
  const message = availability.messages.closed;
  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={false}
      title={<ModalTitle icon={Lock} tone="dark">{message.title}</ModalTitle>}
      width="560px"
      footer={
        <Button variant="dark" onClick={onClose} block>
          {message.button}
        </Button>
      }
    >
      <ScheduleMessage message={message} availability={availability} />
    </Modal>
  );
};
