// A flat geometric mark — one rounded square and three triangles with thin gaps between them.
// Colours come from the 21st.dev "Respec" theme: periwinkle #BEC7FE, blue #3B82F6, mint #72E3AD, violet #8B5CF6.
export default function HeroMark({ size = 120, className = '' }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" focusable="false" className={className} style={{ strokeLinejoin: 'round', strokeWidth: 2.6 }}>
      <polygon points="4,6 45,6 45,47" fill="#3B82F6" stroke="#3B82F6" />
      <rect x="52" y="5" width="44" height="42" rx="5" fill="#BEC7FE" stroke="#BEC7FE" />
      <polygon points="4,55 45,55 38,96" fill="#72E3AD" stroke="#72E3AD" />
      <polygon points="52,54 96,54 96,96" fill="#8B5CF6" stroke="#8B5CF6" />
    </svg>
  );
}
