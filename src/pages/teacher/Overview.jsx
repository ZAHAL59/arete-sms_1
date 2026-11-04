import { useMemo } from 'react';
import useStore from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import { plural } from '../../components/shell/Page';
import { loadPrincipal, prettyDate } from '../principal/constants';
import { TEACHER, PERIODS, TT, TODAY, getCurrentPeriod, getNotices, getMyTraining, getMaterials } from './constants';

export const APPS = [
  { id: 'classroom', name: 'Classroom', icon: '🍎', desc: 'Today’s classes, timetable, students and attendance', pages: [['today', 'Today’s Classes', '🏠'], ['timetable', 'Timetable', '📅'], ['myclass', 'My Classes', '👥'], ['profiles', 'Student Profiles', '📋'], ['sessions', 'Session Logs', '🧾'], ['history', 'Attendance History', '📊']] },
  { id: 'resources', name: 'Resources & Notes', icon: '📚', desc: 'Study materials and your own notes', pages: [['materials', 'Study Materials', '📚'], ['notes', 'My Notes', '📝']] },
  { id: 'school', name: 'School Updates', icon: '🔔', desc: 'Notices from school and training sessions', pages: [['alerts', 'Alerts & Notices', '🔔'], ['training', 'Training Sessions', '🎓']] },
];

export function useTeacherSummary(go) {
  const attLog = useStore(s => s.attLog); const db = useStore(s => s.db); const myNotes = useStore(s => s.myNotes) || [];
  return useMemo(() => {
    const dow = new Date().getDay() - 1, weekday = dow >= 0 && dow <= 4, cur = getCurrentPeriod(), hour = new Date().getHours();
    const classes = weekday ? TT[dow].map((c, i) => ({ c, i })).filter(x => x.c && x.c.cls) : [];
    const marked = cls => { const k = cls.replace(/\s+/g, '') + '-' + TODAY; return !!(attLog[k] && Object.keys(attLog[k]).length); };
    const started = x => hour >= 15 || (cur.period >= 0 && x.i <= cur.period);
    const pending = classes.filter(x => started(x) && !marked(x.c.cls));
    const next = classes.find(x => !started(x) || x.i === cur.period) || null;
    const notices = getNotices(), training = getMyTraining().filter(t => t.date >= TODAY), materials = getMaterials();
    const cover = (loadPrincipal().substitutions || []).filter(x => x.date === TODAY && x.sub === TEACHER.name).sort((a, b) => a.row - b.row);
    const students = db.students.filter(s => TEACHER.classes.includes(`${s.cls} ${s.section}`.trim()));
    const attention = [
      ...pending.map(x => ({ id: 'att' + x.i, letter: '✓', color: '#18181B', title: `Mark attendance — ${x.c.cls}`, sub: `Period ${x.i + 1} · ${PERIODS[x.i]}`, actions: [{ label: 'Mark', run: () => go('myclass') }] })),
      ...cover.map(x => ({ id: 'cv' + x.id, letter: 'S', color: '#B45309', title: `Cover duty — ${x.cls} (${x.subject})`, sub: `${x.time} · covering for ${x.absent}`, actions: [{ label: 'Open', variant: 'outline', run: () => go('timetable') }] })),
    ];
    return { db, weekday, classes, marked, pending, next, notices, training, materials, cover, students, myNotes, attention };
  }, [attLog, db, myNotes]);   // eslint-disable-line react-hooks/exhaustive-deps
}

export function teacherHub(S, go) {
  const n = S.next;
  const pulse = [
    { label: 'Classes today', value: S.classes.length, note: S.weekday ? 'On your timetable' : 'Weekend', run: () => go('timetable') },
    { label: 'Attendance to mark', value: S.pending.length, note: 'Classes already begun', color: S.pending.length ? '#18181B' : '#166534', run: () => go('myclass') },
    { label: 'Notices', value: S.notices.length, note: 'From school & HR', color: '#1A5FB4', run: () => go('alerts') },
    { label: 'Training', value: S.training.length, note: 'Upcoming sessions', color: '#6D28D9', run: () => go('training') },
  ];
  const today = S.classes.map(x => ({ id: 'c' + x.i, time: PERIODS[x.i], title: x.c.cls, tag: S.marked(x.c.cls) ? 'Marked ✓' : 'Not marked' }));
  const upcoming = S.training.slice(0, 3).map(t => ({ id: 'u' + t.id, date: t.date, title: t.title, sub: prettyDate(t.date), tag: 'Training' }));
  const cfg = {
    classroom: { kicker: n ? `NEXT CLASS · ${PERIODS[n.i]}` : undefined, title: n ? n.c.cls : S.weekday ? 'No more classes today' : 'No classes today', sub: S.weekday ? `${plural(S.classes.length, 'class', 'classes')} today · ${S.pending.length ? `${plural(S.pending.length, 'register')} still to mark` : 'all registers marked'}` : 'Enjoy the break — your timetable resumes on Monday.',
      actions: [{ label: 'Mark attendance', primary: true, page: 'myclass' }, { label: 'Timetable', page: 'timetable' }],
      tiles: [{ label: 'Classes today', value: S.classes.length, note: S.weekday ? 'On your timetable' : 'Weekend', page: 'timetable' }, { label: 'Registers marked', value: `${S.classes.filter(x => S.marked(x.c.cls)).length}/${S.classes.length}`, note: S.pending.length ? `${S.pending.length} still to mark` : 'All up to date', color: S.pending.length ? '#B45309' : '#166534', bar: S.classes.length ? S.classes.filter(x => S.marked(x.c.cls)).length / S.classes.length * 100 : 0, page: 'myclass' }, { label: 'My students', value: S.students.length, note: `${TEACHER.classes.length} classes`, color: '#1A5FB4', page: 'profiles' }, { label: 'Cover duty', value: S.cover.length, note: 'Periods today', color: S.cover.length ? '#B45309' : '#166534', page: 'timetable' }],
      panels: [{ title: 'Today’s classes', meta: S.weekday ? plural(S.classes.length, 'class', 'classes') : 'Weekend', action: { label: 'Timetable', page: 'timetable' }, rows: S.classes.map(x => ({ key: x.i, icon: '📚', title: x.c.cls, sub: `Period ${x.i + 1} · ${PERIODS[x.i]}`, right: <Badge variant={S.marked(x.c.cls) ? 'green' : 'grey'}>{S.marked(x.c.cls) ? 'Marked ✓' : 'Not marked'}</Badge>, page: 'myclass' })), empty: { icon: '📅', title: S.weekday ? 'No classes today' : 'No classes at the weekend' } },
        { title: 'Cover duty today', meta: S.cover.length ? plural(S.cover.length, 'period') : 'None', rows: S.cover.map(x => ({ key: x.id, icon: '↻', title: `${x.cls} — ${x.subject}`, sub: `${x.time} · covering for ${x.absent}`, right: <Badge variant="amber">Cover</Badge> })), empty: { icon: '✓', title: 'No cover duty today' } }] },
    resources: { title: `${plural(S.materials.length, 'study material')} available`, sub: `${plural(S.myNotes.length, 'personal note')} saved`,
      actions: [{ label: 'Study materials', primary: true, page: 'materials' }, { label: 'My notes', page: 'notes' }],
      tiles: [{ label: 'Materials', value: S.materials.length, note: 'Shared by the school', page: 'materials' }, { label: 'My notes', value: S.myNotes.length, note: 'Saved notes', color: '#1A5FB4', page: 'notes' }, { label: 'Notices', value: S.notices.length, note: 'Unread updates', color: '#6D28D9', page: 'alerts' }, { label: 'Training', value: S.training.length, note: 'Upcoming', color: '#B45309', page: 'training' }],
      panels: [{ title: 'Study materials', meta: plural(S.materials.length, 'item'), action: { label: 'Browse', page: 'materials' }, rows: S.materials.slice(0, 5).map((m, i) => ({ key: m.id || i, icon: '📚', title: m.title, sub: `${m.subject || ''}${m.grade ? ' · ' + m.grade : ''}`, right: m.type ? <Badge variant="blue">{m.type}</Badge> : null, page: 'materials' })), empty: { icon: '📚', title: 'No materials yet' } }] },
    school: { title: `${plural(S.notices.length, 'notice')} from the school`, sub: `${plural(S.training.length, 'training session')} coming up`,
      actions: [{ label: 'Notices', primary: true, page: 'alerts' }, { label: 'Training', page: 'training' }],
      tiles: [{ label: 'Notices', value: S.notices.length, note: 'School & HR', color: '#1A5FB4', page: 'alerts' }, { label: 'Urgent', value: S.notices.filter(x => x.urgent).length, note: 'Marked urgent', color: S.notices.some(x => x.urgent) ? '#DC2626' : '#166534', page: 'alerts' }, { label: 'Training', value: S.training.length, note: 'Upcoming sessions', color: '#6D28D9', page: 'training' }, { label: 'Cover duty', value: S.cover.length, note: 'Today', color: S.cover.length ? '#B45309' : '#166534', page: 'timetable' }],
      panels: [{ title: 'Notices', meta: plural(S.notices.length, 'notice'), action: { label: 'All notices', page: 'alerts' }, rows: S.notices.slice(0, 4).map((x, i) => ({ key: i, icon: '🔔', title: x.title, sub: `${x.sent || ''}${x.to ? ' · ' + x.to : ''}`, right: x.urgent ? <Badge variant="red">Urgent</Badge> : null, page: 'alerts' })), empty: { icon: '🔔', title: 'No notices' } },
        { title: 'Training sessions', meta: plural(S.training.length, 'session'), rows: S.training.slice(0, 4).map(t => ({ key: t.id, icon: '🎓', title: t.title, sub: `${prettyDate(t.date)} · ${t.duration || ''}`, right: <Badge variant="blue">Training</Badge>, page: 'training' })), empty: { icon: '🎓', title: 'No upcoming training' } }] },
  };
  return { pulse, today, upcoming, cfg };
}
