import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PageHeader = ({ kicker, title, description, actions }) => (
  <motion.header className="page-head" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
    <div>
      {kicker && <span className="kicker">{kicker}</span>}
      <h1 style={{ marginTop: kicker ? 10 : 0 }}>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {actions && <div className="page-head__actions">{actions}</div>}
  </motion.header>
);

export const Card = ({ title, subtitle, actions, children, className = '', delay = 0, ...props }) => (
  <motion.section
    className={`card ${className}`}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    {...props}
  >
    {(title || actions) && (
      <div className="card__head">
        <div>
          {title && <h2 className="card__title">{title}</h2>}
          {subtitle && <p className="card__sub">{subtitle}</p>}
        </div>
        {actions}
      </div>
    )}
    {children}
  </motion.section>
);

export const StatCard = ({ label, value, hint, icon: Icon, tone, index = 0 }) => {
  const isText = typeof value === 'string' && value.length > 8;
  return (
    <motion.div
      className={`stat ${tone ? `stat--${tone}` : ''}`}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {Icon && (
        <span className="stat__icon" aria-hidden="true">
          <Icon size={18} />
        </span>
      )}
      <span className="stat__label">{label}</span>
      <span className={`stat__value ${isText ? 'stat__value--text' : ''} tabular`}>{value}</span>
      {hint && <span className="stat__hint">{hint}</span>}
    </motion.div>
  );
};

export const Pagination = ({ pagination, onPage }) => {
  if (!pagination) return null;
  const { page, totalPages, total, pageSize } = pagination;
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="pagination">
      <span className="tabular">
        {from}–{to} de {total}
      </span>
      <div className="pagination__controls">
        <button type="button" className="icon-btn" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Página anterior">
          <ChevronLeft size={18} />
        </button>
        <span style={{ alignSelf: 'center', padding: '0 6px' }} className="tabular">
          {page} / {totalPages}
        </span>
        <button type="button" className="icon-btn" disabled={page >= totalPages} onClick={() => onPage(page + 1)} aria-label="Página siguiente">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export const Tabs = ({ value, onChange, options, id }) => (
  <div className="tabs" role="tablist">
    {options.map((option) => (
      <button key={option.value} type="button" role="tab" aria-selected={value === option.value} onClick={() => onChange(option.value)}>
        {value === option.value && <motion.span layoutId={`tabs-${id}`} className="tabs__bg" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
        <span>{option.label}</span>
      </button>
    ))}
  </div>
);

export const TagList = ({ items, max = 6, custom = [] }) => {
  const all = [...items.map((name) => ({ name })), ...custom.map((name) => ({ name, custom: true }))];
  const visible = all.slice(0, max);
  return (
    <div className="tag-list">
      {visible.map((t, i) => (
        <span key={`${t.name}-${i}`} className={`tag ${t.custom ? 'tag--custom' : ''}`}>
          {t.name}
        </span>
      ))}
      {all.length > max && <span className="tag tag--more">+{all.length - max}</span>}
    </div>
  );
};
