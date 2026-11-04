import { useId } from 'react';
export default function Input({ label, type='text', value, onChange, placeholder, className='' }) {
  const id = useId();
  return (
    <div className={`mb-3 ${className}`}>
      {label && <label htmlFor={id} className="block text-[11.5px] font-semibold text-[#333] mb-1.5">{label}</label>}
      <input
        id={id} aria-label={label ? undefined : placeholder} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] font-[inherit] text-[#111] bg-white outline-none transition-all focus:border-[#71717A] focus:shadow-[0_0_0_3px_#F6F6F7]"
      />
    </div>
  );
}
export function Select({ label, value, onChange, children, className='' }) {
  const id = useId();
  return (
    <div className={`mb-3 ${className}`}>
      {label && <label htmlFor={id} className="block text-[11.5px] font-semibold text-[#333] mb-1.5">{label}</label>}
      <select
        id={id} value={value} onChange={onChange}
        className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] font-[inherit] text-[#111] bg-white outline-none transition-all focus:border-[#71717A] focus:shadow-[0_0_0_3px_#F6F6F7]"
      >
        {children}
      </select>
    </div>
  );
}
