import { useState } from 'react';
import useHR from './useHR';
import StaffDirectory from './StaffDirectory';
import Vacancies from './Vacancies';
import Applications from './Applications';
import Interviews from './Interviews';
import Training from './Training';
import StaffDocuments from './StaffDocuments';
import StaffAttendance from './StaffAttendance';
import GrowthTracker from './GrowthTracker';
import LeaveRequests from './LeaveRequests';
import PortalHub from '../../components/shell/PortalHub';
import useHubNav from '../../components/shell/useHubNav';
import AppOverview from '../../components/shell/AppOverview';
import { APPS, useHRSummary, hrHub } from './Overview';


export default function HRPortal() {
  const nav = useHubNav(APPS); const view = nav.page; const setView = nav.go;
  const [appVac, setAppVac] = useState('');
  const go = (v, vac = '') => { setAppVac(vac); setView(v); };
  const { hr, addVacancy, updateVacancy, addCandidate, updateCandidate,
          scheduleInterview, updateInterview, addTraining, markTrainingAtt,
          updateLeave, addLeave, markStaffAtt, shortlistApplication, rejectApplication, restoreApplication, markInviteSent, setChecklist, saveInterviewResult, hireCandidate, addStaffDoc, deleteStaffDoc } = useHR();
  const pendingApps = (hr.applications || []).filter(a => a.hrStatus === 'Pending Review').length;
  const badgeOf = { applications: pendingApps, interviews: hr.interviews.filter(i => i.status === 'Scheduled').length, leave: hr.leaveRequests.filter(l => l.status === 'Pending').length };   // only things that need action

  const sharedHR = { hr };
  const S = useHRSummary(hr, go);
  const entities = S.db.staff.map(s => ({ id: 'st' + s.id, group: 'Staff', icon: '👥', label: s.name, hint: s.subj, run: () => go('staff') }));

  const hub = hrHub(S, go, hr);
  const overviews = Object.fromEntries(APPS.map(a => [a.id, () => <AppOverview cfg={hub.cfg[a.id]} app={a} go={go} />]));

  return (
    <PortalHub portalId="hr" apps={APPS} nav={nav} overviews={overviews} badges={badgeOf} pulse={hub.pulse} today={hub.today} upcoming={hub.upcoming} attention={S.attention} entities={entities}>
        {view==='staff'      && <StaffDirectory />}
        {view==='growth'     && <GrowthTracker hr={hr} />}
        {view==='vacancies'  && <Vacancies hr={hr} addVacancy={addVacancy} updateVacancy={updateVacancy} go={go}/>}
        {view==='applications' && <Applications key={appVac} hr={hr} initialVac={appVac} shortlist={shortlistApplication} reject={rejectApplication} restore={restoreApplication} markInviteSent={markInviteSent}/>}
        {view==='interviews' && <Interviews hr={hr} scheduleInterview={scheduleInterview} setChecklist={setChecklist} saveInterviewResult={saveInterviewResult} hireCandidate={hireCandidate}/>}
        {view==='documents'  && <StaffDocuments hr={hr} addStaffDoc={addStaffDoc} deleteStaffDoc={deleteStaffDoc}/>}
        {view==='training'   && <Training hr={hr} addTraining={addTraining} markTrainingAtt={markTrainingAtt}/>}
        {view==='satt'       && <StaffAttendance hr={hr} markStaffAtt={markStaffAtt}/>}
        {view==='leave'      && <LeaveRequests hr={hr} updateLeave={updateLeave} addLeave={addLeave}/>}
    </PortalHub>
  );
}
