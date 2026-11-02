export const inputCls = 'w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#C8202E] focus:shadow-[0_0_0_3px_#FEF4F4] bg-white font-[inherit]';

export function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-[11.5px] font-semibold text-[#333] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function Kpi({ label, value, note, color = '#C8202E' }) {
  return (
    <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-3.5 shadow-[0_1px_4px_rgba(0,0,0,.07)]" style={{ borderLeft:`3px solid ${color}` }}>
      <div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[22px] font-extrabold leading-none" style={{ color }}>{value}</div>
      {note && <div className="text-[11.5px] text-[#AAA] mt-1">{note}</div>}
    </div>
  );
}

export const Th = ({ children }) => (
  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{children}</th>
);

export const filterCls = 'px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E] bg-white';

// A row of filters with a "Clear filters" link and a "Showing x of y" summary
export function FilterBar({ children, active, onClear, summary }) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-3">
      {children}
      {active && <button onClick={onClear} className="text-[12px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none">Clear filters</button>}
      {summary && <span className="ml-auto text-[12px] text-[#777]">{summary}</span>}
    </div>
  );
}
