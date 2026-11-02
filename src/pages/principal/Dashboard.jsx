import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Collapsible from '../../components/ui/Collapsible';
import { getStudentDue, countsTowardDue } from '../finance/constants';
import { snapshot, setLeaveStatus, setOutingStatus, docStatus, loanStatus, staffAttOn, onLeaveOn } from './bridge';
import { uncovered } from './cover';
import { StudentPanel, EditStudentModal } from './Students';
import { attendanceOf, fmt, fmtL, TODAY, prettyDate } from './constants';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function Dashboard({ p, go, openRoute }) {
  const db = useStore(s => s.db); const attLog = useStore(s => s.attLog);
  const [tick, setTick] = useState(0);
  const snap = useMemo(snapshot, [tick]);
  const [sel, setSel] = useState(null); const [edit, setEdit] = useState(null);
  const now = new Date(); const [cal, setCal] = useState({ y: now.getFullYear(), m: now.getMonth() }); const [calDay, setCalDay] = useState(TODAY);
  const { hr, hostel, campus, transport, admissions } = snap;
  const complaints = db.complaints || [];

  const upcomingEvents = campus.events.filter(e => e.date >= TODAY);
  const openComplaints = complaints.filter(c => c.status === 'Open');
  const pendingLeaves = hr.leaveRequests.filter(l => l.status === 'Pending');
  const pendingApps = (hr.applications || []).filter(a => a.hrStatus === 'Pending Review');
  const pendingOutings = hostel.outings.filter(o => o.status === 'Pending Approval');
  // teachers away today (marked absent or on approved leave) whose classes have no substitute yet
  const needCover = db.staff.map(s => ({ s, n: (staffAttOn(hr, s.id, TODAY) === 'A' || onLeaveOn(hr, s.id, TODAY)) ? uncovered(p.timetable, p.substitutions || [], s.name, TODAY).length : 0 })).filter(x => x.n > 0);
  const pending = needCover.length + pendingLeaves.length + pendingApps.length + pendingOutings.length + openComplaints.length;

  const totalDue = db.students.reduce((a, s) => a + getStudentDue(s), 0);
  const collected = db.payments.filter(p => p.studentId && countsTowardDue(p)).reduce((a, p) => a + p.amount, 0);
  const pct = totalDue ? Math.round(collected / totalDue * 1000) / 10 : 0;
  const todayLogs = Object.entries(attLog).filter(([k]) => k.endsWith(TODAY)).flatMap(([, l]) => Object.values(l));
  const todayAtt = todayLogs.length ? Math.round(todayLogs.filter(v => v === 'P').length / todayLogs.length * 100) : null;
  const atRisk = db.students.filter(s => (attendanceOf(s.id, attLog)?.pct ?? 100) < p.settings.lowAtt).length;

  const pulse = [['Students', db.students.length], ['Staff', db.staff.length], ['Boarders', db.students.filter(s => s.boarding).length], ['Bus Routes', db.routes.length], ['Events', upcomingEvents.length], ['Complaints', openComplaints.length]];
  const portals = [
    ['HR pipeline', pendingApps.length, 'Applications to review', '/hr'], ['Open vacancies', hr.vacancies.filter(v => v.status === 'Active').length, 'Teaching posts', '/hr'],
    ['Low mess stock', hostel.stock.filter(s => s.qty <= s.low).length, 'Items to reorder', '/hostel'], ['Pending outings', pendingOutings.length, 'Awaiting warden', '/hostel'],
    ['Overdue books', campus.books.filter(b => loanStatus(b) === 'Overdue').length, 'Library', '/campus'], ['Vehicle docs', transport.docs.filter(d => docStatus(d.expiry).days <= 30).length, 'Expiring / expired', '/transport'],
    ['Visitors inside', campus.visitors.filter(v => v.status === 'In' && v.date === TODAY).length, 'On premises now', '/campus'], ['Open incidents', hostel.incidents.filter(i => i.status === 'Open').length, 'Hostel', '/hostel'],
  ];

  const activity = [
    ...db.payments.filter(x => x.studentId).slice(0, 4).map(x => ({ at: x.date, c: '#166534', msg: `Fee payment — <b>${fmt(x.amount)}</b> · ${db.students.find(s => s.id === x.studentId)?.name || ''} · ${x.mode}` })),
    ...complaints.slice(0, 3).map(c => ({ at: c.date, c: '#DC2626', msg: `Complaint ${c.status === 'Open' ? 'logged' : 'resolved'} — ${c.subj.slice(0, 60)}` })),
    ...(hr.applications || []).slice(-3).map(a => ({ at: (a.appliedAt || '').slice(0, 10), c: '#1A5FB4', msg: `Job application — <b>${a.name}</b>` })),
    ...campus.visitors.slice(0, 3).map(v => ({ at: v.date, c: '#B45309', msg: `Visitor — <b>${v.name}</b> (${v.purpose})` })),
    ...p.incidents.slice(0, 2).map(i => ({ at: i.date, c: '#6D28D9', msg: `Health incident — ${i.stu}: ${i.issue}` })),
  ].filter(a => a.at).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);

  const first = new Date(cal.y, cal.m, 1).getDay(), days = new Date(cal.y, cal.m + 1, 0).getDate();
  const iso = d => `${cal.y}-${String(cal.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const evOn = d => campus.events.filter(e => e.date === d);
  const shiftMonth = n => setCal(c => { const d = new Date(c.y, c.m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });

  return (
    <div className="p-6">
      <div className="rounded-[14px] p-5 mb-4 text-white" style={{ background: 'linear-gradient(135deg,#C8202E,#9A1822)' }}>
        <div className="text-[11px] font-bold uppercase tracking-widest text-white/60">{p.settings.school} · {p.settings.board} · AY {p.settings.year}</div>
        <div className="text-[22px] font-extrabold tracking-tight mb-1">School Management Overview</div>
        <div className="text-[12.5px] text-white/70 mb-4">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <div className="grid grid-cols-6 gap-2.5">{pulse.map(([l, v]) => <div key={l} className="bg-white/15 border border-white/10 rounded-[10px] py-3 text-center"><div className="text-[24px] font-extrabold leading-none">{v}</div><div className="text-[11px] text-white/80 mt-1">{l}</div></div>)}</div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-4">{portals.map(([l, v, n, to]) => (
        <div key={l} onClick={() => openRoute(to)} className="bg-white border border-[#E4E4E4] rounded-[10px] p-3 cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,.1)] transition-all">
          <div className="text-[10px] font-bold text-[#AAA] uppercase tracking-wider">{l}</div><div className="text-[22px] font-extrabold leading-tight" style={{ color: v ? '#C8202E' : '#166534' }}>{v}</div><div className="text-[11px] text-[#AAA]">{n}</div></div>))}</div>

      <Collapsible className="mb-4" header={<div className="flex items-center gap-3 flex-1"><span className="text-[13.5px] font-bold text-[#111]">⏳ Pending Approvals</span><span className="ml-auto text-[11.5px] font-bold" style={{ color: pending ? '#C8202E' : '#166534' }}>{pending ? `${pending} item${pending > 1 ? 's' : ''} pending` : 'All clear ✓'}</span></div>}>
        <div className="border-t border-[#E4E4E4] divide-y divide-[#E4E4E4]">
          {!pending && <div className="px-4 py-3 text-[13px] text-[#AAA]">✓ No pending approvals — everything is up to date</div>}
          {openComplaints.slice(0, 3).map(c => <Row key={c.id} ic="C" col="#DC2626" text={c.subj.slice(0, 70)} sub={`Complaint · ${c.type}`} actions={<Button size="sm" variant="outline" onClick={() => openRoute('/campus')}>Open →</Button>} />)}
          {needCover.map(({ s, n }) => <Row key={'cv' + s.id} ic="S" col="#B45309" text={`${s.name} is away — ${n} period${n > 1 ? 's' : ''} need a substitute`} sub="Classes today without cover" actions={<Button size="sm" onClick={() => go('attendance')}>Assign →</Button>} />)}
          {pendingLeaves.map(l => <Row key={l.id} ic="L" col="#C8202E" text={`${db.staff.find(s => s.id === l.staffId)?.name || l.staffId} — ${l.type} leave`} sub={`${l.from} to ${l.to || l.from} · ${l.reason || ''}`} actions={<><Button size="sm" onClick={() => { setLeaveStatus(l.id, 'Approved'); setTick(t => t + 1); }}>Approve</Button><Button size="sm" variant="outline" onClick={() => { setLeaveStatus(l.id, 'Rejected'); setTick(t => t + 1); }}>Reject</Button></>} />)}
          {pendingOutings.map(o => <Row key={o.id} ic="O" col="#B45309" text={`${o.stuName} — hostel outing (${o.purpose})`} sub={`${o.dep} to ${o.ret}`} actions={<><Button size="sm" onClick={() => { setOutingStatus(o.id, 'Approved'); setTick(t => t + 1); }}>Approve</Button><Button size="sm" variant="outline" onClick={() => { setOutingStatus(o.id, 'Rejected'); setTick(t => t + 1); }}>Reject</Button></>} />)}
          {pendingApps.slice(0, 3).map(a => <Row key={a.id} ic="H" col="#1A5FB4" text={`${a.name} — job application`} sub="HR review needed" actions={<Button size="sm" variant="outline" onClick={() => openRoute('/hr')}>Open →</Button>} />)}
        </div>
      </Collapsible>

      <div className="grid grid-cols-4 gap-3 mb-4">
        {[['Fees Collected', fmtL(collected), `${pct}% of ${fmtL(totalDue)}`, '#166534'], ['Outstanding', fmtL(Math.max(0, totalDue - collected)), 'Pending collection', '#DC2626'], ['Attendance Today', todayAtt == null ? '—' : todayAtt + '%', todayAtt == null ? 'Not marked yet' : `${todayLogs.length} marked`, '#1A5FB4'], ['Attendance Risk', atRisk, `Below ${p.settings.lowAtt}%`, atRisk ? '#DC2626' : '#166534']].map(([l, v, n, c]) => (
          <div key={l} className="bg-white border border-[#E4E4E4] rounded-[10px] p-4 shadow-[0_1px_4px_rgba(0,0,0,.07)]" style={{ borderLeft: `3px solid ${c}` }}><div className="text-[10.5px] font-semibold text-[#AAA] uppercase tracking-wider mb-1">{l}</div><div className="text-[22px] font-extrabold leading-none" style={{ color: c }}>{v}</div><div className="text-[11.5px] text-[#AAA] mt-1">{n}</div></div>))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-3">
          <Collapsible header={<div className="flex items-center gap-3 flex-1"><span className="text-[13.5px] font-bold text-[#111]">Fee Collection — AY {p.settings.year}</span><span className="ml-auto text-[11.5px] text-[#777]"><b className="text-[#166534]">{fmtL(collected)}</b> of {fmtL(totalDue)} · {pct}%</span></div>}>
            <div className="p-4 border-t border-[#E4E4E4]"><div className="flex items-baseline gap-2"><span className="text-[26px] font-extrabold">{fmt(collected)}</span><span className="text-[12px] text-[#AAA]">of {fmt(totalDue)} billed</span></div>
              <div className="h-2 bg-[#E4E4E4] rounded-full mt-3 overflow-hidden"><div className="h-full bg-[#166534] rounded-full" style={{ width: `${Math.min(100, pct)}%` }} /></div>
              <div className="flex justify-between text-[12px] text-[#777] mt-1.5"><span>{pct}%</span><span>{fmt(Math.max(0, totalDue - collected))} remaining</span></div></div>
          </Collapsible>
          <Collapsible header={<div className="flex items-center gap-3 flex-1"><span className="text-[13.5px] font-bold text-[#111]">Recently Enrolled</span><span className="text-[11.5px] text-[#AAA]">{Math.min(6, db.students.length)} of {db.students.length}</span><Button size="sm" variant="outline" className="ml-auto" onClick={e => { e.stopPropagation(); go('students'); }}>All students →</Button></div>}>
            <table className="w-full border-collapse text-[13px] border-t border-[#E4E4E4]"><tbody>{db.students.slice(-6).reverse().map(s => (
              <tr key={s.id} onClick={() => setSel(s)} className="border-b border-[#E4E4E4] last:border-b-0 hover:bg-[#F8F8F8] cursor-pointer"><td className="px-4 py-2.5 font-semibold text-[#111]">{s.name}</td><td className="px-4 py-2.5 text-[#555]">{s.cls} {s.section}</td><td className="px-4 py-2.5 text-[#AAA] text-[12px]">Admitted {s.adm}</td></tr>))}</tbody></table>
          </Collapsible>
        </div>
        <div className="space-y-3">
          <Collapsible header={<div className="flex items-center gap-2 flex-1"><span className="text-[13.5px] font-bold text-[#111]">Today's Activity</span><span className="ml-auto text-[11.5px] text-[#777]">{activity.length} update{activity.length === 1 ? '' : 's'}</span></div>}>
            <div className="border-t border-[#E4E4E4] divide-y divide-[#E4E4E4]">{!activity.length ? <div className="p-4 text-[12.5px] text-[#AAA]">No activity yet</div> : activity.map((a, i) => (
              <div key={i} className="flex gap-2.5 px-4 py-2.5"><span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.c }} /><div><div className="text-[12.5px] text-[#333]" dangerouslySetInnerHTML={{ __html: a.msg }} /><div className="text-[10.5px] text-[#AAA]">{prettyDate(a.at)}</div></div></div>))}</div>
          </Collapsible>
          <Collapsible header={<div className="flex items-center gap-2 flex-1"><span className="text-[13.5px] font-bold text-[#111]">Calendar</span><span className="ml-auto text-[11.5px] text-[#777]">{MONTHS[cal.m]} {cal.y}</span></div>}>
            <div className="p-3 border-t border-[#E4E4E4]">
              <div className="flex items-center justify-between mb-2"><button onClick={() => shiftMonth(-1)} className="px-2 cursor-pointer bg-none border-none text-[16px]">‹</button><span className="text-[13px] font-bold">{MONTHS[cal.m]} {cal.y}</span><button onClick={() => shiftMonth(1)} className="px-2 cursor-pointer bg-none border-none text-[16px]">›</button></div>
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#AAA] mb-1">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}</div>
              <div className="grid grid-cols-7 gap-0.5 text-center">{Array.from({ length: first }).map((_, i) => <div key={'b' + i} />)}{Array.from({ length: days }, (_, i) => i + 1).map(d => {
                const k = iso(d), has = evOn(k).length > 0, today = k === TODAY, on = k === calDay;
                return <div key={d} onClick={() => setCalDay(k)} className="relative py-1.5 rounded-[5px] text-[12px] cursor-pointer" style={{ background: today ? '#C8202E' : on ? '#FEF4F4' : '', color: today ? '#fff' : '#333', fontWeight: today || has ? 700 : 500 }}>{d}{has && !today && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C8202E]" />}</div>;
              })}</div>
              <div className="mt-2 pt-2 border-t border-[#E4E4E4] text-[12px]">{evOn(calDay).length ? evOn(calDay).map(e => <div key={e.id} className="py-0.5"><b>{e.time}</b> · {e.title}</div>) : <span className="text-[#AAA]">{prettyDate(calDay)}: no events</span>}</div>
            </div>
          </Collapsible>
        </div>
      </div>
      {sel && <StudentPanel student={sel} onClose={() => setSel(null)} onEdit={s => { setSel(null); setEdit(s); }} />}
      {edit && <EditStudentModal student={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function Row({ ic, col, text, sub, actions }) {
  return <div className="flex items-center gap-3 px-4 py-2.5"><div className="w-7 h-7 rounded-full text-[11px] font-extrabold flex items-center justify-center flex-shrink-0" style={{ background: col + '18', color: col }}>{ic}</div><div className="flex-1 min-w-0"><div className="text-[13px] font-semibold text-[#111] truncate">{text}</div><div className="text-[11.5px] text-[#777]">{sub}</div></div><div className="flex gap-1.5">{actions}</div></div>;
}
