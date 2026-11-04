import { useState, useId } from 'react';

// Works two ways:
//  • on its own  — <Collapsible defaultOpen>…</Collapsible>
//  • controlled  — <Collapsible open={bool} onToggle={fn}>…</Collapsible> (lets a page "Expand all / Collapse all")
// The header may hold its own buttons (e.g. "+ Add"). So the toggle is a separate button laid UNDER the header content
// — clicking empty header space toggles, clicking a button inside the header does that button's job (no nested controls).
export default function Collapsible({ header, children, defaultOpen = false, className = '', open: openProp, onToggle }) {
  const [inner, setInner] = useState(defaultOpen); const hid = useId();
  const controlled = openProp !== undefined;
  const open = controlled ? openProp : inner;
  const toggle = () => { if (controlled) onToggle?.(); else setInner(o => !o); };
  return (
    <div className={`h-fit bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)] mb-2 ${className}`}>
      <div className="relative flex items-center px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8] hover:bg-[#F2F2F2] select-none">
        <button type="button" onClick={toggle} aria-expanded={open} aria-labelledby={hid} className="absolute inset-0 w-full h-full bg-transparent border-none cursor-pointer p-0 focus-visible:outline-offset-[-2px]" />
        <div id={hid} className="relative flex-1 min-w-0 pointer-events-none [&_button]:pointer-events-auto [&_a]:pointer-events-auto [&_input]:pointer-events-auto [&_select]:pointer-events-auto [&_label]:pointer-events-auto">{header}</div>
        <span aria-hidden="true" className={`relative pointer-events-none text-[11px] text-[#666666] ml-2 transition-transform duration-200 ${open ? '' : '-rotate-90'}`}>▾</span>
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}
