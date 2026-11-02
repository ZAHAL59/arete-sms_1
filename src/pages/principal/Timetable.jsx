import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import { Field, inputCls, Th } from '../../components/ui/Kit';
import { snapshot } from './bridge';
import { ApplyLeaveModal } from './Staff';
import SubstituteModal from './SubstituteModal';
import { colOf } from './cover';
import { classLabel, DAYS, TT_SUBJECTS, blankTimetable, TODAY } from './constants';

const PALETTE = ['#FEF4F4', '#EFF6FF', '#F0FDF4', '#FFFBEB', '#F5F3FF', '#ECFEFF', '#FDF2F8', '#F7FEE7'];
const colourOf = subj => PALETTE[[...subj].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];

export default function Timetable({ api, p }) {
  const db = useStore(s => s.db);
  const classes = useMemo(() => [...new Set([...db.students.map(classLabel), ...Object.keys(p.timetable)])].sort(), [db.students, p.timetable]);
  const [cls, setCls] = useState(Object.keys(p.timetable)[0] || classes[0]);
  const [edit, setEdit] = useState(null); const [tick, setTick] = useState(0); const [leaveOpen, setLeaveOpen] = useState(false); const [subFor, setSubFor] = useState(null);
  const todayCol = colOf(TODAY);
  const coverOf = (ri, ci) => ci === todayCol ? (p.substitutions || []).find(x => x.date === TODAY && x.cls === cls && x.row === ri) : null;
  const nameOf = id => db.staff.find(s => s.id === id)?.name;
  const [bk, setBk] = useState({ room: '', by: '', when: '' });
  const hr = useMemo(() => snapshot().hr, [tick]);
  const tt = p.timetable[cls] || blankTimetable();
  const teachers = [...new Set([...db.staff.map(s => s.name), ...Object.values(p.timetable).flatMap(t => t.slots.flatMap(r => r.cells.map(c => c.split('|')[1]).filter(Boolean)))])].sort();
  const students = db.students.filter(s => classLabel(s) === cls).length;
  const [subject, setSubject] = useState(''); const [teacher, setTeacher] = useState('');

  function openCell(row, col) { const [s, t] = (tt.slots[row].cells[col] || '').split('|'); setSubject(s || ''); setTeacher(t || ''); setEdit({ row, col }); }
  function saveCell() { api.setTTCell(cls, edit.row, edit.col, subject ? `${subject}|${teacher}` : ''); setEdit(null); }
  const leaves = hr.leaveRequests.filter(l => l.status !== 'Rejected' && (l.to || l.from) >= new Date().toISOString().slice(0, 10));

  return (
    <div className="p-6">
      <PageHeader title="Timetable & Scheduling" subtitle="Click any cell to edit · changes save automatically"
        actions={<select value={cls} onChange={e => setCls(e.target.value)} className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">{classes.map(c => <option key={c}>{c}</option>)}</select>} />
      <div className="flex gap-3 mb-3 items-center text-[12.5px] text-[#555]"><Badge variant="grey">{students} students</Badge><label className="flex items-center gap-1.5">Room <input value={tt.room || ''} onChange={e => api.setTTMeta(cls, { room: e.target.value })} placeholder="e.g. Room 204" className="px-2 py-1 border border-[#E4E4E4] rounded-[6px] text-[12px] outline-none focus:border-[#C8202E] w-28" /></label></div>

      <div className="bg-white border border-[#E4E4E4] rounded-[12px] overflow-x-auto shadow-[0_1px_4px_rgba(0,0,0,.07)] mb-4">
        <table className="w-full border-collapse text-[12px]">
          <thead><tr><Th>Time</Th>{DAYS.map(d => <Th key={d}>{d}</Th>)}</tr></thead>
          <tbody>{tt.slots.map((r, ri) => r.cells[0] === 'BREAK'
            ? <tr key={ri}><td className="px-3 py-1.5 font-mono text-[11px] text-[#AAA] border-b border-[#E4E4E4]">{r.time}</td><td colSpan={5} className="text-center text-[10px] font-bold tracking-[3px] text-[#AAA] bg-[#F8F8F8] border-b border-[#E4E4E4]">BREAK</td></tr>
            : <tr key={ri}><td className="px-3 py-2 font-mono text-[11px] text-[#777] border-b border-[#E4E4E4]">{r.time}</td>{r.cells.map((c, ci) => { const [s, t] = c.split('|'); const cv = coverOf(ri, ci);
              return <td key={ci} onClick={() => openCell(ri, ci)} className="px-2 py-2 border-b border-l border-[#E4E4E4] cursor-pointer hover:brightness-95" style={{ background: cv ? '#FFF1E0' : s ? colourOf(s) : '#FAFAFA', outline: cv ? '2px solid #F59E0B' : 'none', outlineOffset: -2 }}>{s ? <><div className="font-bold text-[#111]">{s}</div><div className={`text-[10.5px] ${cv ? 'line-through text-[#AAA]' : 'text-[#777]'}`}>{t}</div>{cv && <div className="text-[10.5px] font-bold text-[#B45309]">↻ {cv.sub} covering today</div>}</> : <span className="text-[#CCC]">Free</span>}</td>; })}</tr>)}</tbody>
        </table>
      </div>

      <Collapsible defaultOpen className="mb-3" header={<div className="flex items-center gap-3 flex-1"><span className="text-[13.5px] font-bold text-[#111]">Staff on Leave</span><Button size="sm" variant="outline" className="ml-auto" onClick={e => { e.stopPropagation(); setLeaveOpen(true); }}>+ Apply Leave</Button></div>}>
        <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]"><thead><tr><Th>Staff</Th><Th>Leave</Th><Th>Dates</Th><Th>Substitute</Th><Th>Status</Th><Th /></tr></thead>
          <tbody>{!leaves.length ? <tr><td colSpan={6} className="text-center py-6 text-[#AAA]">No current or upcoming leave</td></tr> : leaves.map(l => <tr key={l.id} className="border-b border-[#E4E4E4] last:border-b-0"><td className="px-4 py-2.5 font-semibold text-[#111]">{db.staff.find(s => s.id === l.staffId)?.name}</td><td className="px-4 py-2.5 text-[#555]">{l.type}</td><td className="px-4 py-2.5 text-[#555]">{l.from} → {l.to || l.from}</td><td className="px-4 py-2.5 text-[12.5px]">{l.subMode === 'adjust' ? 'Class adjustment' : (() => { const n = (p.substitutions || []).filter(x => x.absent === nameOf(l.staffId) && x.date >= l.from && x.date <= (l.to || l.from)).length; return n ? `${n} period(s) covered` : 'To be assigned'; })()}</td><td className="px-4 py-2.5"><Badge variant={l.status === 'Approved' ? 'green' : 'amber'}>{l.status}</Badge></td><td className="px-4 py-2.5">{l.subMode !== 'adjust' && <Button size="sm" variant="outline" onClick={() => setSubFor({ name: nameOf(l.staffId), date: l.from < TODAY && (l.to || l.from) >= TODAY ? TODAY : l.from })}>Assign Substitute</Button>}</td></tr>)}</tbody></table>
      </Collapsible>

      <Collapsible header={<span className="text-[13.5px] font-bold text-[#111]">Room & Resource Booking</span>}>
        <div className="border-t border-[#E4E4E4]">
          {p.bookings.map(b => <div key={b.id} className="flex items-center px-4 py-2.5 border-b border-[#E4E4E4]"><span className="w-44 font-semibold text-[13px]">{b.room}</span><span className="flex-1 text-[13px] text-[#555]">{b.by}</span><span className="text-[12.5px] text-[#777] mr-4">{b.when}</span><button onClick={() => api.deleteBooking(b.id)} className="text-[11px] text-[#DC2626] font-semibold cursor-pointer bg-none border-none underline">Remove</button></div>)}
          <div className="flex gap-2 p-3">{[['room', 'Room / resource'], ['by', 'Booked by'], ['when', 'When (e.g. Mon Wed)']].map(([k, ph]) => <input key={k} value={bk[k]} onChange={e => setBk(x => ({ ...x, [k]: e.target.value }))} placeholder={ph} className={inputCls + ' flex-1'} />)}<Button onClick={() => { if (bk.room && bk.by) { api.addBooking(bk); setBk({ room: '', by: '', when: '' }); } }}>Add</Button></div>
        </div>
      </Collapsible>

      {edit && <Modal open onClose={() => setEdit(null)} title="Edit Period" subtitle={`${cls} · ${DAYS[edit.col]} · ${tt.slots[edit.row].time}`} footer={<><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={saveCell}>Save</Button></>}>
        <div className="space-y-3">
          <Field label="Subject"><select value={subject} onChange={e => setSubject(e.target.value)} className={inputCls}><option value="">— Free period —</option>{TT_SUBJECTS.map(s => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Teacher"><select value={teacher} onChange={e => setTeacher(e.target.value)} className={inputCls}><option value="">— Select —</option>{teachers.map(t => <option key={t}>{t}</option>)}</select></Field>
          {teacher && hr.leaveRequests.some(l => l.status === 'Approved' && db.staff.find(s => s.id === l.staffId)?.name === teacher) && <div className="text-[12px] text-[#B45309] bg-[#FFFBEB] rounded-[6px] p-2.5">⚠ {teacher} has approved leave — check the dates before assigning.</div>}
        </div></Modal>}
      {subFor && <SubstituteModal absent={subFor.name} date={subFor.date} p={p} api={api} onClose={() => setSubFor(null)} />}
      {leaveOpen && <ApplyLeaveModal onClose={() => setLeaveOpen(false)} onDone={() => setTick(t => t + 1)} />}
    </div>
  );
}
