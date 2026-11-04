import { useState, useMemo } from 'react';
import useStore from '../../../store/useStore';
import { getStudentDue, countsTowardDue } from '../../finance/constants';
import { snapshot, setLeaveStatus, setOutingStatus, docStatus, loanStatus, staffAttOn, onLeaveOn } from '../bridge';
import { uncovered } from '../cover';
import { attendanceOf, TODAY } from '../constants';

// Everything the Principal's home screen and overview pages need, worked out in one place.
// `nav` = { go(appId, page), route(path) } so a "needs attention" row can take you to the right place.
export default function useSummary(p, nav) {
  const db = useStore(s => s.db); const attLog = useStore(s => s.attLog);
  const [tick, setTick] = useState(0); const refresh = () => setTick(t => t + 1);
  const snap = useMemo(snapshot, [tick, db]);
  const { hr, hostel, campus, transport, admissions } = snap;
  const complaints = db.complaints || [];

  const openComplaints = complaints.filter(c => c.status === 'Open');
  const pendingLeaves = hr.leaveRequests.filter(l => l.status === 'Pending');
  const pendingApps = (hr.applications || []).filter(a => a.hrStatus === 'Pending Review');
  const pendingOutings = hostel.outings.filter(o => o.status === 'Pending Approval');
  const needCover = db.staff.map(s => ({ s, n: (staffAttOn(hr, s.id, TODAY) === 'A' || onLeaveOn(hr, s.id, TODAY)) ? uncovered(p.timetable, p.substitutions || [], s.name, TODAY).length : 0 })).filter(x => x.n > 0);
  const staffName = id => db.staff.find(s => s.id === id)?.name || id;

  // ── "Needs your attention": one list, each row can act on the spot ──
  const attention = [
    ...needCover.map(({ s, n }) => ({ id: 'cv' + s.id, letter: 'S', color: '#B45309', title: `${s.name} is away — ${n} period${n > 1 ? 's' : ''} need a substitute`, sub: 'Classes today without cover', actions: [{ label: 'Assign', run: () => nav.go('school', 'attendance') }] })),
    ...pendingLeaves.map(l => ({ id: 'l' + l.id, letter: 'L', color: '#18181B', title: `${staffName(l.staffId)} — ${l.type} leave`, sub: `${l.from} to ${l.to || l.from}${l.reason ? ' · ' + l.reason : ''}`,
      actions: [{ label: 'Approve', run: () => { setLeaveStatus(l.id, 'Approved'); refresh(); } }, { label: 'Reject', variant: 'outline', run: () => { setLeaveStatus(l.id, 'Rejected'); refresh(); } }] })),
    ...pendingOutings.map(o => ({ id: 'o' + o.id, letter: 'O', color: '#B45309', title: `${o.stuName} — hostel outing (${o.purpose})`, sub: `${o.dep} to ${o.ret}`,
      actions: [{ label: 'Approve', run: () => { setOutingStatus(o.id, 'Approved'); refresh(); } }, { label: 'Reject', variant: 'outline', run: () => { setOutingStatus(o.id, 'Rejected'); refresh(); } }] })),
    ...openComplaints.map(c => ({ id: 'c' + c.id, letter: 'C', color: '#DC2626', title: c.subj.slice(0, 80), sub: `Complaint · ${c.type}`, actions: [{ label: 'Open', variant: 'outline', run: () => nav.route('/campus') }] })),
    ...pendingApps.map(a => ({ id: 'a' + a.id, letter: 'H', color: '#1A5FB4', title: `${a.name} — job application`, sub: 'HR review needed', actions: [{ label: 'Open', variant: 'outline', run: () => nav.route('/hr') }] })),
  ];

  // ── fees ──
  const totalDue = db.students.reduce((a, s) => a + getStudentDue(s), 0);
  const collected = db.payments.filter(x => x.studentId && countsTowardDue(x)).reduce((a, x) => a + x.amount, 0);
  const fees = { totalDue, collected, outstanding: Math.max(0, totalDue - collected), pct: totalDue ? Math.round(collected / totalDue * 1000) / 10 : 0 };

  // ── attendance ──
  const todayLogs = Object.entries(attLog).filter(([k]) => k.endsWith(TODAY)).flatMap(([, l]) => Object.values(l));
  const attendance = { marked: todayLogs.length, absent: todayLogs.filter(v => v === 'A').length, pct: todayLogs.length ? Math.round(todayLogs.filter(v => v === 'P').length / todayLogs.length * 100) : null,
    atRisk: db.students.filter(s => (attendanceOf(s.id, attLog)?.pct ?? 100) < p.settings.lowAtt).length };

  // ── what is on today, and what is coming ──
  const evTime = e => e.time || '';
  const todayAgenda = [
    ...campus.events.filter(e => e.date === TODAY).map(e => ({ id: 'e' + e.id, time: evTime(e), title: e.title, tag: e.type || 'Event' })),
    ...(admissions || []).filter(a => a.interviewDate === TODAY && a.stage !== 'Enrolled').map(a => ({ id: 'ai' + a.id, time: a.interviewTime || '', title: `Admission interview — ${a.name}`, tag: a.grade })),
    ...hr.interviews.filter(i => i.date === TODAY && i.status === 'Scheduled').map(i => ({ id: 'hi' + i.id, time: i.time || '', title: `Staff interview — ${hr.candidates.find(c => c.id === i.candId)?.name || ''}`, tag: 'HR' })),
    ...hr.training.filter(t => t.date === TODAY).map(t => ({ id: 't' + t.id, time: t.time || '', title: t.title, tag: 'Training' })),
  ].sort((a, b) => a.time.localeCompare(b.time));
  const upcomingEvents = campus.events.filter(e => e.date > TODAY).sort((a, b) => a.date.localeCompare(b.date));
  const upcomingTraining = hr.training.filter(t => t.date > TODAY).sort((a, b) => a.date.localeCompare(b.date));

  const onLeaveToday = db.staff.filter(s => onLeaveOn(hr, s.id, TODAY));
  const recentStudents = db.students.slice(-5).reverse();
  const recentLeaves = hr.leaveRequests.slice(-5).reverse();
  const docsExpiring = (hr.staffDocs || []).filter(d => d.expiry && docStatus(d.expiry).days <= 30).length;

  // ── cross-portal indicators (used by the "Portals" app) ──
  const indicators = [
    ['HR pipeline', pendingApps.length, 'Applications to review', '/hr'], ['Open vacancies', hr.vacancies.filter(v => v.status === 'Active').length, 'Teaching posts', '/hr'],
    ['Low mess stock', hostel.stock.filter(s => s.qty <= s.low).length, 'Items to reorder', '/hostel'], ['Pending outings', pendingOutings.length, 'Awaiting approval', '/hostel'],
    ['Overdue books', campus.books.filter(b => loanStatus(b) === 'Overdue').length, 'Library', '/campus'], ['Vehicle docs', transport.docs.filter(d => docStatus(d.expiry).days <= 30).length, 'Expiring / expired', '/transport'],
    ['Visitors inside', campus.visitors.filter(v => v.status === 'In' && v.date === TODAY).length, 'On premises now', '/campus'], ['Open incidents', hostel.incidents.filter(i => i.status === 'Open').length, 'Hostel', '/hostel'],
  ];

  const activity = [
    ...db.payments.filter(x => x.studentId).slice(0, 4).map(x => ({ at: x.date, c: '#166534', msg: `Fee payment ₹${x.amount.toLocaleString('en-IN')} · ${db.students.find(s => s.id === x.studentId)?.name || ''}` })),
    ...complaints.slice(0, 3).map(c => ({ at: c.date, c: '#DC2626', msg: `Complaint ${c.status === 'Open' ? 'logged' : 'resolved'} — ${c.subj.slice(0, 50)}` })),
    ...(hr.applications || []).slice(-3).map(a => ({ at: (a.appliedAt || '').slice(0, 10), c: '#1A5FB4', msg: `Job application — ${a.name}` })),
    ...campus.visitors.slice(0, 3).map(v => ({ at: v.date, c: '#B45309', msg: `Visitor — ${v.name} (${v.purpose})` })),
    ...p.incidents.slice(0, 2).map(i => ({ at: i.date, c: '#6D28D9', msg: `Health incident — ${i.stu}: ${i.issue}` })),
  ].filter(a => a.at).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);

  return { snap, refresh, db, attention, fees, attendance, todayAgenda, upcomingEvents, upcomingTraining, onLeaveToday, recentStudents, recentLeaves, docsExpiring, indicators, activity,
    counts: { students: db.students.length, staff: db.staff.length, boarders: db.students.filter(s => s.boarding).length, applications: (admissions || []).filter(a => !['Enrolled', 'Waitlisted'].includes(a.stage)).length,
      pendingLeaves: pendingLeaves.length, openComplaints: openComplaints.length, payroll: db.staff.reduce((a, s) => a + (s.salary || 0), 0) } };
}
