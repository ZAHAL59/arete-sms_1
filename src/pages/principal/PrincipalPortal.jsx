import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import usePrincipal from './usePrincipal';
import useSummary from './hub/useSummary';
import { APPS as BASE_APPS, PORTALS, findApp } from './hub/apps';
import PortalHub from '../../components/shell/PortalHub';
import useHubNav from '../../components/shell/useHubNav';
import SettingsModal from './hub/SettingsModal';
import { SchoolOverview, MoneyOverview, OfficeOverview, PortalsOverview } from './hub/Overviews';
import AdmissionsView from './AdmissionsView';
import Students from './Students';
import Timetable from './Timetable';
import Attendance from './Attendance';
import Learning from './Learning';
import Staff from './Staff';
import Payroll from './Payroll';
import Fees from './Fees';
import Communication from './Communication';
import Health from './Health';
import Reports from './Reports';
import { fmtL, prettyDate } from './constants';

// "Portals" lists the other portals as links in its sidebar
const APPS = BASE_APPS.map(a => (a.id === 'portals' ? { ...a, links: PORTALS.map(([to, name, icon]) => [to, name, icon]) } : a));

// The Principal's workspace — same frame as every portal: Home (pulse, areas, today, attention) → an area → its pages.
export default function PrincipalPortal() {
  const navigate = useNavigate(); const nav = useHubNav(APPS);
  const { p, ...api } = usePrincipal(); const db = useStore(s => s.db);
  const [settings, setSettings] = useState(false);
  const route = to => navigate(to);
  // the Overview screens (and the attention list) speak in "area, page" — translate to the hub's page ids
  const go = (appId, pg) => (pg ? nav.go(pg) : nav.goApp(appId));
  const S = useSummary(p, { go, route });

  const pulse = [
    { label: 'Students', value: S.counts.students, note: `${S.counts.boarders} boarders`, run: () => go('school', 'students') },
    { label: 'Attendance today', value: S.attendance.pct == null ? '—' : `${S.attendance.pct}%`, note: S.attendance.pct == null ? 'Not marked yet' : `${S.attendance.absent} absent`, color: '#1A5FB4', run: () => go('school', 'attendance') },
    { label: 'Fees collected', value: `${S.fees.pct}%`, note: `${fmtL(S.fees.collected)} of ${fmtL(S.fees.totalDue)}`, color: '#166534', run: () => go('money', 'fees') },
    { label: 'Pending approvals', value: S.attention.length, note: 'Leave, outings, cover…', color: S.attention.length ? '#18181B' : '#166534' },
  ];
  const upcoming = S.upcomingEvents.slice(0, 3).map(e => ({ id: 'u' + e.id, date: e.date, title: e.title, sub: `${prettyDate(e.date)} · ${e.time || ''}`, tag: e.type }));
  const entities = useMemo(() => [
    ...[['✅', 'Mark attendance', 'school', 'attendance'], ['🎓', 'New application', 'school', 'admissions'], ['📢', 'New announcement', 'office', 'communication'], ['💰', 'Run payroll', 'money', 'payroll'], ['📄', 'Generate a report', 'office', 'reports']]
      .map(([icon, label, a, pg]) => ({ id: 'qa.' + label, group: 'Quick actions', icon, label, hint: findApp(a).name, run: () => nav.go(pg) })),
    ...db.students.map(s => ({ id: 'stu.' + s.id, group: 'Students', icon: '👤', label: s.name, hint: `${s.cls} ${s.section} · ${s.id}`, run: () => nav.go('students') })),
    ...db.staff.map(s => ({ id: 'staff.' + s.id, group: 'Staff', icon: '👥', label: s.name, hint: s.subj, run: () => nav.go('staff') })),
  ], [db]);   // eslint-disable-line react-hooks/exhaustive-deps

  const ctx = { S, p, go, route };
  const overviews = { school: () => <SchoolOverview {...ctx} />, money: () => <MoneyOverview {...ctx} />, office: () => <OfficeOverview {...ctx} />, portals: () => <PortalsOverview {...ctx} /> };
  const page = {
    admissions: <AdmissionsView />, students: <Students settings={p.settings} />, attendance: <Attendance settings={p.settings} p={p} api={api} />, timetable: <Timetable p={p} api={api} />, learning: <Learning p={p} api={api} />, health: <Health p={p} api={api} />,
    staff: <Staff p={p} api={api} />, payroll: <Payroll p={p} api={api} />, fees: <Fees />, communication: <Communication p={p} api={api} />, reports: <Reports p={p} />,
  }[nav.page];

  return (
    <>
      <PortalHub portalId="principal" apps={APPS} nav={nav} overviews={overviews} badges={{ staff: S.counts.pendingLeaves }} prompt="Pick an app to work in."
        pulse={pulse} today={S.todayAgenda} upcoming={upcoming} attention={S.attention} entities={entities}
        accountExtras={[['⚙', 'School settings', () => setSettings(true)]]}>
        {page}
      </PortalHub>
      {settings && <SettingsModal initial={p.settings} onSave={api.setSettings} onClose={() => setSettings(false)} />}
    </>
  );
}
