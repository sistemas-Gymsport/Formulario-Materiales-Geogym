import { motion } from 'motion/react';

export const Step = ({ number, title, description, done, children, id }) => (
  <motion.section
    id={id}
    className={`step ${done ? 'step--done' : ''}`}
    aria-labelledby={`${id}-title`}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="step__head">
      <span className="step__number" aria-hidden="true">
        {String(number).padStart(2, '0')}
      </span>
      <h2 id={`${id}-title`} className="step__title">
        {title}
      </h2>
      {description && <p className="step__desc">{description}</p>}
    </div>
    {children}
  </motion.section>
);
