import { useState, useRef, useEffect } from 'react';

// A small pop-over menu. `trigger(open, toggle)` draws the button; `children(close)` draws the panel.
export default function Dropdown({ trigger, children, width = 320, align = 'right', placement = 'down', className = '', onOpenChange }) {
  const [open, setOpen] = useState(false); const ref = useRef(null);
  const set = v => { setOpen(v); onOpenChange?.(v); };
  useEffect(() => {
    if (!open) return;
    const down = e => { if (ref.current && !ref.current.contains(e.target)) set(false); };
    const key = e => { if (e.key === 'Escape') { set(false); ref.current?.querySelector('button')?.focus(); } };
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <div ref={ref} className={`relative ${className}`}>
      {trigger(open, () => set(!open))}
      {open && <div style={{ width, maxWidth: 'calc(100vw - 24px)' }} className={`absolute ${placement === 'up' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'} ${align === 'right' ? 'right-0' : 'left-0'} z-50 bg-white border border-[#E4E4E4] rounded-[14px] shadow-[0_12px_40px_rgba(0,0,0,.16)] overflow-hidden`}>{children(() => set(false))}</div>}
    </div>
  );
}
