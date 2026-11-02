import { useState } from 'react';
import useAdmissions from './useAdmissions';
import Pipeline from './Pipeline';
import ApplicationList from './ApplicationList';
import Students from './Students';
import DevProfiles from './DevProfiles';
import BusAllocation from './BusAllocation';
import BoardingStudents from './BoardingStudents';
import NewApplicationModal from './modals/NewApplicationModal';
import PortalHub from '../../components/shell/PortalHub';
import useHubNav from '../../components/shell/useHubNav';
import AppOverview from '../../components/shell/AppOverview';
import { APPS, useAdmissionsSummary, admissionsHub } from './Overview';


export default function AdmissionsPortal() {
  const nav = useHubNav(APPS); const view = nav.page; const setView = nav.go;
  const [newOpen, setNewOpen] = useState(false);

  const A = useAdmissions();
  const S = useAdmissionsSummary(A.admissions, setView);
  const entities = [...S.db.students.map(s => ({ id: 'as' + s.id, group: 'Students', icon: '👤', label: s.name, hint: `${s.cls} ${s.section}`, run: () => setView('students') })), ...A.admissions.map(a => ({ id: 'aa' + a.id, group: 'Applications', icon: '📝', label: a.name, hint: `${a.grade} · ${a.stage}`, run: () => setView('list') }))];

  function handleNavigate(v) {
    if (v === 'new') { setNewOpen(true); return; }
    setView(v);
  }

  const hub = admissionsHub(S, setView, () => setNewOpen(true));
  const overviews = Object.fromEntries(APPS.map(a => [a.id, () => <AppOverview cfg={hub.cfg[a.id]} app={a} go={setView} />]));

  return (
    <PortalHub portalId="admissions" apps={APPS} nav={nav} overviews={overviews}  pulse={hub.pulse} today={hub.today} upcoming={hub.upcoming} attention={S.attention} entities={entities}>
        {view==='pipeline' && <Pipeline A={A} onNavigate={handleNavigate}/>}
        {view==='list'     && <ApplicationList A={A}/>}
        {view==='students' && <Students/>}
        {view==='profiles' && <DevProfiles/>}
        {view==='boarding' && <BoardingStudents/>}
        {view==='bus'      && <BusAllocation/>}

      {newOpen && <NewApplicationModal onSave={A.addAdmission} onClose={()=>setNewOpen(false)}/>}
    </PortalHub>
  );
}
