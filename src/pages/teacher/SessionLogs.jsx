import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import { COLORS, TEACHER, SESSION_TYPES, TYPE_VARIANT } from './constants';

export default function SessionLogs() {
  const db = useStore(s => s.db); const logs = useStore(s => s.sessionLogs);
  const [cls, setCls] = useState(''); const [type, setType] = useState(''); const [q, setQ] = useState('');
  const clsOf = id => { const s = db.students.find(x => x.id === id); return s ? `${s.cls} ${s.section}`.trim() : ''; };
  const rows = logs.filter(l => (!cls || clsOf(l.stuId) === cls) && (!type || l.type === type) && (!q || `${l.stuName} ${l.topic} ${l.observation}`.toLowerCase().includes(q.toLowerCase()))).slice().sort((a, b) => b.date.localeCompare(a.date));
  const avg = rows.length ? Math.round(rows.reduce((a, l) => a + (l.engagement || 0), 0) / rows.length * 10) / 10 : 0;
  const sc = 'px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]';
  return (
    <div className="p-6">
      <PageHeader title="Session Logs" subtitle="Everything you've logged about how students learn — log new ones from Student Profiles"
        actions={<><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className={sc + ' w-40'} />
          <select value={cls} onChange={e => setCls(e.target.value)} className={sc}><option value="">All classes</option>{TEACHER.classes.map(c => <option key={c}>{c}</option>)}</select>
          <select value={type} onChange={e => setType(e.target.value)} className={sc}><option value="">All types</option>{SESSION_TYPES.map(t => <option key={t}>{t}</option>)}</select></>} />
      <div className="grid grid-cols-4 gap-3 mb-5">{[['Total Sessions', rows.length, 'logged', '#C8202E'], ['AR / VR', rows.filter(l => /AR|VR/.test(l.type)).length, 'immersive sessions', '#6D28D9'], ['Avg Engagement', avg + ' / 5', 'star rating', '#F59E0B'], ['Follow-ups', rows.filter(l => l.followUp).length, 'need action', '#B45309']].map(([l, v, n, c]) => (
        <div key={l} className="bg-white border border-[#E4E4E4] rounded-[10px] p-3.5 shadow-[0_1px_4px_rgba(0,0,0,.07)]" style={{ borderLeft: `3px solid ${c}` }}><div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider mb-1">{l}</div><div className="text-[22px] font-extrabold" style={{ color: c }}>{v}</div><div className="text-[11.5px] text-[#AAA]">{n}</div></div>))}</div>
      {!rows.length ? <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-12 text-center text-[#AAA]">No session logs yet. Go to Student Profiles and click + Log.</div> : rows.map((l, i) => (
        <div key={l.id} className="bg-white border border-[#E4E4E4] rounded-[10px] mb-2.5 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8]">
            <div style={{ background: COLORS[i % COLORS.length] }} className="w-9 h-9 rounded-full text-white text-[11px] font-bold flex items-center justify-center">{(l.stuName || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
            <div><div className="text-[13.5px] font-bold text-[#111]">{l.stuName}</div><div className="text-[12px] text-[#AAA]">{clsOf(l.stuId)}</div></div><Badge variant={TYPE_VARIANT[l.type] || 'grey'}>{l.type}</Badge>
            <div className="ml-auto text-right"><div className="font-mono text-[11.5px] text-[#AAA]">{l.date}</div><div className="text-[#F59E0B] text-[13px]">{'★'.repeat(l.engagement || 0)}{'☆'.repeat(5 - (l.engagement || 0))}</div></div></div>
          <div className="px-4 py-3 text-[13px]"><div className="font-semibold text-[#333] mb-1">{l.topic}{l.material && <span className="font-normal text-[#777]"> · {l.material}</span>}</div><div className="text-[#555] leading-relaxed">{l.observation}</div>{l.followUp && <div className="mt-2 text-[12px] text-[#B45309] bg-[#FFFBEB] rounded-[6px] px-2.5 py-1.5">Follow-up: {l.followUp}</div>}</div>
        </div>))}
    </div>
  );
}
