import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Kpi, Th } from '../../components/ui/Kit';
import { COLORS } from '../teacher/constants';
import { loadHostel } from '../hostel/constants';
import { loadCampus, loanStatus, prettyDate } from '../campus/constants';
import { getStudentDue, fmt, paidTowardDue } from '../finance/constants';
import { downloadCsv } from '../principal/constants';
import StudentFormModal from './modals/StudentFormModal';

export function StudentDetail({ student, onClose, onEdit }) {
  const db = useStore(s => s.db);
  const s = db.students.find(x => x.id === student.id) || student;
  const route = db.routes.find(r => r.id === s.busRoute);
  const room = useMemo(() => loadHostel().rooms.find(r => r.inmates.includes(s.name)), [s.name]);
  const books = useMemo(() => loadCampus().books.filter(b => b.issuedTo === s.id), [s.id]);
  const pays = db.payments.filter(p => p.studentId === s.id); const paid = paidTowardDue(db.payments, s.id), due = getStudentDue(s);
  const [copied, setCopied] = useState(false);
  const rows = [['Learning style', s.learningStyle || '—'], ['Diet', s.diet || '—'], ['Travel', s.boarding ? 'Boarding' : route ? 'Bus' : 'Own transport'], ['Health', s.health || 'None'], ['Special needs', s.needs || 'None'], ['Parent', `${s.parentName || '—'} ${s.parentPhone || ''}`]];
  const summary = `${s.name} · ${s.cls} ${s.section} · Parent: ${s.parentName} ${s.parentPhone} · Learning style: ${s.learningStyle || '—'} · Diet: ${s.diet || '—'} · Health: ${s.health || 'None'} · Needs: ${s.needs || 'None'}`;
  const svc = (ic, title, on, lines) => <div className={`border-[1.5px] rounded-[8px] p-3 ${on ? 'border-[#C8202E]/40 bg-[#FEF4F4]' : 'border-[#E4E4E4]'}`}><div className="text-[11px] font-bold text-[#777] uppercase tracking-wider mb-1">{ic} {title}</div>{lines}</div>;
  return (
    <Modal open onClose={onClose} size="lg" title={s.name} subtitle={`${s.cls} ${s.section} · Roll ${s.roll || '—'} · Admitted ${s.adm}`}
      footer={<><Button variant="outline" onClick={() => { navigator.clipboard?.writeText(summary); setCopied(true); }}>{copied ? '✓ Copied' : '📋 Copy profile summary'}</Button><Button variant="outline" onClick={onClose}>Close</Button><Button onClick={() => onEdit(s)}>✎ Edit</Button></>}>
      <div className="grid grid-cols-3 gap-2 mb-4">{rows.map(([l, v]) => <div key={l} className="bg-[#F8F8F8] p-2.5 rounded-[6px]"><div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1">{l}</div><div className="text-[13px] font-semibold text-[#333]">{v}</div></div>)}</div>
      <div className="text-[11px] font-bold text-[#C8202E] uppercase tracking-wider mb-2">Connected services</div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        {svc('🚌', 'Transport', !!route, route ? <><div className="text-[13px] font-bold">{route.name}</div><div className="text-[11.5px] text-[#777]">{route.driver} · dep {route.dept}</div></> : <div className="text-[12.5px] text-[#AAA]">Own transport</div>)}
        {svc('🏠', 'Hostel', !!s.boarding, s.boarding ? <><div className="text-[13px] font-bold">{room ? `Room ${room.id}` : 'Boarder'}</div><div className="text-[11.5px] text-[#777]">{room ? room.type : 'No room allotted yet'}</div></> : <div className="text-[12.5px] text-[#AAA]">Day scholar</div>)}
        {svc('📚', 'Library', books.length > 0, books.length ? books.map(b => <div key={b.id} className="text-[12px]"><b>{b.title}</b> <span className="text-[#777]">· {loanStatus(b)} · due {prettyDate(b.due)}</span></div>) : <div className="text-[12.5px] text-[#AAA]">No books on loan</div>)}
      </div>
      {svc('₹', 'Fees', due - paid > 0, <div className="text-[12.5px]">Annual due <b>{fmt(due)}</b> · paid <b className="text-[#166534]">{fmt(paid)}</b> · balance <b style={{ color: due - paid > 0 ? '#DC2626' : '#166534' }}>{fmt(Math.max(0, due - paid))}</b> · {pays.length} payment(s)</div>)}
      {(s.milestones || []).length > 0 && <div className="mt-3"><div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider mb-1.5">Milestones</div>{s.milestones.map((m, i) => <div key={i} className="text-[12.5px] text-[#555] flex gap-3 mb-1"><span className="font-mono text-[#AAA]">{m.date}</span>{m.text}</div>)}</div>}
    </Modal>
  );
}

export default function Students() {
  const db = useStore(s => s.db);
  const [grade, setGrade] = useState(''); const [section, setSection] = useState(''); const [q, setQ] = useState('');
  const [detail, setDetail] = useState(null); const [form, setForm] = useState(undefined);   // undefined = closed, null = new, obj = edit
  const grades = [...new Set(db.students.map(s => s.cls))].sort();
  const rows = db.students.filter(s => (!grade || s.cls === grade) && (!section || s.section === section) && (!q || `${s.name} ${s.cls} ${s.section}`.toLowerCase().includes(q.toLowerCase())));
  const sc = 'px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]';
  const exportCsv = () => downloadCsv(`students_${new Date().toISOString().slice(0, 10)}.csv`, ['ID', 'Name', 'Class', 'Section', 'Bus route', 'Boarding', 'Learning style', 'Diet', 'Parent', 'Phone'],
    rows.map(s => [s.id, s.name, s.cls, s.section, db.routes.find(r => r.id === s.busRoute)?.name || '—', s.boarding ? 'Yes' : 'No', s.learningStyle, s.diet, s.parentName, s.parentPhone]));
  return (
    <div className="p-6">
      <PageHeader title="All Students" subtitle={`${db.students.length} enrolled · ${rows.length} showing`}
        actions={<><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className={sc + ' w-40'} />
          <select value={grade} onChange={e => setGrade(e.target.value)} className={sc}><option value="">All grades</option>{grades.map(g => <option key={g}>{g}</option>)}</select>
          <select value={section} onChange={e => setSection(e.target.value)} className={sc}><option value="">All sections</option>{['A', 'B', 'C'].map(s => <option key={s}>{s}</option>)}</select>
          <Button variant="outline" onClick={exportCsv}>⬇ Export CSV</Button><Button onClick={() => setForm(null)}>+ New Student</Button></>} />
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Kpi label="Total Enrolled" value={db.students.length} note="All classes" /><Kpi label="Boarding" value={db.students.filter(s => s.boarding).length} note="In hostel" color="#1A5FB4" />
        <Kpi label="On Bus Routes" value={db.students.filter(s => s.busRoute).length} note={`Across ${db.routes.length} routes`} color="#B45309" /><Kpi label="Special Needs" value={db.students.filter(s => s.needs && s.needs !== 'None').length} note="Support plans" color="#6D28D9" />
      </div>
      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]"><table className="w-full border-collapse text-[13px]">
        <thead><tr><Th>Student</Th><Th>Class</Th><Th>Transport</Th><Th>Boarding</Th><Th>Learning</Th><Th>Diet</Th><Th>Status</Th><Th /></tr></thead>
        <tbody>{!rows.length ? <tr><td colSpan={8} className="text-center py-12 text-[#AAA]">No students found</td></tr> : rows.map((s, i) => { const r = db.routes.find(x => x.id === s.busRoute); return (
          <tr key={s.id} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8]">
            <td className="px-3.5 py-2.5"><div className="flex items-center gap-2"><div style={{ background: COLORS[i % COLORS.length] }} className="w-7 h-7 rounded-full text-white text-[10px] font-bold flex items-center justify-center">{s.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div><div><button onClick={() => setDetail(s)} className="font-semibold text-[#C8202E] underline cursor-pointer bg-none border-none text-[13px] text-left">{s.name}</button><div className="text-[11px] text-[#AAA]">{s.parentName} · {s.parentPhone}</div></div></div></td>
            <td className="px-3.5 py-2.5 text-[#555]">{s.cls} {s.section}</td><td className="px-3.5 py-2.5">{r ? <Badge variant="amber">{r.name.split('—')[0].trim()}</Badge> : <span className="text-[#AAA]">Own</span>}</td>
            <td className="px-3.5 py-2.5">{s.boarding ? <Badge variant="blue">Boarder</Badge> : <span className="text-[#AAA]">Day</span>}</td><td className="px-3.5 py-2.5"><Badge variant="grey">{s.learningStyle || '—'}</Badge></td><td className="px-3.5 py-2.5 text-[#555] text-[12px]">{s.diet}</td>
            <td className="px-3.5 py-2.5"><Badge variant="green">{s.status || 'Active'}</Badge>{s.needs && s.needs !== 'None' && <Badge variant="amber" className="ml-1">SEN</Badge>}</td>
            <td className="px-3.5 py-2.5"><button onClick={() => setForm(s)} className="text-[11px] font-semibold text-[#555] underline cursor-pointer bg-none border-none">Edit</button></td></tr>); })}</tbody></table></div>
      {detail && <StudentDetail student={detail} onClose={() => setDetail(null)} onEdit={s => { setDetail(null); setForm(s); }} />}
      {form !== undefined && <StudentFormModal student={form} onClose={() => setForm(undefined)} />}
    </div>
  );
}
