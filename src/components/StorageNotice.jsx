import { useEffect, useState } from 'react';
import { STORAGE_EVENT, getStorageProblem } from '../lib/storageGuard';

// A single, dismissible heads-up when the browser blocks or fills local storage.
export default function StorageNotice() {
  const [kind, setKind] = useState(getStorageProblem()); const [hidden, setHidden] = useState(false);
  useEffect(() => { const h = e => { setKind(e.detail); setHidden(false); }; window.addEventListener(STORAGE_EVENT, h); return () => window.removeEventListener(STORAGE_EVENT, h); }, []);
  if (!kind || hidden) return null;
  return (
    <div role="alert" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] w-[min(560px,calc(100vw-24px))] flex items-start gap-3 rounded-[14px] bg-[#18181B] text-white px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,.3)]">
      <span aria-hidden="true">⚠️</span>
      <div className="flex-1 text-[13px] leading-snug">{kind === 'full' ? 'This browser’s storage is full, so recent changes may not be saved.' : 'This browser is blocking storage (private mode?). You can keep working, but changes will be lost when you close the tab.'}</div>
      <button onClick={() => setHidden(true)} className="text-[12px] font-semibold text-white/80 bg-transparent border-none cursor-pointer underline">Dismiss</button>
    </div>
  );
}
