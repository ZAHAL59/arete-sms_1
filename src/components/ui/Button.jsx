const VARIANTS = {
  primary: 'bg-[#18181B] text-white hover:bg-[#2B2B31]',
  outline: 'bg-white text-[#555] border border-[#E4E4E4] hover:bg-[#F8F8F8]',
  ghost:   'bg-transparent text-[#111] hover:bg-[#F6F6F7]',
  danger:  'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] hover:bg-[#FEE2E2]',
};
const SIZES = {
  sm: 'px-3 py-1.5 text-[11.5px]',
  md: 'px-4 py-2 text-[12.5px]',
  lg: 'px-5 py-2.5 text-[13px]',
};
export default function Button({ children, variant='primary', size='md', onClick, disabled, className='' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-[6px] cursor-pointer border-0 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {children}
    </button>
  );
}
