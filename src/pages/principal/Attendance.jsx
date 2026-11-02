import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import AttendancePanel from '../teacher/AttendancePanel';
import { snapshot, staffAttToday, setStaffAttToday, onLeaveToday } from './bridge';
import SubstituteModal from './SubstituteModal';
import { uncovered } from './cover';
import { classLabel, downloadCsv, TODAY, prettyDate } from './constants';

const DOT = { P: ['#166534', '#F0FDF4'], A: ['#DC2626', '#FEF2F2'], L: ['#B45309', '#FFFBEB'] };

export default function Attendance({ settings, p, api }) {
  const db = useStore(s => s.db); const attLog = useStore(s => s.attLog);
  const classes = useMemo(() => [...new Set(db.students.map(classLabel))].sort(), [db.students]);
  const [cls, setCls] = useState(classes[0] || '');
  const [open, setOpen] = useState(true); const [savedAt, setSavedAt] = useState(null);
  const [stuId, setStuId] = useState(db.students[0]?.id || '');
  const [tick, setTick] = useState(0); const [alertOpen, setAlertOpen] = useState(false); const [subFor, setSubFor] = useState(null);
  const hr = useMemo(() => snapshot().hr, [tick]);

  // Staff attendance is a draft until Save is pressed
  const [draft, setDraft] = useState({}); const [staffSavedAt, setStaffSavedAt] = useState(null);
  const savedVal = id => staffAttToday(hr, id);
  const valOf = id => draft[id] ?? savedVal(id);
  const changed = db.staff.filter(s => draft[s.id] !== undefined && draft[s.id] !== savedVal(s.id));
  const sCount = { P: 0, L: 0, A: 0 }; db.staff.forEach(s => { const v = valOf(s.id); if (sCount[v] != null) sCount[v]++; });
  const sUnmarked = db.staff.length - sCount.P - sCount.L - sCount.A;
  function markAllStaff() { setDraft(d => { const n = { ...d }; db.staff.forEach(s => { if (!onLeaveToday(hr, s.id)) n[s.id] = 'P'; }); return n; }); }
  function saveStaff() { changed.forEach(s => setStaffAttToday(s.id, draft[s.id])); setDraft({}); setTick(t => t + 1); setStaffSavedAt(new Date().toTimeString().slice(0, 5)); }

  const key = cls.replace(/\s+/g, '') + '-' + TODAY;
  const roster = db.students.filter(s => classLabel(s) === cls);
  const today = attLog[key] || {};
  const counts = { P: 0, A: 0, L: 0 }; Object.values(today).forEach(v => counts[v] != null && counts[v]++);

  // History for the chosen student, oldest → newest, last 18 recorded days
  const stu = db.students.find(s => s.id === stuId);
  const history = Object.entries(attLog).filter(([, l]) => l[stuId]).map(([k, l]) => ({ date: k.slice(-10), st: l[stuId] })).sort((a, b) => a.date.localeCompare(b.date)).slice(-18);
  const month = history.filter(h => h.date.startsWith(TODAY.slice(0, 7)));
  const monthPct = month.length ? Math.round(month.filter(h => h.st === 'P').length / month.length * 100) : null;

  const issues = Object.entries(attLog).filter(([k]) => k.endsWith(TODAY)).flatMap(([, l]) => Object.entries(l).filter(([, v]) => v === 'A' || v === 'L').map(([id, v]) => ({ s: db.students.find(x => x.id === id), v }))).filter(x => x.s);
  const msg = ({ s, v }) => `Dear ${s.parentName}, ${s.name} (${classLabel(s)}) was marked ${v === 'A' ? 'ABSENT' : 'LATE'} today (${prettyDate(TODAY)}) at ${settings.school}. Please contact the school if this is unexpected.`;

  function exportRoll() { downloadCsv(`roll-${cls.replace(/\s+/g, '')}-${TODAY}.csv`, ['Roll', 'Student', 'Status'], roster.map(s => [s.roll, s.name, { P: 'Present', A: 'Absent', L: 'Late' }[today[s.id]] || 'Not marked'])); }

  return (
    <div className="p-6">
      <PageHeader title="Attendance" subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />

      {/* ── Staff attendance first ── */}
      <Collapsible defaultOpen className="mb-6" header={
        <div className="flex items-center gap-3 flex-1"><span className="text-[14px] font-bold text-[#111]">👥 Staff Attendance — Today</span>
          {changed.length > 0 ? <Badge variant="amber">{changed.length} unsaved change{changed.length > 1 ? 's' : ''}</Badge> : staffSavedAt ? <Badge variant="green">✓ Saved at {staffSavedAt}</Badge> : null}
          <span className="ml-auto text-[12px] text-[#777]"><b className="text-[#166534]">{sCount.P}</b> present · <b className="text-[#B45309]">{sCount.L}</b> late · <b className="text-[#DC2626]">{sCount.A}</b> absent · {sUnmarked} not marked</span></div>}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[#E4E4E4] bg-[#F8F8F8]">
          <Button size="sm" variant="outline" onClick={markAllStaff}>✓ All Present</Button>
          <span className="text-[11.5px] text-[#AAA]">P = Present · L = Late · A = Absent</span>
          <Button size="sm" className="ml-auto" disabled={!changed.length} onClick={saveStaff}>💾 Save Staff Attendance</Button>
        </div>
        <div className="divide-y divide-[#E4E4E4]">{db.staff.map(s => {
          const v = valOf(s.id), leave = onLeaveToday(hr, s.id), dirty = draft[s.id] !== undefined && draft[s.id] !== savedVal(s.id);
          return <div key={s.id} className={`flex items-center gap-3 px-4 py-2.5 ${v === 'P' ? 'bg-[#F6FEF9]' : v === 'A' ? 'bg-[#FFF5F5]' : v === 'L' ? 'bg-[#FFFDF0]' : ''}`}>
            <div className="flex-1"><div className="text-[13px] font-semibold text-[#111]">{s.name}{dirty && <span className="ml-2 text-[10px] font-bold text-[#B45309]">● unsaved</span>}</div><div className="text-[11.5px] text-[#777]">{s.subj}</div></div>
            {leave && <Badge variant="amber">On approved leave</Badge>}
            {(v === 'A' || leave) && (() => { const left = uncovered(p.timetable, p.substitutions || [], s.name, TODAY).length, total = (p.substitutions || []).filter(x => x.date === TODAY && x.absent === s.name).length;
              return <div className="flex items-center gap-2">{left > 0 ? <Badge variant="red">{left} period{left > 1 ? 's' : ''} need cover</Badge> : total > 0 ? <Badge variant="green">✓ Covered</Badge> : <span className="text-[11px] text-[#AAA]">No classes today</span>}
                <Button size="sm" variant="outline" onClick={() => setSubFor(s.name)}>↻ Assign substitute</Button></div>; })()}
            <div className="flex gap-1">{['P', 'L', 'A'].map(x => <button key={x} onClick={() => setDraft(d => ({ ...d, [s.id]: x }))} className="w-8 h-7 rounded-[5px] text-[11px] font-bold border-[1.5px] cursor-pointer" style={{ background: v === x ? DOT[x][0] : DOT[x][1], color: v === x ? '#fff' : DOT[x][0], borderColor: v === x ? DOT[x][0] : DOT[x][0] + '44' }}>{x}</button>)}</div></div>;
        })}</div>
      </Collapsible>

      {/* ── Student attendance ── */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <div className="text-[14px] font-bold text-[#111] mr-2">🎒 Student Attendance</div>
        <select value={cls} onChange={e => { setCls(e.target.value); setOpen(true); setSavedAt(null); }} className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]">{classes.map(c => <option key={c}>{c}</option>)}</select>
        <Button variant="outline" onClick={exportRoll}>⬇ Export Roll</Button>
        <Button variant="outline" onClick={() => setAlertOpen(true)}>📱 Parent Alerts ({issues.length})</Button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[['Present', counts.P, '#166534'], ['Absent', counts.A, '#DC2626'], ['Late', counts.L, '#B45309'], ['Not marked', Math.max(0, roster.length - counts.P - counts.A - counts.L), '#AAA']].map(([l, v, c]) => (
          <div key={l} className="bg-white border border-[#E4E4E4] rounded-[10px] p-3.5" style={{ borderLeft: `3px solid ${c}` }}><div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider">{l}</div><div className="text-[22px] font-extrabold" style={{ color: c }}>{v}</div></div>))}
      </div>

      {open && cls ? <AttendancePanel key={cls + (savedAt || '')} cls={cls} date={TODAY} onClose={() => setOpen(false)} onSaved={() => setSavedAt(new Date().toTimeString().slice(0, 5))} />
        : <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-5 flex items-center gap-3">{savedAt && <Badge variant="green">✓ Saved at {savedAt}</Badge>}<span className="text-[13px] text-[#555] flex-1">Roll call for {cls} is closed.</span><Button onClick={() => setOpen(true)}>Open roll call</Button></div>}

      <Collapsible defaultOpen className="mt-4" header={<div className="flex items-center gap-3 flex-1"><span className="text-[13.5px] font-bold text-[#111]">Attendance History</span>
        <select value={stuId} onClick={e => e.stopPropagation()} onChange={e => setStuId(e.target.value)} className="ml-auto px-2 py-1 border border-[#E4E4E4] rounded-[6px] text-[12px] outline-none">{db.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>}>
        <div className="p-4 border-t border-[#E4E4E4]">
          {!history.length ? <div className="text-[13px] text-[#AAA]">No attendance recorded for {stu?.name} yet.</div> : <>
            <div className="flex gap-1.5 flex-wrap mb-3">{history.map((h, i) => <span key={i} title={`${prettyDate(h.date)} — ${h.st}`} className="w-7 h-7 rounded-[6px] text-[11px] font-bold flex items-center justify-center" style={{ background: DOT[h.st][1], color: DOT[h.st][0], border: `1px solid ${DOT[h.st][0]}33` }}>{h.st}</span>)}</div>
            <div className="text-[12.5px] text-[#555]">{monthPct != null ? <>This month: <b style={{ color: monthPct < settings.lowAtt ? '#DC2626' : '#166534' }}>{monthPct}%</b> present · </> : ''}{history.length} day(s) recorded</div></>}
        </div>
      </Collapsible>

      {subFor && <SubstituteModal absent={subFor} date={TODAY} p={p} api={api} onClose={() => setSubFor(null)} />}

      <Modal open={alertOpen} onClose={() => setAlertOpen(false)} size="lg" title="Parent Alerts" subtitle="Absent and late students today — SMS sending is not connected yet, so copy the message"
        footer={<Button variant="outline" onClick={() => setAlertOpen(false)}>Close</Button>}>
        {!issues.length ? <div className="text-center py-6 text-[#166534] font-semibold">No absent or late students recorded today</div> : <div className="space-y-2">{issues.map((x, i) => (
          <div key={i} className="border border-[#E4E4E4] rounded-[8px] p-3"><div className="flex items-center gap-2 mb-1"><b className="text-[13px]">{x.s.name}</b><Badge variant={x.v === 'A' ? 'red' : 'amber'}>{x.v === 'A' ? 'Absent' : 'Late'}</Badge><span className="font-mono text-[11px] text-[#AAA] ml-auto">{x.s.parentPhone}</span></div>
            <div className="text-[12.5px] text-[#555] leading-relaxed mb-2">{msg(x)}</div><Button size="sm" variant="outline" onClick={() => navigator.clipboard?.writeText(msg(x))}>Copy message</Button></div>))}</div>}
      </Modal>
    </div>
  );
}
