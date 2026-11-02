import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Field, inputCls, Th } from '../../components/ui/Kit';
import { COLORS } from '../teacher/constants';
import { LEAVE_TYPES } from '../hr/constants';
import { snapshot, setLeaveStatus, addLeaveRequest, onLeaveToday } from './bridge';
import SubstituteModal from './SubstituteModal';
import { TODAY } from './constants';

export function ApplyLeaveModal({ onClose, onDone }) {
  const staff = useStore(s => s.db.staff);
  const [f, setF] = useState({ staffId: '', type: 'Casual', from: TODAY, to: TODAY, reason: '', subMode: 'arrange' });
  const days = f.from && f.to ? Math.max(1, Math.round((new Date(f.to) - new Date(f.from)) / 86400000) + 1) : 1;
  function save() { if (!f.staffId || !f.from) return; addLeaveRequest({ ...f, to: f.to || f.from, days }); onDone(); onClose(); }
  return (
    <Modal open onClose={onClose} title="Apply Leave" subtitle="Goes to the HR leave queue for approval" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Submit</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Staff Member *" className="col-span-2"><select value={f.staffId} onChange={e => setF(x => ({ ...x, staffId: e.target.value }))} className={inputCls}><option value="">— Select —</option>{staff.map(s => <option key={s.id} value={s.id}>{s.name} — {s.subj}</option>)}</select></Field>
        <Field label="From *"><input type="date" value={f.from} onChange={e => setF(x => ({ ...x, from: e.target.value }))} className={inputCls} /></Field>
        <Field label="To *"><input type="date" min={f.from} value={f.to} onChange={e => setF(x => ({ ...x, to: e.target.value }))} className={inputCls} /></Field>
        <Field label="Type"><select value={f.type} onChange={e => setF(x => ({ ...x, type: e.target.value }))} className={inputCls}>{LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Days"><div className="px-2.5 py-2 text-[13px] font-bold">{days}</div></Field>
        <Field label="Substitute?" className="col-span-2"><select value={f.subMode} onChange={e => setF(x => ({ ...x, subMode: e.target.value }))} className={inputCls}><option value="arrange">Yes — arrange a substitute</option><option value="adjust">No — class adjustment</option></select></Field>
        <Field label="Reason" className="col-span-2"><input value={f.reason} onChange={e => setF(x => ({ ...x, reason: e.target.value }))} className={inputCls} /></Field>
      </div>
    </Modal>
  );
}

export default function Staff({ p, api }) {
  const db = useStore(s => s.db); const updateDB = useStore(s => s.updateDB);
  const [tab, setTab] = useState('staff'); const [subj, setSubj] = useState(''); const [tick, setTick] = useState(0);
  const hr = useMemo(() => snapshot().hr, [tick]);
  const [form, setForm] = useState(null); const [leaveOpen, setLeaveOpen] = useState(false); const [subFor, setSubFor] = useState(null);
  const nameOf = id => db.staff.find(x => x.id === id)?.name || id;
  const coverText = l => { if (l.subMode === 'adjust') return <span className="text-[#777]">Class adjustment</span>; const n = (p.substitutions || []).filter(x => x.absent === nameOf(l.staffId) && x.date >= l.from && x.date <= (l.to || l.from)).length; return n ? <Badge variant="green">{n} period{n > 1 ? 's' : ''} covered</Badge> : <Badge variant="amber">To be assigned</Badge>; };
  const subjects = [...new Set(db.staff.map(s => s.subj))].sort();
  const rows = db.staff.filter(s => !subj || s.subj === subj);
  const pending = hr.leaveRequests.filter(l => l.status === 'Pending').length;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function save() {
    if (!form.name.trim()) return;
    updateDB(d => {
      const data = { name: form.name.trim(), subj: form.subj, phone: form.phone, joined: form.joined, salary: +form.salary || 0 };
      if (form.id) { const i = d.staff.findIndex(x => x.id === form.id); if (i >= 0) d.staff[i] = { ...d.staff[i], ...data }; }
      else d.staff.push({ ...data, id: 'T' + String(d.staff.length + 1).padStart(3, '0'), status: 'Active', classes: [] });
      return d;
    });
    setForm(null);
  }

  return (
    <div className="p-6">
      <PageHeader title="Staff & HR" subtitle={`${db.staff.length} staff · ${pending} leave request(s) pending`}
        actions={<><Link to="/hr" className="px-3 py-2 border border-[#E4E4E4] rounded-[6px] text-[12.5px] font-semibold text-[#555] no-underline hover:bg-[#F8F8F8]">Open HR Portal ↗</Link><Button variant="outline" onClick={() => setLeaveOpen(true)}>📅 Apply Leave</Button><Button onClick={() => setForm({ name: '', subj: '', phone: '', joined: TODAY, salary: '' })}>+ Add Staff</Button></>} />
      <div className="flex gap-1 mb-4 border-b border-[#E4E4E4]">{[['staff', 'All Staff'], ['leave', `Leave Requests${pending ? ` (${pending})` : ''}`]].map(([id, l]) => <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 text-[13px] font-semibold border-b-2 -mb-px cursor-pointer bg-none ${tab === id ? 'border-[#C8202E] text-[#C8202E]' : 'border-transparent text-[#777]'}`}>{l}</button>)}</div>

      {tab === 'staff' ? <>
        <div className="mb-3"><select value={subj} onChange={e => setSubj(e.target.value)} className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]"><option value="">All subjects</option>{subjects.map(s => <option key={s}>{s}</option>)}</select></div>
        <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]"><table className="w-full border-collapse text-[13px]">
          <thead><tr><Th>Name</Th><Th>Subject</Th><Th>Phone</Th><Th>Classes</Th><Th>Status</Th><Th>Joined</Th><Th /></tr></thead>
          <tbody>{rows.map((s, i) => (
            <tr key={s.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
              <td className="px-4 py-2.5"><div className="flex items-center gap-2"><div style={{ background: COLORS[i % COLORS.length] }} className="w-8 h-8 rounded-full text-white text-[10px] font-bold flex items-center justify-center">{s.name.split(' ').filter(w => /[A-Z]/.test(w[0])).map(w => w[0]).join('').slice(0, 2)}</div><div><div className="font-semibold text-[#111]">{s.name}</div><div className="font-mono text-[10.5px] text-[#AAA]">{s.id}</div></div></div></td>
              <td className="px-4 py-2.5 text-[#555]">{s.subj}</td><td className="px-4 py-2.5 font-mono text-[11.5px] text-[#555]">{s.phone}</td>
              <td className="px-4 py-2.5 text-[#777] text-[12px]">{(s.classes || []).length ? (s.classes || []).length + ' classes' : '—'}</td>
              <td className="px-4 py-2.5"><Badge variant={onLeaveToday(hr, s.id) ? 'amber' : 'green'}>{onLeaveToday(hr, s.id) ? 'On Leave' : s.status}</Badge></td>
              <td className="px-4 py-2.5 text-[#555]">{s.joined}</td>
              <td className="px-4 py-2.5"><button onClick={() => setForm({ ...s, salary: String(s.salary) })} className="text-[11px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none">Edit</button></td>
            </tr>))}</tbody></table></div>
      </> : (
        <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]"><table className="w-full border-collapse text-[13px]">
          <thead><tr><Th>Staff</Th><Th>Type</Th><Th>Dates</Th><Th>Days</Th><Th>Reason</Th><Th>Substitute</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>{!hr.leaveRequests.length ? <tr><td colSpan={8} className="text-center py-10 text-[#AAA]">No leave requests</td></tr> : hr.leaveRequests.map(l => (
            <tr key={l.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
              <td className="px-4 py-2.5 font-semibold text-[#111]">{db.staff.find(s => s.id === l.staffId)?.name || l.staffId}</td><td className="px-4 py-2.5"><Badge variant="grey">{l.type}</Badge></td>
              <td className="px-4 py-2.5 text-[#555]">{l.from} → {l.to || l.from}</td><td className="px-4 py-2.5 font-bold">{l.days}</td><td className="px-4 py-2.5 text-[#555]">{l.reason}</td>
              <td className="px-4 py-2.5">{l.status !== 'Rejected' ? coverText(l) : '—'}</td>
              <td className="px-4 py-2.5"><Badge variant={l.status === 'Approved' ? 'green' : l.status === 'Rejected' ? 'red' : 'amber'}>{l.status}</Badge></td>
              <td className="px-4 py-2.5 whitespace-nowrap">{l.status !== 'Rejected' && l.subMode !== 'adjust' && <button onClick={() => setSubFor({ name: nameOf(l.staffId), date: l.from < TODAY && (l.to || l.from) >= TODAY ? TODAY : l.from })} className="text-[11px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none mr-3">Assign substitute</button>}{l.status === 'Pending' && <><button onClick={() => { setLeaveStatus(l.id, 'Approved'); setTick(t => t + 1); }} className="text-[11px] font-semibold text-[#166534] underline cursor-pointer bg-none border-none mr-3">Approve</button><button onClick={() => { setLeaveStatus(l.id, 'Rejected'); setTick(t => t + 1); }} className="text-[11px] font-semibold text-[#DC2626] underline cursor-pointer bg-none border-none">Reject</button></>}</td>
            </tr>))}</tbody></table></div>)}

      {form && <Modal open onClose={() => setForm(null)} title={form.id ? `Edit — ${form.name}` : 'Add Staff'} footer={<><Button variant="outline" onClick={() => setForm(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name *" className="col-span-2"><input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} /></Field>
          <Field label="Subject / Role"><input value={form.subj} onChange={e => set('subj', e.target.value)} className={inputCls} /></Field>
          <Field label="Phone"><input value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} /></Field>
          <Field label="Date Joined"><input type="date" value={form.joined} onChange={e => set('joined', e.target.value)} className={inputCls} /></Field>
          <Field label="Monthly Salary (₹)"><input type="number" value={form.salary} onChange={e => set('salary', e.target.value)} className={inputCls} /></Field>
        </div></Modal>}
      {subFor && <SubstituteModal absent={subFor.name} date={subFor.date} p={p} api={api} onClose={() => setSubFor(null)} />}
      {leaveOpen && <ApplyLeaveModal onClose={() => setLeaveOpen(false)} onDone={() => { setTick(t => t + 1); setTab('leave'); }} />}
    </div>
  );
}
