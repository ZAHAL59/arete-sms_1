import { useMemo } from 'react';
import useStore from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import { DateChip } from '../../components/shell/widgets';
import { plural } from '../../components/shell/Page';
import { STAGE_VARIANT } from './constants';

const TODAY = new Date().toISOString().slice(0, 10);
export const APPS = [
  { id: 'applications', name: 'Applications', icon: '📝', desc: 'The admissions pipeline, from enquiry to enrolment', pages: [['pipeline', 'Pipeline', '📊'], ['list', 'All Applications', '📋']] },
  { id: 'students', name: 'Students', icon: '👤', desc: 'The student register and development profiles', pages: [['students', 'All Students', '👤'], ['profiles', 'Dev Profiles', '🧠']] },
  { id: 'campus', name: 'Boarding & Buses', icon: '🏠', desc: 'Boarding students and bus allocation', pages: [['boarding', 'Boarding Students', '🏠'], ['bus', 'Bus Allocation', '🚌']] },
];

export function useAdmissionsSummary(apps, go) {
  const db = useStore(s => s.db);
  return useMemo(() => {
    const pipeline = apps.filter(a => !['Enrolled', 'Waitlisted'].includes(a.stage));
    const ready = apps.filter(a => a.stage === 'Seat Allocated');
    const interviews = apps.filter(a => a.interviewDate && a.interviewDate >= TODAY && a.stage !== 'Enrolled').sort((a, b) => a.interviewDate.localeCompare(b.interviewDate));
    const today = interviews.filter(a => a.interviewDate === TODAY);
    const docsMissing = pipeline.filter(a => Object.values(a.docs).some(d => !d));
    const recent = apps.slice().reverse().slice(0, 5);
    const boarders = db.students.filter(s => s.boarding), onBus = db.students.filter(s => s.busRoute);
    const needs = db.students.filter(s => s.needs && s.needs !== 'None');
    const attention = [
      ...ready.map(a => ({ id: 'r' + a.id, letter: '✓', color: '#166534', title: `${a.name} — ready to enrol`, sub: `${a.grade} · seat allocated`, actions: [{ label: 'Open', run: () => go('list') }] })),
      ...today.map(a => ({ id: 'i' + a.id, letter: 'I', color: '#1A5FB4', title: `Interview today — ${a.name}`, sub: `${a.interviewTime || ''} · ${a.grade}`, actions: [{ label: 'Open', variant: 'outline', run: () => go('list') }] })),
    ];
    return { db, apps, pipeline, ready, interviews, today, docsMissing, recent, boarders, onBus, needs, attention };
  }, [apps, db]);   // eslint-disable-line react-hooks/exhaustive-deps
}

export function admissionsHub(S, go, onNew) {
  const pulse = [
    { label: 'In the pipeline', value: S.pipeline.length, note: 'Not yet enrolled', run: () => go('pipeline') },
    { label: 'Interviews', value: S.interviews.length, note: S.today.length ? `${S.today.length} today` : 'Coming up', color: '#1A5FB4', run: () => go('list') },
    { label: 'Ready to enrol', value: S.ready.length, note: 'Seat allocated', color: S.ready.length ? '#166534' : '#777', run: () => go('list') },
    { label: 'Students', value: S.db.students.length, note: `${S.boarders.length} boarders`, color: '#6D28D9', run: () => go('students') },
  ];
  const today = S.today.map(a => ({ id: 'i' + a.id, time: a.interviewTime, title: `Interview — ${a.name}`, tag: a.grade }));
  const upcoming = S.interviews.filter(a => a.interviewDate > TODAY).slice(0, 3).map(a => ({ id: 'u' + a.id, date: a.interviewDate, title: `Interview — ${a.name}`, sub: `${a.interviewTime || ''} · ${a.grade}`, tag: 'Interview' }));
  const studentRows = S.db.students.slice(-5).reverse().map(s => ({ key: s.id, icon: '👤', title: s.name, sub: `${s.cls} ${s.section} · admitted ${s.adm}`, right: s.boarding ? <Badge variant="blue">Boarder</Badge> : null, page: 'students' }));
  const cfg = {
    applications: { title: `${plural(S.pipeline.length, 'application')} in progress`, sub: `${plural(S.today.length || S.interviews.length, 'interview')} ${S.today.length ? 'today' : 'coming up'} · ${plural(S.ready.length, 'applicant')} ready to enrol`,
      actions: [{ label: 'New application', primary: true, run: onNew }, { label: 'Open pipeline', page: 'pipeline' }],
      tiles: [{ label: 'In the pipeline', value: S.pipeline.length, note: 'Not yet enrolled', page: 'pipeline' }, { label: 'Documents missing', value: S.docsMissing.length, note: 'Applicants with gaps', color: S.docsMissing.length ? '#B45309' : '#166534', page: 'list' }, { label: 'Ready to enrol', value: S.ready.length, note: 'Seat allocated', color: S.ready.length ? '#166534' : '#777', page: 'list' }, { label: 'Interviews', value: S.interviews.length, note: 'Coming up', color: '#1A5FB4', page: 'list' }],
      panels: [{ title: 'Ready to enrol', meta: plural(S.ready.length, 'applicant'), action: { label: 'All applications', page: 'list' }, rows: S.ready.map(a => ({ key: a.id, icon: '🎓', title: a.name, sub: `${a.grade} · ${a.parent}`, right: <Badge variant="green">Seat allocated</Badge>, page: 'list' })), empty: { icon: '🎓', title: 'Nobody is waiting to be enrolled' } },
        { title: 'Interviews coming up', meta: plural(S.interviews.length, 'interview'), rows: S.interviews.slice(0, 5).map(a => ({ key: a.id, icon: <DateChip iso={a.interviewDate} />, title: a.name, sub: `${a.interviewTime || ''} · ${a.grade}${a.panel ? ' · ' + a.panel : ''}`, page: 'list' })), empty: { icon: '🗓', title: 'No interviews scheduled' } },
        { title: 'Recent applications', meta: plural(S.recent.length, 'application'), rows: S.recent.map(a => ({ key: a.id, icon: '📝', title: a.name, sub: `${a.grade} · applied ${a.applied}`, right: <Badge variant={STAGE_VARIANT[a.stage] || 'grey'}>{a.stage}</Badge>, page: 'list' })), empty: { icon: '📝', title: 'No applications yet' } }] },
    students: { title: `${plural(S.db.students.length, 'student')} enrolled`, sub: `${S.boarders.length} boarders · ${S.onBus.length} bus riders · ${S.needs.length} with learning support notes`,
      actions: [{ label: 'All students', primary: true, page: 'students' }, { label: 'Dev profiles', page: 'profiles' }],
      tiles: [{ label: 'Enrolled', value: S.db.students.length, note: 'On the register', page: 'students' }, { label: 'Boarders', value: S.boarders.length, note: 'In the hostel', color: '#1A5FB4', page: 'students' }, { label: 'Bus riders', value: S.onBus.length, note: 'On school buses', color: '#6D28D9', page: 'students' }, { label: 'Learning support', value: S.needs.length, note: 'With support notes', color: '#B45309', page: 'profiles' }],
      panels: [{ title: 'Recently enrolled', meta: plural(Math.min(5, S.db.students.length), 'student'), action: { label: 'All students', page: 'students' }, rows: studentRows, empty: { icon: '👤', title: 'No students yet' } }] },
    campus: { title: `${S.boarders.length} boarders · ${S.onBus.length} on buses`, sub: `${plural(S.db.routes.length, 'bus route')} · Boarding and transport at a glance`,
      actions: [{ label: 'Boarding students', primary: true, page: 'boarding' }, { label: 'Bus allocation', page: 'bus' }],
      tiles: [{ label: 'Boarders', value: S.boarders.length, note: 'Hostel residents', page: 'boarding' }, { label: 'Bus riders', value: S.onBus.length, note: 'Across routes', color: '#6D28D9', page: 'bus' }, { label: 'Routes', value: S.db.routes.length, note: 'Bus routes', color: '#1A5FB4', page: 'bus' }, { label: 'Day scholars', value: S.db.students.length - S.boarders.length, note: 'Not boarding', color: '#166534', page: 'students' }],
      panels: [{ title: 'Boarding students', meta: plural(S.boarders.length, 'student'), action: { label: 'Open', page: 'boarding' }, rows: S.boarders.map(s => ({ key: s.id, icon: '🏠', title: s.name, sub: `${s.cls} ${s.section}`, right: <Badge variant="blue">Boarder</Badge>, page: 'boarding' })), empty: { icon: '🏠', title: 'No boarders' } },
        { title: 'Bus routes', meta: plural(S.db.routes.length, 'route'), rows: S.db.routes.map(r => ({ key: r.id, icon: '🚌', title: r.name || r.id, sub: `${S.db.students.filter(s => s.busRoute === r.id).length} riders`, page: 'bus' })), empty: { icon: '🚌', title: 'No routes' } }] },
  };
  return { pulse, today, upcoming, cfg };
}
