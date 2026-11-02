import { useState } from 'react';
import useStore from '../../store/useStore';
import useCampus from './useCampus';
import { loanStatus, TODAY } from './constants';
import Complaints from './Complaints';
import Visitors from './Visitors';
import Events from './Events';
import Inventory from './Inventory';
import Library from './Library';
import FinanceSummary from './FinanceSummary';
import PortalHub from '../../components/shell/PortalHub';
import useHubNav from '../../components/shell/useHubNav';
import AppOverview from '../../components/shell/AppOverview';
import { APPS, useCampusSummary, campusHub } from './Overview';


export default function CampusPortal() {
  const nav = useHubNav(APPS); const view = nav.page; const setView = nav.go;
  const C = useCampus(); const { c } = C;
  const complaints = useStore(s => s.db.complaints) || [];
  const S = useCampusSummary(c, setView);
  const badge = {
    complaints: complaints.filter(x => x.status === 'Open').length,
    visitors: c.visitors.filter(v => v.status === 'In' && v.date === TODAY).length,
    library: c.books.filter(b => loanStatus(b) === 'Overdue').length,
  };

  const hub = campusHub(S, setView, c);
  const overviews = Object.fromEntries(APPS.map(a => [a.id, () => <AppOverview cfg={hub.cfg[a.id]} app={a} go={setView} />]));

  return (
    <PortalHub portalId="campus" apps={APPS} nav={nav} overviews={overviews} badges={badge} pulse={hub.pulse} today={hub.today} upcoming={hub.upcoming} attention={S.attention} >
        {view === 'complaints' && <Complaints addComplaint={C.addComplaint} resolveComplaint={C.resolveComplaint} addComplaintNote={C.addComplaintNote} />}
        {view === 'visitors'   && <Visitors c={c} addVisitor={C.addVisitor} checkOut={C.checkOut} />}
        {view === 'events'     && <Events c={c} addEvent={C.addEvent} allocateSeats={C.allocateSeats} />}
        {view === 'inventory'  && <Inventory c={c} addAsset={C.addAsset} editAsset={C.editAsset} />}
        {view === 'library'    && <Library c={c} addBook={C.addBook} issueBook={C.issueBook} returnBook={C.returnBook} />}
        {view === 'finance'    && <FinanceSummary />}
    </PortalHub>
  );
}
