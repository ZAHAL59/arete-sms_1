import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Kpi, Field, inputCls, Th } from '../../components/ui/Kit';
import { MAINT_TYPES, TODAY, fmt } from './constants';

export default function Maintenance({ t, addMaint }) {
  const db = useStore(s => s.db);
  const [open, setOpen] = useState(false);
  const blank = { vehicle: db.routes[0]?.vehicle || '', type: MAINT_TYPES[0], cost: '', desc: '', date: TODAY, next: '' };
  const [f, setF] = useState(blank);
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  const total = t.maintenance.reduce((a, m) => a + (m.cost || 0), 0);
  const upcoming = t.maintenance.filter(m => m.next && m.next >= TODAY).sort((a, b) => a.next.localeCompare(b.next))[0];

  function save() {
    if (!f.desc.trim()) return;
    addMaint({ ...f, cost: +f.cost || 0 });
    setOpen(false); setF(blank);
  }

  return (
    <div className="p-6">
      <PageHeader title="Maintenance Log" subtitle="Service, repair and inspection history"
        actions={<Button onClick={() => { setF(blank); setOpen(true); }}>+ Log Maintenance</Button>} />
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Kpi label="Total Spend" value={fmt(total)} note="All logged entries" />
        <Kpi label="Entries" value={t.maintenance.length} note="Across the fleet" color="#1A5FB4" />
        <Kpi label="Next Service Due" value={upcoming?.next || '—'} note={upcoming?.vehicle || 'None scheduled'} color="#B45309" />
      </div>
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr><Th>Vehicle</Th><Th>Type</Th><Th>Description</Th><Th>Date</Th><Th>Cost</Th><Th>Next Due</Th><Th>Status</Th></tr></thead>
          <tbody>
            {t.maintenance.map(m => (
              <tr key={m.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                <td className="px-4 py-2.5 font-mono text-[12px] font-bold text-[#111]">{m.vehicle}</td>
                <td className="px-4 py-2.5"><Badge variant="grey">{m.type}</Badge></td>
                <td className="px-4 py-2.5 text-[#555]">{m.desc}</td>
                <td className="px-4 py-2.5 text-[#555]">{m.date}</td>
                <td className="px-4 py-2.5 font-mono font-bold text-[#111]">{m.cost ? fmt(m.cost) : '—'}</td>
                <td className="px-4 py-2.5 text-[#555]">{m.next || '—'}</td>
                <td className="px-4 py-2.5"><Badge variant="green">Done</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Maintenance" subtitle="Record service, repair or inspection"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save Entry</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vehicle" className="col-span-2">
            <select value={f.vehicle} onChange={e => set('vehicle', e.target.value)} className={inputCls}>
              {db.routes.map(r => <option key={r.id} value={r.vehicle}>{r.vehicle} ({r.name})</option>)}
            </select>
          </Field>
          <Field label="Type"><select value={f.type} onChange={e => set('type', e.target.value)} className={inputCls}>{MAINT_TYPES.map(x => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Cost (₹)"><input type="number" value={f.cost} onChange={e => set('cost', e.target.value)} className={inputCls} /></Field>
          <Field label="Description *" className="col-span-2"><textarea rows={2} value={f.desc} onChange={e => set('desc', e.target.value)} className={inputCls + ' resize-none'} /></Field>
          <Field label="Date"><input type="date" value={f.date} onChange={e => set('date', e.target.value)} className={inputCls} /></Field>
          <Field label="Next Due"><input type="date" value={f.next} onChange={e => set('next', e.target.value)} className={inputCls} /></Field>
        </div>
      </Modal>
    </div>
  );
}
