import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Kpi, Field, inputCls, Th } from './ui';
import { TODAY, OUTING_PURPOSES, CONSENT_MODES } from './constants';

const STATUS_VARIANT = { 'Pending Approval':'amber', Approved:'green', Rejected:'red' };

export default function Outing({ h, addOuting, setOutingStatus }) {
  const db = useStore(s => s.db);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ stuId:'', purpose:OUTING_PURPOSES[0], dep:'', ret:'', consent:'Pending' });

  const pending = h.outings.filter(o => o.status === 'Pending Approval').length;
  const approved = h.outings.filter(o => o.status === 'Approved').length;
  const away = h.outings.filter(o => o.status === 'Approved' && o.dep <= TODAY && o.ret >= TODAY).length;
  const rows = h.outings.filter(o => filter === 'all' || o.status === filter);

  function save() {
    if (!f.stuId || !f.dep || !f.ret) return;
    const s = db.students.find(x => x.id === f.stuId);
    addOuting({ ...f, stuName:s.name, cls:`${s.cls} ${s.section}` });
    setOpen(false); setF({ stuId:'', purpose:OUTING_PURPOSES[0], dep:'', ret:'', consent:'Pending' });
  }

  return (
    <div className="p-6">
      <PageHeader title="Outing Requests" subtitle="Leave-of-absence from hostel"
        actions={<>
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">
            <option value="all">All</option><option>Pending Approval</option><option>Approved</option><option>Rejected</option>
          </select>
          <Button onClick={() => setOpen(true)}>+ New Request</Button>
        </>} />

      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Pending Approval" value={pending} note="Awaiting warden sign-off" color="#B45309" />
        <Kpi label="Approved" value={approved} note="This month" color="#166534" />
        <Kpi label="Currently Away" value={away} note="Out of hostel now" color="#DC2626" />
        <Kpi label="Total Requests" value={h.outings.length} note="All time" color="#1A5FB4" />
      </div>

      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr><Th>Student</Th><Th>Class</Th><Th>Purpose</Th><Th>Departure</Th><Th>Return</Th><Th>Consent</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>
            {!rows.length
              ? <tr><td colSpan={8} className="text-center py-10 text-[#AAA]">No requests</td></tr>
              : rows.map(o => (
                <tr key={o.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                  <td className="px-4 py-2.5 font-semibold text-[#111]">{o.stuName}</td>
                  <td className="px-4 py-2.5 text-[#555]">{o.cls}</td>
                  <td className="px-4 py-2.5"><Badge variant="grey">{o.purpose}</Badge></td>
                  <td className="px-4 py-2.5 text-[#555]">{o.dep}</td>
                  <td className="px-4 py-2.5 text-[#555]">{o.ret}</td>
                  <td className="px-4 py-2.5 text-[#555]">{o.consent}</td>
                  <td className="px-4 py-2.5"><Badge variant={STATUS_VARIANT[o.status] || 'grey'}>{o.status}</Badge></td>
                  <td className="px-4 py-2.5">
                    {o.status === 'Pending Approval' && (
                      <div className="flex gap-2">
                        <button onClick={() => setOutingStatus(o.id, 'Approved')} className="text-[11px] font-semibold text-[#166534] underline cursor-pointer bg-none border-none">Approve</button>
                        <button onClick={() => setOutingStatus(o.id, 'Rejected')} className="text-[11px] font-semibold text-[#DC2626] underline cursor-pointer bg-none border-none">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Outing Request"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Submit</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Student *" className="col-span-2">
            <select value={f.stuId} onChange={e => setF(x => ({ ...x, stuId:e.target.value }))} className={inputCls}>
              <option value="">— Select boarder —</option>
              {db.students.filter(s => s.boarding).map(s => <option key={s.id} value={s.id}>{s.name} — {s.cls} {s.section}</option>)}
            </select>
          </Field>
          <Field label="Purpose">
            <select value={f.purpose} onChange={e => setF(x => ({ ...x, purpose:e.target.value }))} className={inputCls}>
              {OUTING_PURPOSES.map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Parent Consent">
            <select value={f.consent} onChange={e => setF(x => ({ ...x, consent:e.target.value }))} className={inputCls}>
              {CONSENT_MODES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Departure *"><input type="date" value={f.dep} onChange={e => setF(x => ({ ...x, dep:e.target.value }))} className={inputCls} /></Field>
          <Field label="Return *"><input type="date" value={f.ret} onChange={e => setF(x => ({ ...x, ret:e.target.value }))} className={inputCls} /></Field>
        </div>
      </Modal>
    </div>
  );
}
