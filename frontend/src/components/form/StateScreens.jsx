import { motion } from 'motion/react';
import { FileDown, Lock, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { OrganicBlob } from './Decor.jsx';
import { ScheduleDetails } from './ScheduleModals.jsx';
import { formatDate, formatTime12 } from '../../utils/dates.js';
import { plural } from '../../utils/text.js';

const ease = [0.22, 1, 0.36, 1];

const SuccessMark = () => (
  <svg className="success-mark" viewBox="0 0 132 132" aria-hidden="true">
    <motion.path
      d="M66 6c33 0 60 25 60 59s-27 61-61 61S6 99 6 66 33 6 66 6Z"
      fill="#F64851"
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      style={{ transformOrigin: '66px 66px' }}
    />
    <motion.path d="M42 68 58 84 92 48" fill="none" stroke="#000" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.5, ease }} />
  </svg>
);

const reveal = (delay) => ({ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.5, ease } });

export const SuccessScreen = ({ request, timeZone, onRestart, onEvidence }) => (
  <section className="state-screen" aria-live="assertive">
    <OrganicBlob className="hero__blob" opacity={0.12} />
    <div className="state-screen__inner">
      <SuccessMark />
      <motion.h1 {...reveal(0.45)}>¡Solicitud registrada!</motion.h1>
      <motion.p {...reveal(0.55)}>Tu solicitud de materiales se ha registrado correctamente.</motion.p>
      <motion.article className="ticket" {...reveal(0.68)}>
        <div className="ticket__top">
          <span>FOLIO</span>
          <strong className="ticket__folio">{request.folio}</strong>
        </div>
        <div className="ticket__cut" aria-hidden="true" />
        <dl>
          <div>
            <dt>Nombre</dt>
            <dd>{request.requesterName}</dd>
          </div>
          <div>
            <dt>Sucursal</dt>
            <dd>{request.branchName}</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd>
              {formatDate(request.createdAt, timeZone)} · {formatTime12(request.createdAt, timeZone)}
            </dd>
          </div>
          <div>
            <dt>Materiales</dt>
            <dd>{plural(request.itemCount, 'material solicitado', 'materiales solicitados')}</dd>
          </div>
        </dl>
      </motion.article>
      <motion.div className="state-screen__actions" {...reveal(0.8)}>
        <Button variant="coral" icon={FileDown} onClick={onEvidence}>
          Reporte PDF y evidencia
        </Button>
        <Button variant="dark" icon={RotateCcw} onClick={onRestart}>
          Realizar otra solicitud
        </Button>
      </motion.div>
    </div>
  </section>
);

export const ClosedScreen = ({ availability }) => (
  <section className="state-screen">
    <OrganicBlob className="hero__blob" opacity={0.14} />
    <div className="state-screen__inner">
      <motion.span className="closed-clock" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }} aria-hidden="true">
        <Lock size={60} strokeWidth={2.2} />
      </motion.span>
      <motion.span className="kicker" {...reveal(0.1)}>
        Formulario no disponible
      </motion.span>
      <motion.h1 {...reveal(0.18)}>{availability.messages.closed.title}</motion.h1>
      <motion.div className="state-screen__card" {...reveal(0.28)}>
        <ScheduleDetails availability={availability} />
      </motion.div>
      {availability.messages.closed.outro && <motion.p {...reveal(0.36)}>{availability.messages.closed.outro}</motion.p>}
    </div>
  </section>
);
