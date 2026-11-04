import { useEffect, useRef, useId } from 'react';

// An accessible dialog: labelled for screen readers, keeps keyboard focus inside while open and gives it back on close.
export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  const ref = useRef(null); const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement; const prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const focusables = () => [...(ref.current?.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') || [])];
    (focusables().find(el => el.tagName !== 'BUTTON' || !el.dataset.close) || ref.current)?.focus();
    const key = e => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose?.(); }
      if (e.key === 'Tab') { const f = focusables(); if (!f.length) { e.preventDefault(); return; } const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = prevOverflow; if (opener && document.contains(opener)) opener.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  const maxW = size === 'lg' ? 'max-w-3xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={`bg-white rounded-[14px] w-full ${maxW} max-h-[92vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,.18)] outline-none`}>
        <div className="flex justify-between items-start gap-3 px-4 sm:px-6 py-4 border-b border-[#E4E4E4] flex-wrap gap-y-2">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[15px] font-bold text-[#111]">{title}</h2>
            {subtitle && <p className="text-[11.5px] text-[#666666] mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" data-close onClick={onClose} aria-label="Close dialog" className="text-[#666666] hover:text-[#111] text-xl leading-none bg-transparent border-none cursor-pointer px-1 flex-shrink-0">×</button>
        </div>
        <div className="px-4 sm:px-6 py-4">{children}</div>
        {footer && <div className="px-4 sm:px-6 py-3 border-t border-[#E4E4E4] bg-[#F8F8F8] flex flex-wrap gap-2 justify-end rounded-b-[14px]">{footer}</div>}
      </div>
    </div>
  );
}
