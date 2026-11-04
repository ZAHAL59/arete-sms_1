import { useId, Children, isValidElement, cloneElement } from 'react';

export const inputCls = 'w-full px-2.5 py-2 border-[1.5px] border-[#E4E4E4] rounded-[6px] text-[13px] outline-none focus:border-[#71717A] focus:shadow-[0_0_0_3px_#F6F6F7] bg-white font-[inherit]';

export function Field({ label, children, className = '' }) {
  const id = useId();
  // a single input/select/textarea gets a proper <label for>; a group of controls is announced as a labelled group
  const single = Children.count(children) === 1 && isValidElement(children) && ['input', 'select', 'textarea'].includes(children.type);
  return (
    <div className={className} role={single ? undefined : 'group'} aria-labelledby={single ? undefined : `${id}-l`}>
      <label id={`${id}-l`} htmlFor={single ? (children.props.id || id) : undefined} className="block text-[11.5px] font-semibold text-[#333] mb-1.5">{label}</label>
      {single ? cloneElement(children, { id: children.props.id || id }) : children}
    </div>
  );
}

export function Kpi({ label, value, note, color = '#18181B' }) {
  return (
    <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-3.5 shadow-[0_1px_4px_rgba(0,0,0,.07)]" style={{ borderLeft:`3px solid ${color}` }}>
      <div className="text-[10.5px] font-semibold text-[#666666] uppercase tracking-wider mb-1">{label}</div>
      <div className="text-[22px] font-extrabold leading-none" style={{ color }}>{value}</div>
      {note && <div className="text-[11.5px] text-[#666666] mt-1">{note}</div>}
    </div>
  );
}

export const Th = ({ children }) => (
  <th className="px-4 py-2.5 text-left text-[10px] font-bold text-[#666666] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{children}</th>
);
