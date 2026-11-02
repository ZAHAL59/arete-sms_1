import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import useExpand from '../../components/ui/useExpand';
import ExpandControls from '../../components/ui/ExpandControls';
import { Kpi, Field, inputCls } from '../../components/ui/Kit';
import { COMPLAINT_TYPES, TODAY, daysBetween, prettyDate } from './constants';

const TYPE_VARIANT = { Academic:'blue', Facility:'amber', Transport:'purple', Behavioural:'red', Administrative:'grey', General:'grey' };

export default function Complaints({ addComplaint, resolveComplaint, addComplaintNote }) {
  const complaints = useStore(s => s.db.complaints) || [];
  const [open, setOpen] = useState(false);
  const [noteFor, setNoteFor] = useState(null);
  const [note, setNote] = useState('');
  const [f, setF] = useState({ who:'', type:COMPLAINT_TYPES[0], date:TODAY, subj:'' });

  const openList = complaints.filter(c => c.status === 'Open');
  const resolved = complaints.filter(c => c.status === 'Resolved');
  const avgDays = resolved.length ? Math.round(resolved.reduce((a, c) => a + daysBetween(c.date, c.resolvedOn || c.date), 0) / resolved.length * 10) / 10 : 0;

  function save() {
    if (!f.subj.trim()) return;
    addComplaint({ ...f, who: f.who.trim() || 'Anonymous', subj: f.subj.trim() });
    setOpen(false); setF({ who:'', type:COMPLAINT_TYPES[0], date:TODAY, subj:'' });
  }
  function saveNote() {
    if (!note.trim()) return;
    addComplaintNote(noteFor, note.trim()); setNoteFor(null); setNote('');
  }

  const age = c => daysBetween(c.date, TODAY);
  const attention = openList.filter(c => age(c) > 7), recent = openList.filter(c => age(c) <= 7);
  const groupIds = ['g:attention', 'g:recent', 'g:resolved'];
  const allIds = [...groupIds, ...complaints.map(c => c.id)];
  const ex = useExpand(['g:attention', 'g:recent']);       // groups that need action start open; individual complaints start collapsed

  const openRow = c => {
    const days = age(c);
    return (
      <Collapsible key={c.id} className="mb-1.5" open={ex.isOpen(c.id)} onToggle={() => ex.toggle(c.id)}
        header={
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-mono text-[11px] text-[#AAA] flex-shrink-0">{c.id}</span>
            <Badge variant={TYPE_VARIANT[c.type] || 'grey'}>{c.type}</Badge>
            <span className="flex-1 truncate text-[13px] font-semibold text-[#111]">{c.subj}</span>
            <span className={`text-[11px] font-semibold flex-shrink-0 ${days > 7 ? 'text-[#DC2626]' : 'text-[#AAA]'}`}>{days} day{days === 1 ? '' : 's'}</span>
            <Button size="sm" onClick={e => { e.stopPropagation(); resolveComplaint(c.id); }}>Resolve</Button>
          </div>}>
        <div className="p-4" style={{ borderLeft: `3px solid ${days > 7 ? '#DC2626' : '#C8202E'}` }}>
          <div className="text-[11.5px] text-[#AAA] mb-1">Logged {prettyDate(c.date)} · From: <span className="text-[#555] font-semibold">{c.who}</span> · Open {days} day{days === 1 ? '' : 's'}</div>
          <div className="text-[13.5px] font-bold text-[#111] mb-2">{c.subj}</div>
          <div className="text-[12px] text-[#9A1822] bg-[#FEF4F4] rounded-[6px] px-2.5 py-1.5 mb-3">⚡ {c.action}</div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => resolveComplaint(c.id)}>Mark Resolved</Button>
            <Button size="sm" variant="outline" onClick={() => { setNoteFor(c.id); setNote(''); }}>Update Action</Button>
          </div>
        </div>
      </Collapsible>);
  };
  const group = (id, title, count, badge, rows, empty) => (
    <Collapsible className="mb-3" open={ex.isOpen(id)} onToggle={() => ex.toggle(id)}
      header={<div className="flex items-center gap-2"><span className="text-[13.5px] font-bold text-[#111]">{title}</span><Badge variant={badge}>{count}</Badge></div>}>
      <div className="p-3 border-t border-[#E4E4E4]">{count ? rows : <div className="text-center text-[#AAA] text-[13px] py-4">{empty}</div>}</div>
    </Collapsible>);

  return (
    <div className="p-6">
      <PageHeader title="Complaints" subtitle="Parent, staff and student complaints — synced with the Principal's dashboard"
        actions={<><ExpandControls ex={ex} ids={allIds} /><Button onClick={() => setOpen(true)}>+ Log Complaint</Button></>} />
      <div className="grid grid-cols-3 gap-3 mb-5">
        <Kpi label="Open" value={openList.length} note="Awaiting resolution" color={openList.length ? '#DC2626' : '#166534'} />
        <Kpi label="Resolved" value={resolved.length} note="All time" color="#166534" />
        <Kpi label="Avg Resolution" value={`${avgDays} days`} note="From logged to resolved" color="#1A5FB4" />
      </div>

      {!openList.length && <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-8 text-center text-[#166534] font-semibold mb-4">🎉 No open complaints</div>}
      {openList.length > 0 && group('g:attention', '🔴 Needs attention — open more than 7 days', attention.length, attention.length ? 'red' : 'grey', attention.map(openRow), 'Nothing is overdue')}
      {openList.length > 0 && group('g:recent', '🟠 Open — recent', recent.length, 'amber', recent.map(openRow), 'No recent complaints')}

      {group('g:resolved', '✅ Resolved', resolved.length, 'green', resolved.map(c => (
        <Collapsible key={c.id} className="mb-1.5" open={ex.isOpen(c.id)} onToggle={() => ex.toggle(c.id)}
          header={<div className="flex items-center gap-2.5 min-w-0"><span className="font-mono text-[11px] text-[#AAA] flex-shrink-0">{c.id}</span><Badge variant="grey">{c.type}</Badge><span className="flex-1 truncate text-[13px] text-[#333]">{c.subj}</span><span className="text-[11.5px] text-[#166534] font-semibold flex-shrink-0">{daysBetween(c.date, c.resolvedOn || c.date)} day(s)</span></div>}>
          <div className="p-4 text-[12.5px] text-[#555] space-y-1.5">
            <div className="text-[13px] font-semibold text-[#111]">{c.subj}</div>
            <div>From: <b>{c.who}</b> · Logged {prettyDate(c.date)}{c.resolvedOn && <> · Resolved {prettyDate(c.resolvedOn)}</>}</div>
            {c.action && <div className="bg-[#F8F8F8] rounded-[6px] px-2.5 py-1.5">Action taken: {c.action}</div>}
          </div>
        </Collapsible>)), 'No resolved complaints yet')}

      <Modal open={open} onClose={() => setOpen(false)} title="Log Complaint"
        footer={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Log Complaint</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="From (Name)" className="col-span-2"><input value={f.who} onChange={e => setF(x => ({ ...x, who:e.target.value }))} placeholder="e.g. Parent - Mrs. Suma R." className={inputCls} /></Field>
          <Field label="Type"><select value={f.type} onChange={e => setF(x => ({ ...x, type:e.target.value }))} className={inputCls}>{COMPLAINT_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Date"><input type="date" value={f.date} onChange={e => setF(x => ({ ...x, date:e.target.value }))} className={inputCls} /></Field>
          <Field label="Description *" className="col-span-2"><textarea rows={4} value={f.subj} onChange={e => setF(x => ({ ...x, subj:e.target.value }))} placeholder="Describe the complaint in detail..." className={inputCls + ' resize-y'} /></Field>
        </div>
      </Modal>

      <Modal open={!!noteFor} onClose={() => setNoteFor(null)} title="Update Action Taken" subtitle={noteFor}
        footer={<><Button variant="outline" onClick={() => setNoteFor(null)}>Cancel</Button><Button onClick={saveNote}>Save</Button></>}>
        <Field label="Action taken / follow-up"><textarea rows={4} value={note} onChange={e => setNote(e.target.value)} placeholder="Action taken, update, follow-up required..." className={inputCls + ' resize-y'} /></Field>
      </Modal>
    </div>
  );
}
