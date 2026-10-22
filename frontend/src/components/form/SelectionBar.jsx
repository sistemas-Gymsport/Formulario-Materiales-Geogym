import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { AnimatedNumber } from '../common/Feedback.jsx';

export const SelectionBar = ({ total, recent, canReview, missing, onReview }) =>
  createPortal(
    <AnimatePresence>
      {total > 0 && (
        <motion.div
          className="selection-bar"
          role="region"
          aria-label="Resumen de selección"
          initial={{ y: 120, x: '-50%', opacity: 0 }}
          animate={{ y: 0, x: '-50%', opacity: 1 }}
          exit={{ y: 120, x: '-50%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        >
          <span className="selection-bar__count" aria-hidden="true">
            <AnimatedNumber value={total} />
          </span>
          <div className="selection-bar__text">
            <strong>
              Has seleccionado {total} {total === 1 ? 'material' : 'materiales'}
            </strong>
            <span>{canReview ? recent : `Falta: ${missing.join(', ')}`}</span>
          </div>
          <Button variant="coral" iconRight={ArrowRight} disabled={!canReview} onClick={onReview}>
            <span className="only-wide">Revisar solicitud</span>
            <span className="only-narrow">Revisar</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
