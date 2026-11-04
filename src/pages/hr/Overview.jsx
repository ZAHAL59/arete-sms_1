import { useMemo } from 'react';
import useStore from '../../store/useStore';
import Badge from '../../components/ui/Badge';
import { DateChip } from '../../components/shell/widgets';
import { plural } from '../../components/shell/Page';
import { docStatus, onLeaveOn, staffAttOn } from '../principal/bridge';
import { prettyDate } from '../principal/constants';
import { TODAY } from './constants';

export const APPS = [
  { id: 'recruitment', name: 'Recruitment', icon: '📋', desc: 'Vacancies, applications and interviews', pages: [['vacancies', 'Vacancies', '📋'], ['applications', 'Applications', '📥'], ['interviews', 'Interviews', '🎤']] },
  { id: 'development', name: 'Staff Development', icon: '🎓', desc: 'Training, growth, attendance and documents', pages: [['training', 'Training', '🎓'], ['growth', 'Growth Tracker', '📈'], ['satt', 'Staff Attendance', '📅'], ['documents', 'Documents', '🗂']] },
  { id: 'people', name: 'Staff & Leave', icon: '👥', desc: 'Staff directory and leave requests', pages: [['staff', 'Staff Directory', '👥'], ['leave', 'Leave Requests', '🏖']] },
];

export function useHRSummary(hr, go) {
  const db = useStore(s => s.db);
  return useMemo(() => {
    const staffName = id => db.staff.find(s => s.id === id)?.name || id;
    const pendingApps = (hr.applications || []).filter(a => a.hrStatus === 'Pending Review');
    const openVacancies = hr.vacancies.filter(v => v.status === 'Active');
    const pipeline = hr.candidates.filter(c => !['Rejected', 'Hired'].includes(c.status));
    const upcoming = hr.candidates.filter(c => c.status === 'Interview Scheduled').map(c => ({ c, iv: hr.interviews.find(i => i.candId === c.id && i.status === 'Scheduled') })).sort((a, b) => (a.iv?.date || '9').localeCompare(b.iv?.date || '9'));
    const pendingLeaves = hr.leaveRequests.filter(l => l.status === 'Pending');
    const onLeaveToday = db.staff.filter(s => onLeaveOn(hr, s.id, TODAY));
    const absentToday = db.staff.filter(s => staffAttOn(hr, s.id, TODAY) === 'A');
    const docsExpiring = (hr.staffDocs || []).filter(d => d.expiry && docStatus(d.expiry).days <= 30);
    const training = hr.training.filter(t => t.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date));
    const attention = [
      ...pendingApps.slice(0, 5).map(a => ({ id: 'a' + a.id, letter: 'A', color: '#1A5FB4', title: `${a.name} — application`, sub: `${hr.vacancies.find(v => v.id === a.vacId)?.subj || ''} · score ${a.score}`, actions: [{ label: 'Review', run: () => go('applications') }] })),
      ...pendingLeaves.map(l => ({ id: 'l' + l.id, letter: 'L', color: '#18181B', title: `${staffName(l.staffId)} — ${l.type} leave`, sub: `${l.from} to ${l.to || l.from}`, actions: [{ label: 'Open', variant: 'outline', run: () => go('leave') }] })),
      ...(docsExpiring.length ? [{ id: 'docs', letter: 'D', color: '#B45309', title: `${plural(docsExpiring.length, 'staff document')} expiring within 30 days`, sub: 'Renew or replace', actions: [{ label: 'Open', variant: 'outline', run: () => go('documents') }] }] : []),
    ];
    return { db, staffName, pendingApps, openVacancies, pipeline, upcoming, pendingLeaves, onLeaveToday, absentToday, docsExpiring, training, attention };
  }, [hr, db]);   // eslint-disable-line react-hooks/exhaustive-deps
}

export function hrHub(S, go, hr) {
  const pulse = [
    { label: 'Open vacancies', value: S.openVacancies.length, note: 'Teaching posts', run: () => go('vacancies') },
    { label: 'Applications', value: S.pendingApps.length, note: 'To review', color: S.pendingApps.length ? '#1A5FB4' : '#166534', run: () => go('applications') },
    { label: 'Interviews', value: S.upcoming.length, note: 'Coming up', color: '#6D28D9', run: () => go('interviews') },
    { label: 'Leave requests', value: S.pendingLeaves.length, note: 'Waiting for approval', color: S.pendingLeaves.length ? '#B45309' : '#166534', run: () => go('leave') },
  ];
  const today = [
    ...hr.interviews.filter(i => i.date === TODAY && i.status === 'Scheduled').map(i => ({ id: 'i' + i.id, time: i.time, title: `Interview — ${hr.candidates.find(c => c.id === i.candId)?.name || ''}`, tag: 'Interview' })),
    ...hr.training.filter(t => t.date === TODAY).map(t => ({ id: 't' + t.id, time: t.time, title: t.title, tag: 'Training' })),
  ];
  const upcoming = S.training.filter(t => t.date > TODAY).slice(0, 3).map(t => ({ id: 'u' + t.id, date: t.date, title: t.title, sub: prettyDate(t.date), tag: 'Training' }));
  const appRows = S.pendingApps.slice(0, 5).map(a => ({ key: a.id, icon: '📥', title: a.name, sub: `${a.qual} · ${a.exp}`, right: <Badge variant={a.score >= 75 ? 'green' : a.score >= 50 ? 'amber' : 'red'}>{a.score}</Badge>, page: 'applications' }));
  const ivRows = S.upcoming.slice(0, 5).map(({ c, iv }) => ({ key: c.id, icon: iv ? <DateChip iso={iv.date} /> : '📧', title: c.name, sub: iv ? `${iv.date} ${iv.time || ''} · ${iv.venue || iv.mode}` : 'Invited — date not set', right: <Badge variant="blue">{iv ? 'Scheduled' : 'Invited'}</Badge>, page: 'interviews' }));
  const leaveRows = S.pendingLeaves.map(l => ({ key: l.id, icon: '🏖', title: `${S.staffName(l.staffId)} — ${l.type}`, sub: `${l.from} to ${l.to || l.from}`, right: <Badge variant="amber">Pending</Badge>, page: 'leave' }));
  const cfg = {
    recruitment: { title: S.pendingApps.length ? `${plural(S.pendingApps.length, 'application')} to review` : 'Inbox is clear', sub: `${plural(S.openVacancies.length, 'open vacancy', 'open vacancies')} · ${plural(S.upcoming.length, 'interview')} coming up · ${plural(S.pipeline.length, 'candidate')} in the pipeline`,
      actions: [{ label: 'Review applications', primary: true, page: 'applications' }, { label: 'Post a vacancy', page: 'vacancies' }],
      tiles: [{ label: 'Open vacancies', value: S.openVacancies.length, note: 'Teaching posts', page: 'vacancies' }, { label: 'To review', value: S.pendingApps.length, note: 'Applications', color: '#1A5FB4', page: 'applications' }, { label: 'In the pipeline', value: S.pipeline.length, note: 'Candidates moving', color: '#6D28D9', page: 'interviews' }, { label: 'Interviews', value: S.upcoming.length, note: 'Coming up', color: '#B45309', page: 'interviews' }],
      panels: [{ title: 'Applications to review', meta: `${S.pendingApps.length} pending`, action: { label: 'Open inbox', page: 'applications' }, rows: appRows, empty: { icon: '📥', title: 'No applications waiting' } }, { title: 'Upcoming interviews', meta: plural(S.upcoming.length, 'interview'), rows: ivRows, empty: { icon: '🎤', title: 'No interviews scheduled' } }] },
    development: { title: S.training.length ? `${plural(S.training.length, 'training session')} coming up` : 'No training scheduled', sub: `${plural(S.db.staff.length, 'staff member')} · ${S.absentToday.length} absent today · ${plural(S.docsExpiring.length, 'document')} expiring`,
      actions: [{ label: 'Training', primary: true, page: 'training' }, { label: 'Staff attendance', page: 'satt' }],
      tiles: [{ label: 'Training', value: S.training.length, note: 'Upcoming sessions', page: 'training' }, { label: 'Absent today', value: S.absentToday.length, note: 'Marked absent', color: S.absentToday.length ? '#DC2626' : '#166534', page: 'satt' }, { label: 'On leave today', value: S.onLeaveToday.length, note: 'Approved leave', color: '#1A5FB4', page: 'leave' }, { label: 'Documents expiring', value: S.docsExpiring.length, note: 'Within 30 days', color: S.docsExpiring.length ? '#B45309' : '#166534', page: 'documents' }],
      panels: [{ title: 'Upcoming training', meta: plural(S.training.length, 'session'), rows: S.training.slice(0, 5).map(t => ({ key: t.id, icon: <DateChip iso={t.date} />, title: t.title, sub: `${t.duration || ''}${t.trainer ? ' · ' + t.trainer : ''}`, right: <Badge variant="blue">Training</Badge>, page: 'training' })), empty: { icon: '🎓', title: 'No upcoming training' } },
        { title: 'Documents expiring', meta: S.docsExpiring.length ? plural(S.docsExpiring.length, 'document') : 'All valid ✓', rows: S.docsExpiring.map(d => ({ key: d.id, icon: '🗂', title: `${S.staffName(d.staffId)} — ${d.type}`, sub: `Expires ${prettyDate(d.expiry)}`, right: <Badge variant={docStatus(d.expiry).variant}>{docStatus(d.expiry).label}</Badge>, page: 'documents' })), empty: { icon: '✓', title: 'No documents expiring soon' } }] },
    people: { title: S.pendingLeaves.length ? `${plural(S.pendingLeaves.length, 'leave request')} pending` : 'No pending leave', sub: `${plural(S.db.staff.length, 'staff member')} · ${S.onLeaveToday.length} on leave today`,
      actions: [{ label: 'Leave requests', primary: true, page: 'leave' }, { label: 'Staff directory', page: 'staff' }],
      tiles: [{ label: 'Staff', value: S.db.staff.length, note: 'Active members', page: 'staff' }, { label: 'Pending leave', value: S.pendingLeaves.length, note: 'Waiting for approval', color: S.pendingLeaves.length ? '#B45309' : '#166534', page: 'leave' }, { label: 'On leave today', value: S.onLeaveToday.length, note: S.onLeaveToday.map(s => s.name.split(' ')[0]).join(', ') || 'Everyone in', color: '#1A5FB4' }, { label: 'Absent today', value: S.absentToday.length, note: 'Marked absent', color: S.absentToday.length ? '#DC2626' : '#166534', page: 'satt' }],
      panels: [{ title: 'Leave requests', meta: S.pendingLeaves.length ? `${S.pendingLeaves.length} pending` : 'None pending', action: { label: 'Open', page: 'leave' }, rows: leaveRows, empty: { icon: '🏖', title: 'No pending leave' } },
        { title: 'On leave today', meta: String(S.onLeaveToday.length), rows: S.onLeaveToday.map(s => ({ key: s.id, icon: '🏖', title: s.name, sub: s.subj, right: <Badge variant="blue">On leave</Badge> })), empty: { icon: '✓', title: 'Everyone is in today' } }] },
  };
  return { pulse, today, upcoming, cfg };
}
