import { useState } from 'react';
import Button from '../ui/Button';
import HeroMark from './HeroMark';

// Shared building blocks for the home screen and overview pages.
export const Panel = ({ title, action, children, className = '' }) => (
  <section className={`bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-7 shadow-[0_2px_16px_rgba(0,0,0,.045)] ${className}`}>
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
        {meta != null && <span className="ml-auto text-[12px] text-[#666666]">{meta}</span>}
        <span className={`${meta != null ? '' : 'ml-auto'} text-[11px] text-[#666666] transition-transform duration-200 ${open ? '' : '-rotate-90'}`}>▾</span>
      </button>
      {open && <div className="mt-4">{action && <div className="flex justify-end -mt-1 mb-2">{action}</div>}{children}</div>}
    </section>
  );
}

export const Tile = ({ label, value, note, color = '#111', onClick, bar }) => (
  <div onClick={onClick} className={`bg-white rounded-[16px] sm:rounded-[18px] px-4 sm:px-5 py-3 sm:py-3.5 shadow-[0_2px_16px_rgba(0,0,0,.045)] ${onClick ? 'cursor-pointer hover:shadow-[0_8px_28px_rgba(0,0,0,.10)] transition-shadow' : ''}`}>
    <div className="text-[10.5px] font-bold uppercase tracking-[1.2px] text-[#666666]">{label}</div>
    <div className="text-[22px] sm:text-[26px] font-extrabold leading-tight mt-1" style={{ color }}>{value}</div>
    <div className="text-[12px] text-[#666666]">{note}</div>
    {bar != null && <div className="h-1 rounded-full bg-[#EEE] mt-2 overflow-hidden" role="progressbar" aria-label={`${label} progress`} aria-valuenow={Math.round(bar)} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, bar))}%` }} /></div>}
  </div>
);

export const Hero = ({ kicker, title, sub, actions = [], progress }) => (
  <div className="arete-hero rounded-[20px] sm:rounded-[22px] p-5 sm:p-6 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,.16)]">
    <HeroMark size={128} className="hidden sm:block absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none" />
    <div className="sm:pr-36">
      <div className="text-[11px] font-bold uppercase tracking-[1.6px] opacity-70">{kicker}</div>
      <div className="text-[22px] sm:text-[28px] font-extrabold tracking-tight leading-tight mt-1.5">{title}</div>
      <div className="text-[13.5px] opacity-75 mt-1">{sub}</div>
    </div>
    {progress != null && <div className="arete-track h-1.5 rounded-full mt-3 overflow-hidden max-w-[420px]"><div className="arete-fill h-full rounded-full" style={{ width: `${Math.min(100, progress)}%` }} /></div>}
    <div className="flex flex-wrap gap-2 mt-auto pt-4">{actions.map(a => <button key={a.label} onClick={a.run} className={`${a.primary ? 'arete-btn-primary' : 'arete-btn'} px-4 py-2 rounded-full text-[12.5px] font-semibold cursor-pointer transition-colors`}>{a.label}</button>)}</div>
  </div>
);

export const QuickActions = ({ items }) => (
  <Panel title="Quick actions">
    <div className="grid grid-cols-2 gap-3">{items.map(([icon, label, run]) => (
      <button key={label} onClick={run} className="flex items-center gap-3 px-4 py-3.5 rounded-[16px] border border-[#F0F0F0] bg-white text-left cursor-pointer hover:border-[#71717A]/50 hover:bg-[#F6F6F7] transition-colors">
        <span className="w-8 h-8 rounded-[9px] bg-[#F6F6F7] flex items-center justify-center text-[14px] flex-shrink-0">{icon}</span><span className="text-[12.5px] font-semibold text-[#111]">{label}</span></button>))}</div>
  </Panel>
);

export const Row = ({ icon, title, sub, right, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 py-3.5 border-b border-[#F3F3F3] last:border-b-0 ${onClick ? 'cursor-pointer hover:bg-[#FAFAFA] -mx-3 px-3 rounded-[12px]' : ''}`}>
    <span className="w-9 h-9 rounded-[10px] bg-[#F6F6F7] flex items-center justify-center text-[15px] flex-shrink-0">{icon}</span>
    <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-[#111] truncate">{title}</div>{sub && <div className="text-[11.5px] text-[#666666] truncate">{sub}</div>}</div>
    {right}
  </div>
);

export const DateChip = ({ iso }) => { const d = new Date(iso + 'T00:00:00'); return <div className="w-10 h-10 rounded-[10px] bg-[#F6F6F7] text-center flex-shrink-0 pt-0.5"><div className="text-[8.5px] font-bold uppercase text-[#111]">{d.toLocaleString('en-IN', { month: 'short' })}</div><div className="text-[15px] font-extrabold text-[#111] leading-none">{d.getDate()}</div></div>; };

export const Empty = ({ icon = '✓', title, sub }) => (
  <div className="py-8 text-center"><div className="w-12 h-12 rounded-[14px] bg-[#F4F4F5] mx-auto flex items-center justify-center text-[18px] text-[#666666] mb-3">{icon}</div><div className="text-[14px] font-bold text-[#111]">{title}</div>{sub && <div className="text-[12px] text-[#666666] mt-0.5">{sub}</div>}</div>
);

// A "needs your attention" row, able to act on the spot (approve / reject / open)
export const AttentionRow = ({ item, compact }) => (
  <div className={`flex items-center gap-4 ${compact ? 'px-4 py-2.5' : 'py-3.5'} border-b border-[#F3F3F3] last:border-b-0`}>
    <span className="relative w-8 h-8 rounded-full bg-[#F4F4F5] text-[#111] text-[12px] font-extrabold flex items-center justify-center flex-shrink-0">{item.letter}<i className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white" style={{ background: item.color }} /></span>
    <div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-[#111] truncate">{item.title}</div><div className="text-[11.5px] text-[#666666] truncate">{item.sub}</div></div>
    <div className="flex gap-1.5 flex-shrink-0">{item.actions.map(a => <Button key={a.label} size="sm" variant={a.variant || 'primary'} onClick={a.run}>{a.label}</Button>)}</div>
  </div>
);
