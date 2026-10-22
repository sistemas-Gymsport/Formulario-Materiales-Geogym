export const BrandImage = ({ className = '', large }) => (
  <img
    className={className}
    src={large ? '/assets/logo.webp' : '/assets/logo-sm.webp'}
    width={large ? 640 : 256}
    height={large ? 569 : 228}
    alt="Logotipo de GEO GYM"
    decoding="async"
  />
);

export const Logo = ({ light, subtitle = 'Materiales', size = 46 }) => (
  <span className={`logo ${light ? 'logo--light' : ''}`}>
    <img className="logo__mark" src="/assets/logo-sm.webp" alt="" width={size} height={size} />
    <span className="logo__word">
      GEO GYM
      {subtitle && <small>{subtitle}</small>}
    </span>
  </span>
);
