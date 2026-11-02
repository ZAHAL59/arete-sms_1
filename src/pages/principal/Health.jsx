import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import { Kpi, Field, inputCls, Th } from '../../components/ui/Kit';
import { VISIT_PURPOSES } from '../campus/constants';
import { snapshot, signOutVisitor, addVisitorEntry } from './bridge';
import { INCIDENT_TYPES, PARENT_NOTIFIED, TODAY, prettyDate } from './constants';

const none = v => !v || /^none$/i.test(v.trim());

export default function Health({ p, api }) {
  const db = useStore(s => s.db);
  const [tick, setTick] = useState(0);
  const campus = useMemo(() => snapshot().campus, [tick]);
  const [open, setOpen] = useState(false); const [visOpen, setVisOpen] = useState(false);
  const blank = { stu: '', cls: '', type: INCIDENT_TYPES[0], date: TODAY, issue: '', action: '', parent: PARENT_NOTIFIED[0] };
  const [f, setF] = useState(blank); const [v, setV] = useState({ name: '', purpose: VISIT_PURPOSES[0], meeting: '' });

  const month = TODAY.slice(0, 7);
  const medical = [
    ['Allergies', db.students.filter(s => !none(s.allergy))], ['Health notes', db.students.filter(s => !none(s.health))],
    ['Special needs', db.students.filter(s => !none(s.needs))], ['Medication in school', db.students.filter(s => !none(s.medication))],
  ];
  const visitors = campus.visitors.filter(x => x.date === TODAY);

  function saveInc() {
    if (!f.stu.trim() || !f.issue.trim()) return;
    const known = db.students.find(s => s.name.toLowerCase() === f.stu.trim().toLowerCase());
    api.addIncident({ ...f, stu: f.stu.trim(), cls: known ? known.cls : f.cls, issue: f.issue.trim(), action: f.action.trim() });
    setOpen(false); setF(blank);
  }
  function saveVisitor() {
    if (!v.name.trim()) return;
    addVisitorEntry({ name: v.name.trim(), phone: '—', purpose: v.purpose, meeting: v.meeting || '—', date: TODAY, timeIn: new Date().toTimeString().slice(0, 5), idProof: 'Other' });
    setVisOpen(false); setV({ name: '', purpose: VISIT_PURPOSES[0], meeting: '' }); setTick(t => t + 1);
  }

  return (
    <div className="p-6">
      <PageHeader title="Health & Incidents" subtitle="Incidents, immunisation, visitors and medical summary" actions={<Button onClick={() => setOpen(true)}>+ Log Incident</Button>} />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Incidents" value={p.incidents.length} note="All logged" /><Kpi label="This Month" value={p.incidents.filter(i => i.date.startsWith(month)).length} note="Current month" color="#1A5FB4" />
        <Kpi label="Parent Not Told" value={p.incidents.filter(i => i.parent === 'Not yet').length} note="Needs follow-up" color={p.incidents.some(i => i.parent === 'Not yet') ? '#DC2626' : '#166534'} />
        <Kpi label="Visitors Inside" value={visitors.filter(x => x.status === 'In').length} note="Right now" color="#B45309" />
      </div>

      <Collapsible defaultOpen className="mb-3" header={<span className="text-[13.5px] font-bold text-[#111]">Health Incidents</span>}>
        <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]"><thead><tr><Th>Student</Th><Th>Date</Th><Th>Type</Th><Th>Incident</Th><Th>Action</Th><Th>Parent</Th><Th /></tr></thead>
          <tbody>{!p.incidents.length ? <tr><td colSpan={7} className="text-center py-8 text-[#AAA]">No incidents logged</td></tr> : p.incidents.map(i => (
            <tr key={i.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]"><td className="px-4 py-2.5 font-semibold text-[#111]">{i.stu}<div className="text-[11px] text-[#AAA] font-normal">{i.cls}</div></td><td className="px-4 py-2.5 text-[#555]">{prettyDate(i.date)}</td><td className="px-4 py-2.5"><Badge variant="amber">{i.type}</Badge></td><td className="px-4 py-2.5 text-[#333]">{i.issue}</td><td className="px-4 py-2.5 text-[#555] text-[12px]">{i.action || '—'}</td>
              <td className="px-4 py-2.5"><Badge variant={i.parent === 'Not yet' ? 'red' : 'green'}>{i.parent.replace('Yes — ', '').replace(' sent', '') === 'Not yet' ? 'Pending' : i.parent.replace('Yes — ', '').replace(' sent', '')}</Badge></td>
              <td className="px-4 py-2.5"><button onClick={() => api.deleteIncident(i.id)} className="text-[11px] text-[#DC2626] font-semibold cursor-pointer bg-none border-none underline">Remove</button></td></tr>))}</tbody></table>
      </Collapsible>

      <Collapsible defaultOpen className="mb-3" header={<span className="text-[13.5px] font-bold text-[#111]">Immunisation Coverage</span>}>
        <div className="border-t border-[#E4E4E4] divide-y divide-[#E4E4E4]">{p.immunisation.map(x => (
          <div key={x.vaccine} className="flex items-center gap-3 px-4 py-2.5"><span className="w-36 text-[13px] font-semibold">{x.vaccine}</span>
            <div className="flex-1 h-2 bg-[#E4E4E4] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${x.coverage}%`, background: x.coverage >= 90 ? '#166534' : x.coverage >= 85 ? '#B45309' : '#DC2626' }} /></div>
            <input type="number" min={0} max={100} value={x.coverage} onChange={e => api.setImmunisation(x.vaccine, { coverage: Math.min(100, Math.max(0, +e.target.value || 0)) })} className="w-16 px-2 py-1 border border-[#E4E4E4] rounded-[6px] text-[12px] text-center outline-none" /><span className="text-[12px] text-[#777]">%</span>
            <span className="text-[11.5px] text-[#AAA] w-24 text-right">Review {x.next}</span></div>))}</div>
      </Collapsible>

      <Collapsible className="mb-3" header={<div className="flex items-center gap-3 flex-1"><span className="text-[13.5px] font-bold text-[#111]">Visitors Today</span><Button size="sm" variant="outline" className="ml-auto" onClick={e => { e.stopPropagation(); setVisOpen(true); }}>+ Log Visitor</Button></div>}>
        <div className="border-t border-[#E4E4E4] divide-y divide-[#E4E4E4]">{!visitors.length && <div className="p-4 text-[13px] text-[#AAA]">No visitors today</div>}{visitors.map(x => (
          <div key={x.id} className="flex items-center gap-3 px-4 py-2.5"><div className="flex-1"><div className="text-[13px] font-semibold">{x.name}</div><div className="text-[11.5px] text-[#777]">{x.purpose} · in {x.timeIn}{x.timeOut ? ` · out ${x.timeOut}` : ''}</div></div>
            <Badge variant={x.status === 'In' ? 'amber' : 'green'}>{x.status === 'In' ? 'Inside' : 'Signed out'}</Badge>{x.status === 'In' && <Button size="sm" variant="outline" onClick={() => { signOutVisitor(x.id); setTick(t => t + 1); }}>Sign Out</Button>}</div>))}</div>
      </Collapsible>

      <Collapsible header={<span className="text-[13.5px] font-bold text-[#111]">Medical Summary <span className="text-[11px] font-normal text-[#AAA]">from student records</span></span>}>
        <div className="border-t border-[#E4E4E4] divide-y divide-[#E4E4E4]">{medical.map(([l, list]) => <div key={l} className="px-4 py-2.5"><div className="flex items-center"><span className="flex-1 text-[13px] font-semibold">{l}</span><span className="text-[13px] font-bold text-[#C8202E]">{list.length} student{list.length === 1 ? '' : 's'}</span></div>{list.length > 0 && <div className="text-[12px] text-[#777] mt-0.5">{list.map(s => s.name).join(', ')}</div>}</div>)}</div>
      </Collapsible>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Incident" footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={saveInc}>Save Incident</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Student Name *"><input list="stu-list" value={f.stu} onChange={e => setF(x => ({ ...x, stu: e.target.value }))} className={inputCls} /><datalist id="stu-list">{db.students.map(s => <option key={s.id} value={s.name} />)}</datalist></Field>
          <Field label="Type"><select value={f.type} onChange={e => setF(x => ({ ...x, type: e.target.value }))} className={inputCls}>{INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Date"><input type="date" value={f.date} onChange={e => setF(x => ({ ...x, date: e.target.value }))} className={inputCls} /></Field>
          <Field label="Parent Notified"><select value={f.parent} onChange={e => setF(x => ({ ...x, parent: e.target.value }))} className={inputCls}>{PARENT_NOTIFIED.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Description *" className="col-span-2"><textarea rows={2} value={f.issue} onChange={e => setF(x => ({ ...x, issue: e.target.value }))} className={inputCls + ' resize-y'} /></Field>
          <Field label="Action Taken" className="col-span-2"><input value={f.action} onChange={e => setF(x => ({ ...x, action: e.target.value }))} className={inputCls} /></Field>
        </div></Modal>
      <Modal open={visOpen} onClose={() => setVisOpen(false)} title="Log Visitor" subtitle="Saved to the Campus visitor log" footer={<><Button variant="outline" onClick={() => setVisOpen(false)}>Cancel</Button><Button onClick={saveVisitor}>Log Entry</Button></>}>
        <div className="space-y-3"><Field label="Visitor Name *"><input value={v.name} onChange={e => setV(x => ({ ...x, name: e.target.value }))} className={inputCls} /></Field>
          <Field label="Purpose"><select value={v.purpose} onChange={e => setV(x => ({ ...x, purpose: e.target.value }))} className={inputCls}>{VISIT_PURPOSES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Meeting With"><input value={v.meeting} onChange={e => setV(x => ({ ...x, meeting: e.target.value }))} className={inputCls} /></Field></div></Modal>
    </div>
  );
}
