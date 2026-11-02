import { useState } from 'react';
import Today from './Today';
import Timetable from './Timetable';
import MyClasses from './MyClasses';
import StudentProfiles from './StudentProfiles';
import Materials from './Materials';
import Alerts from './Alerts';
import Training from './Training';
import AttendanceHistory from './AttendanceHistory';
import MyNotes from './MyNotes';
import SessionLogs from './SessionLogs';
import { getNotices, getMyTraining, TODAY, TEACHER } from './constants';
import PortalHub from '../../components/shell/PortalHub';
import useHubNav from '../../components/shell/useHubNav';
import AppOverview from '../../components/shell/AppOverview';
import { APPS, useTeacherSummary, teacherHub } from './Overview';
import useStore from '../../store/useStore';


export default function TeacherPortal() {
  const nav = useHubNav(APPS); const view = nav.page; const setView = nav.go;
  const db = useStore(s => s.db);
  const S = useTeacherSummary(setView);
  const noticeCount = getNotices().length;
  const trainingCount = getMyTraining().filter(t => t.date >= TODAY).length;
  const entities = db.students.filter(s => TEACHER.classes.includes(`${s.cls} ${s.section}`.trim())).map(s => ({ id: 'ts' + s.id, group: 'My students', icon: '👤', label: s.name, hint: `${s.cls} ${s.section}`, run: () => setView('profiles') }));
  const hub = teacherHub(S, setView);
  const overviews = Object.fromEntries(APPS.map(a => [a.id, () => <AppOverview cfg={hub.cfg[a.id]} app={a} go={setView} />]));

  return (
    <PortalHub portalId="teacher" apps={APPS} nav={nav} overviews={overviews} badges={{ alerts: noticeCount, training: trainingCount }} pulse={hub.pulse} today={hub.today} upcoming={hub.upcoming} attention={S.attention} entities={entities}>
        {view==='today'     && <Today onNavigate={setView} />}
        {view==='timetable' && <Timetable />}
        {view==='myclass'   && <MyClasses />}
        {view==='profiles'  && <StudentProfiles />}
        {view==='sessions'  && <SessionLogs />}
        {view==='materials' && <Materials />}
        {view==='alerts'    && <Alerts />}
        {view==='training'  && <Training />}
        {view==='history'   && <AttendanceHistory />}
        {view==='notes'     && <MyNotes />}
    </PortalHub>
  );
}
