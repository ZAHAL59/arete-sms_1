import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { COLORS } from '../teacher/constants';
import { MONTHLY_FEE, fmt } from './constants';
import { FilterBar, filterCls } from './ui';
import { getFeeStructure } from '../finance/constants';
import { headStatus } from './hostelFees';
import { DEFAULT_FEE_HEADS } from './constants';

const monthName = ym => new Date(ym + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
const Info = ({ l, v }) => <div className="bg-[#F8F8F8] rounded-[6px] p-2.5"><div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-0.5">{l}</div><div className="text-[12.5px] text-[#333] font-semibold break-words">{v || '—'}</div></div>;

export default function Inmates({ h }) {
  const db = useStore(s => s.db);
  const [f, setF] = useState({ q: '', cls: '', room: '', diet: '', health: '' }); const [sel, setSel] = useState(null);
  const all = db.students.filter(s => s.boarding);
  const roomOf = name => h.rooms.find(r => r.inmates.includes(name))?.id;
  const hasMedical = s => !!s.health && s.health !== 'None';
  const boarders = all.filter(s => (!f.q || s.name.toLowerCase().includes(f.q.toLowerCase())) && (!f.cls || `${s.cls} ${s.section}`.trim() === f.cls)
    && (!f.room || (f.room === 'none' ? !roomOf(s.name) : roomOf(s.name) === f.room)) && (!f.diet || s.diet === f.diet) && (!f.health || (f.health === 'has' ? hasMedical(s) : !hasMedical(s))));
  const active = !!(f.q || f.cls || f.room || f.diet || f.health);
  const classes = [...new Set(all.map(s => `${s.cls} ${s.section}`.trim()))].sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')) || a.localeCompare(b));
  const diets = [...new Set(all.map(s => s.diet).filter(Boolean))];
  const recOf = s => (h.admissions || []).find(a => a.studentId === s.id);
  const fee = s => Math.round((getFeeStructure()[s.cls]?.hostel || MONTHLY_FEE * 12) / 12);

  const profile = sel && (() => {
    const s = db.students.find(x => x.id === sel.id) || sel, rec = recOf(s);
    const pays = db.payments.filter(p => p.studentId === s.id && (p.category || '').startsWith('Hostel')).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return (
      <Modal open onClose={() => setSel(null)} size="lg" title={s.name} subtitle={`${s.cls} ${s.section} · ${roomOf(s.name) ? 'Room ' + roomOf(s.name) : 'No room yet'}`} footer={<Button variant="outline" onClick={() => setSel(null)}>Close</Button>}>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Info l="Hostel since" v={rec?.date} /><Info l="Gender" v={rec?.gender || s.gender} /><Info l="Diet" v={s.diet} />
          <Info l="Parent / guardian" v={`${s.parentName || '—'} ${s.parentPhone || ''}`} /><Info l="Emergency contact" v={rec ? `${rec.emergencyName || '—'} ${rec.emergencyPhone}` : s.emergencyPhone} /><Info l="Local guardian" v={rec?.localName ? `${rec.localName} ${rec.localPhone}` : ''} />
          <Info l="Medical / allergies" v={s.health !== 'None' ? s.health : 'None'} /><Info l="Medication" v={s.medication || 'None'} /><Info l="Special needs" v={s.needs !== 'None' ? s.needs : 'None'} />
        </div>
        {rec?.notes && <div className="text-[12.5px] text-[#555] bg-[#FFFBEB] rounded-[6px] p-2.5 mb-3">📝 {rec.notes}</div>}
        {(() => { const heads = h.feeHeads || DEFAULT_FEE_HEADS; return <div className="grid grid-cols-3 gap-2 mb-3">{heads.map(x => { const st = headStatus(db.payments, s.id, x); return <div key={x.id} className="bg-[#F8F8F8] rounded-[6px] p-2.5"><div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-0.5">{x.name}{x.kind !== 'One-time fee' ? ' · held' : ''}</div><div className="text-[12.5px] font-semibold" style={{ color: st.balance ? '#DC2626' : '#166534' }}>{st.balance ? (st.paid ? `${fmt(st.paid)} of ${fmt(x.amount)}` : `Due ${fmt(x.amount)}`) : `✓ ${fmt(st.paid)}`}</div></div>; })}</div>; })()}
        <div className="text-[10.5px] font-bold text-[#AAA] uppercase tracking-wider mb-1.5">Hostel fee payments · {fmt(fee(s))} / month</div>
        {!pays.length ? <div className="text-[12.5px] text-[#AAA]">No payments yet — collect from Hostel Fees.</div> : <div className="border border-[#E4E4E4] rounded-[8px] divide-y divide-[#E4E4E4]">{pays.map(p => <div key={p.id} className="flex items-center gap-3 px-3 py-2 text-[12.5px]"><span className="font-mono text-[11.5px] text-[#C8202E]">{p.id}</span><span className="flex-1 text-[#555]">{p.period ? monthName(p.period) : p.category}</span><span className="text-[#AAA]">{p.mode}</span><b className="font-mono text-[#166534]">{fmt(p.amount)}</b></div>)}</div>}
      </Modal>);
  })();

  return (
    <div className="p-6">
      <PageHeader title="Inmate Records" subtitle={`${all.length} boarders — click a name for the full hostel profile`} />
      <FilterBar active={active} onClear={() => setF({ q: '', cls: '', room: '', diet: '', health: '' })} summary={`Showing ${boarders.length} of ${all.length} boarders`}>
        <input value={f.q} onChange={e => setF(x => ({ ...x, q: e.target.value }))} placeholder="Search inmate…" className={filterCls + ' w-44'} />
        <select value={f.cls} onChange={e => setF(x => ({ ...x, cls: e.target.value }))} className={filterCls}><option value="">All classes</option>{classes.map(c => <option key={c}>{c}</option>)}</select>
        <select value={f.room} onChange={e => setF(x => ({ ...x, room: e.target.value }))} className={filterCls}><option value="">All rooms</option><option value="none">Unplaced</option>{h.rooms.filter(r => r.type !== 'Staff').map(r => <option key={r.id} value={r.id}>{r.id}</option>)}</select>
        <select value={f.diet} onChange={e => setF(x => ({ ...x, diet: e.target.value }))} className={filterCls}><option value="">All diets</option>{diets.map(d => <option key={d}>{d}</option>)}</select>
        <select value={f.health} onChange={e => setF(x => ({ ...x, health: e.target.value }))} className={filterCls}><option value="">Any health status</option><option value="has">With medical notes</option><option value="none">No medical notes</option></select>
      </FilterBar>
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr>{['Student', 'Class', 'Room', 'Diet', 'Health', 'Parent', 'Emergency contact', 'Hostel since'].map(t =>
            <th key={t} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#AAA] uppercase tracking-wider border-b border-[#E4E4E4] bg-[#F8F8F8]">{t}</th>)}</tr></thead>
          <tbody>
            {!boarders.length
              ? <tr><td colSpan={8} className="text-center py-10 text-[#AAA]">{all.length ? 'No boarders match these filters' : 'No boarders yet'}</td></tr>
              : boarders.map((s, i) => { const rec = recOf(s); return (
                <tr key={s.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSel(s)}>
                      <div style={{ background: COLORS[i % COLORS.length] }} className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center">{s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                      <span className="font-semibold text-[#C8202E] underline">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-[#555]">{s.cls} {s.section}</td>
                  <td className="px-4 py-2.5">{roomOf(s.name) ? <Badge variant="blue">{roomOf(s.name)}</Badge> : <Badge variant="amber">Unplaced</Badge>}</td>
                  <td className="px-4 py-2.5 text-[#555]">{s.diet || '—'}</td>
                  <td className="px-4 py-2.5">{s.health && s.health !== 'None' ? <Badge variant="amber">{s.health.slice(0, 24)}{s.health.length > 24 ? '…' : ''}</Badge> : <span className="text-[#AAA]">None</span>}</td>
                  <td className="px-4 py-2.5 text-[#555]">{s.parentName}</td>
                  <td className="px-4 py-2.5 font-mono text-[11.5px] text-[#555]">{rec?.emergencyPhone || s.emergencyPhone || s.parentPhone}</td>
                  <td className="px-4 py-2.5 text-[#555]">{rec?.date || '—'}</td>
                </tr>); })}
          </tbody>
        </table>
      </div>
      {profile}
    </div>
  );
}
