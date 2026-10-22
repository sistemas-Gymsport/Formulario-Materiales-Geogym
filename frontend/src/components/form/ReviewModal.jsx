import { motion } from 'motion/react';
import { AlertTriangle, PenLine, Send } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';
import { CategoryIcon } from '../common/CategoryIcon.jsx';
import { formatDate } from '../../utils/dates.js';

const stagger = (i) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.12 + i * 0.06, duration: 0.32, ease: [0.22, 1, 0.36, 1] }
});

export const ReviewModal = ({ open, onClose, onConfirm, submitting, error, summary, timeZone }) => (
  <Modal
    open={open}
    onClose={onClose}
    dismissible={!submitting}
    title="Resumen de solicitud"
    description="Revisa que todo esté correcto. La solicitud se registrará solo al confirmar."
    width="680px"
    footer={
      <>
        <Button variant="ghost" icon={PenLine} onClick={onClose} disabled={submitting}>
          Modificar solicitud
        </Button>
        <Button variant="coral" icon={Send} loading={submitting} onClick={onConfirm}>
          {submitting ? 'Enviando…' : 'Confirmar y enviar solicitud'}
        </Button>
      </>
    }
  >
    <motion.dl className="review-card" {...stagger(0)}>
      <div>
        <dt>Solicitante</dt>
        <dd>{summary.name}</dd>
      </div>
      <div>
        <dt>Sucursal</dt>
        <dd>{summary.branch}</dd>
      </div>
      <div>
        <dt>Fecha</dt>
        <dd>{formatDate(new Date(), timeZone)}</dd>
      </div>
    </motion.dl>
    {summary.groups.map((group, i) => (
      <motion.section key={group.id} className="review-group" {...stagger(i + 1)}>
        <h3>
          <CategoryIcon name={group.icon} size={17} />
          {group.name}
          <span>{group.materials.length}</span>
        </h3>
        <ul className="review-list">
          {group.materials.map((m) => (
            <li key={m.id}>{m.name}</li>
          ))}
        </ul>
      </motion.section>
    ))}
    {summary.custom.length > 0 && (
      <motion.section className="review-group" {...stagger(summary.groups.length + 1)}>
        <h3>
          <CategoryIcon name="package" size={17} />
          Materiales adicionales
          <span>{summary.custom.length}</span>
        </h3>
        <ul className="review-list review-list--custom">
          {summary.custom.map((c) => (
            <li key={c.key}>{c.name}</li>
          ))}
        </ul>
      </motion.section>
    )}
    <motion.div className="review-total" {...stagger(summary.groups.length + 2)}>
      <span>Total de materiales diferentes solicitados</span>
      <strong className="tabular">{summary.total}</strong>
    </motion.div>
    {error && (
      <motion.div className="alert" role="alert" style={{ marginTop: 16 }} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <AlertTriangle size={18} />
        <span>{error}</span>
      </motion.div>
    )}
  </Modal>
);
