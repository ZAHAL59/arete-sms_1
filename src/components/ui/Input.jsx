export default function Input({ label, type='text', value, onChange, placeholder, className='' }) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">{label}</label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] font-[inherit] text-[#111] bg-white outline-none transition-all focus:border-[#C8202E] focus:shadow-[0_0_0_3px_#FEF4F4]"
      />
    </div>
  );
}
export function Select({ label, value, onChange, children, className='' }) {
  return (
    <div className={`mb-3 ${className}`}>
      {label && <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">{label}</label>}
      <select
        value={value} onChange={onChange}
        className="w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] font-[inherit] text-[#111] bg-white outline-none transition-all focus:border-[#C8202E] focus:shadow-[0_0_0_3px_#FEF4F4]"
      >
        {children}
      </select>
    </div>
  );
}
