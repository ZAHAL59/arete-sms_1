import { useState } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Field, inputCls, Th } from '../../components/ui/Kit';
import { COLORS } from '../teacher/constants';
import { getStudentDue, paidTowardDue } from '../finance/constants';
import { attendanceOf, classLabel, downloadCsv, fmt } from './constants';

const GRADES = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);
const EDIT_FIELDS = [['Name', 'name'], ['Date of Birth', 'dob', 'date'], ['Parent / Guardian', 'parentName'], ['Parent Phone', 'parentPhone'], ['Blood Group', 'bloodGroup'], ['Allergies', 'allergy'], ['Medication', 'medication'], ['Category', 'category'], ['Health Notes', 'health'], ['Special Needs', 'needs'], ['Languages', 'langs'], ['Hobbies', 'hobbies']];

export function studentStatus(s, fee) { return fee.bal > 0 ? 'Fee Pending' : s.status || 'Active'; }
export function feeOf(s, payments) {
  const due = getStudentDue(s), paid = paidTowardDue(payments, s.id);
  return { due, paid, bal: Math.max(0, due - paid) };
}

export function StudentPanel({ student, onClose, onEdit }) {
  const db = useStore(s => s.db); const attLog = useStore(s => s.attLog); const sessionLogs = useStore(s => s.sessionLogs);
  const s = db.students.find(x => x.id === student.id) || student;
  const fee = feeOf(s, db.payments); const att = attendanceOf(s.id, attLog);
  const route = db.routes.find(r => r.id === s.busRoute);
  const rows = [['Class', classLabel(s)], ['Roll', s.roll || '—'], ['Date of Birth', s.dob || '—'], ['Admitted', s.adm || '—'], ['Guardian', s.parentName || '—'], ['Phone', s.parentPhone || '—'],
    ['Blood Group', s.bloodGroup || '—'], ['Allergies', s.allergy || 'None'], ['Medication', s.medication || 'None'], ['Health', s.health || 'None'], ['Special Needs', s.needs || 'None'], ['Category', s.category || 'General'],
    ['Learning Style', s.learningStyle || '—'], ['Diet', s.diet || '—'], ['Languages', s.langs || '—'], ['Hobbies', s.hobbies || '—'],
    ['Travel', s.boarding ? 'Boarding' : route ? `Bus — ${route.name}` : 'Own transport']];
  return (
    <Modal open onClose={onClose} size="lg" title={s.name} subtitle={`${classLabel(s)} · ${s.id}`}
      footer={<><Button variant="outline" onClick={onClose}>Close</Button>{onEdit && <Button onClick={() => onEdit(s)}>✎ Edit</Button>}</>}>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[['Attendance', att ? att.pct + '%' : '—', att && att.pct < 75 ? '#DC2626' : '#166534'], ['Fee Balance', fmt(fee.bal), fee.bal ? '#DC2626' : '#166534'], ['Session Logs', sessionLogs.filter(l => l.stuId === s.id).length, '#6D28D9']].map(([l, v, c]) => (
          <div key={l} className="bg-[#F8F8F8] rounded-[8px] p-3 text-center"><div className="text-[20px] font-extrabold" style={{ color: c }}>{v}</div><div className="text-[10.5px] text-[#AAA] uppercase tracking-wider">{l}</div></div>))}
      </div>
      <div className="grid grid-cols-2 gap-2">{rows.map(([l, v]) => <div key={l} className="bg-[#F8F8F8] p-2.5 rounded-[6px]"><div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1">{l}</div><div className="text-[13px] text-[#333] break-words">{v}</div></div>)}</div>
      {s.behav && <div className="mt-3 bg-[#FFFBEB] border border-[#FEF08A] rounded-[6px] p-3 text-[12.5px] text-[#B45309]"><b>Behaviour:</b> {s.behav}</div>}
      {(s.milestones || []).length > 0 && <div className="mt-3"><div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1.5">Milestones</div>{s.milestones.map((m, i) => <div key={i} className="text-[12.5px] text-[#555] flex gap-3 mb-1"><span className="font-mono text-[#AAA]">{m.date}</span>{m.text}</div>)}</div>}
    </Modal>
  );
}

export function EditStudentModal({ student, onClose }) {
  const updateDB = useStore(s => s.updateDB);
  const [f, setF] = useState(() => Object.fromEntries(EDIT_FIELDS.map(([, k]) => [k, student[k] || ''])));
  function save() { updateDB(d => { const i = d.students.findIndex(x => x.id === student.id); if (i >= 0) d.students[i] = { ...d.students[i], ...f, name: f.name.trim() || d.students[i].name }; return d; }); onClose(); }
  return (
    <Modal open onClose={onClose} size="lg" title={`Edit — ${student.name}`} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save}>Save Changes</Button></>}>
      <div className="grid grid-cols-2 gap-3">{EDIT_FIELDS.map(([l, k, t]) => <Field key={k} label={l}><input type={t || 'text'} value={f[k]} onChange={e => setF(x => ({ ...x, [k]: e.target.value }))} className={inputCls} /></Field>)}</div>
    </Modal>
  );
}

export default function Students({ settings }) {
  const db = useStore(s => s.db); const attLog = useStore(s => s.attLog); const updateDB = useStore(s => s.updateDB);
  const [q, setQ] = useState(''); const [grade, setGrade] = useState(''); const [pill, setPill] = useState('all');
  const [sel, setSel] = useState(null); const [edit, setEdit] = useState(null); const [addOpen, setAddOpen] = useState(false);
  const blank = { name: '', dob: '', cls: 'Grade 6', section: 'A', parentName: '', parentPhone: '', diet: 'Vegetarian', boarding: false };
  const [nf, setNf] = useState(blank);

  const rows = db.students.map(s => ({ s, fee: feeOf(s, db.payments), att: attendanceOf(s.id, attLog) })).filter(({ s, fee, att }) =>
    (!q || s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase())) && (!grade || s.cls === grade) &&
    (pill === 'all' || (pill === 'active' && s.status === 'Active') || (pill === 'fee' && fee.bal > 0) || (pill === 'risk' && att && att.pct < settings.lowAtt)));
  const count = p => db.students.filter(s => p === 'fee' ? feeOf(s, db.payments).bal > 0 : p === 'risk' ? (attendanceOf(s.id, attLog)?.pct ?? 100) < settings.lowAtt : p === 'active' ? s.status === 'Active' : true).length;

  function exportCsv() {
    downloadCsv('students.csv', ['ID', 'Name', 'Class', 'Guardian', 'Phone', 'Attendance %', 'Fee Balance', 'Status'],
      rows.map(({ s, fee, att }) => [s.id, s.name, classLabel(s), s.parentName, s.parentPhone, att ? att.pct : '', fee.bal, studentStatus(s, fee)]));
  }
  function enrol() {
    if (!nf.name.trim() || !nf.parentName.trim()) return;
    updateDB(d => { d.students.push({ id: 'S' + String(d.students.length + 1).padStart(3, '0'), name: nf.name.trim(), dob: nf.dob, cls: nf.cls, section: nf.section, roll: d.students.filter(x => x.cls === nf.cls && x.section === nf.section).length + 1,
      adm: new Date().toISOString().slice(0, 10), learningStyle: '', diet: nf.diet, health: 'None', needs: 'None', hobbies: '', langs: 'Malayalam, English', travel: 'Own', busRoute: '', boarding: nf.boarding,
      parentName: nf.parentName.trim(), parentPhone: nf.parentPhone, behav: '', expPref: '', status: 'Active' }); return d; });
    setAddOpen(false); setNf(blank);
  }

  return (
    <div className="p-6">
      <PageHeader title="Student Records" subtitle={`${db.students.length} students · longitudinal record per student`}
        actions={<><Button variant="outline" onClick={exportCsv}>⬇ Export CSV</Button><Button onClick={() => setAddOpen(true)}>+ Enrol Student</Button></>} />
      <div className="flex gap-2 flex-wrap mb-3 items-center">
        {[['all', 'All Students'], ['active', 'Active'], ['fee', 'Fee Pending'], ['risk', 'Attendance Risk']].map(([id, l]) => (
          <button key={id} onClick={() => setPill(id)} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold cursor-pointer border ${pill === id ? 'bg-[#C8202E] text-white border-[#C8202E]' : 'bg-white text-[#555] border-[#E4E4E4] hover:border-[#C8202E]'}`}>{l} <span className="opacity-70">{count(id)}</span></button>))}
        <div className="ml-auto flex gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or ID..." className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E] w-44" />
          <select value={grade} onChange={e => setGrade(e.target.value)} className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]"><option value="">All grades</option>{GRADES.map(g => <option key={g}>{g}</option>)}</select>
        </div>
      </div>
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <table className="w-full border-collapse text-[13px]">
          <thead><tr><Th>Student</Th><Th>ID</Th><Th>Class</Th><Th>Guardian</Th><Th>Attendance</Th><Th>Fee Status</Th><Th /></tr></thead>
          <tbody>
            {!rows.length ? <tr><td colSpan={7} className="text-center py-10 text-[#AAA]">No students match</td></tr> : rows.map(({ s, fee, att }, i) => (
              <tr key={s.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
                <td className="px-4 py-2.5"><div className="flex items-center gap-2 cursor-pointer" onClick={() => setSel(s)}><div style={{ background: COLORS[i % COLORS.length] }} className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center">{s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div><span className="font-semibold text-[#C8202E] underline">{s.name}</span></div></td>
                <td className="px-4 py-2.5 font-mono text-[11.5px] text-[#AAA]">{s.id}</td>
                <td className="px-4 py-2.5 text-[#555]">{classLabel(s)}</td>
                <td className="px-4 py-2.5 text-[#555]">{s.parentName}</td>
                <td className="px-4 py-2.5">{att ? <span className="font-bold" style={{ color: att.pct < settings.lowAtt ? '#DC2626' : '#166534' }}>{att.pct}%</span> : <span className="text-[#CCC]">—</span>}</td>
                <td className="px-4 py-2.5"><Badge variant={fee.bal > 0 ? (fee.paid ? 'amber' : 'red') : 'green'}>{fee.bal > 0 ? (fee.paid ? 'Partial' : 'Pending') : 'Paid'}</Badge></td>
                <td className="px-4 py-2.5 whitespace-nowrap"><button onClick={() => setSel(s)} className="text-[11px] font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none mr-3">View</button><button onClick={() => setEdit(s)} className="text-[11px] font-semibold text-[#555] underline cursor-pointer bg-none border-none">Edit</button></td>
              </tr>))}
          </tbody>
        </table>
      </div>
      {sel && <StudentPanel student={sel} onClose={() => setSel(null)} onEdit={s => { setSel(null); setEdit(s); }} />}
      {edit && <EditStudentModal student={edit} onClose={() => setEdit(null)} />}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Enrol Student" subtitle="Direct enrolment — for admissions via the pipeline use the Admissions page" footer={<><Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button onClick={enrol}>Enrol</Button></>}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Student Name *" className="col-span-2"><input value={nf.name} onChange={e => setNf(x => ({ ...x, name: e.target.value }))} className={inputCls} /></Field>
          <Field label="Date of Birth"><input type="date" value={nf.dob} onChange={e => setNf(x => ({ ...x, dob: e.target.value }))} className={inputCls} /></Field>
          <Field label="Diet"><select value={nf.diet} onChange={e => setNf(x => ({ ...x, diet: e.target.value }))} className={inputCls}><option>Vegetarian</option><option>Non-Vegetarian</option><option>Vegan</option></select></Field>
          <Field label="Grade"><select value={nf.cls} onChange={e => setNf(x => ({ ...x, cls: e.target.value }))} className={inputCls}>{GRADES.map(g => <option key={g}>{g}</option>)}</select></Field>
          <Field label="Section"><select value={nf.section} onChange={e => setNf(x => ({ ...x, section: e.target.value }))} className={inputCls}>{['A', 'B', 'C'].map(g => <option key={g}>{g}</option>)}</select></Field>
          <Field label="Guardian *"><input value={nf.parentName} onChange={e => setNf(x => ({ ...x, parentName: e.target.value }))} className={inputCls} /></Field>
          <Field label="Guardian Phone"><input value={nf.parentPhone} onChange={e => setNf(x => ({ ...x, parentPhone: e.target.value }))} className={inputCls} /></Field>
          <label className="col-span-2 flex items-center gap-2 text-[13px] cursor-pointer"><input type="checkbox" checked={nf.boarding} onChange={e => setNf(x => ({ ...x, boarding: e.target.checked }))} className="accent-[#C8202E]" /> Boarding</label>
        </div>
      </Modal>
    </div>
  );
}
