import { forwardRef } from 'react';

const trackPointer = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
};

export const Button = forwardRef(function Button(
  { variant = 'dark', size, block, icon: Icon, iconRight: IconRight, loading, children, className = '', type = 'button', disabled, ...props },
  ref
) {
  const classes = ['btn', variant !== 'dark' && `btn--${variant}`, size && `btn--${size}`, block && 'btn--block', className].filter(Boolean).join(' ');
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} onPointerMove={trackPointer} {...props}>
      {loading ? <span className="spinner" aria-hidden="true" /> : Icon && <Icon size={18} strokeWidth={2.4} aria-hidden="true" />}
      {children}
      {IconRight && !loading && <IconRight size={18} strokeWidth={2.4} aria-hidden="true" />}
    </button>
  );
});
