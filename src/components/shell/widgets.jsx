import { useState } from 'react';
import Button from '../ui/Button';

// Shared building blocks for the home screen and overview pages.
export const Panel = ({ title, action, children, className = '' }) => (
  <section className={`bg-white rounded-[24px] p-7 shadow-[0_2px_16px_rgba(0,0,0,.045)] ${className}`}>
    <div className="flex items-center mb-4"><h2 className="text-[16px] font-bold text-[#111]">{title}</h2>{action && <div className="ml-auto">{action}</div>}</div>
    {children}
  </section>
);

// A panel that starts closed and tells you what is inside (count / status) in its header.
export function CPanel({ title, meta, action, children, defaultOpen = false, className = '' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`h-fit bg-white rounded-[24px] px-7 py-5 shadow-[0_2px_16px_rgba(0,0,0,.045)] ${className}`}>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open} className="w-full flex items-center gap-3 bg-transparent border-none cursor-pointer text-left p-0 py-1">
        <h2 className="text-[16px] font-bold text-[#111]">{title}</h2>
        {meta != null && <span className="ml-auto text-[12px] text-[#777]">{meta}</span>}
        <span className={`${meta != null ? '' : 'ml-auto'} text-[11px] text-[#BBB] transition-transform duration-200 ${open ? '' : '-rotate-90'}`}>▾</span>
      </button>
      {open && <div className="mt-4">{action && <div className="flex justify-end -mt-1 mb-2">{action}</div>}{children}</div>}
    </section>
  );
}

export const Tile = ({ label, value, note, color = '#111', onClick, bar }) => (
  <div onClick={onClick} className={`bg-white rounded-[22px] px-6 py-5 shadow-[0_2px_16px_rgba(0,0,0,.045)] ${onClick ? 'cursor-pointer hover:shadow-[0_8px_28px_rgba(0,0,0,.10)] transition-shadow' : ''}`}>
    <div className="text-[10.5px] font-bold uppercase tracking-[1.2px] text-[#999]">{label}</div>
    <div className="text-[30px] font-extrabold leading-tight mt-1.5" style={{ color }}>{value}</div>
    <div className="text-[12px] text-[#777]">{note}</div>
    {bar != null && <div className="h-1 rounded-full bg-[#EEE] mt-3 overflow-hidden" role="progressbar" aria-valuenow={Math.round(bar)} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-[#C8202E]" style={{ width: `${Math.min(100, Math.max(0, bar))}%` }} /></div>}
  </div>
);

export const Hero = ({ kicker, title, sub, actions = [], progress }) => (
  <div className="arete-hero rounded-[26px] p-9 text-white flex flex-col shadow-[0_14px_40px_rgba(0,0,0,.18)]" style={{ minHeight: 290 }}>
    <div className="text-[11px] font-bold uppercase tracking-[1.6px] text-white/70">{kicker}</div>
    <div className="text-[36px] font-extrabold tracking-tight leading-tight mt-2">{title}</div>
    <div className="text-[14.5px] text-white/75 mt-1.5">{sub}</div>
    {progress != null && <div className="h-1.5 bg-white/15 rounded-full mt-5 overflow-hidden max-w-[420px]"><div className="h-full rounded-full bg-[#F0525D]" style={{ width: `${Math.min(100, progress)}%` }} /></div>}
    <div className="flex gap-3 mt-auto pt-7">{actions.map(a => <button key={a.label} onClick={a.run} className={`px-5 py-2.5 rounded-full text-[13px] font-semibold cursor-pointer border ${a.primary ? 'bg-[#C8202E] text-white border-[#C8202E] hover:bg-[#D6303E]' : 'bg-white/10 text-white border-white/30 hover:bg-white/20'}`}>{a.label}</button>)}</div>
  </div>
);

export const QuickActions = ({ items }) => (
  <Panel title="Quick actions">
    <div className="grid grid-cols-2 gap-3">{items.map(([icon, label, run]) => (
      <button key={label} onClick={run} className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] border border-[#F0F0F0] bg-white text-left cursor-pointer hover:border-[#C8202E]/50 hover:bg-[#F6F6F7] transition-colors">
        <span className="w-8 h-8 rounded-[9px] bg-[#F6F6F7] flex items-center justify-center text-[14px] flex-shrink-0">{icon}</span><span className="text-[12.5px] font-semibold text-[#111]">{label}</span></button>))}</div>
  </Panel>
);

export const Row = ({ icon, title, sub, right, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 py-3.5 border-b border-[#F3F3F3] last:border-b-0 ${onClick ? 'cursor-pointer hover:bg-[#FAFAFA] -mx-3 px-3 rounded-[12px]' : ''}`}>
    <span className="w-9 h-9 rounded-[10px] bg-[#F6F6F7] flex items-center justify-center text-[15px] flex-shrink-0">{icon}</span>
    <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-[#111] truncate">{title}</div>{sub && <div className="text-[11.5px] text-[#999] truncate">{sub}</div>}</div>
    {right}
  </div>
);

export const DateChip = ({ iso }) => { const d = new Date(iso + 'T00:00:00'); return <div className="w-10 h-10 rounded-[10px] bg-[#F6F6F7] text-center flex-shrink-0 pt-0.5"><div className="text-[8.5px] font-bold uppercase text-[#C8202E]">{d.toLocaleString('en-IN', { month: 'short' })}</div><div className="text-[15px] font-extrabold text-[#111] leading-none">{d.getDate()}</div></div>; };

export const Empty = ({ icon = '✓', title, sub }) => (
  <div className="py-8 text-center"><div className="w-12 h-12 rounded-[14px] bg-[#F4F4F5] mx-auto flex items-center justify-center text-[18px] text-[#777] mb-3">{icon}</div><div className="text-[14px] font-bold text-[#111]">{title}</div>{sub && <div className="text-[12px] text-[#999] mt-0.5">{sub}</div>}</div>
);

// A "needs your attention" row, able to act on the spot (approve / reject / open)
export const AttentionRow = ({ item, compact }) => (
  <div className={`flex items-center gap-4 ${compact ? 'px-4 py-2.5' : 'py-3.5'} border-b border-[#F3F3F3] last:border-b-0`}>
    <span className="w-8 h-8 rounded-full text-[12px] font-extrabold flex items-center justify-center flex-shrink-0" style={{ background: item.color + '18', color: item.color }}>{item.letter}</span>
    <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-[#111] truncate">{item.title}</div><div className="text-[11.5px] text-[#999] truncate">{item.sub}</div></div>
    <div className="flex gap-1.5 flex-shrink-0">{item.actions.map(a => <Button key={a.label} size="sm" variant={a.variant || 'primary'} onClick={a.run}>{a.label}</Button>)}</div>
  </div>
);
