const DOT = { green: '#16A34A', red: '#DC2626', amber: '#D97706', blue: '#2563EB', purple: '#7C3AED', grey: '#A1A1AA', red2: '#C8202E' };
// A neutral pill with a small coloured dot — colour carries the meaning, not a filled block.
export default function Badge({ children, variant = 'grey', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#E4E4E4] bg-white text-[10.5px] font-semibold text-[#444] whitespace-nowrap ${className}`}>
      <i className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: DOT[variant] || DOT.grey }} />
      {children}
    </span>
  );
}
