import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Kpi, Field, inputCls, Th } from '../../components/ui/Kit';
import { DOC_TYPES, docState, TODAY } from './constants';

export default function StaffDocuments({ hr, addStaffDoc, deleteStaffDoc }) {
  const staff = useStore(s => s.db.staff);
  const docs = hr.staffDocs || [];
  const [fs, setFs] = useState(''); const [ft, setFt] = useState(''); const [fst, setFst] = useState(''); const [open, setOpen] = useState(false);
  const blank = { staffId: staff[0]?.id || '', type: DOC_TYPES[0], num: '', issued: TODAY, expiry: '', notes: '' };
  const [f, setF] = useState(blank); const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const name = id => staff.find(s => s.id === id)?.name || id;
  const rows = docs.filter(d => (!fs || d.staffId === fs) && (!ft || d.type === ft) && (!fst || docState(d.expiry).label === fst));
  const count = l => docs.filter(d => docState(d.expiry).label === l).length;
  const sel = 'px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]';
  function save() { if (!f.staffId || !f.type) return; addStaffDoc({ ...f, num: f.num || '—' }); setOpen(false); setF(blank); }
  return (
    <div className="p-6">
      <PageHeader title="Staff Documents" subtitle="Certificates, contracts and ID — with expiry tracking"
        actions={<><select value={fs} onChange={e => setFs(e.target.value)} className={sel}><option value="">All staff</option>{staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <select value={ft} onChange={e => setFt(e.target.value)} className={sel}><option value="">All types</option>{DOC_TYPES.map(t => <option key={t}>{t}</option>)}</select>
          <select value={fst} onChange={e => setFst(e.target.value)} className={sel}><option value="">All statuses</option>{['Verified', 'Expiring', 'Expired'].map(t => <option key={t}>{t}</option>)}</select>
          <Button onClick={() => { setF(blank); setOpen(true); }}>+ Add Document</Button></>} />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Documents" value={docs.length} note="Across all staff" /><Kpi label="Verified" value={count('Verified')} note="Up to date" color="#166534" />
        <Kpi label="Expiring Soon" value={count('Expiring')} note="Within 30 days" color="#B45309" /><Kpi label="Expired" value={count('Expired')} note="Need renewal" color="#DC2626" />
      </div>
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]"><table className="w-full border-collapse text-[13px]">
        <thead><tr><Th>Staff</Th><Th>Document</Th><Th>Number</Th><Th>Issued</Th><Th>Expiry</Th><Th>Status</Th><Th /></tr></thead>
        <tbody>{!rows.length ? <tr><td colSpan={7} className="text-center py-10 text-[#AAA]">No documents match</td></tr> : rows.map(d => { const st = docState(d.expiry); return (
          <tr key={d.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]"><td className="px-4 py-2.5 font-semibold text-[#111]">{name(d.staffId)}</td><td className="px-4 py-2.5 text-[#555]">{d.type}{d.notes && <div className="text-[11px] text-[#AAA]">{d.notes}</div>}</td>
            <td className="px-4 py-2.5 font-mono text-[11.5px] text-[#555]">{d.num}</td><td className="px-4 py-2.5 text-[#555]">{d.issued || '—'}</td><td className="px-4 py-2.5 text-[#555]">{d.expiry || '—'}</td>
            <td className="px-4 py-2.5"><Badge variant={st.variant}>{st.label}</Badge></td><td className="px-4 py-2.5"><button onClick={() => deleteStaffDoc(d.id)} className="text-[11px] text-[#DC2626] font-semibold cursor-pointer bg-none border-none underline">Remove</button></td></tr>); })}</tbody></table></div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Staff Document" footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save Document</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Staff member *"><select value={f.staffId} onChange={e => set('staffId', e.target.value)} className={inputCls}>{staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Document type *"><select value={f.type} onChange={e => set('type', e.target.value)} className={inputCls}>{DOC_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Document number" className="col-span-2"><input value={f.num} onChange={e => set('num', e.target.value)} className={inputCls} /></Field>
          <Field label="Issued"><input type="date" value={f.issued} onChange={e => set('issued', e.target.value)} className={inputCls} /></Field>
          <Field label="Expiry (if any)"><input type="date" value={f.expiry} onChange={e => set('expiry', e.target.value)} className={inputCls} /></Field>
          <Field label="Notes" className="col-span-2"><input value={f.notes} onChange={e => set('notes', e.target.value)} className={inputCls} /></Field>
        </div></Modal>
    </div>
  );
}
