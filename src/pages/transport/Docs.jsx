import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import { Kpi, Field, inputCls, Th } from '../../components/ui/Kit';
import { DOC_TYPES, docStatus, TODAY } from './constants';

export default function Docs({ t, addDoc }) {
  const db = useStore(s => s.db);
  const [open, setOpen] = useState(false);
  const blank = { vehicle: db.routes[0]?.vehicle || '', type: DOC_TYPES[0], num: '', issued: TODAY, expiry: '' };
  const [f, setF] = useState(blank);
  const set = (k, v) => setF(x => ({ ...x, [k]: v }));

  const st = t.docs.map(d => docStatus(d.expiry));
  const expired = st.filter(s => s.days < 0).length;
  const soon = st.filter(s => s.days >= 0 && s.days <= 30).length;
  const valid = st.length - expired - soon;

  function save() {
    if (!f.vehicle || !f.expiry) return;
    addDoc({ ...f, num: f.num || '—' });
    setOpen(false); setF(blank);
  }

  return (
    <div className="p-6">
      <PageHeader title="Vehicle Documents" subtitle="Insurance, fitness, permits and expiry tracking"
        actions={<Button onClick={() => { setF(blank); setOpen(true); }}>+ Add Document</Button>} />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Documents" value={t.docs.length} note={`${db.routes.length} vehicles`} />
        <Kpi label="Valid" value={valid} note="More than 30 days" color="#166534" />
        <Kpi label="Expiring Soon" value={soon} note="Within 30 days" color="#B45309" />
        <Kpi label="Expired" value={expired} note="Renew immediately" color="#DC2626" />
      </div>

      {db.routes.map(r => {
        const docs = t.docs.filter(d => d.vehicle === r.vehicle).sort((a, b) => a.expiry.localeCompare(b.expiry));
        const issues = docs.filter(d => docStatus(d.expiry).days <= 30).length;
        return (
          <Collapsible key={r.id} defaultOpen={issues > 0} className="mb-2"
            header={
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-1"><div className="text-[13.5px] font-bold text-[#111] font-mono">{r.vehicle}</div><div className="text-[11.5px] text-[#777] font-sans">{r.name}</div></div>
                <Badge variant="grey">{docs.length} docs</Badge>
                {issues > 0 && <Badge variant="amber">{issues} need attention</Badge>}
              </div>
            }>
            <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]">
              <thead><tr><Th>Document</Th><Th>Number</Th><Th>Issued</Th><Th>Expiry</Th><Th>Status</Th></tr></thead>
              <tbody>
                {!docs.length
                  ? <tr><td colSpan={5} className="text-center py-6 text-[#AAA]">No documents recorded</td></tr>
                  : docs.map(d => { const s = docStatus(d.expiry); return (
                    <tr key={d.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                      <td className="px-4 py-2.5 font-semibold text-[#111]">{d.type}</td>
                      <td className="px-4 py-2.5 font-mono text-[11.5px] text-[#555]">{d.num}</td>
                      <td className="px-4 py-2.5 text-[#555]">{d.issued}</td>
                      <td className="px-4 py-2.5 text-[#555]">{d.expiry}</td>
                      <td className="px-4 py-2.5"><Badge variant={s.variant}>{s.label}</Badge></td>
                    </tr>); })}
              </tbody>
            </table>
          </Collapsible>
        );
      })}

      <Modal open={open} onClose={() => setOpen(false)} title="Add Vehicle Document"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save Document</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vehicle *"><select value={f.vehicle} onChange={e => set('vehicle', e.target.value)} className={inputCls}>{db.routes.map(r => <option key={r.id} value={r.vehicle}>{r.vehicle}</option>)}</select></Field>
          <Field label="Document Type"><select value={f.type} onChange={e => set('type', e.target.value)} className={inputCls}>{DOC_TYPES.map(x => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Document Number" className="col-span-2"><input value={f.num} onChange={e => set('num', e.target.value)} className={inputCls} /></Field>
          <Field label="Issued"><input type="date" value={f.issued} onChange={e => set('issued', e.target.value)} className={inputCls} /></Field>
          <Field label="Expiry *"><input type="date" value={f.expiry} onChange={e => set('expiry', e.target.value)} className={inputCls} /></Field>
        </div>
      </Modal>
    </div>
  );
}
