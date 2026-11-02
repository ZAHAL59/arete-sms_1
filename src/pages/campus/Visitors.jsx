import { useState } from 'react';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Collapsible from '../../components/ui/Collapsible';
import useExpand from '../../components/ui/useExpand';
import ExpandControls from '../../components/ui/ExpandControls';
import Modal from '../../components/ui/Modal';
import { Kpi, Field, inputCls, Th } from '../../components/ui/Kit';
import { VISIT_PURPOSES, ID_PROOFS, TODAY } from './constants';

export default function Visitors({ c, addVisitor, checkOut }) {
  const [q, setQ] = useState('');
  const [range, setRange] = useState('today');
  const [open, setOpen] = useState(false);
  const nowTime = () => new Date().toTimeString().slice(0, 5);
  const blank = () => ({ name:'', phone:'', purpose:VISIT_PURPOSES[0], meeting:'', date:TODAY, timeIn:nowTime(), idProof:ID_PROOFS[0] });
  const [f, setF] = useState(blank);
  const ex = useExpand(['d:' + TODAY]);        // today's entries open, earlier days collapsed

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const list = c.visitors.filter(v =>
    (range === 'all' || (range === 'today' && v.date === TODAY) || (range === 'week' && v.date >= weekAgo)) &&
    (!q || v.name.toLowerCase().includes(q.toLowerCase()) || v.purpose.toLowerCase().includes(q.toLowerCase())));

  const inside = c.visitors.filter(v => v.status === 'In' && v.date === TODAY).length;

  function save() {
    if (!f.name.trim()) return;
    addVisitor({ ...f, name:f.name.trim(), phone:f.phone || '—', meeting:f.meeting || '—' });
    setOpen(false); setF(blank());
  }

  const days = [...new Set(list.map(v => v.date))].sort().reverse();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const dayLabel = d => d === TODAY ? 'Today' : d === yesterday ? 'Yesterday' : new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long' });
  const dayDate = d => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const allIds = days.map(d => 'd:' + d);

  return (
    <div className="p-6">
      <PageHeader title="Visitor Log" subtitle="Gate entries and check-outs — grouped by day"
        actions={<>
          <ExpandControls ex={ex} ids={allIds} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search visitor..." className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E] w-40" />
          <select value={range} onChange={e => setRange(e.target.value)} className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">
            <option value="today">Today</option><option value="week">Last 7 days</option><option value="all">All time</option>
          </select>
          <Button onClick={() => { setF(blank()); setOpen(true); }}>+ Log Visitor</Button>
        </>} />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Currently Inside" value={inside} note="On premises right now" color={inside ? '#DC2626' : '#166534'} />
        <Kpi label="Visitors Today" value={c.visitors.filter(v => v.date === TODAY).length} note="Total entries today" />
        <Kpi label="This Week" value={c.visitors.filter(v => v.date >= weekAgo).length} note="Total visits" color="#1A5FB4" />
        <Kpi label="Total Records" value={c.visitors.length} note="All time" color="#6D28D9" />
      </div>

      {!days.length && <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-10 text-center text-[#AAA]">No visitors found</div>}
      {days.map(d => {
        const rows = list.filter(v => v.date === d), here = rows.filter(v => v.status === 'In').length;
        return (
          <Collapsible key={d} className="mb-3" open={q ? true : ex.isOpen('d:' + d)} onToggle={() => ex.toggle('d:' + d)}
            header={<div className="flex items-center gap-2.5"><span className="text-[13.5px] font-bold text-[#111]">{dayLabel(d)}</span><span className="text-[12px] text-[#777]">{dayDate(d)}</span><Badge variant="grey">{rows.length} visit{rows.length === 1 ? '' : 's'}</Badge>{here > 0 && <Badge variant="red">{here} inside</Badge>}</div>}>
            <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]">
              <thead><tr><Th>Visitor</Th><Th>Purpose</Th><Th>Meeting With</Th><Th>In</Th><Th>Out</Th><Th>ID</Th><Th>Status</Th><Th /></tr></thead>
              <tbody>{rows.map(v => (
                <tr key={v.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                  <td className="px-4 py-2.5"><div className="font-semibold text-[#111]">{v.name}</div><div className="font-mono text-[11px] text-[#AAA]">{v.phone}</div></td>
                  <td className="px-4 py-2.5"><Badge variant="grey">{v.purpose}</Badge></td>
                  <td className="px-4 py-2.5 text-[#555]">{v.meeting}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">{v.timeIn}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">{v.timeOut || '—'}</td>
                  <td className="px-4 py-2.5 text-[#555]">{v.idProof}</td>
                  <td className="px-4 py-2.5"><Badge variant={v.status === 'In' ? 'red' : 'green'}>{v.status === 'In' ? 'Inside' : 'Left'}</Badge></td>
                  <td className="px-4 py-2.5">{v.status === 'In' && <Button size="sm" variant="outline" onClick={() => checkOut(v.id)}>Check Out</Button>}</td>
                </tr>))}</tbody>
            </table>
          </Collapsible>);
      })}

      <Modal open={open} onClose={() => setOpen(false)} title="Log Visitor"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Log Entry</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Visitor Name *"><input value={f.name} onChange={e => setF(x => ({ ...x, name:e.target.value }))} className={inputCls} /></Field>
          <Field label="Phone"><input value={f.phone} onChange={e => setF(x => ({ ...x, phone:e.target.value }))} placeholder="+91 ..." className={inputCls} /></Field>
          <Field label="Purpose"><select value={f.purpose} onChange={e => setF(x => ({ ...x, purpose:e.target.value }))} className={inputCls}>{VISIT_PURPOSES.map(p => <option key={p}>{p}</option>)}</select></Field>
          <Field label="Meeting With"><input value={f.meeting} onChange={e => setF(x => ({ ...x, meeting:e.target.value }))} placeholder="e.g. Principal" className={inputCls} /></Field>
          <Field label="Date"><input type="date" value={f.date} onChange={e => setF(x => ({ ...x, date:e.target.value }))} className={inputCls} /></Field>
          <Field label="Time In"><input type="time" value={f.timeIn} onChange={e => setF(x => ({ ...x, timeIn:e.target.value }))} className={inputCls} /></Field>
          <Field label="ID Proof" className="col-span-2"><select value={f.idProof} onChange={e => setF(x => ({ ...x, idProof:e.target.value }))} className={inputCls}>{ID_PROOFS.map(p => <option key={p}>{p}</option>)}</select></Field>
        </div>
      </Modal>
    </div>
  );
}
