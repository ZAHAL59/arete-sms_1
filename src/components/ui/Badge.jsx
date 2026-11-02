const VARIANTS = {
  green:  'bg-[#F0FDF4] text-[#166534]',
  red:    'bg-[#FEF2F2] text-[#DC2626]',
  amber:  'bg-[#FFFBEB] text-[#B45309]',
  blue:   'bg-[#EFF5FF] text-[#1A5FB4]',
  purple: 'bg-[#F5F3FF] text-[#6D28D9]',
  grey:   'bg-[#F2F2F2] text-[#777777]',
  red2:   'bg-[#FEF4F4] text-[#C8202E]',
};
export default function Badge({ children, variant = 'grey', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-semibold ${VARIANTS[variant] || VARIANTS.grey} ${className}`}>
      {children}
    </span>
  );
}
