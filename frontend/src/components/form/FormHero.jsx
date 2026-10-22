import { motion } from 'motion/react';
import { BrandImage, Logo } from '../common/Logo.jsx';
import { StatusPill } from '../common/Feedback.jsx';
import { OrganicBlob, Swoosh } from './Decor.jsx';
import { formatTime12 } from '../../utils/dates.js';

const rise = (delay) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }
});

export const AvailabilityPill = ({ availability }) =>
  availability?.isOpen ? (
    <StatusPill tone="open">Abierto · cierra {formatTime12(availability.closesAt, availability.timezone)}</StatusPill>
  ) : (
    <StatusPill tone="closed">Formulario cerrado</StatusPill>
  );

export const TopBar = ({ availability }) => (
  <header className="topbar">
    <Logo />
    {availability && <AvailabilityPill availability={availability} />}
  </header>
);

export const FormHero = ({ stats }) => (
  <section className="hero" aria-labelledby="hero-title">
    <OrganicBlob className="hero__blob" />
    <motion.div className="hero__badge" initial={{ opacity: 0, scale: 0.8, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 5 }} transition={{ type: 'spring', stiffness: 160, damping: 16, delay: 0.3 }}>
      <BrandImage className="brand-sticker" large />
    </motion.div>
    <div className="hero__content">
      <motion.span className="kicker" {...rise(0)}>
        Sucursales GEO GYM
      </motion.span>
      <h1 id="hero-title" className="hero__title">
        <motion.span {...rise(0.08)}>Solicitud</motion.span>
        <motion.span {...rise(0.16)}>
          de <em>materiales<Swoosh /></em>
        </motion.span>
      </h1>
      <motion.div className="hero__row" {...rise(0.28)}>
        <p className="hero__subtitle">Selecciona los materiales que necesita tu sucursal.</p>
        <div className="hero__facts">
          {stats.map((s) => (
            <div className="fact" key={s.label}>
              <strong className="tabular">{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);
