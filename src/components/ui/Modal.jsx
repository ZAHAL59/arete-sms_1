import { useEffect } from 'react';
export default function Modal({ open, onClose, title, subtitle, children, footer, size='md' }) {
  useEffect(() => {
    const fn = e => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);
  if (!open) return null;
  const maxW = size === 'lg' ? 'max-w-3xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={e => e.target===e.currentTarget && onClose?.()}>
      <div className={`bg-white rounded-[14px] w-full ${maxW} max-h-[92vh] overflow-y-auto shadow-[0_8px_40px_rgba(0,0,0,.18)]`}>
        <div className="flex justify-between items-start px-6 py-4 border-b border-[#E4E4E4]">
          <div>
            <h3 className="text-[15px] font-bold text-[#111]">{title}</h3>
            {subtitle && <p className="text-[11.5px] text-[#777] mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-[#999] hover:text-[#111] text-xl leading-none bg-none border-none cursor-pointer px-1">×</button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="px-6 py-3 border-t border-[#E4E4E4] bg-[#F8F8F8] flex gap-2 justify-end rounded-b-[14px]">{footer}</div>}
      </div>
    </div>
  );
}
