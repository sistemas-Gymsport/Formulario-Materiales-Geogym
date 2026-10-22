import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Download, FileCheck2, Share2 } from 'lucide-react';
import { Modal } from '../common/Modal.jsx';
import { Button } from '../common/Button.jsx';

const STEPS = [
  { title: 'Ubica tu reporte', text: (name) => `Se descargó como «${name}» en la carpeta de descargas de tu dispositivo.` },
  { title: 'Abre el grupo de WhatsApp', text: () => 'Entra al grupo de WhatsApp del gimnasio donde se reportan las solicitudes.' },
  { title: 'Adjunta el PDF', text: () => 'Toca el clip, elige «Documento» y selecciona el reporte de tu solicitud.' },
  { title: 'Envíalo como evidencia', text: (name, folio) => `Envía el archivo. El folio ${folio} identifica tu solicitud.` }
];

const StatusBanner = ({ receipt, onRetry }) => {
  if (receipt.status === 'generating') {
    return (
      <div className="evidence-status">
        <span className="spinner" aria-hidden="true" />
        Generando tu reporte PDF…
      </div>
    );
  }
  if (receipt.status === 'error') {
    return (
      <div className="evidence-status evidence-status--error" role="alert">
        <AlertTriangle size={18} />
        <span>Tu solicitud sí quedó registrada, pero no pudimos generar el PDF.</span>
        <button type="button" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    );
  }
  return (
    <div className="evidence-status evidence-status--ok">
      <CheckCircle2 size={18} />
      Tu reporte PDF se descargó en tu dispositivo.
    </div>
  );
};

export const EvidenceModal = ({ open, onClose, receipt, request, onRetry }) => {
  const name = receipt.file?.name ?? 'tu reporte';
  const ready = receipt.status === 'ready';
  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={false}
      width="580px"
      title={
        <span className="schedule-title">
          <span className="schedule-title__icon schedule-title__icon--coral" aria-hidden="true">
            <FileCheck2 size={20} />
          </span>
          ¡Solicitud registrada! Comparte tu evidencia
        </span>
      }
      footer={
        <>
          {receipt.canShare && (
            <Button variant="coral" icon={Share2} onClick={receipt.share}>
              Compartir PDF
            </Button>
          )}
          <Button variant="ghost" icon={Download} onClick={receipt.download} disabled={!ready}>
            Descargar de nuevo
          </Button>
          <Button variant={receipt.canShare ? 'dark' : 'coral'} onClick={onClose} disabled={receipt.status === 'generating'}>
            Listo, ya lo envié
          </Button>
        </>
      }
    >
      <div className="evidence">
        <StatusBanner receipt={receipt} onRetry={onRetry} />
        <p className="evidence__lead">
          Para que tu solicitud <strong>{request.folio}</strong> sea considerada, envía el reporte PDF al grupo de WhatsApp del gimnasio como evidencia:
        </p>
        <ol className="evidence-steps">
          {STEPS.map((step, i) => (
            <motion.li key={step.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}>
              <span className="evidence-steps__n" aria-hidden="true">
                {i + 1}
              </span>
              <span>
                <strong>{step.title}</strong>
                {step.text(name, request.folio)}
              </span>
            </motion.li>
          ))}
        </ol>
        {receipt.canShare && <p className="evidence__tip">En tu celular puedes tocar «Compartir PDF» y elegir WhatsApp directamente.</p>}
      </div>
    </Modal>
  );
};
