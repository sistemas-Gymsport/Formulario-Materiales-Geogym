export const OrganicBlob = ({ className, color = '#F64851', opacity = 1 }) => (
  <svg className={className} viewBox="0 0 600 600" aria-hidden="true">
    <path
      fill={color}
      fillOpacity={opacity}
      d="M421.5 76.3c58.8 33.4 108.6 92.9 117.3 158.5 8.8 65.6-23.6 137.3-71.1 189.6-47.5 52.2-110.2 85.1-176.6 92.2-66.4 7.1-136.5-11.6-178-58.2C71.6 412 58.7 337.6 67.4 271c8.6-66.6 38.9-125.4 85.4-162.8 46.6-37.4 109.3-53.4 165.6-50.3 56.3 3.2 44.3-15 103.1 18.4Z"
    />
  </svg>
);

export const Swoosh = () => (
  <svg className="hero__swoosh" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true">
    <path d="M4 22C70 6 170 2 296 14" fill="none" stroke="#F64851" strokeWidth="9" strokeLinecap="round" pathLength="1" />
  </svg>
);

export const CheckDraw = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3.2 8.4 6.5 11.6 12.8 4.6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
