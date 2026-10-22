import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle, Inbox } from 'lucide-react';

export const AnimatedNumber = ({ value, className = '' }) => (
  <span className={`tabular ${className}`} style={{ display: 'inline-grid', overflow: 'hidden', verticalAlign: 'bottom' }} aria-live="polite">
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={value} initial={{ y: '-90%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '90%', opacity: 0 }} transition={{ type: 'spring', stiffness: 520, damping: 32 }}>
        {value}
      </motion.span>
    </AnimatePresence>
  </span>
);

export const EmptyState = ({ icon: Icon = Inbox, title, children, action }) => (
  <div className="empty">
    <span className="empty__icon">
      <Icon size={26} aria-hidden="true" />
    </span>
    <p className="empty__title">{title}</p>
    {children && <p>{children}</p>}
    {action}
  </div>
);

export const ErrorState = ({ error, onRetry }) => (
  <div className="alert" role="alert">
    <AlertTriangle size={18} />
    <div>
      <p>{error?.message ?? 'No fue posible cargar la información.'}</p>
      {onRetry && (
        <button type="button" onClick={() => onRetry()} style={{ marginTop: 8, fontWeight: 800, textDecoration: 'underline' }}>
          Reintentar
        </button>
      )}
    </div>
  </div>
);

export const Skeleton = ({ height = 18, width = '100%', radius, style }) => <div className="skeleton" style={{ height, width, borderRadius: radius, ...style }} aria-hidden="true" />;

export const StatusPill = ({ tone = 'neutral', children, dot = true }) => (
  <span className={`pill pill--${tone}`}>
    {dot && <span className="pill__dot" aria-hidden="true" />}
    {children}
  </span>
);
