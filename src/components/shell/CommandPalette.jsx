import { useState, useEffect, useRef, useMemo } from 'react';

// "Search anything" — jump to a page, a portal, a student or a staff member. Open with ⌘K / Ctrl+K.
// items: [{ id, group, label, hint, icon, run }]
export default function CommandPalette({ open, onClose, items }) {
  const [q, setQ] = useState(''); const [idx, setIdx] = useState(0); const input = useRef(null);
  useEffect(() => { if (open) { setQ(''); setIdx(0); setTimeout(() => input.current?.focus(), 0); } }, [open]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [...items.filter(i => i.group === 'Quick actions'), ...items.filter(i => i.group === 'Pages')].slice(0, 14);   // actions first, then pages
    const score = i => { const l = i.label.toLowerCase(), h = (i.hint || '').toLowerCase(); return l.startsWith(s) ? 0 : l.includes(' ' + s) ? 1 : l.includes(s) ? 2 : h.includes(s) ? 3 : 99; };
    return items.map(i => [i, score(i)]).filter(([, sc]) => sc < 99).sort((a, b) => a[1] - b[1]).slice(0, 30).map(([i]) => i);
  }, [q, items]);
  useEffect(() => setIdx(0), [q]);
  if (!open) return null;

  const pick = i => { if (!i) return; onClose(); i.run(); };
  const onKey = e => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(results.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); pick(results[idx]); }
  };
  const groups = []; results.forEach((r, i) => { const g = groups.find(x => x.name === r.group) || (groups.push({ name: r.group, rows: [] }), groups[groups.length - 1]); g.rows.push([r, i]); });

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 flex items-start justify-center pt-[12vh]" onMouseDown={onClose}>
      <div role="dialog" aria-label="Search" className="w-[560px] max-w-[92vw] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,.28)] overflow-hidden" onMouseDown={e => e.stopPropagation()} onKeyDown={onKey}>
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E4E4E4]">
          <span className="text-[#AAA] text-[15px]">⌕</span>
          <input ref={input} value={q} onChange={e => setQ(e.target.value)} placeholder="Search pages, students, staff, portals…" className="flex-1 text-[14px] outline-none bg-transparent" />
          <kbd className="text-[10.5px] text-[#999] border border-[#E4E4E4] rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-[52vh] overflow-y-auto py-1.5">
          {!results.length && <div className="px-5 py-8 text-center text-[13px] text-[#AAA]">Nothing found for “{q}”</div>}
          {groups.map(g => (
            <div key={g.name}>
              <div className="px-5 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-[1.4px] text-[#AAA]">{g.name}</div>
              {g.rows.map(([r, i]) => (
                <div key={r.id} onMouseEnter={() => setIdx(i)} onClick={() => pick(r)} className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-[9px] cursor-pointer ${i === idx ? 'bg-[#FEF4F4]' : ''}`}>
                  <span className="w-7 h-7 rounded-[8px] bg-[#F4F4F5] flex items-center justify-center text-[13px] flex-shrink-0">{r.icon}</span>
                  <span className="flex-1 text-[13px] font-semibold text-[#111] truncate">{r.label}</span>
                  {r.hint && <span className="text-[11.5px] text-[#999] truncate max-w-[200px]">{r.hint}</span>}
                  {i === idx && <span className="text-[10.5px] text-[#C8202E] font-semibold">↵</span>}
                </div>))}
            </div>))}
        </div>
        <div className="flex gap-4 px-5 py-2 border-t border-[#E4E4E4] bg-[#FAFAFA] text-[10.5px] text-[#999]"><span>↑↓ move</span><span>↵ open</span><span>Esc close</span></div>
      </div>
    </div>
  );
}
